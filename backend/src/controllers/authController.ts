import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { hashPassword, comparePassword, generateToken } from '../services/authService.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, ageRange, occupation, monthlyIncome, financialKnowledge, riskProfile } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
        code: 'USER_EXISTS',
      });
      return;
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      ageRange: ageRange || '25-34',
      occupation: occupation || 'Professional',
      monthlyIncome: monthlyIncome || 0,
      financialKnowledge: financialKnowledge || 'beginner',
      riskProfile: riskProfile || 'moderate',
    });

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          monthlyIncome: user.monthlyIncome,
          financialKnowledge: user.financialKnowledge,
          riskProfile: user.riskProfile,
          ageRange: user.ageRange,
          occupation: user.occupation,
        },
      },
    });
  } catch (err: any) {
    console.error('[AuthController.register] Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to register user: ' + (err.message || 'Unknown error'),
      code: 'SERVER_ERROR',
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Explicitly select passwordHash since select: false on schema
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
      });
      return;
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
      });
      return;
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          monthlyIncome: user.monthlyIncome,
          financialKnowledge: user.financialKnowledge,
          riskProfile: user.riskProfile,
          ageRange: user.ageRange,
          occupation: user.occupation,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to log in',
      code: 'SERVER_ERROR',
    });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const user = await User.findById(userId).select('-passwordHash');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User profile not found',
        code: 'NOT_FOUND',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
      code: 'SERVER_ERROR',
    });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { name, monthlyIncome, ageRange, occupation, financialKnowledge, riskProfile } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(name && { name }),
        ...(monthlyIncome !== undefined && { monthlyIncome }),
        ...(ageRange && { ageRange }),
        ...(occupation && { occupation }),
        ...(financialKnowledge && { financialKnowledge }),
        ...(riskProfile && { riskProfile }),
      },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: 'User profile not found',
        code: 'NOT_FOUND',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      code: 'SERVER_ERROR',
    });
  }
};
