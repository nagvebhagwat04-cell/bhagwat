import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IChatMessage extends Document {
  userId: Types.ObjectId;
  role: 'user' | 'assistant';
  message: string;
  financialContextSnapshot?: Record<string, any>;
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    financialContextSnapshot: {
      type: Schema.Types.Mixed,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    toJSON: {
      transform: (_doc, ret) => {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

ChatMessageSchema.index({ userId: 1, createdAt: 1 });

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
