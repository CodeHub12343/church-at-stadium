import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
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
import { AuthToken } from '@/lib/models/AuthToken';
import { LoginAttempt } from '@/lib/models/LoginAttempt';
import { recordAudit } from '@/lib/audit';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { password, confirm } = body ?? {};
  if (confirm !== 'DELETE') {
    return NextResponse.json({ error: 'Type DELETE to confirm' }, { status: 400 });
  }
  if (typeof password !== 'string' || !password) {
    return NextResponse.json({ error: 'Password required' }, { status: 400 });
  }

  await dbConnect();
  const user = await User.findById(session.user.id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Last-admin guard
  if (user.role === 'admin') {
    const otherAdmins = await User.countDocuments({ role: 'admin', _id: { $ne: user._id } });
    if (otherAdmins === 0) {
      return NextResponse.json(
        { error: 'You are the last remaining admin. Promote someone else before deleting this account.' },
        { status: 409 }
      );
    }
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: 'Password incorrect' }, { status: 401 });

  const email = user.email;
  const userId = user._id;

  // Hard-delete owned records; messages leave a "deleted user" placeholder.
  const threads = await MessageThread.find({ participants: userId }).select('_id').lean();
  const threadIds = threads.map((t) => t._id);
  await Promise.all([
    EventRegistration.deleteMany({ userId }),
    VolunteerApplication.deleteMany({ userId }),
    UserChurchMembership.deleteMany({ userId }),
    Notification.deleteMany({ userId }),
    Document.deleteMany({ ownerId: userId }),
    Task.deleteMany({ userId }),
    Message.deleteMany({ senderId: userId }),
    MessageThread.deleteMany({ _id: { $in: threadIds } }),
    AuthToken.deleteMany({ userId }),
    LoginAttempt.deleteOne({ email }),
  ]);
  await User.deleteOne({ _id: userId });

  await recordAudit({
    action: 'user.delete',
    description: `Account self-deletion for ${email}`,
    resource: String(userId),
    severity: 'sensitive',
  });

  return NextResponse.json({ ok: true });
}
