export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { Venue } from '@/lib/models/Venue';

export async function GET() {
  await dbConnect();
  const docs = await Venue.find({}).sort({ name: 1 }).lean();
  return NextResponse.json({
    venues: docs.map((v) => ({
      id: v.venueId,
      name: v.name,
      city: v.city,
      country: v.country,
      capacity: v.capacity,
      type: v.type,
      verified: v.verified,
      booking: v.booking,
      bookingDate: v.bookingDate,
      upcoming: v.upcoming,
      initials: v.initials,
    })),
  });
}
