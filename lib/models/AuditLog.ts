import mongoose, { Schema, Model, models } from 'mongoose';

export type AuditSeverity = 'info' | 'success' | 'sensitive' | 'alert';

export interface IAuditLog {
  _id: mongoose.Types.ObjectId;
  action: string;
  description: string;
  actorId?: mongoose.Types.ObjectId;
  actorName: string;
  actorRole: string;
  resource?: string;
  severity: AuditSeverity;
  ip?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true, index: true },
    description: { type: String, required: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
    actorName: { type: String, required: true },
    actorRole: { type: String, default: 'admin' },
    resource: { type: String },
    severity: { type: String, enum: ['info', 'success', 'sensitive', 'alert'], default: 'info', index: true },
    ip: { type: String },
    location: { type: String },
  },
  { timestamps: true }
);

export const AuditLog: Model<IAuditLog> =
  models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
