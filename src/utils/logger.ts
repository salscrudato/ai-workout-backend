import pino from 'pino';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Extend Express Request interface to include correlation ID and logger
declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
      startTime?: number;
      log?: pino.Logger;
    }
    interface Response {
      responseTime?: number;
    }
  }
}

/**
 * Logger configuration based on environment
 */
const createLogger = (name?: string) => {
  const isDevelopment = process.env['NODE_ENV'] === 'development';
  
  return pino({
    name: name || 'ai-workout-backend',
    level: isDevelopment ? 'debug' : 'info',
    ...(isDevelopment && {
      transport: {
        target: 'pino-pretty',
        options: {
          singleLine: true,
          colorize: true,
          translateTime: 'HH:MM:ss.l',
          ignore: 'pid,hostname'
        }
      }
    }),
    formatters: {
      level: (label) => ({ level: label }),
      log: (object: any) => {
        // Add correlation ID to all log entries if available
        const correlationId = object['correlationId'] || object['req']?.correlationId;
        if (correlationId) {
          return { ...object, correlationId };
        }
        return object;
      }
    },
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        correlationId: req.correlationId,
        userAgent: req.headers?.['user-agent'],
        ip: req.ip || req.connection?.remoteAddress
      }),
      res: (res) => ({
        statusCode: res.statusCode,
        responseTime: res.responseTime
      }),
      err: pino.stdSerializers.err
    }
  });
};

/**
 * Main application logger
 */
export const logger = createLogger();

/**
 * Create a child logger with specific context
 */
export const createChildLogger = (context: Record<string, any>, name?: string) => {
  const baseLogger = name ? createLogger(name) : logger;
  return baseLogger.child(context);
};

/**
 * Middleware to add correlation ID to requests and responses
 */
export const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Generate or extract correlation ID
  const correlationId = req.headers['x-correlation-id'] as string || 
                       req.headers['x-request-id'] as string || 
                       uuidv4();

  // Add to request
  req.correlationId = correlationId;
  req.startTime = Date.now();

  // Add to response headers
  res.setHeader('X-Correlation-ID', correlationId);

  // Create request-scoped logger
  req.log = logger.child({ correlationId });

  next();
};

/**
 * Request logging middleware with performance tracking
 */
export const requestLoggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = req.startTime || Date.now();
  const requestLogger = req.log || logger.child({ correlationId: req.correlationId });

  // Log incoming request
  requestLogger.info({
    req,
    msg: 'Incoming request'
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any, cb?: any) {
    const responseTime = Date.now() - startTime;
    res.responseTime = responseTime;

    // Log response
    requestLogger.info({
      res,
      responseTime,
      msg: 'Request completed'
    });

    // Call original end method
    return originalEnd.call(this, chunk, encoding, cb);
  };

  next();
};

/**
 * Error logging middleware
 */
export const errorLoggingMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestLogger = req.log || logger.child({ correlationId: req.correlationId });
  const responseTime = req.startTime ? Date.now() - req.startTime : undefined;

  requestLogger.error({
    err: error,
    req,
    responseTime,
    msg: 'Request failed with error'
  });

  next(error);
};

/**
 * Performance monitoring logger
 */
export class PerformanceLogger {
  private static instance: PerformanceLogger;
  private logger: pino.Logger;
  private metrics: Map<string, number[]> = new Map();

  private constructor() {
    this.logger = createLogger('performance');
  }

  static getInstance(): PerformanceLogger {
    if (!PerformanceLogger.instance) {
      PerformanceLogger.instance = new PerformanceLogger();
    }
    return PerformanceLogger.instance;
  }

  /**
   * Log performance metric
   */
  logMetric(name: string, value: number, context?: Record<string, any>): void {
    // Store metric for aggregation
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);

    // Log individual metric
    this.logger.debug({
      metric: name,
      value,
      ...context,
      msg: 'Performance metric recorded'
    });
  }

  /**
   * Log aggregated metrics
   */
  logAggregatedMetrics(): void {
    const aggregated: Record<string, any> = {};

    for (const [name, values] of this.metrics) {
      if (values.length === 0) continue;

      const sorted = values.sort((a, b) => a - b);
      aggregated[name] = {
        count: values.length,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        avg: values.reduce((sum, val) => sum + val, 0) / values.length,
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)]
      };
    }

    this.logger.info({
      metrics: aggregated,
      msg: 'Aggregated performance metrics'
    });

    // Clear metrics after logging
    this.metrics.clear();
  }

  /**
   * Start periodic metric aggregation
   */
  startPeriodicAggregation(intervalMs: number = 60000): void {
    setInterval(() => {
      this.logAggregatedMetrics();
    }, intervalMs);

    this.logger.info({
      intervalMs,
      msg: 'Started periodic metric aggregation'
    });
  }
}

/**
 * Structured logging utilities
 */
export class StructuredLogger {
  private logger: pino.Logger;

  constructor(context: Record<string, any> = {}) {
    this.logger = logger.child(context);
  }

  /**
   * Log business event
   */
  logBusinessEvent(event: string, data: Record<string, any> = {}): void {
    this.logger.info({
      eventType: 'business',
      event,
      ...data,
      msg: `Business event: ${event}`
    });
  }

  /**
   * Log security event
   */
  logSecurityEvent(event: string, data: Record<string, any> = {}): void {
    this.logger.warn({
      eventType: 'security',
      event,
      ...data,
      msg: `Security event: ${event}`
    });
  }

  /**
   * Log audit event
   */
  logAuditEvent(event: string, userId?: string, data: Record<string, any> = {}): void {
    this.logger.info({
      eventType: 'audit',
      event,
      userId,
      ...data,
      msg: `Audit event: ${event}`
    });
  }

  /**
   * Log external service call
   */
  logExternalServiceCall(
    service: string,
    operation: string,
    duration: number,
    success: boolean,
    data: Record<string, any> = {}
  ): void {
    this.logger.info({
      eventType: 'external_service',
      service,
      operation,
      duration,
      success,
      ...data,
      msg: `External service call: ${service}.${operation}`
    });
  }

  /**
   * Log database operation
   */
  logDatabaseOperation(
    operation: string,
    collection: string,
    duration: number,
    recordCount?: number,
    data: Record<string, any> = {}
  ): void {
    this.logger.debug({
      eventType: 'database',
      operation,
      collection,
      duration,
      recordCount,
      ...data,
      msg: `Database operation: ${operation} on ${collection}`
    });
  }
}

// Export singleton instances
export const performanceLogger = PerformanceLogger.getInstance();
export const structuredLogger = new StructuredLogger();

// Start periodic metric aggregation
performanceLogger.startPeriodicAggregation();

/**
 * Utility function to measure execution time
 */
export const measureExecutionTime = async <T>(
  operation: string,
  fn: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> => {
  const startTime = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    
    performanceLogger.logMetric(`${operation}_duration`, duration, {
      ...context,
      success: true
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    performanceLogger.logMetric(`${operation}_duration`, duration, {
      ...context,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    throw error;
  }
};
