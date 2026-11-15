import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { requireAdmin } from '@/lib/adminAuth';
import { dbConnect } from '@/lib/mongodb';
import { Announcement, AnnouncementAudience, AnnouncementStatus } from '@/lib/models/Announcement';
import { recordAudit } from '@/lib/audit';
import { isNonEmptyString } from '@/lib/validators';
import { sendAnnouncement } from '@/lib/announcements';

const AUDIENCES: AnnouncementAudience[] = ['all', 'church_reps', 'volunteers', 'organizers', 'attendees'];
const STATUSES: AnnouncementStatus[] = ['draft', 'scheduled', 'sent'];

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  await dbConnect();
  const filter: Record<string, unknown> = {};
  if (status && STATUSES.includes(status as AnnouncementStatus)) filter.status = status;
  const docs = await Announcement.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json({
    announcements: docs.map((a) => ({
      id: String(a._id),
      title: a.title,
      body: a.body,
      status: a.status,
      audience: a.audience,
      eventSlug: a.eventSlug,
      scheduledFor: a.scheduledFor,
      sentAt: a.sentAt,
      recipientCount: a.recipientCount ?? 0,
      createdAt: a.createdAt,
    })),
  });
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const body = await req.json().catch(() => ({}));
  const { title, body: text, audience, eventSlug, scheduledFor, send } = body ?? {};
  if (!isNonEmptyString(title)) return NextResponse.json({ error: 'Title required' }, { status: 400 });
  if (!isNonEmptyString(text)) return NextResponse.json({ error: 'Body required' }, { status: 400 });

  await dbConnect();
  const aud: AnnouncementAudience = AUDIENCES.includes(audience) ? audience : 'all';
  const status: AnnouncementStatus = send ? 'sent' : scheduledFor ? 'scheduled' : 'draft';

  const a = await Announcement.create({
    title: title.trim(),
    body: text.trim(),
    audience: aud,
    eventSlug: isNonEmptyString(eventSlug) ? eventSlug : undefined,
    scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
    sentAt: send ? new Date() : undefined,
    status,
    createdBy: new mongoose.Types.ObjectId(auth.userId),
  });

  if (send) {
    const count = await sendAnnouncement(a);
    await recordAudit({
      actorId: auth.userId,
      action: 'announcement.send',
      description: `Sent announcement "${a.title}" to ${count} ${aud}`,
      resource: String(a._id),
      severity: 'success',
    });
  } else {
    await recordAudit({
      actorId: auth.userId,
      action: 'announcement.create',
      description: `Created ${status} announcement "${a.title}"`,
      resource: String(a._id),
      severity: 'info',
    });
  }

  return NextResponse.json({ ok: true, id: String(a._id), status: a.status, recipientCount: a.recipientCount });
}
