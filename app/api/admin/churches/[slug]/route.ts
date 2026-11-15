import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { dbConnect } from '@/lib/mongodb';
import { Church } from '@/lib/models/Church';
import { UserChurchMembership } from '@/lib/models/UserChurchMembership';
import { Notification } from '@/lib/models/Notification';
import { recordAudit } from '@/lib/audit';

export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => ({}));
  const { action } = body ?? {};
  await dbConnect();
  const church = await Church.findOne({ slug: params.slug });
  if (!church) return NextResponse.json({ error: 'Church not found' }, { status: 404 });

  if (action === 'approve') {
    church.verified = true;
    await church.save();
    await UserChurchMembership.updateMany(
      { churchSlug: params.slug, status: { $ne: 'verified' } },
      { $set: { status: 'verified', verifiedAt: new Date() } }
    );
    const memberships = await UserChurchMembership.find({ churchSlug: params.slug }).lean();
    for (const m of memberships) {
      await Notification.create({
        userId: m.userId,
        title: `${church.name} is now verified`,
        body: 'Your church has been approved. You can now apply to events and recruit volunteers.',
        tag: 'Verification',
        link: `/dashboard/churches/${church.slug}`,
        icon: '✓',
        bg: '#E6F5EC',
        fg: '#0E7A4C',
      });
    }
    await recordAudit({
      actorId: auth.userId,
      action: 'church.approve',
      description: `Approved church "${church.name}"`,
      resource: church.slug,
      severity: 'success',
    });
    return NextResponse.json({ ok: true, verified: true });
  }

  if (action === 'reject') {
    church.verified = false;
    await church.save();
    await UserChurchMembership.updateMany(
      { churchSlug: params.slug, status: { $ne: 'rejected' } },
      { $set: { status: 'rejected' } }
    );
    await recordAudit({
      actorId: auth.userId,
      action: 'church.reject',
      description: `Rejected / revoked church "${church.name}"`,
      resource: church.slug,
      severity: 'sensitive',
    });
    return NextResponse.json({ ok: true, verified: false });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
