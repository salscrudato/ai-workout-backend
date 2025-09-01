import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction): void {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const validationErrors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    res.status(400).json({
      error: 'Validation failed',
      details: validationErrors
    });
    return;
  }

  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    res.status(409).json({
      error: `${field} already exists`
    });
    return;
  }

  // Handle MongoDB cast errors
  if (err.name === 'CastError') {
    res.status(400).json({
      error: 'Invalid ID format'
    });
    return;
  }

  const status = err.status ?? 500;
  const message = err.message ?? 'Internal Server Error';

  // Log errors in non-test environments
  if (process.env.NODE_ENV !== 'test') {
    console.error(`Error ${status}:`, {
      message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query
    });
  }

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

export const asyncHandler = <T extends Request, U extends Response>(
  fn: (req: T, res: U, next: NextFunction) => Promise<void>
) => (req: T, res: U, next: NextFunction): void => {
  Promise.resolve(fn(req, res, next)).catch(next);
};