import mongoose, { Schema, Model, models } from 'mongoose';

export type UserRole = 'church_rep' | 'volunteer' | 'organizer' | 'attendee' | 'admin';

export interface IUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  country?: string;
  churchId?: mongoose.Types.ObjectId;
  emailVerified?: Date;
  verifyToken?: string;
  resetToken?: string;
  resetTokenExpires?: Date;
  // Profile extensions (Phase 5)
  displayName?: string;
  pronouns?: 'she' | 'he' | 'they' | 'x';
  secondaryEmail?: string;
  phone?: string;
  language?: string;
  bio?: string;
  churchName?: string;
  // Notification preferences: map of category key -> [email, in-app, push, sms]
  notificationPrefs?: Record<string, boolean[]>;
  quietHours?: { start: string; end: string; enabled: boolean };
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['church_rep', 'volunteer', 'organizer', 'attendee', 'admin'],
      default: 'attendee',
      required: true,
    },
    country: { type: String },
    churchId: { type: Schema.Types.ObjectId, ref: 'Church' },
    emailVerified: { type: Date },
    verifyToken: { type: String, index: true },
    resetToken: { type: String, index: true },
    resetTokenExpires: { type: Date },
    displayName: { type: String },
    pronouns: { type: String, enum: ['she', 'he', 'they', 'x'] },
    secondaryEmail: { type: String, lowercase: true, trim: true },
    phone: { type: String },
    language: { type: String },
    bio: { type: String },
    churchName: { type: String },
    notificationPrefs: { type: Schema.Types.Mixed, default: {} },
    quietHours: {
      start: { type: String, default: '22:00' },
      end: { type: String, default: '07:00' },
      enabled: { type: Boolean, default: true },
    },
    avatarUrl: { type: String },
  },
  { timestamps: true }
);

export const User: Model<IUser> = models.User || mongoose.model<IUser>('User', UserSchema);
