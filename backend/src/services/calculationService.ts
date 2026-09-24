/**
 * Deterministic Financial Calculation Engine
 * 
 * Implements pure, unit-tested financial formulas strictly according to
 * RULES.md, PRD.md, and ARCHITECTURE.md.
 */

export interface GoalCalculationResult {
  remainingMonths: number;
  remainingAmount: number;
  monthlyRequired: number;
  isExpired: boolean;
  percentageComplete: number;
}

export interface EMICalculationResult {
  monthlyEMI: number;
  totalPayment: number;
  totalInterest: number;
  principal: number;
  tenureMonths: number;
  annualInterestRate: number;
}

export interface DTICalculationResult {
  ratio: number;
  status: 'healthy' | 'moderate' | 'high_risk';
  description: string;
}

export interface BudgetUtilizationResult {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  utilizationRate: number;
  status: 'under_budget' | 'warning' | 'exceeded';
}

/**
 * Validates a finite non-negative number
 */
export const validateNonNegativeNumber = (val: any, fieldName: string): number => {
  const num = Number(val);
  if (!Number.isFinite(num) || isNaN(num) || num < 0) {
    throw new Error(`${fieldName} must be a non-negative finite number`);
  }
  return num;
};

/**
 * Validates a positive number (> 0)
 */
export const validatePositiveNumber = (val: any, fieldName: string): number => {
  const num = Number(val);
  if (!Number.isFinite(num) || isNaN(num) || num <= 0) {
    throw new Error(`${fieldName} must be a positive finite number greater than zero`);
  }
  return num;
};

/**
 * Calculate Monthly Surplus:
 * surplus = income - totalExpenses
 */
export const calculateMonthlySurplus = (income: number, totalExpenses: number): number => {
  const validIncome = validateNonNegativeNumber(income, 'income');
  const validExpenses = validateNonNegativeNumber(totalExpenses, 'totalExpenses');
  return Math.round((validIncome - validExpenses) * 100) / 100;
};

/**
 * Calculate Savings Rate (%):
 * savingsRate = (monthlySurplus / income) * 100
 * Handles zero income safely without division by zero.
 */
export const calculateSavingsRate = (income: number, totalExpenses: number): number => {
  const validIncome = validateNonNegativeNumber(income, 'income');
  const validExpenses = validateNonNegativeNumber(totalExpenses, 'totalExpenses');

  if (validIncome === 0) {
    return 0;
  }

  const surplus = validIncome - validExpenses;
  const rate = (surplus / validIncome) * 100;
  return Math.round(rate * 100) / 100;
};

/**
 * Calculate Budget Utilization:
 * utilizationRate = (totalSpent / totalBudget) * 100
 */
export const calculateBudgetUtilization = (
  totalSpent: number,
  totalBudget: number
): BudgetUtilizationResult => {
  const validSpent = validateNonNegativeNumber(totalSpent, 'totalSpent');
  const validBudget = validateNonNegativeNumber(totalBudget, 'totalBudget');

  if (validBudget === 0) {
    return {
      totalBudget: 0,
      totalSpent: validSpent,
      remaining: -validSpent,
      utilizationRate: 0,
      status: validSpent > 0 ? 'exceeded' : 'under_budget',
    };
  }

  const utilizationRate = Math.round((validSpent / validBudget) * 10000) / 100;
  const remaining = Math.round((validBudget - validSpent) * 100) / 100;

  let status: 'under_budget' | 'warning' | 'exceeded' = 'under_budget';
  if (utilizationRate > 100) {
    status = 'exceeded';
  } else if (utilizationRate >= 80) {
    status = 'warning';
  }

  return {
    totalBudget: validBudget,
    totalSpent: validSpent,
    remaining,
    utilizationRate,
    status,
  };
};

/**
 * Calculate Emergency Fund Requirement:
 * fund = monthlyExpenses * targetMonths
 */
export const calculateEmergencyFundRequirement = (
  monthlyExpenses: number,
  targetMonths: number = 6
): { targetAmount: number; targetMonths: number; monthlyExpenseBasis: number } => {
  const validExpenses = validateNonNegativeNumber(monthlyExpenses, 'monthlyExpenses');
  const validMonths = validatePositiveNumber(targetMonths, 'targetMonths');

  const targetAmount = Math.round(validExpenses * validMonths * 100) / 100;
  return {
    targetAmount,
    targetMonths: validMonths,
    monthlyExpenseBasis: validExpenses,
  };
};

/**
 * Calculate Goal Required Monthly Contribution:
 * Handles expired deadlines, remaining months calculation, and target completion.
 */
