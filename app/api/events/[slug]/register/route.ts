import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongodb';
import { Event } from '@/lib/models/Event';
import { EventRegistration } from '@/lib/models/EventRegistration';
import { isEmail, isNonEmptyString } from '@/lib/validators';
import { limit } from '@/lib/rateLimit';
import { sendEmail } from '@/lib/email';
import { registrationConfirmedTemplate } from '@/lib/emailTemplates';

function makeReference(slug: string) {
  const prefix = slug.replace(/[^a-z0-9]/gi, '').slice(0, 3).toUpperCase() || 'EVT';
  const n = crypto.randomInt(10000, 99999);
  return `CATS-${prefix}-${n}`;
}

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Please sign in to register for this event.', code: 'auth_required' },
      { status: 401 }
    );
  }
  const rl = await limit(req, 'event.register', { max: 10, windowMs: 60 * 60 * 1000, extra: params.slug });
  if (rl) return rl;

  try {
    const body = await req.json();
    const {
      mode,
      partySize,
      firstName,
      lastName,
      email,
      country,
      city,
      churchName,
      days,
      accessibility,
      consentReminders,
      consentMarketing,
    } = body ?? {};

    if (!isNonEmptyString(firstName)) return NextResponse.json({ error: 'First name is required' }, { status: 400 });
    if (!isNonEmptyString(lastName)) return NextResponse.json({ error: 'Last name is required' }, { status: 400 });
    if (!isEmail(email)) return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    if (!isNonEmptyString(country)) return NextResponse.json({ error: 'Country is required' }, { status: 400 });
    if (!isNonEmptyString(city)) return NextResponse.json({ error: 'City is required' }, { status: 400 });
    const dayList = Array.isArray(days) ? days.filter((d) => typeof d === 'string') : [];
    if (dayList.length === 0) return NextResponse.json({ error: 'Pick at least one day' }, { status: 400 });

    await dbConnect();

    const event = await Event.findOne({ slug: params.slug }).lean();
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    const normalizedEmail = email.toLowerCase().trim();
    const partyCount = Math.max(1, Number(partySize) || (mode === 'group' ? 2 : 1));

    // Duplicate-registration guard
    const dup = await EventRegistration.findOne({ eventSlug: params.slug, email: normalizedEmail }).lean();
    if (dup) {
      return NextResponse.json(
        { error: `This email is already registered for ${event.title}. Reference: ${dup.reference}`, reference: dup.reference },
        { status: 409 }
      );
    }

    // Capacity guard
    if (typeof event.capacityLimit === 'number' && event.capacityLimit > 0) {
      const taken = await EventRegistration.aggregate<{ total: number }>([
        { $match: { eventSlug: params.slug } },
        { $group: { _id: null, total: { $sum: { $ifNull: ['$partySize', 1] } } } },
        { $project: { _id: 0, total: 1 } },
      ]);
      const current = taken[0]?.total ?? 0;
      if (current + partyCount > event.capacityLimit) {
        return NextResponse.json(
          { error: 'This event is at capacity. Try the waitlist from the event page.' },
          { status: 409 }
        );
      }
    }

    let reference = makeReference(params.slug);
    for (let i = 0; i < 5; i++) {
      const existingRef = await EventRegistration.findOne({ reference }).lean();
      if (!existingRef) break;
      reference = makeReference(params.slug);
    }

    let reg;
    try {
      reg = await EventRegistration.create({
        reference,
        eventSlug: params.slug,
        userId: session.user.id,
        mode: mode === 'group' ? 'group' : 'individual',
        partySize: partyCount,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        country: country.trim(),
        city: city.trim(),
        churchName: isNonEmptyString(churchName) ? churchName.trim() : undefined,
        days: dayList,
        accessibility: isNonEmptyString(accessibility) ? accessibility.trim() : undefined,
        consentReminders: consentReminders !== false,
        consentMarketing: !!consentMarketing,
      });
    } catch (err) {
      // Dup-key race: another request landed between the dup check and the write
      if (typeof err === 'object' && err && (err as { code?: number }).code === 11000) {
        const existingReg = await EventRegistration.findOne({ eventSlug: params.slug, email: normalizedEmail }).lean();
        return NextResponse.json(
          { error: 'This email is already registered for that event.', reference: existingReg?.reference },
          { status: 409 }
        );
      }
      throw err;
    }

    const { Notification } = await import('@/lib/models/Notification');
    await Notification.create({
      userId: session.user.id,
      title: `Registration confirmed · ${event.title}`,
      body: `You're in. Reference ${reg.reference}. ${event.dateLabel} · ${event.venue}.`,
      tag: 'Event update',
      link: `/events/${event.slug}`,
      icon: '✓',
      bg: '#E6F5EC',
      fg: '#0E7A4C',
    });

    const base = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const tmpl = registrationConfirmedTemplate({
      firstName: reg.firstName,
      eventTitle: event.title,
      dateLabel: event.dateLabel,
      venue: event.venue,
      reference: reg.reference,
      eventUrl: `${base}/events/${event.slug}`,
    });
    await sendEmail({ to: reg.email, subject: tmpl.subject, html: tmpl.html, text: tmpl.text });

    return NextResponse.json({
      ok: true,
      reference: reg.reference,
      email: reg.email,
    });
  } catch (err) {
    console.error('[event register] error', err);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get('reference');
  if (!reference) return NextResponse.json({ error: 'Missing reference' }, { status: 400 });

  await dbConnect();
  const reg = await EventRegistration.findOne({ eventSlug: params.slug, reference }).lean();
  if (!reg) return NextResponse.json({ error: 'Registration not found' }, { status: 404 });

  return NextResponse.json({
    registration: {
      reference: reg.reference,
      eventSlug: reg.eventSlug,
      mode: reg.mode,
      partySize: reg.partySize,
      firstName: reg.firstName,
      lastName: reg.lastName,
      email: reg.email,
      days: reg.days,
      checkInStatus: reg.checkInStatus,
    },
  });
}
