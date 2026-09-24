import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Transaction } from '../models/Transaction.js';
import { Budget } from '../models/Budget.js';
import { Goal } from '../models/Goal.js';
import { ChatMessage } from '../models/ChatMessage.js';
import { hashPassword } from '../services/authService.js';
import { calculateGoalContribution } from '../services/calculationService.js';

dotenv.config();

export const seedData = async (shouldDisconnect: boolean = false) => {
  try {
    console.log('[Seed] Starting database seeding...');
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    // Clear existing data for demo account
    const demoEmail = 'alex.demo@fintech.io';
    const existing = await User.findOne({ email: demoEmail });
    if (existing) {
      await Promise.all([
        Transaction.deleteMany({ userId: existing._id }),
        Budget.deleteMany({ userId: existing._id }),
        Goal.deleteMany({ userId: existing._id }),
        ChatMessage.deleteMany({ userId: existing._id }),
        User.deleteOne({ _id: existing._id }),
      ]);
      console.log('[Seed] Cleaned prior demo user data.');
    }

    const passwordHash = await hashPassword('DemoPassword123!');

    const user = await User.create({
      name: 'Alex Morgan',
      email: demoEmail,
      passwordHash,
      ageRange: '25-34',
      occupation: 'Software Engineer',
      monthlyIncome: 6500,
      financialKnowledge: 'intermediate',
      riskProfile: 'moderate',
    });

    console.log(`[Seed] Created demo user: ${user.email} (Password: DemoPassword123!)`);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Transactions across categories
    const transactionsData = [
      // Current Month Income
      {
        userId: user._id,
        type: 'income',
        category: 'Salary',
        amount: 6500,
        description: 'Monthly Tech Lead Salary',
        date: new Date(currentYear, currentMonth, 1),
      },
      {
        userId: user._id,
        type: 'income',
        category: 'Freelancing',
        amount: 800,
        description: 'Consulting gig website architecture',
        date: new Date(currentYear, currentMonth, 12),
      },
      // Current Month Expenses
      {
        userId: user._id,
        type: 'expense',
        category: 'Housing',
        amount: 1800,
        description: 'Downtown Apartment Rent',
        date: new Date(currentYear, currentMonth, 2),
      },
      {
        userId: user._id,
        type: 'expense',
        category: 'Groceries',
        amount: 520,
        description: 'Supermarket supplies & organics',
        date: new Date(currentYear, currentMonth, 5),
      },
      {
        userId: user._id,
        type: 'expense',
        category: 'Utilities',
        amount: 195,
        description: 'Electricity, Water, High-speed Fiber',
        date: new Date(currentYear, currentMonth, 8),
      },
      {
        userId: user._id,
        type: 'expense',
        category: 'Transportation',
        amount: 280,
        description: 'Transit pass & ride sharing',
        date: new Date(currentYear, currentMonth, 10),
      },
      {
        userId: user._id,
        type: 'expense',
        category: 'Dining Out',
        amount: 340,
        description: 'Team lunches and weekend dining',
        date: new Date(currentYear, currentMonth, 14),
      },
      {
        userId: user._id,
        type: 'expense',
        category: 'Entertainment',
        amount: 160,
        description: 'Streaming services & concert tickets',
        date: new Date(currentYear, currentMonth, 16),
      },
      {
        userId: user._id,
        type: 'expense',
        category: 'Healthcare',
        amount: 110,
        description: 'Gym membership & pharmacy',
        date: new Date(currentYear, currentMonth, 18),
      },

      // Previous Month Sample
      {
        userId: user._id,
        type: 'income',
        category: 'Salary',
        amount: 6500,
        description: 'Prior Month Tech Salary',
        date: new Date(currentYear, currentMonth - 1, 1),
      },
      {
        userId: user._id,
        type: 'expense',
        category: 'Housing',
        amount: 1800,
        description: 'Prior Month Apartment Rent',
        date: new Date(currentYear, currentMonth - 1, 2),
      },
      {
        userId: user._id,
        type: 'expense',
        category: 'Groceries',
        amount: 480,
        description: 'Groceries',
        date: new Date(currentYear, currentMonth - 1, 8),
      },
    ];

    await Transaction.insertMany(transactionsData);
    console.log(`[Seed] Seeded ${transactionsData.length} transactions.`);

    // Budget for Current Month
    const categoryLimits = [
      { category: 'Housing', limit: 1800 },
      { category: 'Groceries', limit: 600 },
      { category: 'Utilities', limit: 250 },
      { category: 'Transportation', limit: 350 },
      { category: 'Dining Out', limit: 400 },
      { category: 'Entertainment', limit: 200 },
      { category: 'Healthcare', limit: 150 },
    ];
    const totalBudget = categoryLimits.reduce((acc, c) => acc + c.limit, 0);

    await Budget.create({
      userId: user._id,
      month: currentMonth + 1,
      year: currentYear,
      income: 6500,
      categoryLimits,
      totalBudget,
    });
    console.log(`[Seed] Seeded monthly budget of $${totalBudget}.`);

    // Financial Goals
    const emergencyFundDate = new Date();
    emergencyFundDate.setMonth(emergencyFundDate.getMonth() + 8);
    const efCalc = calculateGoalContribution(20000, 11500, emergencyFundDate);

    const houseDepositDate = new Date();
    houseDepositDate.setFullYear(houseDepositDate.getFullYear() + 2);
    const hdCalc = calculateGoalContribution(60000, 18000, houseDepositDate);

    const vacationDate = new Date();
    vacationDate.setMonth(vacationDate.getMonth() + 4);
    const vacCalc = calculateGoalContribution(4000, 2400, vacationDate);

    await Goal.insertMany([
      {
        userId: user._id,
        name: 'Emergency Fund (6 Months)',
        targetAmount: 20000,
        currentAmount: 11500,
        targetDate: emergencyFundDate,
        monthlyRequired: efCalc.monthlyRequired,
        category: 'Security',
      },
      {
        userId: user._id,
        name: 'Home Down Payment',
        targetAmount: 60000,
        currentAmount: 18000,
        targetDate: houseDepositDate,
        monthlyRequired: hdCalc.monthlyRequired,
        category: 'Real Estate',
      },
      {
        userId: user._id,
        name: 'Europe Summer Vacation',
        targetAmount: 4000,
        currentAmount: 2400,
        targetDate: vacationDate,
        monthlyRequired: vacCalc.monthlyRequired,
        category: 'Leisure',
      },
    ]);
    console.log('[Seed] Seeded 3 financial goals with calculated contributions.');

    // Seed sample educational AI Chat history
    await ChatMessage.insertMany([
      {
        userId: user._id,
        role: 'user',
        message: 'How is my current savings rate looking for my income level?',
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
      {
        userId: user._id,
        role: 'assistant',
        message: `### Financial Health Analysis for Alex
- **Monthly Income:** $6,500
- **Recorded Expenses:** $3,405
- **Current Monthly Surplus:** $3,095
- **Savings Rate:** ~47.6%

You are in an exceptional financial position! A 47.6% savings rate is well above the standard 20% benchmark recommended by the 50/30/20 budgeting rule.

#### Immediate Recommendations:
1. **Accelerate Emergency Fund:** Your Emergency Reserve goal has $11,500 of the $20,000 target. By allocating $1,063/mo of your surplus, you'll fully fund it in under 8 months.
2. **Tax-Advantaged Investing:** Consider funneling remaining surplus into index funds or retirement accounts to benefit from long-term compound growth.

*Disclaimer: Educational planning only. Not regulated investment advice.*`,
        createdAt: new Date(Date.now() - 3600000 * 2 + 5000),
      },
    ]);
    console.log('[Seed] Seeded sample AI chat history.');

    console.log('[Seed] Database seeding completed successfully!');
  } catch (err: any) {
    console.error('[Seed] Error during seeding:', err.message);
  } finally {
    if (shouldDisconnect) {
      await disconnectDB();
    }
  }
};

// Run if called directly
if (process.argv[1]?.includes('seed.ts') || process.argv[1]?.includes('seed.js')) {
  seedData(true);
}
