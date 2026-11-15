import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { dbConnect } from '@/lib/mongodb';
import { Event } from '@/lib/models/Event';
import { EventRegistration } from '@/lib/models/EventRegistration';

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  await dbConnect();
  const filter: Record<string, unknown> = {};
  if (status && status !== 'All') filter.status = status;
  const docs = await Event.find(filter).sort({ start: 1 }).lean();

  const regCounts = await EventRegistration.aggregate([
    { $group: { _id: '$eventSlug', count: { $sum: 1 } } },
  ]);
  const byCount = new Map<string, number>(regCounts.map((r) => [r._id as string, r.count as number]));

  return NextResponse.json({
    events: docs.map((e) => ({
      slug: e.slug,
      title: e.title,
      category: e.category,
      status: e.status,
      start: e.start,
      end: e.end,
      dateLabel: e.dateLabel,
      city: e.city,
      country: e.country,
      venue: e.venue,
      churches: e.churches,
      expected: e.expected,
      capacityPct: e.capacityPct,
      registrations: byCount.get(e.slug) ?? 0,
    })),
  });
}
