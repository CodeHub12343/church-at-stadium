import { NextResponse } from 'next/server';
import { dbConnect } from './mongodb';
import { RateLimit } from './models/RateLimit';

export type RateLimitConfig = {
  key: string;
  max: number;
  windowMs: number;
};

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfter: number };

export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

export async function enforceRateLimit(cfg: RateLimitConfig): Promise<RateLimitResult> {
  try {
    await dbConnect();
    const now = new Date();
    const windowAgo = new Date(now.getTime() - cfg.windowMs);
    const expiresAt = new Date(now.getTime() + cfg.windowMs);

    const doc = await RateLimit.findOneAndUpdate(
      { key: cfg.key, windowStart: { $gte: windowAgo } },
      {
        $inc: { count: 1 },
        $setOnInsert: { key: cfg.key, windowStart: now, expiresAt },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    if (doc.count > cfg.max) {
      const retryAfter = Math.max(
        1,
        Math.ceil(
          (new Date(doc.windowStart).getTime() + cfg.windowMs - now.getTime()) / 1000
        )
      );
      return { ok: false, retryAfter };
    }
    return { ok: true, remaining: Math.max(0, cfg.max - doc.count) };
  } catch (err) {
    console.error('[rateLimit] failed', err);
    return { ok: true, remaining: cfg.max };
  }
}

export function rateLimited(retryAfter: number) {
  return NextResponse.json(
    { error: 'Too many requests. Try again in a moment.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  );
}

export async function limit(
  req: Request,
  scope: string,
  opts: { max: number; windowMs: number; extra?: string }
): Promise<NextResponse | null> {
  const ip = clientIp(req);
  const key = `${scope}:${ip}${opts.extra ? `:${opts.extra}` : ''}`;
  const result = await enforceRateLimit({ key, max: opts.max, windowMs: opts.windowMs });
  if (!result.ok) return rateLimited(result.retryAfter);
  return null;
}
