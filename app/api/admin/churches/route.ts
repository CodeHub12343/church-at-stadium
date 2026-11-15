import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { dbConnect } from '@/lib/mongodb';
import { Church } from '@/lib/models/Church';
import { UserChurchMembership } from '@/lib/models/UserChurchMembership';
import { User } from '@/lib/models/User';

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status'); // 'pending' | 'verified' | 'all'
  await dbConnect();

  const filter: Record<string, unknown> = {};
  if (status === 'pending') filter.verified = false;
  if (status === 'verified') filter.verified = true;

  const churches = await Church.find(filter).sort({ createdAt: -1 }).lean();

  // Join representatives
  const slugs = churches.map((c) => c.slug);
  const memberships = slugs.length
    ? await UserChurchMembership.find({ churchSlug: { $in: slugs } }).lean()
    : [];
  const userIds = Array.from(new Set(memberships.map((m) => String(m.userId))));
  const users = userIds.length ? await User.find({ _id: { $in: userIds } }).lean() : [];
  const userById = new Map(users.map((u) => [String(u._id), u]));

  return NextResponse.json({
    churches: churches.map((c) => {
      const reps = memberships.filter((m) => m.churchSlug === c.slug).map((m) => {
        const u = userById.get(String(m.userId));
        return {
          id: String(m.userId),
          name: u ? `${u.firstName} ${u.lastName}`.trim() : 'Unknown',
          email: u?.email,
          role: m.role,
          status: m.status,
        };
      });
      return {
        slug: c.slug,
        name: c.name,
        initials: c.initials,
        city: c.city,
        country: c.country,
        region: c.region,
        denomination: c.denomination,
        established: c.established,
        verified: c.verified,
        size: c.size,
        pastor: c.pastor,
        email: c.email,
        website: c.website,
        gradient: c.gradient,
        submittedAt: c.createdAt,
        representatives: reps,
      };
    }),
  });
}
