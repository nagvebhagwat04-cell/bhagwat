import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICategoryLimit {
  category: string;
  limit: number;
}

export interface IBudget extends Document {
  userId: Types.ObjectId;
  month: number; // 1-12
  year: number;
  income: number;
  categoryLimits: ICategoryLimit[];
  totalBudget: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategoryLimitSchema = new Schema<ICategoryLimit>(
  {
    category: { type: String, required: true, trim: true },
    limit: { type: Number, required: true, min: [0, 'Limit cannot be negative'] },
  },
  { _id: false }
);

const BudgetSchema = new Schema<IBudget>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
      min: 2000,
    },
    income: {
      type: Number,
      default: 0,
      min: 0,
    },
    categoryLimits: {
      type: [CategoryLimitSchema],
      default: [],
    },
    totalBudget: {
      type: Number,
      default: 0,
      min: 0,
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

BudgetSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });

export const Budget = mongoose.model<IBudget>('Budget', BudgetSchema);
