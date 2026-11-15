import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { Church } from '@/lib/models/Church';
import { Event } from '@/lib/models/Event';

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  await dbConnect();
  const church = await Church.findOne({ slug: params.slug }).lean();
  if (!church) return NextResponse.json({ error: 'Church not found' }, { status: 404 });

  const upcomingEvents = church.upcoming?.length
    ? await Event.find({ slug: { $in: church.upcoming } }).lean()
    : [];

  return NextResponse.json({
    church: {
      slug: church.slug,
      initials: church.initials,
      name: church.name,
      city: church.city,
      country: church.country,
      region: church.region,
      denomination: church.denomination,
      established: church.established,
      size: church.size,
      branches: church.branches,
      website: church.website,
      email: church.email,
      pastor: church.pastor,
      bio: church.bio,
      gradient: church.gradient,
      verified: church.verified,
      upcoming: church.upcoming,
    },
    upcomingEvents: upcomingEvents.map((e) => ({
      slug: e.slug,
      title: e.title,
      category: e.category,
      dateLabel: e.dateLabel,
      city: e.city,
      venue: e.venue,
      gradient: e.gradient,
      image: e.image,
    })),
  });
}
