import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbConnect } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { AuthToken } from '@/lib/models/AuthToken';
import { isEmail } from '@/lib/validators';
import { limit } from '@/lib/rateLimit';
import { sendEmail } from '@/lib/email';
import { verifyEmailTemplate } from '@/lib/emailTemplates';

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  await dbConnect();
  const now = new Date();
  const doc = await AuthToken.findOne({ token, kind: 'verify', expiresAt: { $gt: now } }).lean();
  let user = doc ? await User.findById(doc.userId) : null;
  if (!user) {
    user = await User.findOne({ verifyToken: token });
  }
  if (!user) return NextResponse.json({ error: 'Invalid or already-used token' }, { status: 400 });

  user.emailVerified = new Date();
  user.verifyToken = undefined;
  await user.save();
  if (doc) await AuthToken.deleteOne({ _id: doc._id });

  return NextResponse.json({ ok: true, email: user.email });
}

export async function POST(req: Request) {
  const rl = await limit(req, 'auth.verify-resend', { max: 3, windowMs: 60 * 60 * 1000 });
  if (rl) return rl;

  try {
    const { email } = await req.json();
    if (!isEmail(email)) return NextResponse.json({ ok: true });

    await dbConnect();
    const user = await User.findOne({ email: email.toLowerCase() }).lean();
    if (user && !user.emailVerified) {
      const tokenValue = crypto.randomBytes(32).toString('hex');
      await AuthToken.create({
        token: tokenValue,
        kind: 'verify',
        userId: user._id,
        email: user.email,
        expiresAt: new Date(Date.now() + VERIFY_TTL_MS),
      });
      const url = `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/verify-email?token=${tokenValue}`;
      const tmpl = verifyEmailTemplate(user.firstName, url);
      await sendEmail({ to: user.email, subject: tmpl.subject, html: tmpl.html, text: tmpl.text });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[verify-email resend] error', err);
    return NextResponse.json({ ok: true });
  }
}
