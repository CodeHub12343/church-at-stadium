import mongoose, { Schema, Model, models } from 'mongoose';

export type ReportType = 'platform' | 'event' | 'church' | 'volunteers' | 'finance';
export type ReportStatus = 'draft' | 'ready';

export interface IReport {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  type: ReportType;
  status: ReportStatus;
  periodStart?: Date;
  periodEnd?: Date;
  data: Record<string, unknown>;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ['platform', 'event', 'church', 'volunteers', 'finance'], default: 'platform' },
    status: { type: String, enum: ['draft', 'ready'], default: 'ready' },
    periodStart: { type: Date },
    periodEnd: { type: Date },
    data: { type: Schema.Types.Mixed, default: {} },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Report: Model<IReport> =
  models.Report || mongoose.model<IReport>('Report', ReportSchema);
