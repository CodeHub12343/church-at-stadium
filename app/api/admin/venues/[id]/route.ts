import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { dbConnect } from '@/lib/mongodb';
import { Venue } from '@/lib/models/Venue';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  await dbConnect();
  const v = await Venue.findOne({ venueId: params.id }).lean();
  if (!v) return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
  return NextResponse.json({
    venue: {
      id: v.venueId, name: v.name, city: v.city, country: v.country,
      capacity: v.capacity, type: v.type, verified: v.verified,
      booking: v.booking, bookingDate: v.bookingDate, upcoming: v.upcoming,
    },
  });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const body = await req.json().catch(() => ({}));
  const update: Record<string, unknown> = {};
  for (const k of ['name', 'city', 'country', 'capacity', 'type', 'verified', 'booking', 'bookingDate'] as const) {
    if (k in body) update[k] = body[k];
  }
  await dbConnect();
  const v = await Venue.findOneAndUpdate({ venueId: params.id }, { $set: update }, { new: true }).lean();
  if (!v) return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
