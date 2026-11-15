import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { Event } from '@/lib/models/Event';

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  await dbConnect();
  const doc = await Event.findOne({ slug: params.slug }).lean();
  if (!doc) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  return NextResponse.json({
    event: {
      slug: doc.slug,
      title: doc.title,
      category: doc.category,
      start: doc.start,
      end: doc.end,
      dateLabel: doc.dateLabel,
      city: doc.city,
      country: doc.country,
      venue: doc.venue,
      churches: doc.churches,
      expected: doc.expected,
      capacityPct: doc.capacityPct,
      gradient: doc.gradient,
      status: doc.status,
      image: doc.image,
    },
  });
}
