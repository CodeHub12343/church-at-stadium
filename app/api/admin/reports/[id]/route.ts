import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { dbConnect } from '@/lib/mongodb';
import { Report } from '@/lib/models/Report';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  await dbConnect();
  const r = await Report.findOne({ slug: params.id }).lean();
  if (!r) return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  return NextResponse.json({
    report: {
      id: r.slug,
      title: r.title,
      type: r.type,
      status: r.status,
      periodStart: r.periodStart,
      periodEnd: r.periodEnd,
      data: r.data,
      createdAt: r.createdAt,
    },
  });
}
