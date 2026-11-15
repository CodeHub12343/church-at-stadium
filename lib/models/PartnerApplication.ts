import mongoose, { Schema, Model, models } from 'mongoose';

export type PartnerTrack = 'ministry' | 'operations' | 'hospitality' | 'foundation';
export type PartnerStatus = 'submitted' | 'under_review' | 'approved' | 'declined';

export interface IPartnerApplication {
  _id: mongoose.Types.ObjectId;
  organization: string;
  contactName: string;
  contactEmail: string;
  phone?: string;
  website?: string;
  track: PartnerTrack;
  city?: string;
  country?: string;
  bio?: string;
  status: PartnerStatus;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PartnerApplicationSchema = new Schema<IPartnerApplication>(
  {
    organization: { type: String, required: true },
    contactName: { type: String, required: true },
    contactEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String },
    website: { type: String },
    track: {
      type: String,
      enum: ['ministry', 'operations', 'hospitality', 'foundation'],
      default: 'ministry',
    },
    city: { type: String },
    country: { type: String },
    bio: { type: String },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'approved', 'declined'],
      default: 'submitted',
      index: true,
    },
    note: { type: String },
  },
  { timestamps: true }
);

export const PartnerApplication: Model<IPartnerApplication> =
  models.PartnerApplication || mongoose.model<IPartnerApplication>('PartnerApplication', PartnerApplicationSchema);
