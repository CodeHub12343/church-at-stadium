import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongodb';
import { EventRegistration } from '@/lib/models/EventRegistration';
import { Event, EventCategory } from '@/lib/models/Event';
import { requireVerified } from '@/lib/verifiedGate';
import { recordAudit } from '@/lib/audit';
import { isNonEmptyString } from '@/lib/validators';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60);
}

const ALLOWED_CATEGORIES: EventCategory[] = [
  'Stadium Worship', 'United Prayer', 'Gospel Crusade', 'Conference', 'Youth Gathering', 'Outreach',
];

const ALLOWED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

async function saveEventImage(file: File, slug: string): Promise<string | null> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) return null;
  if (file.size === 0 || file.size > MAX_IMAGE_BYTES) return null;
  const ext = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
  const buf = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), 'public', 'uploads', 'events');
  await fs.mkdir(dir, { recursive: true });
  const name = `${slug}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
  await fs.writeFile(path.join(dir, name), buf);
  return `/uploads/events/${name}`;
}

function formatDateLabel(startIso: string, endIso: string): string {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const fmt = (d: Date) =>
    d.toLocaleDateString('en', { day: '2-digit', month: 'short', year: 'numeric' });
  if (Number.isNaN(s.getTime())) return '';
  if (Number.isNaN(e.getTime()) || s.toDateString() === e.toDateString()) return fmt(s);
  return `${fmt(s)} – ${fmt(e)}`;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const regs = await EventRegistration.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean();
  const slugs = Array.from(new Set(regs.map((r) => r.eventSlug)));
  const events = slugs.length ? await Event.find({ slug: { $in: slugs } }).lean() : [];
  const bySlug = new Map(events.map((e) => [e.slug, e]));

  const now = Date.now();
  const items = regs
    .map((r) => {
      const ev = bySlug.get(r.eventSlug);
      if (!ev) return null;
      return {
        reference: r.reference,
        partySize: r.partySize,
        mode: r.mode,
        days: r.days,
        checkInStatus: r.checkInStatus,
        createdAt: r.createdAt,
        event: {
          slug: ev.slug,
          title: ev.title,
          category: ev.category,
          dateLabel: ev.dateLabel,
          start: ev.start,
          end: ev.end,
          city: ev.city,
          country: ev.country,
          venue: ev.venue,
          gradient: ev.gradient,
          image: ev.image,
          status: ev.status,
          expected: ev.expected,
          churches: ev.churches,
          capacityPct: ev.capacityPct,
        },
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const upcoming = items.filter((i) => new Date(i!.event.start).getTime() >= now);
  const past = items.filter((i) => new Date(i!.event.start).getTime() < now);

  return NextResponse.json({
    upcoming,
    past,
    stats: {
      upcomingCount: upcoming.length,
      attendedCount: regs.filter((r) => r.checkInStatus === 'in').length,
      groupCount: regs.filter((r) => r.mode === 'group').length,
    },
  });
}

export async function POST(req: Request) {
  const gate = await requireVerified();
  if (!gate.ok) return gate.response;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const contentType = req.headers.get('content-type') || '';
  type Fields = {
    title?: string; category?: string;
    start?: string; end?: string;
    city?: string; country?: string; venue?: string;
    expected?: string;
    description?: string;
    registrationMode?: string;
    registrationCap?: string;
    departments?: string;
  };
  let fields: Fields = {};
  let imageFile: File | null = null;

  if (contentType.startsWith('multipart/form-data')) {
    const form = await req.formData();
    const obj: Record<string, string> = {};
    for (const [k, v] of form.entries()) {
      if (k === 'image' && v instanceof File) {
        imageFile = v;
      } else if (typeof v === 'string') {
        obj[k] = v;
      }
    }
    fields = obj as Fields;
  } else {
    fields = (await req.json().catch(() => ({}))) as Fields;
  }

  const { title, category, start, end, city, country, venue, expected,
    description, registrationMode, registrationCap, departments } = fields;

  if (!isNonEmptyString(title)) return NextResponse.json({ error: 'Event title is required' }, { status: 400 });
  if (!isNonEmptyString(city))  return NextResponse.json({ error: 'City is required' }, { status: 400 });
  if (!isNonEmptyString(country)) return NextResponse.json({ error: 'Country is required' }, { status: 400 });
  if (!isNonEmptyString(venue)) return NextResponse.json({ error: 'Venue is required' }, { status: 400 });
  if (!isNonEmptyString(start)) return NextResponse.json({ error: 'Start date is required' }, { status: 400 });

  const startDate = new Date(start);
  if (Number.isNaN(startDate.getTime())) return NextResponse.json({ error: 'Start date is not valid' }, { status: 400 });
  const endDate = isNonEmptyString(end) ? new Date(end) : startDate;
  if (Number.isNaN(endDate.getTime())) return NextResponse.json({ error: 'End date is not valid' }, { status: 400 });
  if (endDate.getTime() < startDate.getTime()) {
    return NextResponse.json({ error: 'End date must be after start' }, { status: 400 });
  }

  const safeCategory: EventCategory = ALLOWED_CATEGORIES.includes(category as EventCategory)
    ? (category as EventCategory)
    : 'Conference';

  await dbConnect();

  let base = slugify(title);
  if (!base) base = `event-${Date.now()}`;
  let candidate = base;
  for (let i = 1; i < 20; i++) {
    const exists = await Event.findOne({ slug: candidate }).lean();
    if (!exists) break;
    candidate = `${base}-${i}`;
  }

  let imageUrl: string | undefined;
  if (imageFile) {
    const saved = await saveEventImage(imageFile, candidate);
    if (saved) imageUrl = saved;
  }

  const ev = await Event.create({
    slug: candidate,
    title: title.trim(),
    category: safeCategory,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    dateLabel: formatDateLabel(startDate.toISOString(), endDate.toISOString()),
    city: city.trim(),
    country: country.trim(),
    venue: venue.trim(),
    churches: 0,
    expected: (expected ?? '').trim(),
    capacityPct: 0,
    gradient: ['#101B32', '#2A3E6F'],
    status: 'Open',
    image: imageUrl,
    createdBy: session.user.id,
    description: (description ?? '').trim(),
    registrationMode: registrationMode === 'invitation' ? 'invitation' : 'open',
    registrationCap: registrationCap ? Number(registrationCap) || undefined : undefined,
    departments: (() => {
      if (!departments) return [];
      try {
        const parsed = JSON.parse(departments);
        if (!Array.isArray(parsed)) return [];
        return parsed
          .filter((d: unknown): d is { name: string; slots: number } =>
            !!d && typeof (d as { name: unknown }).name === 'string')
          .map((d) => ({ name: String(d.name).slice(0, 60), slots: Number(d.slots) || 0 }));
      } catch { return []; }
    })(),
  });

  await recordAudit({
    actorId: session.user.id,
    action: 'event.create',
    description: `Created and published event "${ev.title}"`,
    resource: `event:${ev.slug}`,
  });

  return NextResponse.json({ ok: true, slug: ev.slug });
}
