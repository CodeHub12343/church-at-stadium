import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { processDueAnnouncements } from '@/lib/announcements';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function authorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get('authorization');
  if (header === `Bearer ${secret}`) return true;
  // Vercel Cron sends x-vercel-cron: 1 with a signed invocation.
  const vercel = req.headers.get('x-vercel-cron');
  if (vercel) return true;
  return false;
}

export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const result = await processDueAnnouncements();
  return NextResponse.json({ ok: true, ...result });
}

// GET for Vercel Cron, which uses GET by default.
export async function GET(req: Request) {
  return POST(req);
}
