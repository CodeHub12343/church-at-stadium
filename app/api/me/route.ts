import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { EventRegistration } from '@/lib/models/EventRegistration';
import { VolunteerApplication } from '@/lib/models/VolunteerApplication';
import { Event } from '@/lib/models/Event';
import { Notification } from '@/lib/models/Notification';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const [user, regs, apps, unread] = await Promise.all([
    User.findById(session.user.id).lean(),
    EventRegistration.find({ userId: session.user.id }).lean(),
    VolunteerApplication.find({ userId: session.user.id }).lean(),
    Notification.countDocuments({ userId: session.user.id, read: false }),
  ]);

  const now = Date.now();
  const slugs = Array.from(new Set(regs.map((r) => r.eventSlug)));
  const events = slugs.length ? await Event.find({ slug: { $in: slugs } }).lean() : [];
  const bySlug = new Map(events.map((e) => [e.slug, e]));

  const upcoming = regs
    .map((r) => ({ reg: r, event: bySlug.get(r.eventSlug) }))
    .filter((x) => x.event && new Date(x.event!.start).getTime() >= now)
    .sort((a, b) => new Date(a.event!.start).getTime() - new Date(b.event!.start).getTime());

  const attended = regs.filter((r) => r.checkInStatus === 'in').length;
  const groupCount = regs.filter((r) => r.mode === 'group').length;

  return NextResponse.json({
    user: {
      id: String(user?._id),
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      role: user?.role ?? 'attendee',
      churchName: user?.churchName ?? '',
      verified: !!user?.emailVerified,
    },
    stats: {
      upcomingCount: upcoming.length,
      attendedCount: attended,
      groupCount,
      approvedApps: apps.filter((a) => a.status === 'approved').length,
      pendingApps: apps.filter((a) => a.status === 'submitted' || a.status === 'under_review').length,
      unreadNotifications: unread,
    },
    upcoming: upcoming.slice(0, 5).map(({ reg, event }) => ({
      reference: reg.reference,
      partySize: reg.partySize,
      mode: reg.mode,
      checkInStatus: reg.checkInStatus,
      event: {
        slug: event!.slug,
        title: event!.title,
        dateLabel: event!.dateLabel,
        start: event!.start,
        city: event!.city,
        venue: event!.venue,
        gradient: event!.gradient,
        image: event!.image,
        status: event!.status,
        churches: event!.churches,
        expected: event!.expected,
      },
    })),
  });
}
