import mongoose, { Schema, Model, models } from 'mongoose';

export interface IVenue {
  _id: mongoose.Types.ObjectId;
  venueId: string;
  name: string;
  city: string;
  country: string;
  capacity: number;
  type: 'Outdoor' | 'Indoor';
  verified: boolean;
  booking: 'confirmed' | 'pending' | 'available' | 'unverified';
  bookingDate?: string;
  upcoming: number;
  initials: string;
  createdAt: Date;
  updatedAt: Date;
}

const VenueSchema = new Schema<IVenue>(
  {
    venueId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    capacity: { type: Number, required: true },
    type: { type: String, required: true, default: 'Outdoor' },
    verified: { type: Boolean, default: false },
    booking: { type: String, required: true, default: 'available' },
    bookingDate: { type: String },
    upcoming: { type: Number, default: 0 },
    initials: { type: String, required: true },
  },
  { timestamps: true }
);

export const Venue: Model<IVenue> = models.Venue || mongoose.model<IVenue>('Venue', VenueSchema);
