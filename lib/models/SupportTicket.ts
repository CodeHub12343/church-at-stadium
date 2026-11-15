import mongoose, { Schema, Model, models } from 'mongoose';

export type SupportStatus = 'new' | 'in_progress' | 'resolved';

export interface ISupportTicket {
  _id: mongoose.Types.ObjectId;
  reference: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  category: 'help' | 'contact';
  topic?: string;
  status: SupportStatus;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    reference: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    category: { type: String, enum: ['help', 'contact'], default: 'help' },
    topic: { type: String },
    status: { type: String, enum: ['new', 'in_progress', 'resolved'], default: 'new', index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const SupportTicket: Model<ISupportTicket> =
  models.SupportTicket || mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
