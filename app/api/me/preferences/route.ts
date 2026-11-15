import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongodb';
import { User } from '@/lib/models/User';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const user = await User.findById(session.user.id).lean();
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json({
    notificationPrefs: user.notificationPrefs ?? {},
    quietHours: user.quietHours ?? { start: '22:00', end: '07:00', enabled: true },
  });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const update: Record<string, unknown> = {};

  if (body.notificationPrefs && typeof body.notificationPrefs === 'object') {
    const clean: Record<string, boolean[]> = {};
    for (const [k, v] of Object.entries(body.notificationPrefs)) {
      if (Array.isArray(v) && v.every((b) => typeof b === 'boolean')) clean[k] = v.slice(0, 4);
    }
    update.notificationPrefs = clean;
  }
  if (body.quietHours && typeof body.quietHours === 'object') {
    update.quietHours = {
      start: typeof body.quietHours.start === 'string' ? body.quietHours.start : '22:00',
      end: typeof body.quietHours.end === 'string' ? body.quietHours.end : '07:00',
      enabled: body.quietHours.enabled !== false,
    };
  }

  if (!Object.keys(update).length) return NextResponse.json({ ok: true });

  await dbConnect();
  await User.findByIdAndUpdate(session.user.id, { $set: update });
  return NextResponse.json({ ok: true });
}
