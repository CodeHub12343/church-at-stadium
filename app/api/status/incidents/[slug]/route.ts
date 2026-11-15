import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { Incident } from '@/lib/models/Incident';

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  await dbConnect();
  const inc = await Incident.findOne({ slug: params.slug }).lean();
  if (!inc) return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
  return NextResponse.json({
    incident: {
      slug: inc.slug,
      title: inc.title,
      status: inc.status,
      severity: inc.severity,
      impact: inc.impact,
      affectedServices: inc.affectedServices,
      startedAt: inc.startedAt,
      resolvedAt: inc.resolvedAt,
      updates: (inc.updates || [])
        .slice()
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
        .map((u) => ({ at: u.at, status: u.status, body: u.body })),
    },
  });
}
