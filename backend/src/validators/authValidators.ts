import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
      code: 'VALIDATION_ERROR',
    });
    return;
  }
  next();
};

export const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  handleValidationErrors,
];

export const loginValidator = [
  body('email').trim().isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

export const profileValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('monthlyIncome').optional().isFloat({ min: 0 }).withMessage('Monthly income cannot be negative'),
  body('ageRange').optional().trim(),
  body('occupation').optional().trim(),
  body('financialKnowledge').optional().isIn(['beginner', 'intermediate', 'advanced']),
  body('riskProfile').optional().isIn(['conservative', 'moderate', 'aggressive']),
  handleValidationErrors,
];
