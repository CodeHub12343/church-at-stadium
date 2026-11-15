import mongoose, { Schema, Model, models } from 'mongoose';

export type RegistrationMode = 'individual' | 'group';
export type CheckInStatus = 'pending' | 'in' | 'duplicate' | 'denied';

export interface IEventRegistration {
  _id: mongoose.Types.ObjectId;
  reference: string;
  eventSlug: string;
  userId?: mongoose.Types.ObjectId;
  mode: RegistrationMode;
  partySize: number;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  city: string;
  churchName?: string;
  days: string[];
  accessibility?: string;
  consentReminders: boolean;
  consentMarketing: boolean;
  checkInStatus: CheckInStatus;
  checkedInAt?: Date;
  gate?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventRegistrationSchema = new Schema<IEventRegistration>(
  {
    reference: { type: String, required: true, unique: true, index: true },
    eventSlug: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    mode: { type: String, enum: ['individual', 'group'], default: 'individual' },
    partySize: { type: Number, default: 1 },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    churchName: { type: String },
    days: { type: [String], default: [] },
    accessibility: { type: String },
    consentReminders: { type: Boolean, default: true },
    consentMarketing: { type: Boolean, default: false },
    checkInStatus: { type: String, enum: ['pending', 'in', 'duplicate', 'denied'], default: 'pending', index: true },
    checkedInAt: { type: Date },
    gate: { type: String },
    note: { type: String },
  },
  { timestamps: true }
);

// Prevent the same email from registering for the same event twice.
EventRegistrationSchema.index({ eventSlug: 1, email: 1 }, { unique: true });

export const EventRegistration: Model<IEventRegistration> =
  models.EventRegistration || mongoose.model<IEventRegistration>('EventRegistration', EventRegistrationSchema);
