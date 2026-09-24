import { Response } from 'express';
import { Goal } from '../models/Goal.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { calculateGoalContribution } from '../services/calculationService.js';

export const getGoals = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const goals = await Goal.find({ userId }).sort({ targetDate: 1 });

    const enrichedGoals = goals.map((goal) => {
      const calc = calculateGoalContribution(
        goal.targetAmount,
        goal.currentAmount,
        goal.targetDate
      );

      return {
        ...goal.toJSON(),
        monthlyRequired: calc.monthlyRequired,
        remainingMonths: calc.remainingMonths,
        remainingAmount: calc.remainingAmount,
        percentageComplete: calc.percentageComplete,
        isExpired: calc.isExpired,
      };
    });

    res.status(200).json({
      success: true,
      data: enrichedGoals,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve goals',
      code: 'SERVER_ERROR',
    });
  }
};

export const createGoal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { name, targetAmount, currentAmount, targetDate, category } = req.body;

    const calc = calculateGoalContribution(
      Number(targetAmount),
      Number(currentAmount || 0),
      targetDate
    );

    const goal = await Goal.create({
      userId,
      name,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount || 0),
      targetDate: new Date(targetDate),
      monthlyRequired: calc.monthlyRequired,
      category: category || 'General',
    });

    res.status(201).json({
      success: true,
      message: 'Financial goal created successfully',
      data: {
        ...goal.toJSON(),
        remainingMonths: calc.remainingMonths,
        remainingAmount: calc.remainingAmount,
        percentageComplete: calc.percentageComplete,
        isExpired: calc.isExpired,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create goal',
      code: 'SERVER_ERROR',
    });
  }
};

export const updateGoal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { name, targetAmount, currentAmount, targetDate, category } = req.body;

    const goal = await Goal.findOne({ _id: id, userId });
    if (!goal) {
      res.status(404).json({
        success: false,
        message: 'Goal not found or unauthorized',
        code: 'NOT_FOUND',
      });
      return;
    }

    if (name) goal.name = name;
    if (targetAmount !== undefined) goal.targetAmount = Number(targetAmount);
    if (currentAmount !== undefined) goal.currentAmount = Number(currentAmount);
    if (targetDate) goal.targetDate = new Date(targetDate);
    if (category) goal.category = category;

    const calc = calculateGoalContribution(
      goal.targetAmount,
      goal.currentAmount,
      goal.targetDate
    );

    goal.monthlyRequired = calc.monthlyRequired;
    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Goal updated successfully',
      data: {
        ...goal.toJSON(),
        remainingMonths: calc.remainingMonths,
        remainingAmount: calc.remainingAmount,
        percentageComplete: calc.percentageComplete,
        isExpired: calc.isExpired,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update goal',
      code: 'SERVER_ERROR',
    });
  }
};

export const deleteGoal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const goal = await Goal.findOneAndDelete({ _id: id, userId });
    if (!goal) {
      res.status(404).json({
        success: false,
        message: 'Goal not found or unauthorized',
        code: 'NOT_FOUND',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Goal deleted successfully',
      data: { id: goal._id },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete goal',
      code: 'SERVER_ERROR',
    });
  }
};
