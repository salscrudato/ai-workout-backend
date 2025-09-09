"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorLoggingMiddleware = exports.AppError = void 0;
exports.errorHandler = errorHandler;
const tslib_1 = require("tslib");
const zod_1 = require("zod");
const pino_1 = tslib_1.__importDefault(require("pino"));
const circuitBreaker_1 = require("../utils/circuitBreaker");
const baseLogger = (0, pino_1.default)({
    name: 'error-handler',
    level: process.env['NODE_ENV'] === 'development' ? 'debug' : 'info',
});
const logger = {
    info: (msg, obj) => baseLogger.info(obj || {}, msg),
    error: (msg, obj) => baseLogger.error(obj || {}, msg),
    warn: (msg, obj) => baseLogger.warn(obj || {}, msg),
    debug: (msg, obj) => baseLogger.debug(obj || {}, msg),
};
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
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
function generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
function errorHandler(err, req, res, _next) {
    const errorId = generateErrorId();
    const userId = req.user?.uid || 'anonymous';
    const context = {
        operation: `${req.method} ${req.path}`,
        userId,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        timestamp: new Date().toISOString(),
    };
    const isDev = process.env['NODE_ENV'] === 'development';
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
    if (err instanceof zod_1.ZodError) {
        const validationErrors = err.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
            code: e.code,
            received: e.received
        }));
        logger.warn('Validation error', {
            errorId,
            ...context,
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
            retryAfter: 60
        });
        return;
    }
    const isServerError = statusCode >= 500;
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
const errorLoggingMiddleware = (error, req, _res, next) => {
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
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errors.js.map