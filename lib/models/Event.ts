import mongoose, { Schema, Model, models } from 'mongoose';

export type EventCategory =
  | 'Stadium Worship'
  | 'United Prayer'
  | 'Gospel Crusade'
  | 'Conference'
  | 'Youth Gathering'
  | 'Outreach';

export type EventStatus = 'Open' | 'Invitation' | 'Approved' | 'Draft';

export interface IEvent {
  _id: mongoose.Types.ObjectId;
  slug: string;
  title: string;
  category: EventCategory;
  start: string;
  end: string;
  dateLabel: string;
  city: string;
  country: string;
  venue: string;
  churches: number;
  expected: string;
  capacityPct: number;
  capacityLimit?: number;
  gradient: [string, string];
  status: EventStatus;
  image?: string;
  createdBy?: mongoose.Types.ObjectId;
  description?: string;
  registrationMode?: 'open' | 'invitation';
  registrationCap?: number;
  departments?: { name: string; slots: number }[];
  communityReservedPct?: number;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    category: { type: String, required: true, index: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    dateLabel: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    venue: { type: String, required: true },
    churches: { type: Number, default: 0 },
    expected: { type: String, default: '' },
    capacityPct: { type: Number, default: 0 },
    capacityLimit: { type: Number },
    gradient: { type: [String], required: true, validate: (v: string[]) => v.length === 2 },
    status: { type: String, required: true, default: 'Open' },
    image: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    description: { type: String, default: '' },
    registrationMode: { type: String, enum: ['open', 'invitation'], default: 'open' },
    registrationCap: { type: Number },
    departments: {
      type: [{ name: String, slots: Number, _id: false }],
      default: [],
    },
    communityReservedPct: { type: Number, default: 10, min: 0, max: 100 },
  },
  { timestamps: true }
);

export const Event: Model<IEvent> = models.Event || mongoose.model<IEvent>('Event', EventSchema);
