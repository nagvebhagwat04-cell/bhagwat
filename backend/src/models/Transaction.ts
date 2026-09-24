import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITransaction extends Document {
  userId: Types.ObjectId;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, 'Amount must be greater than zero'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 255,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Compound index for user transactions ordered by date
TransactionSchema.index({ userId: 1, date: -1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
