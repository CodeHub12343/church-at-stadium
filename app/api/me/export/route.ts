import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { EventRegistration } from '@/lib/models/EventRegistration';
import { VolunteerApplication } from '@/lib/models/VolunteerApplication';
import { UserChurchMembership } from '@/lib/models/UserChurchMembership';
import { Notification } from '@/lib/models/Notification';
import { Document } from '@/lib/models/Document';
import { Task } from '@/lib/models/Task';
import { MessageThread, Message } from '@/lib/models/Message';
import { recordAudit } from '@/lib/audit';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const userId = session.user.id;

  const [user, regs, vApps, churches, notes, docs, tasks, threads] = await Promise.all([
    User.findById(userId).lean(),
    EventRegistration.find({ userId }).lean(),
    VolunteerApplication.find({ userId }).lean(),
    UserChurchMembership.find({ userId }).lean(),
    Notification.find({ userId }).lean(),
    Document.find({ ownerId: userId }).lean(),
    Task.find({ userId }).lean(),
    MessageThread.find({ participants: userId }).lean(),
  ]);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const threadIds = threads.map((t) => t._id);
  const messages = threadIds.length ? await Message.find({ threadId: { $in: threadIds } }).lean() : [];

  const payload = {
    exportedAt: new Date().toISOString(),
    user: {
      ...user,
      passwordHash: undefined,
      verifyToken: undefined,
      resetToken: undefined,
    },
    eventRegistrations: regs,
    volunteerApplications: vApps,
    churchMemberships: churches,
    notifications: notes,
    documents: docs,
    tasks,
    messageThreads: threads,
    messages: messages.filter((m) => String(m.senderId) === String(userId)),
  };

  await recordAudit({
    actorId: userId,
    action: 'user.export',
    description: `Data export for ${user.email}`,
    resource: userId,
    severity: 'sensitive',
  });

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="cats-export-${user.email}.json"`,
    },
  });
}
