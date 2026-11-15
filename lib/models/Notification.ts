import mongoose, { Schema, Model, models } from 'mongoose';

export type NotificationTag = 'Event update' | 'Invitation' | 'Task' | 'Verification' | 'Document' | 'Account';

export interface INotification {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  body: string;
  tag: NotificationTag;
  link?: string;
  icon?: string;
  bg?: string;
  fg?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    tag: { type: String, required: true },
    link: { type: String },
    icon: { type: String },
    bg: { type: String },
    fg: { type: String },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const Notification: Model<INotification> =
  models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
