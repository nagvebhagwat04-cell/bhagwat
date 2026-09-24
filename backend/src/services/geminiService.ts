import { GoogleGenerativeAI } from '@google/generative-ai';
import { User } from '../models/User.js';
import { Transaction } from '../models/Transaction.js';
import { Goal } from '../models/Goal.js';
import { Budget } from '../models/Budget.js';
import { ChatMessage } from '../models/ChatMessage.js';
import {
  calculateMonthlySurplus,
  calculateSavingsRate,
  calculateBudgetUtilization,
  calculateEmergencyFundRequirement,
} from './calculationService.js';

export interface FinancialContext {
  profile: {
    name: string;
    monthlyIncome: number;
    financialKnowledge: string;
    riskProfile: string;
  };
  metrics: {
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlySurplus: number;
    savingsRate: number;
    emergencyFundRequirement6Months: number;
    budgetUtilizationRate: number;
    totalBudget: number;
  };
  categorySpending: Record<string, number>;
  goals: Array<{
    name: string;
    targetAmount: number;
    currentAmount: number;
    monthlyRequired: number;
    percentageComplete: number;
    targetDate: string;
  }>;
  recentTransactions: Array<{
    type: string;
    category: string;
    amount: number;
    date: string;
    description: string;
  }>;
}

/**
 * Builds the structured, sanitized financial context for a specific user.
 * Strictly avoids leaking sensitive credentials.
 */
export const buildFinancialContext = async (userId: string): Promise<FinancialContext> => {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) {
    throw new Error('User not found');
  }

  // Get current month transactions
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const transactions = await Transaction.find({
    userId,
    date: { $gte: startOfMonth, $lte: endOfMonth },
  }).sort({ date: -1 });

  // Fallback to all recent transactions if no transactions this month
  const allRecent = transactions.length > 0 
    ? transactions 
    : await Transaction.find({ userId }).sort({ date: -1 }).limit(30);

  let monthlyExpenses = 0;
  let transactionIncome = 0;
  const categorySpending: Record<string, number> = {};

  for (const tx of allRecent) {
    if (tx.type === 'expense') {
      monthlyExpenses += tx.amount;
      categorySpending[tx.category] = (categorySpending[tx.category] || 0) + tx.amount;
    } else if (tx.type === 'income') {
      transactionIncome += tx.amount;
    }
  }

  // Use profile monthly income if specified, otherwise transaction income
  const effectiveIncome = user.monthlyIncome > 0 ? user.monthlyIncome : transactionIncome;

  // Fetch Budget
  const budget = await Budget.findOne({
    userId,
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });

  const totalBudget = budget ? budget.totalBudget : 0;

  // Goals
  const goals = await Goal.find({ userId }).sort({ targetDate: 1 });

  // Deterministic metrics
  const monthlySurplus = calculateMonthlySurplus(effectiveIncome, monthlyExpenses);
  const savingsRate = calculateSavingsRate(effectiveIncome, monthlyExpenses);
  const emergencyFund = calculateEmergencyFundRequirement(monthlyExpenses, 6);
  const budgetUtil = calculateBudgetUtilization(monthlyExpenses, totalBudget);

  return {
    profile: {
      name: user.name,
      monthlyIncome: effectiveIncome,
      financialKnowledge: user.financialKnowledge,
      riskProfile: user.riskProfile,
    },
    metrics: {
      monthlyIncome: effectiveIncome,
      monthlyExpenses: Math.round(monthlyExpenses * 100) / 100,
      monthlySurplus,
      savingsRate,
      emergencyFundRequirement6Months: emergencyFund.targetAmount,
      budgetUtilizationRate: budgetUtil.utilizationRate,
      totalBudget,
    },
    categorySpending,
    goals: goals.map((g) => ({
      name: g.name,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      monthlyRequired: g.monthlyRequired,
      percentageComplete: g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0,
      targetDate: g.targetDate.toISOString().split('T')[0],
    })),
    recentTransactions: allRecent.slice(0, 10).map((t) => ({
      type: t.type,
      category: t.category,
      amount: t.amount,
      date: t.date.toISOString().split('T')[0],
      description: t.description,
    })),
  };
};

/**
 * Generate educational response using rule-based deterministic fallback
 * when Gemini API key is absent or Gemini encounters network/rate limits.
 */
