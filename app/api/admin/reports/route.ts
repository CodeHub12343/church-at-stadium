import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { requireAdmin } from '@/lib/adminAuth';
import { dbConnect } from '@/lib/mongodb';
import { Report, ReportType } from '@/lib/models/Report';
import { User } from '@/lib/models/User';
import { Church } from '@/lib/models/Church';
import { Event } from '@/lib/models/Event';
import { EventRegistration } from '@/lib/models/EventRegistration';
import { VolunteerApplication } from '@/lib/models/VolunteerApplication';
import { recordAudit } from '@/lib/audit';

const ALLOWED: ReportType[] = ['platform', 'event', 'church', 'volunteers', 'finance'];

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60);
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  await dbConnect();
  const docs = await Report.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({
    reports: docs.map((r) => ({
      id: r.slug,
      title: r.title,
      type: r.type,
      status: r.status,
      periodStart: r.periodStart,
      periodEnd: r.periodEnd,
      createdAt: r.createdAt,
      summary: r.data,
    })),
  });
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const body = await req.json().catch(() => ({}));
  const { title, type } = body ?? {};
  const t: ReportType = ALLOWED.includes(type) ? type : 'platform';

  await dbConnect();
  const now = new Date();
  const periodStart = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
  let data: Record<string, unknown> = {};

  if (t === 'platform') {
    const [users, churches, verifiedCh, events, regs, apps] = await Promise.all([
      User.countDocuments({}),
      Church.countDocuments({}),
      Church.countDocuments({ verified: true }),
      Event.countDocuments({}),
      EventRegistration.countDocuments({}),
      VolunteerApplication.countDocuments({}),
    ]);
    data = { users, churches, verifiedChurches: verifiedCh, events, registrations: regs, volunteerApplications: apps };
  } else if (t === 'event') {
    const events = await Event.find({}).lean();
    const regAgg = await EventRegistration.aggregate([
      { $group: { _id: '$eventSlug', count: { $sum: 1 }, checkedIn: { $sum: { $cond: [{ $eq: ['$checkInStatus', 'in'] }, 1, 0] } } } },
    ]);
    const byCount = new Map<string, { count: number; checkedIn: number }>(
      regAgg.map((r) => [r._id as string, { count: r.count, checkedIn: r.checkedIn }])
    );
    data = {
      events: events.map((e) => ({
        slug: e.slug, title: e.title, status: e.status,
        registrations: byCount.get(e.slug)?.count ?? 0,
        checkedIn: byCount.get(e.slug)?.checkedIn ?? 0,
      })),
    };
  } else if (t === 'church') {
    const churches = await Church.find({}).lean();
    data = {
      total: churches.length,
      verified: churches.filter((c) => c.verified).length,
      pending: churches.filter((c) => !c.verified).length,
      byRegion: churches.reduce((acc: Record<string, number>, c) => {
        acc[c.region] = (acc[c.region] || 0) + 1;
        return acc;
      }, {}),
    };
  } else if (t === 'volunteers') {
    const apps = await VolunteerApplication.find({}).lean();
    data = {
      total: apps.length,
      approved: apps.filter((a) => a.status === 'approved').length,
      pending: apps.filter((a) => a.status === 'submitted' || a.status === 'under_review').length,
      declined: apps.filter((a) => a.status === 'declined').length,
    };
  } else if (t === 'finance') {
    data = { total: 0, note: 'Finance integration not yet connected.' };
  }

  const baseSlug = slugify(title || `${t}-report-${now.toISOString().slice(0, 10)}`);
  let slug = baseSlug;
  for (let i = 1; i < 10; i++) {
    const exists = await Report.findOne({ slug }).lean();
    if (!exists) break;
    slug = `${baseSlug}-${i}`;
  }

  const r = await Report.create({
    title: title || `${t.charAt(0).toUpperCase() + t.slice(1)} report · ${now.toLocaleDateString()}`,
    slug,
    type: t,
    status: 'ready',
    periodStart,
    periodEnd: now,
    data,
    createdBy: new mongoose.Types.ObjectId(auth.userId),
  });

  await recordAudit({
    actorId: auth.userId,
    action: 'report.generate',
    description: `Generated ${t} report "${r.title}"`,
    resource: r.slug,
    severity: 'info',
  });

  return NextResponse.json({ ok: true, id: r.slug });
}
