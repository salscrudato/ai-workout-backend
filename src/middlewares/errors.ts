import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import pino from 'pino';
import { RetryExhaustedError } from '../utils/circuitBreaker';

// Initialize logger for error handling
const baseLogger = pino({
  name: 'error-handler',
  level: process.env['NODE_ENV'] === 'development' ? 'debug' : 'info'
});

// Create logger wrapper that accepts any parameters
const logger = {
  info: (msg: string, obj?: any) => baseLogger.info(obj || {}, msg),
  error: (msg: string, obj?: any) => baseLogger.error(obj || {}, msg),
  warn: (msg: string, obj?: any) => baseLogger.warn(obj || {}, msg),
  debug: (msg: string, obj?: any) => baseLogger.debug(obj || {}, msg),
};

/**
 * Custom error class for application-specific errors
 * Provides structured error information for better debugging and user experience
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly timestamp: string;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Generates a unique error ID for tracking and correlation
 * @returns Unique error identifier
 */
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction): void {
  const errorId = generateErrorId();
  const userId = req.user?.uid || 'anonymous';
  const context = {
    operation: `${req.method} ${req.path}`,
    userId
  };

  const isDev = process.env.NODE_ENV === 'development';

  let statusCode = 500;
  if (err instanceof AppError) {
    statusCode = err.statusCode;
  } else if (err instanceof ZodError) {
    statusCode = 400;
  } else if (err instanceof RetryExhaustedError) {
    statusCode = 503;
  } else if (typeof err.status === 'number') {
    statusCode = err.status;
  } else if (typeof err.statusCode === 'number') {
    statusCode = err.statusCode;
  }

  // Handle Zod validation errors with enhanced details
  if (err instanceof ZodError) {
    const validationErrors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code,
      received: (e as any).received
    }));

    logger.warn('Validation error', {
      errorId,
      userId,
      url: req.url,
      method: req.method,
      validationErrors,
    });

    res.status(400).json({
      error: 'Invalid request parameters',
      code: 'VALIDATION_ERROR',
      details: validationErrors,
      errorId,
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Handle custom application errors
  if (err instanceof AppError) {
    logger.error('Application error', {
      errorId,
      userId,
      url: req.url,
      method: req.method,
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
      isOperational: err.isOperational,
    });

    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      errorId,
      timestamp: err.timestamp
    });
    return;
  }

  // Handle retry exhausted errors
  if (err instanceof RetryExhaustedError) {
    logger.error('Retry exhausted error', {
      errorId,
      userId,
      url: req.url,
      method: req.method,
      attempts: err.attempts,
      originalError: err.originalError.message,
    });

    res.status(503).json({
      error: 'Service temporarily unavailable. Please try again.',
      code: 'RETRY_EXHAUSTED',
      errorId,
      timestamp: new Date().toISOString(),
      retryAfter: 60 // Suggest retry after 60 seconds
    });
    return;
  }

  const isServerError = statusCode >= 500;
  // Log the error with appropriate level
  const logPayload: any = {
    errorId,
    userId,
    url: req.url,
    method: req.method,
    statusCode,
    message: err?.message,
  };
  if (isDev) {
    logPayload.stack = err?.stack;
  }
  if (isServerError) {
    logger.error('Request error', logPayload);
  } else {
    logger.warn('Request error', logPayload);
  }

  // Minimal user-facing message
  const defaultMessages: Record<number, string> = {
    400: 'Invalid request',
    401: 'Authentication failed',
    403: 'Access denied',
    404: 'Not found',
    429: 'Too many requests',
    503: 'Service temporarily unavailable. Please try again.',
    500: 'Internal server error',
  };

  const response: any = {
    error: err instanceof AppError ? err.message : (defaultMessages[statusCode] || defaultMessages[500]),
    code: err instanceof AppError ? err.code : `HTTP_${statusCode}`,
    errorId,
    timestamp: new Date().toISOString()
  };

  if (isDev && err && err.stack) {
    response.technical = { stack: err.stack };
  }

  res.status(statusCode).json(response);
}

/**
 * Error logging middleware
 */
export const errorLoggingMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errorId = generateErrorId();
  const userId = req.user?.uid || 'anonymous';
  const responseTime = req.startTime ? Date.now() - req.startTime : undefined;

  logger.error('Request failed with error', {
    errorId,
    userId,
    url: req.url,
    method: req.method,
    error: error.message,
    stack: error.stack,
    responseTime
  });

  next(error);
};

/**
 * Async handler wrapper for Express route handlers
 *
 * Automatically catches and forwards async errors to error middleware.
 * Provides type safety for async route handlers.
 *
 * @param fn - Async route handler function
 * @returns Express middleware function that handles async errors
 *
 * @example
 * ```typescript
* export const getUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
 *   const user = await UserModel.findById(req.params.id);
 *   res.json(user);
 * });
 *
```
 */
export const asyncHandler = <T extends Request = Request, U extends Response = Response>(
  fn: (req: T, res: U, next: NextFunction) => Promise<void>
) => (req: T, res: U, next: NextFunction): void => {
  Promise.resolve(fn(req, res, next)).catch(next);
};