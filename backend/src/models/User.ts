import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  ageRange?: string;
  occupation?: string;
  monthlyIncome: number;
  financialKnowledge: 'beginner' | 'intermediate' | 'advanced';
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Never return passwordHash by default
    },
    ageRange: {
      type: String,
      default: '25-34',
    },
    occupation: {
      type: String,
      default: 'Professional',
      trim: true,
    },
    monthlyIncome: {
      type: Number,
      default: 0,
      min: [0, 'Monthly income cannot be negative'],
    },
    financialKnowledge: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    riskProfile: {
      type: String,
      enum: ['conservative', 'moderate', 'aggressive'],
      default: 'moderate',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete (ret as any).passwordHash;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
