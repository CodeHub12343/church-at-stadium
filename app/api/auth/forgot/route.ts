import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbConnect } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { AuthToken } from '@/lib/models/AuthToken';
import { isEmail } from '@/lib/validators';
import { limit } from '@/lib/rateLimit';
import { sendEmail } from '@/lib/email';
import { resetPasswordTemplate } from '@/lib/emailTemplates';

const RESET_TTL_MS = 30 * 60 * 1000;

export async function POST(req: Request) {
  const rl = await limit(req, 'auth.forgot', { max: 3, windowMs: 60 * 60 * 1000 });
  if (rl) return rl;

  try {
    const { email } = await req.json();
    if (!isEmail(email)) return NextResponse.json({ ok: true }); // don't leak

    await dbConnect();
    const user = await User.findOne({ email: email.toLowerCase() }).lean();
    if (user) {
      const tokenValue = crypto.randomBytes(32).toString('hex');
      await AuthToken.create({
        token: tokenValue,
        kind: 'reset',
        userId: user._id,
        email: user.email,
        expiresAt: new Date(Date.now() + RESET_TTL_MS),
      });
      const url = `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/reset?token=${tokenValue}`;
      const tmpl = resetPasswordTemplate(user.firstName, url);
      await sendEmail({ to: user.email, subject: tmpl.subject, html: tmpl.html, text: tmpl.text });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[forgot] error', err);
    return NextResponse.json({ ok: true }); // still don't leak
  }
}
