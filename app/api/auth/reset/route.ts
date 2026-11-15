import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { AuthToken } from '@/lib/models/AuthToken';
import { isNonEmptyString, isPassword } from '@/lib/validators';
import { limit } from '@/lib/rateLimit';
import { clearLoginFailures } from '@/lib/loginAttempts';

async function findValidReset(token: string) {
  const now = new Date();
  // New storage: AuthToken collection (TTL-indexed)
  const doc = await AuthToken.findOne({ token, kind: 'reset', expiresAt: { $gt: now } }).lean();
  if (doc) {
    const user = await User.findById(doc.userId);
    if (user) return { user, tokenDoc: doc };
  }
  // Legacy: User.resetToken
  const legacy = await User.findOne({ resetToken: token, resetTokenExpires: { $gt: now } });
  if (legacy) return { user: legacy, tokenDoc: null };
  return null;
}

export async function POST(req: Request) {
  const rl = await limit(req, 'auth.reset', { max: 5, windowMs: 60 * 60 * 1000 });
  if (rl) return rl;

  try {
    const { token, password } = await req.json();
    if (!isNonEmptyString(token)) return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    if (!isPassword(password)) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });

    await dbConnect();
    const found = await findValidReset(token);
    if (!found) return NextResponse.json({ error: 'This reset link is invalid or has expired' }, { status: 400 });

    const { user, tokenDoc } = found;
    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();
    if (tokenDoc) await AuthToken.deleteOne({ _id: tokenDoc._id });
    await clearLoginFailures(user.email);

    return NextResponse.json({ ok: true, email: user.email });
  } catch (err) {
    console.error('[reset] error', err);
    return NextResponse.json({ error: 'Reset failed' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  if (!token) return NextResponse.json({ valid: false });
  await dbConnect();
  const found = await findValidReset(token);
  return NextResponse.json({ valid: !!found, email: found?.user.email });
}
