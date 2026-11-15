import { Event, IEvent } from '@/lib/models/Event';
import { CommunityTicket } from '@/lib/models/CommunityTicket';

export type CommunityAvailability = {
  totalReserved: number;
  seatsClaimed: number;
  seatsRemaining: number;
  reservedPct: number;
  totalCapacity: number;
  isConfigured: boolean;
};

function capacityFromEvent(ev: Pick<IEvent, 'registrationCap' | 'expected'>): number {
  if (typeof ev.registrationCap === 'number' && ev.registrationCap > 0) return ev.registrationCap;
  // Fall back to parsing the `expected` text, e.g. "82,000"
  const digits = (ev.expected || '').replace(/[^\d]/g, '');
  const n = Number(digits);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export async function getCommunityAvailability(eventSlug: string): Promise<CommunityAvailability | null> {
  const ev = await Event.findOne({ slug: eventSlug })
    .select('registrationCap expected communityReservedPct')
    .lean();
  if (!ev) return null;

  const totalCapacity = capacityFromEvent(ev);
  const reservedPct = typeof ev.communityReservedPct === 'number' ? ev.communityReservedPct : 10;
  const totalReserved = Math.floor((totalCapacity * reservedPct) / 100);

  const agg = await CommunityTicket.aggregate<{ _id: null; seats: number }>([
    { $match: { eventSlug, status: { $in: ['reserved', 'issued'] } } },
    { $group: { _id: null, seats: { $sum: '$seats' } } },
  ]);
  const seatsClaimed = agg[0]?.seats ?? 0;

  return {
    totalReserved,
    seatsClaimed,
    seatsRemaining: Math.max(0, totalReserved - seatsClaimed),
    reservedPct,
    totalCapacity,
    isConfigured: totalCapacity > 0,
  };
}

export function generateReference(): string {
  const d = new Date();
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CT-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${code}`;
}
