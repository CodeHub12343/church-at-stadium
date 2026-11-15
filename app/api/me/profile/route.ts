import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { EMAIL_VERIFICATION_ENABLED } from '@/lib/featureFlags';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const user = await User.findById(session.user.id).lean();
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json({
    profile: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      secondaryEmail: user.secondaryEmail ?? '',
      phone: user.phone ?? '',
      displayName: user.displayName ?? `${user.firstName} ${user.lastName}`.trim(),
      pronouns: user.pronouns ?? 'x',
      language: user.language ?? 'en-GB',
      bio: user.bio ?? '',
      country: user.country ?? '',
      churchName: user.churchName ?? '',
      role: user.role,
      memberSince: user.createdAt,
      verified: !EMAIL_VERIFICATION_ENABLED || !!user.emailVerified,
      avatarUrl: user.avatarUrl ?? '',
    },
  });
}

const EDITABLE = [
  'firstName', 'lastName', 'displayName', 'pronouns',
  'secondaryEmail', 'phone', 'language', 'bio', 'country', 'churchName',
  'avatarUrl',
] as const;

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const update: Record<string, unknown> = {};
  for (const k of EDITABLE) {
    if (k in body) {
      const v = body[k];
      if (typeof v === 'string') update[k] = v.trim();
      else if (v === null || v === '') update[k] = '';
    }
  }
  if (!Object.keys(update).length) return NextResponse.json({ ok: true });

  await dbConnect();
  await User.findByIdAndUpdate(session.user.id, { $set: update });
  return NextResponse.json({ ok: true });
}
