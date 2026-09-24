import { body } from 'express-validator';
import { handleValidationErrors } from './authValidators.js';

export const transactionValidator = [
  body('type').isIn(['income', 'expense']).withMessage('Type must be either income or expense'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('description').optional().trim().isLength({ max: 255 }),
  body('date').optional().isISO8601().toDate().withMessage('Invalid date format'),
  handleValidationErrors,
];

export const transactionUpdateValidator = [
  body('type').optional().isIn(['income', 'expense']).withMessage('Type must be either income or expense'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('description').optional().trim().isLength({ max: 255 }),
  body('date').optional().isISO8601().toDate().withMessage('Invalid date format'),
  handleValidationErrors,
];

export const budgetValidator = [
  body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  body('year').isInt({ min: 2000, max: 2100 }).withMessage('Year must be between 2000 and 2100'),
  body('income').optional().isFloat({ min: 0 }).withMessage('Income cannot be negative'),
  body('categoryLimits').optional().isArray().withMessage('Category limits must be an array'),
  body('categoryLimits.*.category').trim().notEmpty().withMessage('Category name is required'),
  body('categoryLimits.*.limit').isFloat({ min: 0 }).withMessage('Limit must be non-negative'),
  body('totalBudget').optional().isFloat({ min: 0 }).withMessage('Total budget cannot be negative'),
  handleValidationErrors,
];

export const goalValidator = [
  body('name').trim().notEmpty().withMessage('Goal name is required').isLength({ max: 100 }),
  body('targetAmount').isFloat({ min: 1 }).withMessage('Target amount must be at least 1'),
  body('currentAmount').optional().isFloat({ min: 0 }).withMessage('Current amount cannot be negative'),
  body('targetDate').notEmpty().withMessage('Target date is required').isISO8601().toDate().withMessage('Invalid target date format'),
  body('category').optional().trim(),
  handleValidationErrors,
];

export const goalUpdateValidator = [
  body('name').optional().trim().notEmpty().withMessage('Goal name cannot be empty').isLength({ max: 100 }),
  body('targetAmount').optional().isFloat({ min: 1 }).withMessage('Target amount must be at least 1'),
  body('currentAmount').optional().isFloat({ min: 0 }).withMessage('Current amount cannot be negative'),
  body('targetDate').optional().isISO8601().toDate().withMessage('Invalid target date format'),
  body('category').optional().trim(),
  handleValidationErrors,
];

export const emiCalculationValidator = [
  body('principal').isFloat({ min: 1 }).withMessage('Principal loan amount must be greater than 0'),
  body('annualInterestRate').isFloat({ min: 0 }).withMessage('Annual interest rate cannot be negative'),
  body('tenureMonths').isInt({ min: 1 }).withMessage('Tenure months must be at least 1'),
  handleValidationErrors,
];

export const goalCalculationValidator = [
  body('targetAmount').isFloat({ min: 1 }).withMessage('Target amount must be greater than 0'),
  body('currentAmount').optional().isFloat({ min: 0 }).withMessage('Current amount cannot be negative'),
  body('targetDate').notEmpty().isISO8601().toDate().withMessage('Valid target date is required'),
  handleValidationErrors,
];

export const chatValidator = [
  body('message').trim().notEmpty().withMessage('Message cannot be empty').isLength({ max: 4000 }),
  handleValidationErrors,
];