export const generateDeterministicFallbackResponse = (
  userMessage: string,
  context: FinancialContext
): string => {
  const query = userMessage.toLowerCase();
  const { metrics, profile, goals, categorySpending } = context;

  // Category with highest spending
  const sortedCategories = Object.entries(categorySpending).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories.length > 0 ? sortedCategories[0] : null;

  if (query.includes('saving') || query.includes('improve')) {
    return `### Personalized Savings Analysis for ${profile.name}
- **Current Monthly Income:** $${metrics.monthlyIncome.toLocaleString()}
- **Current Monthly Expenses:** $${metrics.monthlyExpenses.toLocaleString()}
- **Current Monthly Surplus:** $${metrics.monthlySurplus.toLocaleString()}
- **Savings Rate:** ${metrics.savingsRate}%

#### Key Observations:
1. **Target Savings Benchmark:** Aim for a 20% to 30% savings rate (50/30/20 rule: 50% Needs, 30% Wants, 20% Savings). Your current savings rate is **${metrics.savingsRate}%**.
2. ${topCategory ? `Your highest expense category is **${topCategory[0]}** ($${topCategory[1].toLocaleString()}). Trimming 10-15% here could free up an extra $${Math.round(topCategory[1] * 0.12).toLocaleString()} monthly.` : 'Track all recurring subscriptions and dining expenses to discover quick savings wins.'}
3. **Emergency Cushion:** A 6-month safety net for your spending level is **$${metrics.emergencyFundRequirement6Months.toLocaleString()}**.

*Disclaimer: This is educational planning guidance based on your recorded transactions and does not replace regulated financial advice.*`;
  }

  if (query.includes('overspend') || query.includes('expense') || query.includes('where')) {
    if (sortedCategories.length === 0) {
      return `You have not recorded recent expenses yet. Add your daily expenses to see category breakdown and identify where your funds go!`;
    }
    const catList = sortedCategories
      .slice(0, 4)
      .map(([cat, amt]) => `- **${cat}:** $${amt.toLocaleString()} (${Math.round((amt / (metrics.monthlyExpenses || 1)) * 100)}% of total expenses)`)
      .join('\n');

    return `### Expense Breakdown
Here is where your money is currently going:
${catList}

${topCategory ? `**Primary Opportunity:** Your largest outflow is **${topCategory[0]}**. Reviewing discretionary items in this area is typically the fastest way to curb overspending.` : ''}

*Disclaimer: Educational insight only.*`;
  }

  if (query.includes('goal') || query.includes('reach')) {
    if (goals.length === 0) {
      return `You currently have no active financial goals set up. Head to the **Goals** tab to set a target (e.g., Emergency Fund, Vacation, Down Payment) and the system will automatically calculate your exact monthly required contribution!`;
    }
    const goalSummary = goals
      .map(
        (g) =>
          `- **${g.name}:** $${g.currentAmount.toLocaleString()} of $${g.targetAmount.toLocaleString()} (${g.percentageComplete}%). Target Date: ${g.targetDate}. Required Monthly Savings: **$${g.monthlyRequired.toLocaleString()}/mo**.`
      )
      .join('\n');

    const totalGoalMonthly = goals.reduce((acc, g) => acc + g.monthlyRequired, 0);
    const surplusSufficiency = metrics.monthlySurplus >= totalGoalMonthly
      ? `✅ Your monthly surplus ($${metrics.monthlySurplus.toLocaleString()}) is sufficient to cover your total monthly goal requirements ($${totalGoalMonthly.toLocaleString()}).`
      : `⚠️ Your total monthly goal requirement is $${totalGoalMonthly.toLocaleString()}, while your monthly surplus is $${metrics.monthlySurplus.toLocaleString()}. Consider either extending your target dates or reducing expenses to close the $${(totalGoalMonthly - metrics.monthlySurplus).toLocaleString()} gap.`;

    return `### Goal Progress & Feasibility
${goalSummary}

${surplusSufficiency}

*Disclaimer: Educational planning guidance only.*`;
  }

  if (query.includes('sip') || query.includes('invest') || query.includes('systematic')) {
    return `### Systematic Investment Plan (SIP) Explained Simply
A **SIP (Systematic Investment Plan)** is a disciplined method of investing a fixed dollar amount into a diversified investment (such as an index mutual fund or ETF) at regular intervals (usually monthly).

#### How it works:
1. **Rupee/Dollar-Cost Averaging:** When markets dip, your fixed contribution buys more units. When markets rise, you buy fewer units. Over time, this smooths out purchase costs without having to "time the market".
2. **Compounding Power:** Reinvested earnings generate their own earnings over 5, 10, or 20+ years.
3. **Discipline over Emotion:** It automates your savings before you have the chance to spend them.

Based on your **${profile.riskProfile}** risk preference, building a 3-6 month emergency fund ($${metrics.emergencyFundRequirement6Months.toLocaleString()}) before committing to long-term equity SIPs is prudent.

*Disclaimer: For educational purposes only. Past performance does not guarantee future results.*`;
  }

  if (query.includes('emi') || query.includes('loan')) {
    return `### Understanding Loan EMIs and Prepayments
Your **EMI (Equated Monthly Installment)** consists of two components:
1. **Principal repayment** (reduces what you owe)
2. **Interest charge** (the cost of borrowing)

#### Increasing your EMI impact:
- Even a 5% to 10% increase in your monthly EMI payment directly slashes your outstanding principal faster.
- This dramatically shortens your total loan tenure and saves thousands in cumulative interest.
- You can test exact numbers using our built-in **EMI Calculator** under the Calculators tab!

*Disclaimer: Educational information only. Verify terms with your lending institution.*`;
  }

  // General financial assistance
  return `### Financial Advisory Overview for ${profile.name}
Thank you for your question. Here is an overview of your financial snapshot:
- **Monthly Income:** $${metrics.monthlyIncome.toLocaleString()}
- **Monthly Expenses:** $${metrics.monthlyExpenses.toLocaleString()}
- **Monthly Surplus:** $${metrics.monthlySurplus.toLocaleString()} (Savings Rate: ${metrics.savingsRate}%)
- **Emergency Reserve Target (6mo):** $${metrics.emergencyFundRequirement6Months.toLocaleString()}
- **Active Goals:** ${goals.length}

Feel free to ask specific questions such as:
- *"How can I improve my savings?"*
- *"Where am I overspending?"*
- *"Can I reach my goals?"*
- *"Explain SIP in simple words"*
- *"What happens if I increase my EMI?"*

*Disclaimer: Personal Finance Adviser is an educational planning tool and does not provide regulated financial or investment advice.*`;
};

