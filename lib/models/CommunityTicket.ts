import mongoose, { Schema, Model, models } from 'mongoose';

export type CommunityTicketType = 'adult' | 'mother_child';
export type CommunityTicketStatus = 'reserved' | 'cancelled' | 'issued' | 'no_show';

export interface ICommunityTicket {
  _id: mongoose.Types.ObjectId;
  reference: string;
  eventSlug: string;
  userId?: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  ticketType: CommunityTicketType;
  seats: number; // 1 for adult, 2 for mother_child
  ebtAcknowledged: boolean;
  privacyAcknowledged: boolean;
  status: CommunityTicketStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommunityTicketSchema = new Schema<ICommunityTicket>(
  {
    reference: { type: String, required: true, unique: true, index: true },
    eventSlug: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    ticketType: { type: String, enum: ['adult', 'mother_child'], required: true },
    seats: { type: Number, required: true, min: 1, max: 2 },
    ebtAcknowledged: { type: Boolean, required: true },
    privacyAcknowledged: { type: Boolean, required: true },
    status: {
      type: String,
      enum: ['reserved', 'cancelled', 'issued', 'no_show'],
      default: 'reserved',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

CommunityTicketSchema.index({ eventSlug: 1, status: 1 });

export const CommunityTicket: Model<ICommunityTicket> =
  models.CommunityTicket || mongoose.model<ICommunityTicket>('CommunityTicket', CommunityTicketSchema);
