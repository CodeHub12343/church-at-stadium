import mongoose, { Schema, Model, models } from 'mongoose';

export type TaskStatus = 'not_started' | 'in_progress' | 'review' | 'done';

export interface ITask {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  number: number;
  title: string;
  department: string;
  eventSlug?: string;
  status: TaskStatus;
  due?: Date;
  completedAt?: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    number: { type: Number, required: true },
    title: { type: String, required: true },
    department: { type: String, default: 'General' },
    eventSlug: { type: String, index: true },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'review', 'done'],
      default: 'not_started',
      index: true,
    },
    due: { type: Date },
    completedAt: { type: Date },
    description: { type: String },
  },
  { timestamps: true }
);

export const Task: Model<ITask> = models.Task || mongoose.model<ITask>('Task', TaskSchema);
