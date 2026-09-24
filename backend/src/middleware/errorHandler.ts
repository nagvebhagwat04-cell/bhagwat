import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  const code = err.code || (statusCode === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR');

  const response: any = {
    success: false,
    message: err.message || 'An unexpected error occurred',
    code,
  };

  // Only include debug details in non-production
  if (process.env.NODE_ENV === 'development') {
    response.details = err.stack;
  }

  res.status(statusCode).json(response);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`,
    code: 'ROUTE_NOT_FOUND',
  });
};
