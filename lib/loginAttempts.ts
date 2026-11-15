import { dbConnect } from './mongodb';
import { LoginAttempt } from './models/LoginAttempt';

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export type LockoutStatus =
  | { locked: false }
  | { locked: true; retryAfterSeconds: number };

export async function checkLockout(email: string): Promise<LockoutStatus> {
  await dbConnect();
  const key = email.toLowerCase().trim();
  const doc = await LoginAttempt.findOne({ email: key }).lean();
  if (!doc?.lockedUntil) return { locked: false };
  const now = Date.now();
  const until = new Date(doc.lockedUntil).getTime();
  if (until <= now) return { locked: false };
  return { locked: true, retryAfterSeconds: Math.ceil((until - now) / 1000) };
}

export async function recordLoginFailure(email: string): Promise<void> {
  await dbConnect();
  const key = email.toLowerCase().trim();
  const now = new Date();
  const doc = await LoginAttempt.findOne({ email: key });

  if (!doc) {
    await LoginAttempt.create({
      email: key,
      failures: 1,
      lastAttemptAt: now,
      expiresAt: new Date(now.getTime() + WINDOW_MS),
    });
    return;
  }

  // If outside the window, reset the counter
  const windowElapsed = now.getTime() - new Date(doc.lastAttemptAt).getTime() > WINDOW_MS;
  const failures = windowElapsed ? 1 : doc.failures + 1;
  const update: Partial<{ failures: number; lastAttemptAt: Date; expiresAt: Date; lockedUntil: Date }> = {
    failures,
    lastAttemptAt: now,
    expiresAt: new Date(now.getTime() + WINDOW_MS + LOCKOUT_MS),
  };
  if (failures >= MAX_FAILURES) {
    update.lockedUntil = new Date(now.getTime() + LOCKOUT_MS);
  }
  await LoginAttempt.updateOne({ email: key }, { $set: update });
}

export async function clearLoginFailures(email: string): Promise<void> {
  await dbConnect();
  const key = email.toLowerCase().trim();
  await LoginAttempt.deleteOne({ email: key });
}
