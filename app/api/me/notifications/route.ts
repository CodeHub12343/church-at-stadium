import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongodb';
import { Notification } from '@/lib/models/Notification';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const docs = await Notification.find({ userId: session.user.id }).sort({ createdAt: -1 }).limit(100).lean();
  return NextResponse.json({
    notifications: docs.map((n) => ({
      id: String(n._id),
      title: n.title,
      body: n.body,
      tag: n.tag,
      link: n.link,
      icon: n.icon,
      bg: n.bg,
      fg: n.fg,
      unread: !n.read,
      createdAt: n.createdAt,
    })),
    unreadCount: docs.filter((n) => !n.read).length,
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  await dbConnect();

  if (body?.action === 'mark-all-read') {
    await Notification.updateMany({ userId: session.user.id, read: false }, { $set: { read: true } });
    return NextResponse.json({ ok: true });
  }
  if (body?.action === 'mark-read' && body.id) {
    await Notification.updateOne({ _id: body.id, userId: session.user.id }, { $set: { read: true } });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
