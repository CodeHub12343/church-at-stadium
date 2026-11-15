import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/mongodb';
import { User, UserRole } from '@/lib/models/User';
import { AuthToken } from '@/lib/models/AuthToken';
import { isEmail, isNonEmptyString, isPassword } from '@/lib/validators';
import { limit } from '@/lib/rateLimit';
import { sendEmail } from '@/lib/email';
import { verifyEmailTemplate } from '@/lib/emailTemplates';
import { EMAIL_VERIFICATION_ENABLED } from '@/lib/featureFlags';

const ALLOWED_ROLES: UserRole[] = ['church_rep', 'volunteer', 'organizer', 'attendee'];
const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  const rl = await limit(req, 'auth.register', { max: 5, windowMs: 60 * 60 * 1000 });
  if (rl) return rl;

  try {
    const body = await req.json();
    const { email, password, firstName, lastName, country, role } = body ?? {};

    if (!isEmail(email)) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    if (!isPassword(password)) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    if (!isNonEmptyString(firstName)) return NextResponse.json({ error: 'First name is required' }, { status: 400 });
    if (!isNonEmptyString(lastName)) return NextResponse.json({ error: 'Last name is required' }, { status: 400 });
    const userRole: UserRole = ALLOWED_ROLES.includes(role) ? role : 'attendee';

    await dbConnect();

    const existing = await User.findOne({ email: email.toLowerCase() }).lean();
    if (existing) {
      return NextResponse.json({ error: 'An account with that email already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      country: isNonEmptyString(country) ? country.trim() : undefined,
      role: userRole,
      // When verification is disabled, mark the user as verified at creation
      // so the verified-email gate and banner stay out of the way.
      emailVerified: EMAIL_VERIFICATION_ENABLED ? undefined : new Date(),
    });

    const welcomeBody = EMAIL_VERIFICATION_ENABLED
      ? `Thanks for joining, ${user.firstName}. Verify your email, then explore upcoming gatherings.`
      : `Thanks for joining, ${user.firstName}. Explore upcoming gatherings from your dashboard.`;

    const { Notification } = await import('@/lib/models/Notification');
    await Notification.create({
      userId: user._id,
      title: 'Welcome to Church at the Stadiums',
      body: welcomeBody,
      tag: 'Account',
      link: '/dashboard',
      icon: '🎉',
      bg: '#F3F4F6',
      fg: '#667085',
    });

    if (EMAIL_VERIFICATION_ENABLED) {
      const tokenValue = crypto.randomBytes(32).toString('hex');
      await AuthToken.create({
        token: tokenValue,
        kind: 'verify',
        userId: user._id,
        email: user.email,
        expiresAt: new Date(Date.now() + VERIFY_TTL_MS),
      });

      const verifyUrl = `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/verify-email?token=${tokenValue}`;
      const tmpl = verifyEmailTemplate(user.firstName, verifyUrl);
      await sendEmail({ to: user.email, subject: tmpl.subject, html: tmpl.html, text: tmpl.text });
    }

    return NextResponse.json({ ok: true, email: user.email, verificationRequired: EMAIL_VERIFICATION_ENABLED });
  } catch (err) {
    console.error('[register] error', err);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
