import { AuditLog, AuditSeverity } from './models/AuditLog';
import { User } from './models/User';
import { dbConnect } from './mongodb';

export async function recordAudit(opts: {
  actorId?: string;
  action: string;
  description: string;
  resource?: string;
  severity?: AuditSeverity;
  ip?: string;
}): Promise<void> {
  try {
    await dbConnect();
    let actorName = 'System';
    let actorRole = 'system';
    if (opts.actorId) {
      const u = await User.findById(opts.actorId).lean();
      if (u) {
        actorName = `${u.firstName} ${u.lastName}`.trim();
        actorRole = u.role;
      }
    }
    await AuditLog.create({
      action: opts.action,
      description: opts.description,
      actorId: opts.actorId,
      actorName,
      actorRole,
      resource: opts.resource,
      severity: opts.severity ?? 'info',
      ip: opts.ip,
    });
  } catch (err) {
    console.error('[audit] failed', err);
  }
}
