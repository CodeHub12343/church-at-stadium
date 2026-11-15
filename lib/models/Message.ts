import mongoose, { Schema, Model, models } from 'mongoose';

export interface IMessageThread {
  _id: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  title?: string;
  lastMessageAt: Date;
  lastSnippet: string;
  unreadFor: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageThreadSchema = new Schema<IMessageThread>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }],
    title: { type: String },
    lastMessageAt: { type: Date, default: Date.now, index: true },
    lastSnippet: { type: String, default: '' },
    unreadFor: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export const MessageThread: Model<IMessageThread> =
  models.MessageThread || mongoose.model<IMessageThread>('MessageThread', MessageThreadSchema);

export interface IMessage {
  _id: mongoose.Types.ObjectId;
  threadId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    threadId: { type: Schema.Types.ObjectId, ref: 'MessageThread', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true },
  },
  { timestamps: true }
);

export const Message: Model<IMessage> =
  models.Message || mongoose.model<IMessage>('Message', MessageSchema);
