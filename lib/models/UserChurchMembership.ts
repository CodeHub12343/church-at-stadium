import mongoose, { Schema, Model, models } from 'mongoose';

export interface IUserChurchMembership {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  churchSlug: string;
  role: 'rep' | 'leader' | 'admin';
  status: 'pending' | 'verified' | 'rejected';
  submittedAt: Date;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserChurchMembershipSchema = new Schema<IUserChurchMembership>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    churchSlug: { type: String, required: true, index: true },
    role: { type: String, enum: ['rep', 'leader', 'admin'], default: 'rep' },
    status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending', index: true },
    submittedAt: { type: Date, default: Date.now },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

UserChurchMembershipSchema.index({ userId: 1, churchSlug: 1 }, { unique: true });

export const UserChurchMembership: Model<IUserChurchMembership> =
  models.UserChurchMembership || mongoose.model<IUserChurchMembership>('UserChurchMembership', UserChurchMembershipSchema);
