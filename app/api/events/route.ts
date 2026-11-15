export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { Event } from '@/lib/models/Event';

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const q = searchParams.get('q')?.trim().toLowerCase();

  const filter: Record<string, unknown> = {};
  if (category && category !== 'All') filter.category = category;

  let docs = await Event.find(filter).sort({ start: 1 }).lean();

  if (q) {
    docs = docs.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    events: docs.map((d) => ({
      slug: d.slug,
      title: d.title,
      category: d.category,
      start: d.start,
      end: d.end,
      dateLabel: d.dateLabel,
      city: d.city,
      country: d.country,
      venue: d.venue,
      churches: d.churches,
      expected: d.expected,
      capacityPct: d.capacityPct,
      gradient: d.gradient,
      status: d.status,
      image: d.image,
    })),
  });
}
