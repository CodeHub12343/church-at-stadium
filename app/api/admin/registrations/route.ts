import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { dbConnect } from '@/lib/mongodb';
import { EventRegistration } from '@/lib/models/EventRegistration';

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { searchParams } = new URL(req.url);
  const eventSlug = searchParams.get('event');
  const status = searchParams.get('status'); // check-in status
  const limit = Math.min(500, Number(searchParams.get('limit')) || 200);

  await dbConnect();
  const filter: Record<string, unknown> = {};
  if (eventSlug) filter.eventSlug = eventSlug;
  if (status && status !== 'All') filter.checkInStatus = status;
  const docs = await EventRegistration.find(filter).sort({ createdAt: -1 }).limit(limit).lean();

  return NextResponse.json({
    total: docs.length,
    registrations: docs.map((r) => ({
      id: String(r._id),
      reference: r.reference,
      eventSlug: r.eventSlug,
      name: `${r.firstName} ${r.lastName}`.trim(),
      email: r.email,
      partySize: r.partySize,
      mode: r.mode,
      country: r.country,
      city: r.city,
      churchName: r.churchName,
      days: r.days,
      checkInStatus: r.checkInStatus,
      checkedInAt: r.checkedInAt,
      createdAt: r.createdAt,
    })),
  });
}
