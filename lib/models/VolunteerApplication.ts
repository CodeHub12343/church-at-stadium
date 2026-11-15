import mongoose, { Schema, Model, models } from 'mongoose';

export type VolunteerAppStatus = 'submitted' | 'under_review' | 'approved' | 'declined' | 'withdrawn';

export interface IVolunteerApplication {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  opportunityId: string;
  eventSlug: string;
  department: string;
  role: string;
  city: string;
  status: VolunteerAppStatus;
  note?: string;
  reportingInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VolunteerApplicationSchema = new Schema<IVolunteerApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    opportunityId: { type: String, required: true, index: true },
    eventSlug: { type: String, required: true, index: true },
    department: { type: String, required: true },
    role: { type: String, required: true },
    city: { type: String, required: true },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'approved', 'declined', 'withdrawn'],
      default: 'submitted',
      index: true,
    },
    note: { type: String },
    reportingInstructions: { type: String },
  },
  { timestamps: true }
);

VolunteerApplicationSchema.index({ userId: 1, opportunityId: 1 }, { unique: true });

export const VolunteerApplication: Model<IVolunteerApplication> =
  models.VolunteerApplication ||
  mongoose.model<IVolunteerApplication>('VolunteerApplication', VolunteerApplicationSchema);
