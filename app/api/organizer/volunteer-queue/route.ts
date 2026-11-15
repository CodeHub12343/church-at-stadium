import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongodb';
import { Event } from '@/lib/models/Event';
import { VolunteerOpportunity } from '@/lib/models/VolunteerOpportunity';
import { VolunteerApplication } from '@/lib/models/VolunteerApplication';
import { User } from '@/lib/models/User';

// Returns the organizer's events, each with its opportunities + applications.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const events = await Event.find({ createdBy: session.user.id }).sort({ start: 1 }).lean();
  if (events.length === 0) return NextResponse.json({ events: [] });

  const slugs = events.map((e) => e.slug);
  const [opps, apps] = await Promise.all([
    VolunteerOpportunity.find({ eventSlug: { $in: slugs } }).lean(),
    VolunteerApplication.find({ eventSlug: { $in: slugs } }).sort({ createdAt: -1 }).lean(),
  ]);

  const applicantIds = Array.from(new Set(apps.map((a) => String(a.userId))));
  const users = applicantIds.length
    ? await User.find({ _id: { $in: applicantIds } }).select('firstName lastName email').lean()
    : [];
  const userMap = new Map(users.map((u) => [String(u._id), u]));

  return NextResponse.json({
    events: events.map((e) => ({
      slug: e.slug,
      title: e.title,
      dateLabel: e.dateLabel,
      city: e.city,
      country: e.country,
      opportunities: opps
        .filter((o) => o.eventSlug === e.slug)
        .map((o) => ({
          id: o.opportunityId,
          department: o.department,
          role: o.role,
          filled: o.filled,
          total: o.total,
          supervisor: o.supervisor,
          requirements: o.requirements,
        })),
      applications: apps
        .filter((a) => a.eventSlug === e.slug)
        .map((a) => {
          const u = userMap.get(String(a.userId));
          return {
            id: String(a._id),
            opportunityId: a.opportunityId,
            department: a.department,
            role: a.role,
            status: a.status,
            createdAt: a.createdAt,
            applicantName: u ? `${u.firstName} ${u.lastName}`.trim() : 'Unknown',
            applicantEmail: u?.email ?? '',
          };
        }),
    })),
  });
}
