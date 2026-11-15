import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { dbConnect } from '@/lib/mongodb';
import { Event, EventStatus } from '@/lib/models/Event';
import { recordAudit } from '@/lib/audit';

const ALLOWED: EventStatus[] = ['Open', 'Invitation', 'Approved', 'Draft'];

export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => ({}));
  await dbConnect();

  const update: Record<string, unknown> = {};
  if (body.status && ALLOWED.includes(body.status)) update.status = body.status;
  if (body.capacityPct != null) update.capacityPct = Number(body.capacityPct);

  const ev = await Event.findOneAndUpdate({ slug: params.slug }, { $set: update }, { new: true }).lean();
  if (!ev) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  if (body.status) {
    await recordAudit({
      actorId: auth.userId,
      action: 'event.status',
      description: `Set event "${ev.title}" status to ${ev.status}`,
      resource: ev.slug,
      severity: body.status === 'Open' ? 'success' : 'info',
    });
  }
  return NextResponse.json({ ok: true, status: ev.status });
}
