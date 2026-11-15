import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongodb';
import { MessageThread } from '@/lib/models/Message';
import { User } from '@/lib/models/User';
import { requireVerified } from '@/lib/verifiedGate';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const threads = await MessageThread.find({ participants: session.user.id })
    .sort({ lastMessageAt: -1 })
    .lean();

  const otherIds = Array.from(
    new Set(
      threads.flatMap((t) =>
        t.participants
          .map((p) => String(p))
          .filter((p) => p !== session.user.id)
      )
    )
  );
  const users = otherIds.length ? await User.find({ _id: { $in: otherIds } }).lean() : [];
  const byId = new Map(users.map((u) => [String(u._id), u]));

  return NextResponse.json({
    threads: threads.map((t) => {
      const other = t.participants.find((p) => String(p) !== session.user.id);
      const u = other ? byId.get(String(other)) : null;
      const name = u ? `${u.firstName} ${u.lastName}`.trim() : t.title || 'Conversation';
      const initials = u
        ? ((u.firstName[0] || '') + (u.lastName[0] || '')).toUpperCase()
        : (t.title || 'C').slice(0, 2).toUpperCase();
      return {
        id: String(t._id),
        title: t.title || name,
        otherName: name,
        otherInitials: initials,
        lastMessageAt: t.lastMessageAt,
        lastSnippet: t.lastSnippet,
        unread: (t.unreadFor || []).some((u) => String(u) === session.user.id),
      };
    }),
  });
}

export async function POST(req: Request) {
  const gate = await requireVerified();
  if (!gate.ok) return gate.response;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { recipientEmail, title, body: initialBody } = body ?? {};
  if (!recipientEmail) return NextResponse.json({ error: 'Recipient required' }, { status: 400 });

  await dbConnect();
  const recipient = await User.findOne({ email: String(recipientEmail).toLowerCase() }).lean();
  if (!recipient) return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });

  const thread = await MessageThread.create({
    participants: [session.user.id, recipient._id],
    title: title || `${recipient.firstName} ${recipient.lastName}`.trim(),
    lastMessageAt: new Date(),
    lastSnippet: initialBody ? String(initialBody).slice(0, 120) : '',
    unreadFor: initialBody ? [recipient._id] : [],
  });

  if (initialBody) {
    const { Message } = await import('@/lib/models/Message');
    await Message.create({ threadId: thread._id, senderId: session.user.id, body: String(initialBody) });
  }

  return NextResponse.json({ ok: true, threadId: String(thread._id) });
}
