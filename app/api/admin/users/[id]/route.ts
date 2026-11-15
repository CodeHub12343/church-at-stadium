import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { dbConnect } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { EventRegistration } from '@/lib/models/EventRegistration';
import { VolunteerApplication } from '@/lib/models/VolunteerApplication';
import { UserChurchMembership } from '@/lib/models/UserChurchMembership';
import { recordAudit } from '@/lib/audit';

const ROLES = ['church_rep', 'volunteer', 'organizer', 'attendee', 'admin'];

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  await dbConnect();
  const u = await User.findById(params.id).lean();
  if (!u) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const [regs, apps, memberships] = await Promise.all([
    EventRegistration.countDocuments({ userId: params.id }),
    VolunteerApplication.countDocuments({ userId: params.id }),
    UserChurchMembership.find({ userId: params.id }).lean(),
  ]);

  return NextResponse.json({
    user: {
      id: String(u._id),
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      country: u.country,
      churchName: u.churchName,
      phone: u.phone,
      bio: u.bio,
      displayName: u.displayName,
      language: u.language,
      verified: !!u.emailVerified,
      createdAt: u.createdAt,
    },
    counts: {
      registrations: regs,
      volunteerApplications: apps,
      churchMemberships: memberships.length,
    },
    churches: memberships.map((m) => ({ churchSlug: m.churchSlug, role: m.role, status: m.status })),
  });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const body = await req.json().catch(() => ({}));

  const update: Record<string, unknown> = {};
  if (body.role && ROLES.includes(body.role)) update.role = body.role;

  await dbConnect();
  const target = await User.findById(params.id).lean();
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Last-admin guard: don't allow demoting the only remaining admin.
  if (body.role && target.role === 'admin' && body.role !== 'admin') {
    const otherAdmins = await User.countDocuments({ role: 'admin', _id: { $ne: target._id } });
    if (otherAdmins === 0) {
      return NextResponse.json(
        { error: 'Cannot demote the last remaining admin. Promote another admin first.' },
        { status: 409 }
      );
    }
  }

  const u = await User.findByIdAndUpdate(params.id, { $set: update }, { new: true }).lean();
  if (!u) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (body.role) {
    await recordAudit({
      actorId: auth.userId,
      action: 'user.role',
      description: `Changed role of ${u.email} to ${u.role}`,
      resource: String(u._id),
      severity: 'sensitive',
    });
  }
  return NextResponse.json({ ok: true, role: u.role });
}
