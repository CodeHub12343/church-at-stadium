import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { dbConnect } from '@/lib/mongodb';
import { User } from '@/lib/models/User';

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim().toLowerCase();
  const role = searchParams.get('role');

  await dbConnect();
  const filter: Record<string, unknown> = {};
  if (role && role !== 'All') filter.role = role;
  let docs = await User.find(filter).sort({ createdAt: -1 }).limit(200).lean();
  if (q) {
    docs = docs.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    users: docs.map((u) => ({
      id: String(u._id),
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      country: u.country,
      churchName: u.churchName,
      verified: !!u.emailVerified,
      createdAt: u.createdAt,
    })),
  });
}
