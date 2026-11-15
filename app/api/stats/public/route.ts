export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { Church } from '@/lib/models/Church';
import { EventRegistration } from '@/lib/models/EventRegistration';
import { Event } from '@/lib/models/Event';

// Public platform stats used on the marketing home page.
// Everything returned here is aggregate counts/sums with no PII.
// Cached for 5 minutes to keep load light.
export const revalidate = 300;

export async function GET() {
  try {
    await dbConnect();

    const [partnerChurches, countriesAgg, attendeesAgg, totalEvents] = await Promise.all([
      Church.countDocuments({ verified: true }),
      Church.distinct('country', { verified: true }),
      EventRegistration.aggregate<{ total: number }>([
        { $group: { _id: null, total: { $sum: { $ifNull: ['$partySize', 1] } } } },
        { $project: { _id: 0, total: 1 } },
      ]),
      Event.countDocuments({ status: { $in: ['Open', 'Approved'] } }),
    ]);

    const countries = Array.isArray(countriesAgg)
      ? countriesAgg.filter((c): c is string => typeof c === 'string' && c.length > 0).length
      : 0;
    const attendees = attendeesAgg?.[0]?.total ?? 0;

    return NextResponse.json({
      partnerChurches,
      countries,
      attendees,
      events: totalEvents,
      asOf: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[stats/public] error', err);
    // Fail soft so the homepage can render placeholder "â€”" without breaking.
    return NextResponse.json(
      { partnerChurches: null, countries: null, attendees: null, events: null, asOf: null },
      { status: 200 }
    );
  }
}
