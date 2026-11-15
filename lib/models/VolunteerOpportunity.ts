import mongoose, { Schema, Model, models } from 'mongoose';

export interface IVolunteerOpportunity {
  _id: mongoose.Types.ObjectId;
  opportunityId: string;
  eventSlug: string;
  department: string;
  role: string;
  city: string;
  dateLabel: string;
  monthShort: string;
  dayShort: string;
  filled: number;
  total: number;
  supervisor?: string;
  requirements?: string;
  recommended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VolunteerOpportunitySchema = new Schema<IVolunteerOpportunity>(
  {
    opportunityId: { type: String, required: true, unique: true, index: true },
    eventSlug: { type: String, required: true, index: true },
    department: { type: String, required: true, index: true },
    role: { type: String, required: true },
    city: { type: String, required: true },
    dateLabel: { type: String, required: true },
    monthShort: { type: String, required: true },
    dayShort: { type: String, required: true },
    filled: { type: Number, default: 0 },
    total: { type: Number, default: 10 },
    supervisor: { type: String },
    requirements: { type: String },
    recommended: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const VolunteerOpportunity: Model<IVolunteerOpportunity> =
  models.VolunteerOpportunity || mongoose.model<IVolunteerOpportunity>('VolunteerOpportunity', VolunteerOpportunitySchema);
