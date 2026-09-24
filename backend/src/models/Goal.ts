import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IGoal extends Document {
  userId: Types.ObjectId;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  monthlyRequired: number;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Goal name is required'],
      trim: true,
      maxlength: 100,
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [1, 'Target amount must be at least 1'],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, 'Current amount cannot be negative'],
    },
    targetDate: {
      type: Date,
      required: [true, 'Target date is required'],
    },
    monthlyRequired: {
      type: Number,
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
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

GoalSchema.index({ userId: 1, targetDate: 1 });

export const Goal = mongoose.model<IGoal>('Goal', GoalSchema);
