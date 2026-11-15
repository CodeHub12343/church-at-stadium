import mongoose, { Schema, Model, models } from 'mongoose';

export type AuthTokenKind = 'verify' | 'reset';

export interface IAuthToken {
  _id: mongoose.Types.ObjectId;
  token: string;
  kind: AuthTokenKind;
  userId: mongoose.Types.ObjectId;
  email: string;
  expiresAt: Date;
  createdAt: Date;
}

const AuthTokenSchema = new Schema<IAuthToken>(
  {
    token: { type: String, required: true, unique: true, index: true },
    kind: { type: String, enum: ['verify', 'reset'], required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuthTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AuthToken: Model<IAuthToken> =
  models.AuthToken || mongoose.model<IAuthToken>('AuthToken', AuthTokenSchema);