export const calculateGoalContribution = (
  targetAmount: number,
  currentAmount: number,
  targetDateInput: Date | string,
  currentDateInput: Date = new Date()
): GoalCalculationResult => {
  const validTarget = validatePositiveNumber(targetAmount, 'targetAmount');
  const validCurrent = validateNonNegativeNumber(currentAmount, 'currentAmount');

  const targetDate = new Date(targetDateInput);
  if (isNaN(targetDate.getTime())) {
    throw new Error('targetDate must be a valid date');
  }

  const currentDate = new Date(currentDateInput);
  const remainingAmount = Math.max(0, validTarget - validCurrent);
  const percentageComplete = Math.min(100, Math.round((validCurrent / validTarget) * 10000) / 100);

  // If already reached
  if (remainingAmount <= 0) {
    return {
      remainingMonths: 0,
      remainingAmount: 0,
      monthlyRequired: 0,
      isExpired: false,
      percentageComplete: 100,
    };
  }

  // Calculate month difference
  const yearDiff = targetDate.getFullYear() - currentDate.getFullYear();
  const monthDiff = targetDate.getMonth() - currentDate.getMonth();
  const dayDiff = targetDate.getDate() - currentDate.getDate();

  let totalMonths = yearDiff * 12 + monthDiff;
  if (dayDiff > 0) {
    totalMonths += 1;
  }

  // Check if deadline is in the past or current month expired
  if (targetDate.getTime() <= currentDate.getTime() || totalMonths <= 0) {
    return {
      remainingMonths: 0,
      remainingAmount: Math.round(remainingAmount * 100) / 100,
      monthlyRequired: Math.round(remainingAmount * 100) / 100,
      isExpired: true,
      percentageComplete,
    };
  }

  const monthlyRequired = Math.round((remainingAmount / totalMonths) * 100) / 100;

  return {
    remainingMonths: totalMonths,
    remainingAmount: Math.round(remainingAmount * 100) / 100,
    monthlyRequired,
    isExpired: false,
    percentageComplete,
  };
};

/**
 * Calculate Loan EMI (Equated Monthly Installment):
 * E = [P * r * (1 + r)^n] / [(1 + r)^n - 1]
 */
export const calculateEMI = (
  principal: number,
  annualInterestRate: number,
  tenureMonths: number
): EMICalculationResult => {
  const validPrincipal = validatePositiveNumber(principal, 'principal');
  const validRate = validateNonNegativeNumber(annualInterestRate, 'annualInterestRate');
  const validTenure = validatePositiveNumber(tenureMonths, 'tenureMonths');

  // Handle 0% interest rate loan
  if (validRate === 0) {
    const monthlyEMI = Math.round((validPrincipal / validTenure) * 100) / 100;
    return {
      monthlyEMI,
      totalPayment: validPrincipal,
      totalInterest: 0,
      principal: validPrincipal,
      tenureMonths: validTenure,
      annualInterestRate: 0,
    };
  }

  // Monthly interest rate
  const monthlyRate = (validRate / 12) / 100;
  const factor = Math.pow(1 + monthlyRate, validTenure);
  const monthlyEMI = (validPrincipal * monthlyRate * factor) / (factor - 1);

  const roundedEMI = Math.round(monthlyEMI * 100) / 100;
  const totalPayment = Math.round(roundedEMI * validTenure * 100) / 100;
  const totalInterest = Math.round((totalPayment - validPrincipal) * 100) / 100;

  return {
    monthlyEMI: roundedEMI,
    totalPayment,
    totalInterest: Math.max(0, totalInterest),
    principal: validPrincipal,
    tenureMonths: validTenure,
    annualInterestRate: validRate,
  };
};

/**
 * Calculate Debt-To-Income (DTI) Ratio:
 * DTI = (monthlyDebtPayments / monthlyIncome) * 100
 */
export const calculateDebtToIncomeRatio = (
  monthlyDebtPayments: number,
  monthlyIncome: number
): DTICalculationResult => {
  const validDebt = validateNonNegativeNumber(monthlyDebtPayments, 'monthlyDebtPayments');
  const validIncome = validateNonNegativeNumber(monthlyIncome, 'monthlyIncome');

  if (validIncome === 0) {
    return {
      ratio: validDebt > 0 ? 100 : 0,
      status: validDebt > 0 ? 'high_risk' : 'healthy',
      description: validDebt > 0 ? 'No reported income with active debt obligations.' : 'Zero debt and zero income.',
    };
  }

  const ratio = Math.round((validDebt / validIncome) * 10000) / 100;

  let status: 'healthy' | 'moderate' | 'high_risk' = 'healthy';
  let description = 'Healthy debt load (below 36%). You have comfortable borrowing capacity.';

  if (ratio > 43) {
    status = 'high_risk';
    description = 'High risk debt load (above 43%). Lenders may consider this risky and prioritize debt reduction.';
  } else if (ratio >= 36) {
    status = 'moderate';
    description = 'Moderate debt load (36% to 43%). Manageable, but keep expenses controlled before taking on more debt.';
  }

  return {
    ratio,
    status,
    description,
  };
};
