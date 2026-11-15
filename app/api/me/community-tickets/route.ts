import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongodb';
import { CommunityTicket } from '@/lib/models/CommunityTicket';
import { Event } from '@/lib/models/Event';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();

  const tickets = await CommunityTicket.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean();
  const slugs = Array.from(new Set(tickets.map((t) => t.eventSlug)));
  const events = slugs.length ? await Event.find({ slug: { $in: slugs } }).lean() : [];
  const bySlug = new Map(events.map((e) => [e.slug, e]));

  return NextResponse.json({
    tickets: tickets.map((t) => ({
      reference: t.reference,
      ticketType: t.ticketType,
      seats: t.seats,
      status: t.status,
      createdAt: t.createdAt,
      event: bySlug.get(t.eventSlug)
        ? {
            slug: bySlug.get(t.eventSlug)!.slug,
            title: bySlug.get(t.eventSlug)!.title,
            dateLabel: bySlug.get(t.eventSlug)!.dateLabel,
            venue: bySlug.get(t.eventSlug)!.venue,
            city: bySlug.get(t.eventSlug)!.city,
            country: bySlug.get(t.eventSlug)!.country,
          }
        : null,
    })),
  });
}
