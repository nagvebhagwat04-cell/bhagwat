import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { User } from '../models/User.js';
import { Transaction } from '../models/Transaction.js';
import { Budget } from '../models/Budget.js';
import { Goal } from '../models/Goal.js';
import {
  calculateMonthlySurplus,
  calculateSavingsRate,
  calculateBudgetUtilization,
  calculateEmergencyFundRequirement,
  calculateGoalContribution,
} from '../services/calculationService.js';

export const getDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    const [user, monthTransactions, budget, goals, recentTransactions] = await Promise.all([
      User.findById(userId).select('-passwordHash'),
      Transaction.find({
        userId,
        date: { $gte: startOfMonth, $lte: endOfMonth },
      }),
      Budget.findOne({ userId, month: currentMonth, year: currentYear }),
      Goal.find({ userId }).sort({ targetDate: 1 }),
      Transaction.find({ userId }).sort({ date: -1 }).limit(8),
    ]);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User profile not found',
        code: 'NOT_FOUND',
      });
      return;
    }

    let monthlyExpenses = 0;
    let monthTxIncome = 0;
    const categorySpending: Record<string, number> = {};

    for (const tx of monthTransactions) {
      if (tx.type === 'expense') {
        monthlyExpenses += tx.amount;
        categorySpending[tx.category] = (categorySpending[tx.category] || 0) + tx.amount;
      } else if (tx.type === 'income') {
        monthTxIncome += tx.amount;
      }
    }

    const effectiveIncome = user.monthlyIncome > 0 ? user.monthlyIncome : monthTxIncome;

    const surplus = calculateMonthlySurplus(effectiveIncome, monthlyExpenses);
    const savingsRate = calculateSavingsRate(effectiveIncome, monthlyExpenses);
    const totalBudget = budget ? budget.totalBudget : 0;
    const budgetUtilization = calculateBudgetUtilization(monthlyExpenses, totalBudget);
    const emergencyFund = calculateEmergencyFundRequirement(monthlyExpenses, 6);

    // Goal summaries
    const goalsSummary = goals.map((g) => {
      const calc = calculateGoalContribution(g.targetAmount, g.currentAmount, g.targetDate);
      return {
        id: g._id,
        name: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        targetDate: g.targetDate,
        monthlyRequired: calc.monthlyRequired,
        percentageComplete: calc.percentageComplete,
        isExpired: calc.isExpired,
      };
    });

    // 6-month historical cash flow trend
    const sixMonthsAgo = new Date(currentYear, currentMonth - 6, 1);
    const historicalTxs = await Transaction.find({
      userId,
      date: { $gte: sixMonthsAgo, $lte: endOfMonth },
    });

    const monthlyTrendsMap: Record<string, { month: string; income: number; expenses: number; savings: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      monthlyTrendsMap[key] = { month: monthLabel, income: 0, expenses: 0, savings: 0 };
    }

    for (const tx of historicalTxs) {
      const txD = new Date(tx.date);
      const key = `${txD.getFullYear()}-${String(txD.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyTrendsMap[key]) {
        if (tx.type === 'income') {
          monthlyTrendsMap[key].income += tx.amount;
        } else {
          monthlyTrendsMap[key].expenses += tx.amount;
        }
      }
    }

    // Default current month baseline income if user has set monthlyIncome on profile
    const currentKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    if (monthlyTrendsMap[currentKey] && monthlyTrendsMap[currentKey].income === 0 && user.monthlyIncome > 0) {
      monthlyTrendsMap[currentKey].income = user.monthlyIncome;
    }

    const cashFlowTrend = Object.values(monthlyTrendsMap).map((m) => ({
      ...m,
      savings: Math.max(0, m.income - m.expenses),
    }));

    // Generate concise AI Financial Summary
    let aiSummary = `Your cash flow is currently balanced. With an income of $${effectiveIncome.toLocaleString()} and expenses of $${monthlyExpenses.toLocaleString()}, you have a net surplus of $${surplus.toLocaleString()} (savings rate: ${savingsRate}%).`;
    if (surplus < 0) {
      aiSummary = `⚠️ You are currently in a monthly deficit of $${Math.abs(surplus).toLocaleString()}. Consider reviewing your category expenses to bring outlays below your income.`;
    } else if (savingsRate >= 20) {
      aiSummary = `🌟 Great job! You are maintaining a strong ${savingsRate}% savings rate ($${surplus.toLocaleString()} surplus). A 6-month emergency reserve for your lifestyle would be $${emergencyFund.targetAmount.toLocaleString()}.`;
    }

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          monthlyIncome: effectiveIncome,
          monthlyExpenses: Math.round(monthlyExpenses * 100) / 100,
          monthlySavings: surplus,
          savingsRate,
          emergencyFund6Months: emergencyFund.targetAmount,
        },
        budgetUtilization,
        categorySpending,
        goals: goalsSummary,
        recentTransactions,
        cashFlowTrend,
        aiSummary,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard data',
      code: 'SERVER_ERROR',
    });
  }
};
