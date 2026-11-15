import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongodb';
import { Task, TaskStatus } from '@/lib/models/Task';

const ALLOWED: TaskStatus[] = ['not_started', 'in_progress', 'review', 'done'];

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const t = await Task.findOne({ _id: params.id, userId: session.user.id }).lean();
  if (!t) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  return NextResponse.json({
    task: {
      id: String(t._id), number: t.number, title: t.title, department: t.department,
      eventSlug: t.eventSlug, status: t.status, due: t.due, completedAt: t.completedAt,
      description: t.description, createdAt: t.createdAt,
    },
  });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));

  const update: Record<string, unknown> = {};
  if (body.title) update.title = String(body.title);
  if (body.department) update.department = String(body.department);
  if (body.due) update.due = new Date(body.due);
  if (body.description != null) update.description = String(body.description);
  if (body.status && ALLOWED.includes(body.status)) {
    update.status = body.status;
    if (body.status === 'done') update.completedAt = new Date();
    else update.completedAt = null;
  }

  await dbConnect();
  const t = await Task.findOneAndUpdate({ _id: params.id, userId: session.user.id }, { $set: update }, { new: true }).lean();
  if (!t) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  return NextResponse.json({ ok: true, status: t.status });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  await Task.deleteOne({ _id: params.id, userId: session.user.id });
  return NextResponse.json({ ok: true });
}
