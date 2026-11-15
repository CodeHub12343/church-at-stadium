import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { dbConnect } from '@/lib/mongodb';
import { VolunteerApplication } from '@/lib/models/VolunteerApplication';
import { User } from '@/lib/models/User';

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  await dbConnect();
  const filter: Record<string, unknown> = {};
  if (status && status !== 'All') filter.status = status;
  const apps = await VolunteerApplication.find(filter).sort({ createdAt: -1 }).lean();

  const userIds = Array.from(new Set(apps.map((a) => String(a.userId))));
  const users = userIds.length ? await User.find({ _id: { $in: userIds } }).lean() : [];
  const byId = new Map(users.map((u) => [String(u._id), u]));

  return NextResponse.json({
    applications: apps.map((a) => {
      const u = byId.get(String(a.userId));
      return {
        id: String(a._id),
        opportunityId: a.opportunityId,
        eventSlug: a.eventSlug,
        department: a.department,
        role: a.role,
        city: a.city,
        status: a.status,
        createdAt: a.createdAt,
        user: u
          ? { id: String(u._id), name: `${u.firstName} ${u.lastName}`.trim(), email: u.email }
          : null,
      };
    }),
  });
}
