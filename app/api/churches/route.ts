export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { Church } from '@/lib/models/Church';

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const region = searchParams.get('region');
  const q = searchParams.get('q')?.trim().toLowerCase();

  const filter: Record<string, unknown> = {};
  if (region && region !== 'All') filter.region = region;

  let docs = await Church.find(filter).sort({ name: 1 }).lean();

  if (q) {
    docs = docs.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    churches: docs.map((d) => ({
      slug: d.slug,
      initials: d.initials,
      name: d.name,
      city: d.city,
      country: d.country,
      region: d.region,
      denomination: d.denomination,
      established: d.established,
      size: d.size,
      branches: d.branches,
      website: d.website,
      email: d.email,
      pastor: d.pastor,
      bio: d.bio,
      gradient: d.gradient,
      verified: d.verified,
      upcoming: d.upcoming,
    })),
  });
}
