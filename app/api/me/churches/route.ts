import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongodb';
import { UserChurchMembership } from '@/lib/models/UserChurchMembership';
import { Church } from '@/lib/models/Church';
import { isNonEmptyString } from '@/lib/validators';
import { requireVerified } from '@/lib/verifiedGate';
import { recordAudit } from '@/lib/audit';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60);
}

const ALLOWED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_PDF_BYTES = 10 * 1024 * 1024;

async function saveChurchImage(file: File, slug: string): Promise<string | null> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) return null;
  if (file.size === 0 || file.size > MAX_IMAGE_BYTES) return null;
  const ext = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
  const buf = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), 'public', 'uploads', 'churches');
  await fs.mkdir(dir, { recursive: true });
  const name = `${slug}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
  await fs.writeFile(path.join(dir, name), buf);
  return `/uploads/churches/${name}`;
}

async function saveAuthorizationLetter(file: File, slug: string): Promise<string | null> {
  if (file.type !== 'application/pdf') return null;
  if (file.size === 0 || file.size > MAX_PDF_BYTES) return null;
  const buf = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), 'public', 'uploads', 'churches', 'authorization');
  await fs.mkdir(dir, { recursive: true });
  const name = `${slug}-${crypto.randomBytes(4).toString('hex')}.pdf`;
  await fs.writeFile(path.join(dir, name), buf);
  return `/uploads/churches/authorization/${name}`;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();

  const memberships = await UserChurchMembership.find({ userId: session.user.id }).sort({ submittedAt: -1 }).lean();
  const slugs = memberships.map((m) => m.churchSlug);
  const churches = slugs.length ? await Church.find({ slug: { $in: slugs } }).lean() : [];
  const bySlug = new Map(churches.map((c) => [c.slug, c]));

  return NextResponse.json({
    memberships: memberships.map((m) => {
      const c = bySlug.get(m.churchSlug);
      return {
        churchSlug: m.churchSlug,
        role: m.role,
        status: m.status,
        submittedAt: m.submittedAt,
        church: c
          ? {
              slug: c.slug, name: c.name, initials: c.initials, city: c.city, country: c.country,
              established: c.established, verified: c.verified, gradient: c.gradient,
              denomination: c.denomination, region: c.region, pastor: c.pastor, size: c.size, branches: c.branches,
              website: c.website, email: c.email, bio: c.bio, upcoming: c.upcoming,
            }
          : null,
      };
    }),
  });
}

export async function POST(req: Request) {
  const gate = await requireVerified();
  if (!gate.ok) return gate.response;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const contentType = req.headers.get('content-type') || '';
  type FormFields = {
    name?: string; city?: string; country?: string; region?: string; denomination?: string;
    established?: string | number; size?: string; branches?: string | number;
    website?: string; email?: string; pastor?: string; bio?: string;
    pastorTitle?: string; pastorEmail?: string; pastorPhone?: string; pastorYears?: string;
    repName?: string; repRole?: string; repEmail?: string; repPhone?: string;
    interests?: string;
  };
  let fields: FormFields = {};
  let imageFile: File | null = null;
  let authFile: File | null = null;

  if (contentType.startsWith('multipart/form-data')) {
    const form = await req.formData();
    const obj: Record<string, string> = {};
    for (const [k, v] of form.entries()) {
      if (k === 'image' && v instanceof File) {
        imageFile = v;
      } else if (k === 'authorizationLetter' && v instanceof File) {
        authFile = v;
      } else if (typeof v === 'string') {
        obj[k] = v;
      }
    }
    fields = obj as FormFields;
  } else {
    fields = (await req.json().catch(() => ({}))) as FormFields;
  }

  const { name, city, country, region, denomination, established, size, branches,
    website, email, pastor, bio, pastorTitle, pastorEmail, pastorPhone, pastorYears,
    repName, repRole, repEmail, repPhone, interests } = fields;

  if (!isNonEmptyString(name)) return NextResponse.json({ error: 'Church name required' }, { status: 400 });
  if (!isNonEmptyString(city)) return NextResponse.json({ error: 'City required' }, { status: 400 });
  if (!isNonEmptyString(country)) return NextResponse.json({ error: 'Country required' }, { status: 400 });

  await dbConnect();
  let slug = slugify(name);
  if (!slug) slug = `church-${Date.now()}`;
  let candidate = slug;
  for (let i = 1; i < 10; i++) {
    const exists = await Church.findOne({ slug: candidate }).lean();
    if (!exists) break;
    candidate = `${slug}-${i}`;
  }

  const initials = name.split(/\s+/).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || 'CH';

  let imageUrl = '';
  if (imageFile) {
    const saved = await saveChurchImage(imageFile, candidate);
    if (saved) imageUrl = saved;
  }
  let authUrl = '';
  if (authFile) {
    const saved = await saveAuthorizationLetter(authFile, candidate);
    if (saved) authUrl = saved;
  }
  const parsedInterests: string[] = (() => {
    if (!interests) return [];
    try {
      const arr = JSON.parse(interests);
      return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string').slice(0, 20) : [];
    } catch { return []; }
  })();

  const allowedRegions = ['Europe', 'Africa', 'Americas', 'Asia'] as const;
  type Region = (typeof allowedRegions)[number];
  const safeRegion: Region = allowedRegions.includes(region as Region) ? (region as Region) : 'Europe';

  const church = await Church.create({
    slug: candidate,
    name: name.trim(),
    initials,
    city: city.trim(),
    country: country.trim(),
    region: safeRegion,
    denomination: denomination || 'Non-denominational',
    established: Number(established) || new Date().getFullYear(),
    size: String(size || '—'),
    branches: Number(branches) || 1,
    website: website || '',
    email: email || '',
    pastor: pastor || '',
    pastorTitle: pastorTitle || '',
    pastorEmail: pastorEmail || '',
    pastorPhone: pastorPhone || '',
    pastorYears: pastorYears || '',
    repName: repName || '',
    repRole: repRole || '',
    repEmail: repEmail || '',
    repPhone: repPhone || '',
    authorizationLetter: authUrl,
    interests: parsedInterests,
    bio: bio || '',
    image: imageUrl,
    gradient: ['#101B32', '#2A3E6F'],
    verified: true,
    upcoming: [],
  });

  await UserChurchMembership.create({
    userId: session.user.id,
    churchSlug: church.slug,
    role: 'rep',
    status: 'verified',
    submittedAt: new Date(),
  });

  await recordAudit({
    actorId: session.user.id,
    action: 'church.create',
    description: `Created and auto-verified church "${church.name}"`,
    resource: `church:${church.slug}`,
  });

  return NextResponse.json({ ok: true, churchSlug: church.slug });
}
