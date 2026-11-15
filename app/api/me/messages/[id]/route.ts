import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongodb';
import mongoose from 'mongoose';
import { MessageThread, Message } from '@/lib/models/Message';
import { User } from '@/lib/models/User';
import { isNonEmptyString } from '@/lib/validators';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();

  const thread = await MessageThread.findOne({ _id: params.id, participants: session.user.id });
  if (!thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 });

  // Mark as read
  if ((thread.unreadFor || []).some((u) => String(u) === session.user.id)) {
    thread.unreadFor = thread.unreadFor.filter((u) => String(u) !== session.user.id);
    await thread.save();
  }

  const messages = await Message.find({ threadId: thread._id }).sort({ createdAt: 1 }).lean();
  const users = await User.find({ _id: { $in: thread.participants } }).lean();
  const byId = new Map(users.map((u) => [String(u._id), u]));
  const other = thread.participants.find((p) => String(p) !== session.user.id);
  const otherUser = other ? byId.get(String(other)) : null;

  return NextResponse.json({
    thread: {
      id: String(thread._id),
      title: thread.title,
      otherName: otherUser ? `${otherUser.firstName} ${otherUser.lastName}`.trim() : thread.title || 'Conversation',
      otherEmail: otherUser?.email,
      otherInitials: otherUser
        ? ((otherUser.firstName[0] || '') + (otherUser.lastName[0] || '')).toUpperCase()
        : 'C',
    },
    messages: messages.map((m) => ({
      id: String(m._id),
      body: m.body,
      mine: String(m.senderId) === session.user.id,
      senderName: byId.get(String(m.senderId))
        ? `${byId.get(String(m.senderId))!.firstName} ${byId.get(String(m.senderId))!.lastName}`.trim()
        : 'Unknown',
      createdAt: m.createdAt,
    })),
  });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { body } = (await req.json().catch(() => ({}))) as { body?: string };
  if (!isNonEmptyString(body)) return NextResponse.json({ error: 'Message body required' }, { status: 400 });

  await dbConnect();
  const thread = await MessageThread.findOne({ _id: params.id, participants: session.user.id });
  if (!thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 });

  const msg = await Message.create({ threadId: thread._id, senderId: session.user.id, body: body.trim() });
  thread.lastMessageAt = new Date();
  thread.lastSnippet = body.trim().slice(0, 120);
  const unread = new Set((thread.unreadFor || []).map((u) => String(u)));
  for (const p of thread.participants) {
    if (String(p) !== session.user.id) unread.add(String(p));
  }
  thread.unreadFor = Array.from(unread).map((id) => new mongoose.Types.ObjectId(id));
  await thread.save();

  return NextResponse.json({ ok: true, id: String(msg._id) });
}
