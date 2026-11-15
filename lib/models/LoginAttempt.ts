import mongoose, { Schema, Model, models } from 'mongoose';

export interface ILoginAttempt {
  _id: mongoose.Types.ObjectId;
  email: string;
  failures: number;
  lockedUntil?: Date;
  lastAttemptAt: Date;
  expiresAt: Date;
}

const LoginAttemptSchema = new Schema<ILoginAttempt>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    failures: { type: Number, default: 0 },
    lockedUntil: { type: Date },
    lastAttemptAt: { type: Date, default: () => new Date() },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: false }
);

LoginAttemptSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const LoginAttempt: Model<ILoginAttempt> =
  models.LoginAttempt || mongoose.model<ILoginAttempt>('LoginAttempt', LoginAttemptSchema);
