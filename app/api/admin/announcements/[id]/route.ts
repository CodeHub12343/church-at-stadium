import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { dbConnect } from '@/lib/mongodb';
import { Announcement } from '@/lib/models/Announcement';
import { recordAudit } from '@/lib/audit';
import { sendAnnouncement } from '@/lib/announcements';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  await dbConnect();
  const a = await Announcement.findById(params.id).lean();
  if (!a) return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
  return NextResponse.json({
    announcement: {
      id: String(a._id),
      title: a.title,
      body: a.body,
      status: a.status,
      audience: a.audience,
      eventSlug: a.eventSlug,
      scheduledFor: a.scheduledFor,
      sentAt: a.sentAt,
      recipientCount: a.recipientCount ?? 0,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    },
  });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const body = await req.json().catch(() => ({}));
  await dbConnect();
  const a = await Announcement.findById(params.id);
  if (!a) return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });

  if (body.action === 'send') {
    const count = await sendAnnouncement(a);
    await recordAudit({
      actorId: auth.userId,
      action: 'announcement.send',
      description: `Sent announcement "${a.title}" to ${count}`,
      resource: String(a._id),
      severity: 'success',
    });
    return NextResponse.json({ ok: true, status: a.status, recipientCount: a.recipientCount });
  }

  if (body.title) a.title = String(body.title);
  if (body.body) a.body = String(body.body);
  if (body.audience) a.audience = body.audience;
  if (body.scheduledFor) {
    a.scheduledFor = new Date(body.scheduledFor);
    if (a.status === 'draft') a.status = 'scheduled';
  }
  await a.save();
  return NextResponse.json({ ok: true, status: a.status });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  await dbConnect();
  await Announcement.deleteOne({ _id: params.id });
  await recordAudit({
    actorId: auth.userId,
    action: 'announcement.delete',
    description: `Deleted announcement ${params.id}`,
    resource: params.id,
    severity: 'sensitive',
  });
  return NextResponse.json({ ok: true });
}
