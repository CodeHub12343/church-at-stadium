import mongoose, { Schema, Model, models } from 'mongoose';

export type IncidentSeverity = 'minor' | 'major' | 'critical';
export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';
export type ServiceStatus = 'operational' | 'degraded' | 'outage';

export interface IIncidentUpdate {
  at: Date;
  status: IncidentStatus;
  body: string;
}

export interface IIncident {
  _id: mongoose.Types.ObjectId;
  slug: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  impact: string;
  affectedServices: string[];
  startedAt: Date;
  resolvedAt?: Date;
  updates: IIncidentUpdate[];
  createdAt: Date;
  updatedAt: Date;
}

const IncidentSchema = new Schema<IIncident>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    severity: { type: String, enum: ['minor', 'major', 'critical'], default: 'minor' },
    status: {
      type: String,
      enum: ['investigating', 'identified', 'monitoring', 'resolved'],
      default: 'investigating',
      index: true,
    },
    impact: { type: String, default: '' },
    affectedServices: { type: [String], default: [] },
    startedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
    updates: {
      type: [
        {
          at: { type: Date, default: Date.now },
          status: { type: String },
          body: { type: String },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export const Incident: Model<IIncident> =
  models.Incident || mongoose.model<IIncident>('Incident', IncidentSchema);
