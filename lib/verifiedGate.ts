import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './authOptions';
import { dbConnect } from './mongodb';
import { User } from './models/User';
import { EMAIL_VERIFICATION_ENABLED } from './featureFlags';

// Ensures the caller is signed in AND email-verified.
// Returns { ok: true, userId } on success, or { ok: false, response } with a 401/403 payload.
export async function requireVerified(): Promise<
  { ok: true; userId: string } | { ok: false; response: NextResponse }
> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  // When verification is disabled globally, only the sign-in check applies.
  if (!EMAIL_VERIFICATION_ENABLED) {
    return { ok: true, userId: session.user.id };
  }
  await dbConnect();
  const u = await User.findById(session.user.id).select('emailVerified role').lean();
  if (!u) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  // Admins are always allowed through (ops access).
  if (u.role !== 'admin' && !u.emailVerified) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Please verify your email first. Check your inbox for the confirmation link.', code: 'email_not_verified' },
        { status: 403 }
      ),
    };
  }
  return { ok: true, userId: session.user.id };
}
