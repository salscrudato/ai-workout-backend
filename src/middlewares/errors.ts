import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import pino from 'pino';

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

/**
 * Enhanced error handler middleware with structured logging and user-friendly responses
 *
 * Handles different types of errors with appropriate HTTP status codes and messages:
 * - Validation errors (Zod schema validation)
 * - Database errors (MongoDB/Firestore)
 * - Application errors (custom AppError instances)
 * - Generic errors with fallback handling
 *
 * @param err - Error object
 * @param req - Express request object
 * @param res - Express response object
 * @param _next - Express next function (unused)
 */
export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction): void {
  const errorId = generateErrorId();
  const userId = req.user?.uid || 'anonymous';

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const validationErrors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code
    }));

    logger.warn('Validation error', {
      errorId,
      userId,
      url: req.url,
      method: req.method,
      validationErrors
    });

    res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: validationErrors,
      errorId
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
      isOperational: err.isOperational
    });

    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      errorId,
      timestamp: err.timestamp
    });
    return;
  }

  // Handle MongoDB/Firestore duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';

    logger.warn('Duplicate key error', {
      errorId,
      userId,
      url: req.url,
      method: req.method,
      field,
      value: err.keyValue?.[field]
    });

    res.status(409).json({
      error: `${field} already exists`,
      code: 'DUPLICATE_KEY_ERROR',
      field,
      errorId
    });
    return;
  }

  // Handle MongoDB cast errors (invalid ObjectId format)
  if (err.name === 'CastError') {
    logger.warn('Cast error (invalid ID format)', {
      errorId,
      userId,
      url: req.url,
      method: req.method,
      path: err.path,
      value: err.value
    });

    res.status(400).json({
      error: 'Invalid ID format',
      code: 'INVALID_ID_FORMAT',
      field: err.path,
      errorId
    });
    return;
  }

  // Handle generic errors
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const isServerError = status >= 500;

  // Log with appropriate level
  if (isServerError) {
    logger.error('Server error', {
      errorId,
      userId,
      url: req.url,
      method: req.method,
      status,
      message,
      stack: err.stack,
      body: req.body,
      params: req.params,
      query: req.query
    });
  } else {
    logger.warn('Client error', {
      errorId,
      userId,
      url: req.url,
      method: req.method,
      status,
      message
    });
  }

  // Prepare response
  const response: any = {
    error: isServerError && process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : message,
    code: err.code || (isServerError ? 'INTERNAL_ERROR' : 'CLIENT_ERROR'),
    errorId
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack;
  }

  res.status(status).json(response);
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
 * ```
 */
export const asyncHandler = <T extends Request = Request, U extends Response = Response>(
  fn: (req: T, res: U, next: NextFunction) => Promise<void>
) => (req: T, res: U, next: NextFunction): void => {
  Promise.resolve(fn(req, res, next)).catch(next);
};