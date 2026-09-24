export interface User {
  id: string;
  name: string;
  email: string;
  ageRange?: string;
  occupation?: string;
  monthlyIncome: number;
  financialKnowledge: 'beginner' | 'intermediate' | 'advanced';
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
}

export interface Transaction {
  _id: string;
  userId: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
}

export interface CategoryLimit {
  category: string;
  limit: number;
}

export interface Budget {
  _id?: string;
  userId?: string;
  month: number;
  year: number;
  income: number;
  categoryLimits: CategoryLimit[];
  totalBudget: number;
}

export interface BudgetUtilization {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  utilizationRate: number;
  status: 'under_budget' | 'warning' | 'exceeded';
}

export interface CategoryBreakdown {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  utilizationRate: number;
  isOverBudget: boolean;
}

export interface BudgetSpendingResponse {
  budget: Budget;
  spending: {
    totalSpent: number;
    categorySpent: Record<string, number>;
    utilization: BudgetUtilization;
    categoryBreakdown: CategoryBreakdown[];
  };
}

export interface Goal {
  _id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  monthlyRequired: number;
  remainingMonths?: number;
  remainingAmount?: number;
  percentageComplete?: number;
  isExpired?: boolean;
  category?: string;
}

export interface ChatMessage {
  _id?: string;
  role: 'user' | 'assistant';
  message: string;
  createdAt?: string;
}

export interface DashboardMetrics {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  savingsRate: number;
  emergencyFund6Months: number;
}

export interface CashFlowTrendItem {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  budgetUtilization: BudgetUtilization;
  categorySpending: Record<string, number>;
  goals: Goal[];
  recentTransactions: Transaction[];
  cashFlowTrend: CashFlowTrendItem[];
  aiSummary: string;
}

export interface EMICalculationResult {
  monthlyEMI: number;
  totalPayment: number;
  totalInterest: number;
  principal: number;
  tenureMonths: number;
  annualInterestRate: number;
}

export interface GoalCalculationResult {
  remainingMonths: number;
  remainingAmount: number;
  monthlyRequired: number;
  isExpired: boolean;
  percentageComplete: number;
}

export interface DTICalculationResult {
  ratio: number;
  status: 'healthy' | 'moderate' | 'high_risk';
  description: string;
}
