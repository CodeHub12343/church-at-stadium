import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { dbConnect } from '@/lib/mongodb';
import { AuditLog } from '@/lib/models/AuditLog';

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { searchParams } = new URL(req.url);
  const severity = searchParams.get('severity');
  const limit = Math.min(500, Math.max(1, Number(searchParams.get('limit')) || 100));

  await dbConnect();
  const filter: Record<string, unknown> = {};
  if (severity && ['info', 'success', 'sensitive', 'alert'].includes(severity)) {
    filter.severity = severity;
  }
  const docs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(limit).lean();

  return NextResponse.json({
    logs: docs.map((l) => ({
      id: String(l._id),
      action: l.action,
      description: l.description,
      actorName: l.actorName,
      actorRole: l.actorRole,
      resource: l.resource,
      severity: l.severity,
      ip: l.ip,
      createdAt: l.createdAt,
    })),
  });
}