/**
 * Executes conversational chat with Gemini using structured financial context.
 */
export const chatWithGemini = async (
  userId: string,
  userMessage: string
): Promise<{ reply: string; contextSummary: any }> => {
  const context = await buildFinancialContext(userId);

  const apiKey = process.env.GEMINI_API_KEY;

  let reply = '';

  if (apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.trim().length > 10) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Retrieve recent chat history for continuity
      const history = await ChatMessage.find({ userId }).sort({ createdAt: -1 }).limit(6);
      const formattedHistory = history.reverse().map((msg) => `${msg.role.toUpperCase()}: ${msg.message}`).join('\n');

      const systemPrompt = `You are a certified educational Personal Finance Adviser Bot.
Your goal is to provide clear, empathetic, responsible, and practical personal finance education and planning guidance.

CRITICAL RESPONSIBLE-FINANCE RULES:
1. You are an educational planning tool, NOT a regulated financial adviser or broker.
2. NEVER guarantee returns or promise specific investment outcomes.
3. NEVER claim to execute transactions or transfer money.
4. Base all observations strictly on the user's backend-calculated financial context provided below.
5. DO NOT invent or fabricate missing user data. If info is missing, politely ask the user.
6. Clearly state assumptions and highlight risks when discussing loans, savings, or investing.
7. Always append or maintain an educational disclaimer.

USER FINANCIAL CONTEXT:
${JSON.stringify(context, null, 2)}

RECENT CONVERSATION HISTORY:
${formattedHistory}

USER QUESTION:
${userMessage}

Respond in concise, structured markdown with clear headings, bullet points, and practical takeaways.`;

      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      reply = response.text();
    } catch (err: any) {
      console.warn(`[Gemini Service] Gemini API call failed (${err.message}). Using deterministic fallback.`);
      reply = generateDeterministicFallbackResponse(userMessage, context);
    }
  } else {
    // Deterministic fallback when API key is not configured
    reply = generateDeterministicFallbackResponse(userMessage, context);
  }

  // Save conversation messages to database
  await ChatMessage.create({
    userId,
    role: 'user',
    message: userMessage,
  });

  await ChatMessage.create({
    userId,
    role: 'assistant',
    message: reply,
    financialContextSnapshot: {
      surplus: context.metrics.monthlySurplus,
      savingsRate: context.metrics.savingsRate,
      expenses: context.metrics.monthlyExpenses,
    },
  });

  return {
    reply,
    contextSummary: context.metrics,
  };
};
