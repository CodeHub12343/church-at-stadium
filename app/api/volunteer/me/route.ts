import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongodb';
import { VolunteerApplication } from '@/lib/models/VolunteerApplication';
import { Event } from '@/lib/models/Event';
import { User } from '@/lib/models/User';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const [user, apps] = await Promise.all([
    User.findById(session.user.id).lean(),
    VolunteerApplication.find({ userId: session.user.id }).lean(),
  ]);

  const approved = apps.filter((a) => a.status === 'approved');
  const pending = apps.filter((a) => a.status === 'submitted' || a.status === 'under_review');

  let nextAssignment: {
    eventSlug: string;
    eventTitle: string;
    dateLabel: string;
    start: string;
    department: string;
    role: string;
    daysToGo: number;
  } | null = null;

  if (approved.length) {
    const slugs = approved.map((a) => a.eventSlug);
    const events = await Event.find({ slug: { $in: slugs } }).lean();
    const now = Date.now();
    const upcoming = events
      .map((e) => ({ event: e, app: approved.find((a) => a.eventSlug === e.slug)! }))
      .filter((x) => new Date(x.event.start).getTime() >= now)
      .sort((a, b) => new Date(a.event.start).getTime() - new Date(b.event.start).getTime());
    if (upcoming[0]) {
      const { event, app } = upcoming[0];
      nextAssignment = {
        eventSlug: event.slug,
        eventTitle: event.title,
        dateLabel: event.dateLabel,
        start: event.start,
        department: app.department,
        role: app.role,
        daysToGo: Math.max(0, Math.ceil((new Date(event.start).getTime() - now) / 86400000)),
      };
    }
  }

  const oldestPending = pending.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )[0];

  return NextResponse.json({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    stats: {
      approvedCount: approved.length,
      pendingCount: pending.length,
      oldestPendingDays: oldestPending
        ? Math.floor((Date.now() - new Date(oldestPending.createdAt).getTime()) / 86400000)
        : null,
      hoursServed: 0, // reserved for future activity log
      eventsServed: 0,
    },
    nextAssignment,
    applications: apps
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map((a) => ({
        id: String(a._id),
        department: a.department,
        role: a.role,
        city: a.city,
        eventSlug: a.eventSlug,
        status: a.status,
        reportingInstructions: a.reportingInstructions,
        createdAt: a.createdAt,
      })),
  });
}
