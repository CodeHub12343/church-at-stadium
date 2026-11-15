import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { dbConnect } from '@/lib/mongodb';
import { AdminSettings } from '@/lib/models/AdminSettings';
import { recordAudit } from '@/lib/audit';

async function getOrCreate() {
  await dbConnect();
  let s = await AdminSettings.findOne({ key: 'global' });
  if (!s) s = await AdminSettings.create({ key: 'global' });
  return s;
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const s = await getOrCreate();
  return NextResponse.json({
    settings: {
      platformName: s.platformName,
      supportEmail: s.supportEmail,
      maintenanceMode: s.maintenanceMode,
      allowRegistrations: s.allowRegistrations,
      requireChurchVerification: s.requireChurchVerification,
      defaultTimezone: s.defaultTimezone,
      brandPrimary: s.brandPrimary,
      brandSecondary: s.brandSecondary,
    },
  });
}

const EDITABLE = [
  'platformName', 'supportEmail', 'maintenanceMode', 'allowRegistrations',
  'requireChurchVerification', 'defaultTimezone', 'brandPrimary', 'brandSecondary',
] as const;

export async function PATCH(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const body = await req.json().catch(() => ({}));
  const s = await getOrCreate();
  const changes: string[] = [];
  for (const k of EDITABLE) {
    if (k in body && body[k] !== undefined && s[k] !== body[k]) {
      (s as unknown as Record<string, unknown>)[k] = body[k];
      changes.push(k);
    }
  }
  await s.save();
  if (changes.length) {
    await recordAudit({
      actorId: auth.userId,
      action: 'settings.update',
      description: `Updated platform settings: ${changes.join(', ')}`,
      resource: 'global',
      severity: 'sensitive',
    });
  }
  return NextResponse.json({ ok: true, changed: changes });
}
