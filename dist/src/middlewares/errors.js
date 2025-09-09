"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorLoggingMiddleware = exports.AppError = void 0;
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const pino_1 = __importDefault(require("pino"));
const circuitBreaker_1 = require("../utils/circuitBreaker");
// Initialize logger for error handling
const baseLogger = (0, pino_1.default)({
    name: 'error-handler',
    level: process.env['NODE_ENV'] === 'development' ? 'debug' : 'info'
});
// Create logger wrapper that accepts any parameters
const logger = {
    info: (msg, obj) => baseLogger.info(obj || {}, msg),
    error: (msg, obj) => baseLogger.error(obj || {}, msg),
    warn: (msg, obj) => baseLogger.warn(obj || {}, msg),
    debug: (msg, obj) => baseLogger.debug(obj || {}, msg),
};
/**
 * Custom error class for application-specific errors
 * Provides structured error information for better debugging and user experience
 */
class AppError extends Error {
    statusCode;
    code;
    isOperational;
    timestamp;
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', isOperational = true) {
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
exports.AppError = AppError;
/**
 * Generates a unique error ID for tracking and correlation
 * @returns Unique error identifier
 */
function generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
function errorHandler(err, req, res, _next) {
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
    }
    else if (err instanceof zod_1.ZodError) {
        statusCode = 400;
    }
    else if (err instanceof circuitBreaker_1.RetryExhaustedError) {
        statusCode = 503;
    }
    else if (typeof err.status === 'number') {
        statusCode = err.status;
    }
    else if (typeof err.statusCode === 'number') {
        statusCode = err.statusCode;
    }
    // Handle Zod validation errors with enhanced details
    if (err instanceof zod_1.ZodError) {
        const validationErrors = err.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
            code: e.code,
            received: e.received
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
    if (err instanceof circuitBreaker_1.RetryExhaustedError) {
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
    const logPayload = {
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
    }
    else {
        logger.warn('Request error', logPayload);
    }
    // Minimal user-facing message
    const defaultMessages = {
        400: 'Invalid request',
        401: 'Authentication failed',
        403: 'Access denied',
        404: 'Not found',
        429: 'Too many requests',
        503: 'Service temporarily unavailable. Please try again.',
        500: 'Internal server error',
    };
    const response = {
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
const errorLoggingMiddleware = (error, req, res, next) => {
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
exports.errorLoggingMiddleware = errorLoggingMiddleware;
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
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errors.js.map