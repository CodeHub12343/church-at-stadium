import mongoose, { Schema, Model, models } from 'mongoose';

export type AnnouncementStatus = 'draft' | 'scheduled' | 'sent';
export type AnnouncementAudience = 'all' | 'church_reps' | 'volunteers' | 'organizers' | 'attendees';

export interface IAnnouncement {
  _id: mongoose.Types.ObjectId;
  title: string;
  body: string;
  status: AnnouncementStatus;
  audience: AnnouncementAudience;
  eventSlug?: string;
  scheduledFor?: Date;
  sentAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  recipientCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    status: { type: String, enum: ['draft', 'scheduled', 'sent'], default: 'draft', index: true },
    audience: {
      type: String,
      enum: ['all', 'church_reps', 'volunteers', 'organizers', 'attendees'],
      default: 'all',
    },
    eventSlug: { type: String, index: true },
    scheduledFor: { type: Date },
    sentAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipientCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Announcement: Model<IAnnouncement> =
  models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
