import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { Incident } from '@/lib/models/Incident';

const SERVICES = [
  { key: 'api', name: 'Core API' },
  { key: 'web', name: 'Website' },
  { key: 'notifications', name: 'Notifications' },
  { key: 'registrations', name: 'Event registrations' },
  { key: 'checkin', name: 'Check-in' },
  { key: 'db', name: 'Database' },
];

export async function GET() {
  await dbConnect();
  const openIncidents = await Incident.find({ status: { $ne: 'resolved' } }).sort({ startedAt: -1 }).lean();
  const recent = await Incident.find({}).sort({ startedAt: -1 }).limit(10).lean();

  const affected = new Set<string>();
  for (const inc of openIncidents) for (const s of inc.affectedServices) affected.add(s);

  const services = SERVICES.map((s) => ({
    key: s.key,
    name: s.name,
    status: affected.has(s.key) ? 'degraded' : 'operational',
  }));

  const overall = openIncidents.length
    ? openIncidents.some((i) => i.severity === 'critical')
      ? 'outage'
      : 'degraded'
    : 'operational';

  return NextResponse.json({
    overall,
    services,
    openIncidents: openIncidents.map((i) => ({
      slug: i.slug,
      title: i.title,
      status: i.status,
      severity: i.severity,
      impact: i.impact,
      startedAt: i.startedAt,
    })),
    recent: recent.map((i) => ({
      slug: i.slug,
      title: i.title,
      status: i.status,
      severity: i.severity,
      startedAt: i.startedAt,
      resolvedAt: i.resolvedAt,
    })),
  });
}
