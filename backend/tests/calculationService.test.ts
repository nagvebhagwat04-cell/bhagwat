import { describe, it, expect } from 'vitest';
import {
  calculateMonthlySurplus,
  calculateSavingsRate,
  calculateBudgetUtilization,
  calculateEmergencyFundRequirement,
  calculateGoalContribution,
  calculateEMI,
  calculateDebtToIncomeRatio,
} from '../src/services/calculationService.js';

describe('Financial Calculation Engine - Unit Tests', () => {
  describe('Monthly Surplus', () => {
    it('calculates surplus correctly for normal values', () => {
      expect(calculateMonthlySurplus(5000, 3200)).toBe(1800);
    });

    it('calculates negative surplus (deficit) when expenses exceed income', () => {
      expect(calculateMonthlySurplus(3000, 3500)).toBe(-500);
    });

    it('handles zero income and zero expenses', () => {
      expect(calculateMonthlySurplus(0, 0)).toBe(0);
    });

    it('throws error on invalid negative input', () => {
      expect(() => calculateMonthlySurplus(-100, 500)).toThrow();
      expect(() => calculateMonthlySurplus(500, -50)).toThrow();
    });

    it('throws error on non-finite/NaN input', () => {
      expect(() => calculateMonthlySurplus(NaN, 500)).toThrow();
    });
  });

  describe('Savings Rate', () => {
    it('calculates savings rate for positive surplus', () => {
      expect(calculateSavingsRate(5000, 3000)).toBe(40);
    });

    it('handles zero income safely without division by zero', () => {
      expect(calculateSavingsRate(0, 1000)).toBe(0);
      expect(calculateSavingsRate(0, 0)).toBe(0);
    });

    it('handles zero expenses (100% savings rate)', () => {
      expect(calculateSavingsRate(4000, 0)).toBe(100);
    });

    it('calculates negative savings rate on deficit', () => {
      expect(calculateSavingsRate(2000, 2500)).toBe(-25);
    });

    it('throws on invalid inputs', () => {
      expect(() => calculateSavingsRate(-500, 200)).toThrow();
    });
  });

  describe('Budget Utilization', () => {
    it('calculates under_budget correctly', () => {
      const res = calculateBudgetUtilization(1500, 2000);
      expect(res.utilizationRate).toBe(75);
      expect(res.remaining).toBe(500);
      expect(res.status).toBe('under_budget');
    });

    it('calculates warning state at 80% to 100%', () => {
      const res = calculateBudgetUtilization(1700, 2000);
      expect(res.utilizationRate).toBe(85);
      expect(res.remaining).toBe(300);
      expect(res.status).toBe('warning');
    });

    it('calculates exceeded state when spent > budget', () => {
      const res = calculateBudgetUtilization(2200, 2000);
      expect(res.utilizationRate).toBe(110);
      expect(res.remaining).toBe(-200);
      expect(res.status).toBe('exceeded');
    });

    it('handles zero budget safely', () => {
      const res = calculateBudgetUtilization(500, 0);
      expect(res.utilizationRate).toBe(0);
      expect(res.status).toBe('exceeded');
    });
  });

  describe('Emergency Fund Requirement', () => {
    it('calculates 6 months standard emergency fund', () => {
      const res = calculateEmergencyFundRequirement(2500, 6);
      expect(res.targetAmount).toBe(15000);
      expect(res.targetMonths).toBe(6);
      expect(res.monthlyExpenseBasis).toBe(2500);
    });

    it('handles custom months and zero expenses', () => {
      const res = calculateEmergencyFundRequirement(0, 3);
      expect(res.targetAmount).toBe(0);
    });

    it('throws on invalid negative expenses or zero months', () => {
      expect(() => calculateEmergencyFundRequirement(-100, 6)).toThrow();
      expect(() => calculateEmergencyFundRequirement(2000, 0)).toThrow();
    });
  });

  describe('Goal Contribution', () => {
    it('calculates required monthly savings for future deadline', () => {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + 10);
      const res = calculateGoalContribution(10000, 2000, targetDate, new Date());
      expect(res.remainingAmount).toBe(8000);
      expect(res.remainingMonths).toBe(10);
      expect(res.monthlyRequired).toBe(800);
      expect(res.percentageComplete).toBe(20);
      expect(res.isExpired).toBe(false);
    });

    it('handles already completed goal', () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 5);
      const res = calculateGoalContribution(5000, 5000, futureDate, new Date());
      expect(res.remainingAmount).toBe(0);
      expect(res.monthlyRequired).toBe(0);
      expect(res.percentageComplete).toBe(100);
    });

    it('handles expired target date gracefully', () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);
      const res = calculateGoalContribution(5000, 1000, pastDate, new Date());
      expect(res.isExpired).toBe(true);
      expect(res.remainingAmount).toBe(4000);
      expect(res.monthlyRequired).toBe(4000);
    });

    it('throws on invalid target amount', () => {
      expect(() => calculateGoalContribution(0, 0, new Date())).toThrow();
      expect(() => calculateGoalContribution(-500, 0, new Date())).toThrow();
    });
  });

  describe('EMI Calculation', () => {
    it('calculates standard home/personal loan EMI correctly', () => {
      // 100,000 principal, 12% annual interest, 12 months tenure
      const res = calculateEMI(100000, 12, 12);
      expect(res.monthlyEMI).toBeCloseTo(8884.88, 1);
      expect(res.totalPayment).toBeCloseTo(106618.56, 1);
      expect(res.totalInterest).toBeCloseTo(6618.56, 1);
    });

    it('handles zero percent (interest-free) loan', () => {
      const res = calculateEMI(12000, 0, 12);
      expect(res.monthlyEMI).toBe(1000);
      expect(res.totalPayment).toBe(12000);
      expect(res.totalInterest).toBe(0);
    });

    it('throws on zero or negative principal or tenure', () => {
      expect(() => calculateEMI(0, 10, 12)).toThrow();
      expect(() => calculateEMI(-1000, 10, 12)).toThrow();
      expect(() => calculateEMI(10000, 10, 0)).toThrow();
      expect(() => calculateEMI(10000, -5, 12)).toThrow();
    });
  });

  describe('Debt-To-Income (DTI) Ratio', () => {
    it('classifies healthy debt under 36%', () => {
      const res = calculateDebtToIncomeRatio(1000, 5000);
      expect(res.ratio).toBe(20);
      expect(res.status).toBe('healthy');
    });

    it('classifies moderate debt between 36% and 43%', () => {
      const res = calculateDebtToIncomeRatio(2000, 5000);
      expect(res.ratio).toBe(40);
      expect(res.status).toBe('moderate');
    });

    it('classifies high risk debt above 43%', () => {
      const res = calculateDebtToIncomeRatio(2500, 5000);
      expect(res.ratio).toBe(50);
      expect(res.status).toBe('high_risk');
    });

    it('handles zero income with zero debt vs positive debt', () => {
      expect(calculateDebtToIncomeRatio(0, 0).status).toBe('healthy');
      expect(calculateDebtToIncomeRatio(500, 0).status).toBe('high_risk');
    });
  });
});
