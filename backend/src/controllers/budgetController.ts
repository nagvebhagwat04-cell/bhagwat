import { Response } from 'express';
import { Budget } from '../models/Budget.js';
import { Transaction } from '../models/Transaction.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { calculateBudgetUtilization } from '../services/calculationService.js';

export const getBudget = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const now = new Date();
    const month = req.query.month ? parseInt(String(req.query.month), 10) : now.getMonth() + 1;
    const year = req.query.year ? parseInt(String(req.query.year), 10) : now.getFullYear();

    let budget = await Budget.findOne({ userId, month, year });

    // Calculate actual spending for this month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const expenseTransactions = await Transaction.find({
      userId,
      type: 'expense',
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const categorySpent: Record<string, number> = {};
    let totalSpent = 0;

    for (const tx of expenseTransactions) {
      totalSpent += tx.amount;
      categorySpent[tx.category] = (categorySpent[tx.category] || 0) + tx.amount;
    }

    const totalBudget = budget ? budget.totalBudget : 0;
    const utilization = calculateBudgetUtilization(totalSpent, totalBudget);

    // Merge category limits with actual spending
    const categoryBreakdown = (budget?.categoryLimits || []).map((cl) => {
      const spent = categorySpent[cl.category] || 0;
      const pct = cl.limit > 0 ? Math.round((spent / cl.limit) * 10000) / 100 : 0;
      return {
        category: cl.category,
        limit: cl.limit,
        spent,
        remaining: Math.max(0, cl.limit - spent),
        utilizationRate: pct,
        isOverBudget: spent > cl.limit,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        budget: budget || {
          month,
          year,
          totalBudget: 0,
          categoryLimits: [],
        },
        spending: {
          totalSpent: Math.round(totalSpent * 100) / 100,
          categorySpent,
          utilization,
          categoryBreakdown,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve budget',
      code: 'SERVER_ERROR',
    });
  }
};

export const upsertBudget = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { month, year, income, categoryLimits, totalBudget } = req.body;

    // Calculate sum of limits if totalBudget not explicitly provided
    let computedTotal = totalBudget;
    if (computedTotal === undefined && Array.isArray(categoryLimits)) {
      computedTotal = categoryLimits.reduce((sum: number, c: any) => sum + (Number(c.limit) || 0), 0);
    }

    const budget = await Budget.findOneAndUpdate(
      { userId, month, year },
      {
        userId,
        month,
        year,
        income: income !== undefined ? income : 0,
        categoryLimits: categoryLimits || [],
        totalBudget: computedTotal || 0,
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Budget saved successfully',
      data: budget,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to save budget',
      code: 'SERVER_ERROR',
    });
  }
};
