"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorLoggingMiddleware = exports.AppError = void 0;
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const pino_1 = __importDefault(require("pino"));
const errorClassification_1 = require("../utils/errorClassification");
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
/**
 * Enhanced error handler middleware with intelligent error classification and structured responses
 *
 * Features:
 * - Automatic error classification and severity assessment
 * - User-friendly error messages with technical details for debugging
 * - Error metrics collection for monitoring and alerting
 * - Structured logging with correlation IDs
 * - Security-aware error exposure (no sensitive data in production)
 *
 * @param err - Error object
 * @param req - Express request object
 * @param res - Express response object
 * @param _next - Express next function (unused)
 */
function errorHandler(err, req, res, _next) {
    const errorId = generateErrorId();
    const userId = req.user?.uid || 'anonymous';
    const context = {
        operation: `${req.method} ${req.path}`,
        userId
    };
    // Classify the error for appropriate handling
    const classification = errorClassification_1.ErrorClassifier.classify(err, context);
    // Record error metrics
    errorClassification_1.ErrorMetrics.record(classification, context);
    // Determine HTTP status code
    let statusCode = 500;
    if (err instanceof AppError) {
        statusCode = err.statusCode;
    }
    else if (err instanceof zod_1.ZodError) {
        statusCode = 400;
    }
    else if (err instanceof circuitBreaker_1.RetryExhaustedError) {
        statusCode = 503; // Service Unavailable
    }
    else if (err.status || err.statusCode) {
        statusCode = err.status || err.statusCode;
    }
    else {
        // Determine status based on classification
        switch (classification.category) {
            case 'VALIDATION':
            case 'AUTHENTICATION':
                statusCode = classification.category === 'VALIDATION' ? 400 : 401;
                break;
            case 'RATE_LIMIT':
                statusCode = 429;
                break;
            case 'EXTERNAL_SERVICE':
            case 'DATABASE':
            case 'NETWORK':
                statusCode = 503;
                break;
            default:
                statusCode = 500;
        }
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
            classification
        });
        res.status(400).json({
            error: classification.userMessage,
            code: classification.errorCode,
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
            classification
        });
        res.status(err.statusCode).json({
            error: classification.userMessage || err.message,
            code: err.code,
            errorId,
            timestamp: err.timestamp,
            ...(classification.suggestedAction && { suggestedAction: classification.suggestedAction })
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
            classification
        });
        res.status(503).json({
            error: classification.userMessage,
            code: classification.errorCode,
            errorId,
            timestamp: new Date().toISOString(),
            retryAfter: 60 // Suggest retry after 60 seconds
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
            value: err.keyValue?.[field],
            classification
        });
        res.status(409).json({
            error: `${field} already exists`,
            code: 'DUPLICATE_KEY_ERROR',
            field,
            errorId,
            timestamp: new Date().toISOString()
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
            value: err.value,
            classification
        });
        res.status(400).json({
            error: 'Invalid ID format',
            code: 'INVALID_ID_FORMAT',
            field: err.path,
            errorId,
            timestamp: new Date().toISOString()
        });
        return;
    }
    // Handle generic errors with intelligent classification
    const isServerError = statusCode >= 500;
    const technicalDetails = errorClassification_1.ErrorClassifier.getTechnicalDetails(err, classification);
    // Log with appropriate level based on severity
    const logLevel = classification.severity === errorClassification_1.ErrorSeverity.CRITICAL ? 'error' :
        classification.severity === errorClassification_1.ErrorSeverity.HIGH ? 'error' :
            classification.severity === errorClassification_1.ErrorSeverity.MEDIUM ? 'warn' : 'info';
    logger[logLevel]('Request error', {
        errorId,
        userId,
        url: req.url,
        method: req.method,
        statusCode,
        classification,
        technicalDetails,
        ...(isServerError && {
            body: req.body,
            params: req.params,
            query: req.query,
            headers: req.headers
        })
    });
    // Prepare user-friendly response
    const response = {
        error: process.env.NODE_ENV === 'production' && isServerError
            ? classification.userMessage
            : classification.userMessage || err.message || 'An error occurred',
        code: classification.errorCode,
        errorId,
        timestamp: new Date().toISOString()
    };
    // Add helpful information for retryable errors
    if (classification.isRetryable) {
        response.retryable = true;
        response.retryAfter = statusCode === 429 ? 60 : 30; // Seconds
    }
    // Add suggested action if available
    if (classification.suggestedAction) {
        response.suggestedAction = classification.suggestedAction;
    }
    // Add technical details in development
    if (process.env.NODE_ENV === 'development') {
        response.technical = {
            message: err.message,
            stack: err.stack,
            classification: {
                category: classification.category,
                severity: classification.severity,
                isRetryable: classification.isRetryable
            }
        };
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
 * ```
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errors.js.map