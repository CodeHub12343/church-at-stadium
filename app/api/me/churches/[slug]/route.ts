import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongodb';
import { UserChurchMembership } from '@/lib/models/UserChurchMembership';
import { Church } from '@/lib/models/Church';
import { Event } from '@/lib/models/Event';

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const membership = await UserChurchMembership.findOne({
    userId: session.user.id,
    churchSlug: params.slug,
  }).lean();
  if (!membership) return NextResponse.json({ error: 'Not a member of this church' }, { status: 404 });

  const church = await Church.findOne({ slug: params.slug }).lean();
  if (!church) return NextResponse.json({ error: 'Church not found' }, { status: 404 });

  const upcomingEvents = church.upcoming?.length
    ? await Event.find({ slug: { $in: church.upcoming } }).lean()
    : [];

  return NextResponse.json({
    membership: {
      role: membership.role,
      status: membership.status,
      submittedAt: membership.submittedAt,
    },
    church,
    upcomingEvents: upcomingEvents.map((e) => ({
      slug: e.slug, title: e.title, dateLabel: e.dateLabel, city: e.city, venue: e.venue, gradient: e.gradient,
    })),
  });
}
