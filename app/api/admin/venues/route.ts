import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { dbConnect } from '@/lib/mongodb';
import { Venue } from '@/lib/models/Venue';
import { isNonEmptyString } from '@/lib/validators';

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  await dbConnect();
  const docs = await Venue.find({}).sort({ name: 1 }).lean();
  return NextResponse.json({
    venues: docs.map((v) => ({
      id: v.venueId, name: v.name, city: v.city, country: v.country,
      capacity: v.capacity, type: v.type, verified: v.verified,
      booking: v.booking, bookingDate: v.bookingDate, upcoming: v.upcoming, initials: v.initials,
    })),
  });
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const body = await req.json().catch(() => ({}));
  const { name, city, country, capacity, type, booking, bookingDate, verified } = body ?? {};
  if (!isNonEmptyString(name)) return NextResponse.json({ error: 'Name required' }, { status: 400 });
  if (!isNonEmptyString(city)) return NextResponse.json({ error: 'City required' }, { status: 400 });

  const venueId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40) || `venue-${Date.now()}`;
  const initials = name.split(/\s+/).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || 'VN';

  await dbConnect();
  await Venue.create({
    venueId,
    name: name.trim(),
    city: city.trim(),
    country: country || '',
    capacity: Number(capacity) || 0,
    type: type === 'Indoor' ? 'Indoor' : 'Outdoor',
    verified: !!verified,
    booking: booking || 'available',
    bookingDate: bookingDate || undefined,
    upcoming: 0,
    initials,
  });
  return NextResponse.json({ ok: true, id: venueId });
}
