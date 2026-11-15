import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongodb';
import { Task } from '@/lib/models/Task';
import { isNonEmptyString } from '@/lib/validators';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const docs = await Task.find({ userId: session.user.id }).sort({ due: 1, createdAt: -1 }).lean();

  const stats = {
    open: docs.filter((t) => t.status !== 'done').length,
    overdue: docs.filter((t) => t.status !== 'done' && t.due && new Date(t.due).getTime() < Date.now()).length,
    completed: docs.filter((t) => t.status === 'done').length,
  };

  return NextResponse.json({
    tasks: docs.map((t) => ({
      id: String(t._id),
      number: t.number,
      title: t.title,
      department: t.department,
      eventSlug: t.eventSlug,
      status: t.status,
      due: t.due,
      completedAt: t.completedAt,
      description: t.description,
    })),
    stats,
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { title, department, eventSlug, status, due, description } = body ?? {};
  if (!isNonEmptyString(title)) return NextResponse.json({ error: 'Title required' }, { status: 400 });

  await dbConnect();
  const last = await Task.find({ userId: session.user.id }).sort({ number: -1 }).limit(1).lean();
  const nextNum = (last[0]?.number ?? 400) + 1;

  const task = await Task.create({
    userId: session.user.id,
    number: nextNum,
    title: title.trim(),
    department: isNonEmptyString(department) ? department : 'General',
    eventSlug: isNonEmptyString(eventSlug) ? eventSlug : undefined,
    status: status || 'not_started',
    due: due ? new Date(due) : undefined,
    description: isNonEmptyString(description) ? description : undefined,
  });

  return NextResponse.json({ ok: true, id: String(task._id), number: task.number });
}
