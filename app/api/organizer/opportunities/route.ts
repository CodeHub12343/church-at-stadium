import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import crypto from 'crypto';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongodb';
import { Event } from '@/lib/models/Event';
import { VolunteerOpportunity } from '@/lib/models/VolunteerOpportunity';
import { isNonEmptyString } from '@/lib/validators';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { eventSlug, department, role, total, supervisor, requirements } = body ?? {};

  if (!isNonEmptyString(eventSlug)) return NextResponse.json({ error: 'eventSlug required' }, { status: 400 });
  if (!isNonEmptyString(department)) return NextResponse.json({ error: 'Department required' }, { status: 400 });
  if (!isNonEmptyString(role)) return NextResponse.json({ error: 'Role required' }, { status: 400 });

  await dbConnect();
  const ev = await Event.findOne({ slug: eventSlug }).lean();
  if (!ev) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  if (String(ev.createdBy) !== String(session.user.id)) {
    return NextResponse.json({ error: 'Not your event' }, { status: 403 });
  }

  const d = new Date(ev.start);
  const monthShort = Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('en', { month: 'short' });
  const dayShort = Number.isNaN(d.getTime()) ? '—' : String(d.getDate());

  const opp = await VolunteerOpportunity.create({
    opportunityId: `opp-${crypto.randomBytes(4).toString('hex')}`,
    eventSlug: ev.slug,
    department: String(department).trim(),
    role: String(role).trim(),
    city: ev.city,
    dateLabel: ev.dateLabel,
    monthShort,
    dayShort,
    filled: 0,
    total: Math.max(1, Number(total) || 5),
    supervisor: isNonEmptyString(supervisor) ? supervisor.trim() : undefined,
    requirements: isNonEmptyString(requirements) ? requirements.trim() : undefined,
    recommended: false,
  });

  return NextResponse.json({ ok: true, id: opp.opportunityId });
}
