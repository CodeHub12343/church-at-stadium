import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongodb';
import { Event } from '@/lib/models/Event';
import { CommunityTicket } from '@/lib/models/CommunityTicket';
import { getCommunityAvailability, generateReference } from '@/lib/communityTickets';
import { recordAudit } from '@/lib/audit';
import { isNonEmptyString, isEmail } from '@/lib/validators';

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  await dbConnect();
  const avail = await getCommunityAvailability(params.slug);
  if (!avail) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  return NextResponse.json({ availability: avail });
}

type Body = {
  ticketType?: 'adult' | 'mother_child';
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  ebtAcknowledged?: boolean;
  privacyAcknowledged?: boolean;
};

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  const event = await Event.findOne({ slug: params.slug }).lean();
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as Body;

  const ticketType = body.ticketType === 'mother_child' ? 'mother_child' : 'adult';
  const seats = ticketType === 'mother_child' ? 2 : 1;

  if (!isNonEmptyString(body.firstName)) return NextResponse.json({ error: 'First name is required' }, { status: 400 });
  if (!isNonEmptyString(body.lastName)) return NextResponse.json({ error: 'Last name is required' }, { status: 400 });
  if (!isEmail(body.email)) return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
  if (!body.ebtAcknowledged) return NextResponse.json({ error: 'You must confirm you will present a valid EBT card or other accepted proof of eligibility at entry' }, { status: 400 });
  if (!body.privacyAcknowledged) return NextResponse.json({ error: 'You must acknowledge the privacy notice' }, { status: 400 });

  // Prevent duplicate active claims for this event by the same user/email
  const email = body.email.trim().toLowerCase();
  const existing = await CommunityTicket.findOne({
    eventSlug: params.slug,
    status: { $in: ['reserved', 'issued'] },
    $or: [
      session?.user?.id ? { userId: session.user.id } : { _id: null },
      { email },
    ],
  }).lean();
  if (existing) {
    return NextResponse.json({
      error: 'A community ticket is already reserved for this email on this event.',
      reference: existing.reference,
    }, { status: 409 });
  }

  const avail = await getCommunityAvailability(params.slug);
  if (!avail || !avail.isConfigured) {
    return NextResponse.json({ error: 'Community tickets are not yet configured for this event. Please check back.' }, { status: 400 });
  }
  if (avail.seatsRemaining < seats) {
    return NextResponse.json({
      error: ticketType === 'mother_child'
        ? `Only ${avail.seatsRemaining} community seat${avail.seatsRemaining === 1 ? '' : 's'} left — not enough for a mother + child pair.`
        : 'Community tickets for this event are fully allocated.',
    }, { status: 409 });
  }

  const ticket = await CommunityTicket.create({
    reference: generateReference(),
    eventSlug: params.slug,
    userId: session?.user?.id,
    firstName: body.firstName.trim(),
    lastName: body.lastName.trim(),
    email,
    phone: (body.phone || '').trim(),
    ticketType,
    seats,
    ebtAcknowledged: true,
    privacyAcknowledged: true,
    status: 'reserved',
  });

  if (session?.user?.id) {
    await recordAudit({
      actorId: session.user.id,
      action: 'community_ticket.reserve',
      description: `Reserved ${seats} community seat${seats === 1 ? '' : 's'} (${ticketType}) for event "${event.title}"`,
      resource: `event:${event.slug}`,
    });
  }

  const updated = await getCommunityAvailability(params.slug);

  return NextResponse.json({
    ok: true,
    reference: ticket.reference,
    seats,
    ticketType,
    availability: updated,
  });
}
