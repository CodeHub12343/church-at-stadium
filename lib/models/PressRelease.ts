import mongoose, { Schema, Model, models } from 'mongoose';

export type PressTag = 'Announcement' | 'Milestone' | 'Partnership' | 'Update';

export interface IPressRelease {
  _id: mongoose.Types.ObjectId;
  slug: string;
  title: string;
  excerpt: string;
  body?: string;
  tag: PressTag;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PressReleaseSchema = new Schema<IPressRelease>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    excerpt: { type: String, required: true },
    body: { type: String },
    tag: { type: String, enum: ['Announcement', 'Milestone', 'Partnership', 'Update'], default: 'Announcement' },
    publishedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const PressRelease: Model<IPressRelease> =
  models.PressRelease || mongoose.model<IPressRelease>('PressRelease', PressReleaseSchema);
