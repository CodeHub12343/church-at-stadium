import mongoose, { Schema, Model, models } from 'mongoose';

export interface IRateLimit {
  _id: mongoose.Types.ObjectId;
  key: string;
  count: number;
  windowStart: Date;
  expiresAt: Date;
}

const RateLimitSchema = new Schema<IRateLimit>(
  {
    key: { type: String, required: true, unique: true, index: true },
    count: { type: Number, default: 0 },
    windowStart: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: false }
);

RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RateLimit: Model<IRateLimit> =
  models.RateLimit || mongoose.model<IRateLimit>('RateLimit', RateLimitSchema);
