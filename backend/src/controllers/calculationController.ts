import { Request, Response } from 'express';
import {
  calculateEMI,
  calculateGoalContribution,
  calculateBudgetUtilization,
  calculateDebtToIncomeRatio,
  calculateEmergencyFundRequirement,
} from '../services/calculationService.js';

export const calculateEMIHandler = (req: Request, res: Response): void => {
  try {
    const { principal, annualInterestRate, tenureMonths } = req.body;
    const result = calculateEMI(
      Number(principal),
      Number(annualInterestRate),
      Number(tenureMonths)
    );
    res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message, code: 'CALCULATION_ERROR' });
  }
};

export const calculateGoalHandler = (req: Request, res: Response): void => {
  try {
    const { targetAmount, currentAmount, targetDate } = req.body;
    const result = calculateGoalContribution(
      Number(targetAmount),
      Number(currentAmount || 0),
      targetDate
    );
    res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message, code: 'CALCULATION_ERROR' });
  }
};

export const calculateBudgetHandler = (req: Request, res: Response): void => {
  try {
    const { totalSpent, totalBudget } = req.body;
    const result = calculateBudgetUtilization(Number(totalSpent), Number(totalBudget));
    res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message, code: 'CALCULATION_ERROR' });
  }
};

export const calculateDTIHandler = (req: Request, res: Response): void => {
  try {
    const { monthlyDebtPayments, monthlyIncome } = req.body;
    const result = calculateDebtToIncomeRatio(
      Number(monthlyDebtPayments),
      Number(monthlyIncome)
    );
    res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message, code: 'CALCULATION_ERROR' });
  }
};

export const calculateEmergencyFundHandler = (req: Request, res: Response): void => {
  try {
    const { monthlyExpenses, targetMonths } = req.body;
    const result = calculateEmergencyFundRequirement(
      Number(monthlyExpenses),
      targetMonths ? Number(targetMonths) : 6
    );
    res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message, code: 'CALCULATION_ERROR' });
  }
};
