import pino from 'pino';

const logger = pino({
  name: 'error-classification',
  level: process.env['NODE_ENV'] === 'development' ? 'debug' : 'info'
});

/**
 * Error severity levels for proper handling and alerting
 */
export enum ErrorSeverity {
  LOW = 'LOW',           // Expected errors, user input issues
  MEDIUM = 'MEDIUM',     // Service degradation, retryable failures
  HIGH = 'HIGH',         // Service outages, data corruption
  CRITICAL = 'CRITICAL'  // System-wide failures, security breaches
}

/**
 * Error categories for better organization and handling
 */
export enum ErrorCategory {
  VALIDATION = 'VALIDATION',           // Input validation errors
  AUTHENTICATION = 'AUTHENTICATION',   // Auth/authorization errors
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',   // Domain-specific errors
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE', // Third-party service errors
  DATABASE = 'DATABASE',               // Database connection/query errors
  NETWORK = 'NETWORK',                 // Network connectivity errors
  SYSTEM = 'SYSTEM',                   // System resource errors
  SECURITY = 'SECURITY',               // Security-related errors
  RATE_LIMIT = 'RATE_LIMIT',          // Rate limiting errors
  UNKNOWN = 'UNKNOWN'                  // Unclassified errors
}

/**
 * Structured error information for better handling
 */
export interface ErrorClassification {
  category: ErrorCategory;
  severity: ErrorSeverity;
  isRetryable: boolean;
  isUserError: boolean;
  requiresAlert: boolean;
  userMessage: string;
  technicalMessage: string;
  suggestedAction?: string;
  errorCode: string;
}

/**
 * Enhanced error classifier that categorizes errors for appropriate handling
 */
export class ErrorClassifier {
  private static readonly ERROR_PATTERNS: Array<{
    pattern: RegExp | string;
    classification: Partial<ErrorClassification>;
  }> = [
    // Validation errors
    {
      pattern: /validation|invalid|required|missing/i,
      classification: {
        category: ErrorCategory.VALIDATION,
        severity: ErrorSeverity.LOW,
        isRetryable: false,
        isUserError: true,
        requiresAlert: false,
        userMessage: 'Please check your input and try again.',
        errorCode: 'VALIDATION_ERROR'
      }
    },
    // Authentication errors
    {
      pattern: /unauthorized|forbidden|token|auth/i,
      classification: {
        category: ErrorCategory.AUTHENTICATION,
        severity: ErrorSeverity.MEDIUM,
        isRetryable: false,
        isUserError: true,
        requiresAlert: false,
        userMessage: 'Authentication failed. Please log in again.',
        errorCode: 'AUTH_ERROR'
      }
    },
    // Rate limiting
    {
      pattern: /rate.?limit|too.?many.?requests/i,
      classification: {
        category: ErrorCategory.RATE_LIMIT,
        severity: ErrorSeverity.MEDIUM,
        isRetryable: true,
        isUserError: false,
        requiresAlert: true,
        userMessage: 'Service is busy. Please try again in a moment.',
        errorCode: 'RATE_LIMIT_ERROR'
      }
    },
    // Network errors
    {
      pattern: /network|connection|timeout|econnreset|enotfound/i,
      classification: {
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.HIGH,
        isRetryable: true,
        isUserError: false,
        requiresAlert: true,
        userMessage: 'Network error occurred. Please try again.',
        errorCode: 'NETWORK_ERROR'
      }
    },
    // Database errors
    {
      pattern: /database|firestore|mongodb|connection.?pool/i,
      classification: {
        category: ErrorCategory.DATABASE,
        severity: ErrorSeverity.HIGH,
        isRetryable: true,
        isUserError: false,
        requiresAlert: true,
        userMessage: 'Database error occurred. Please try again.',
        errorCode: 'DATABASE_ERROR'
      }
    },
    // External service errors (OpenAI, etc.)
    {
      pattern: /openai|external.?service|api.?error/i,
      classification: {
        category: ErrorCategory.EXTERNAL_SERVICE,
        severity: ErrorSeverity.HIGH,
        isRetryable: true,
        isUserError: false,
        requiresAlert: true,
        userMessage: 'AI service is temporarily unavailable. Please try again.',
        errorCode: 'EXTERNAL_SERVICE_ERROR'
      }
    },
    // Security errors
    {
      pattern: /security|malicious|injection|xss|csrf/i,
      classification: {
        category: ErrorCategory.SECURITY,
        severity: ErrorSeverity.CRITICAL,
        isRetryable: false,
        isUserError: false,
        requiresAlert: true,
        userMessage: 'Security error detected. Request blocked.',
        errorCode: 'SECURITY_ERROR'
      }
    },
    // System errors
    {
      pattern: /memory|disk|cpu|system|resource/i,
      classification: {
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.CRITICAL,
        isRetryable: false,
        isUserError: false,
        requiresAlert: true,
        userMessage: 'System error occurred. Please try again later.',
        errorCode: 'SYSTEM_ERROR'
      }
    }
  ];

  /**
   * Classify an error and return structured information
   */
  static classify(error: Error, context?: { operation?: string; userId?: string }): ErrorClassification {
    const errorMessage = error.message || '';
    const errorName = error.name || '';
    const errorStack = error.stack || '';
    
    // Check for specific error types first
    if (error.name === 'ValidationError' || error.name === 'ZodError') {
      return {
        category: ErrorCategory.VALIDATION,
        severity: ErrorSeverity.LOW,
        isRetryable: false,
        isUserError: true,
        requiresAlert: false,
        userMessage: 'Please check your input and try again.',
        technicalMessage: errorMessage,
        errorCode: 'VALIDATION_ERROR'
      };
    }

    // Check HTTP status codes if available
    if ('status' in error) {
      const status = (error as any).status;
      if (status >= 400 && status < 500) {
        return {
          category: ErrorCategory.VALIDATION,
          severity: ErrorSeverity.LOW,
          isRetryable: false,
          isUserError: true,
          requiresAlert: false,
          userMessage: 'Invalid request. Please check your input.',
          technicalMessage: errorMessage,
          errorCode: `HTTP_${status}`
        };
      } else if (status >= 500) {
        return {
          category: ErrorCategory.EXTERNAL_SERVICE,
          severity: ErrorSeverity.HIGH,
          isRetryable: true,
          isUserError: false,
          requiresAlert: true,
          userMessage: 'Service temporarily unavailable. Please try again.',
          technicalMessage: errorMessage,
          errorCode: `HTTP_${status}`
        };
      }
    }

    // Pattern matching
    for (const { pattern, classification } of this.ERROR_PATTERNS) {
      const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;
      
      if (regex.test(errorMessage) || regex.test(errorName) || regex.test(errorStack)) {
        const result: ErrorClassification = {
          category: classification.category || ErrorCategory.UNKNOWN,
          severity: classification.severity || ErrorSeverity.MEDIUM,
          isRetryable: classification.isRetryable ?? false,
          isUserError: classification.isUserError ?? false,
          requiresAlert: classification.requiresAlert ?? true,
          userMessage: classification.userMessage || 'An error occurred. Please try again.',
          technicalMessage: errorMessage,
          errorCode: classification.errorCode || 'UNKNOWN_ERROR',
          suggestedAction: classification.suggestedAction
        };

        logger.debug({
          pattern: pattern.toString(),
          classification: result,
          context
        }, 'Error classified');

        return result;
      }
    }

    // Default classification for unknown errors
    return {
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      isRetryable: false,
      isUserError: false,
      requiresAlert: true,
      userMessage: 'An unexpected error occurred. Please try again.',
      technicalMessage: errorMessage,
      errorCode: 'UNKNOWN_ERROR'
    };
  }

  /**
   * Determine if an error should trigger an alert
   */
  static shouldAlert(classification: ErrorClassification): boolean {
    return classification.requiresAlert || 
           classification.severity === ErrorSeverity.HIGH ||
           classification.severity === ErrorSeverity.CRITICAL;
  }

  /**
   * Get user-friendly error message
   */
  static getUserMessage(classification: ErrorClassification): string {
    return classification.userMessage;
  }

  /**
   * Get technical error details for logging
   */
  static getTechnicalDetails(error: Error, classification: ErrorClassification): object {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
      classification: {
        category: classification.category,
        severity: classification.severity,
        errorCode: classification.errorCode,
        isRetryable: classification.isRetryable,
        requiresAlert: classification.requiresAlert
      }
    };
  }
}

/**
 * Error metrics collector for monitoring and alerting
 */
export class ErrorMetrics {
  private static errorCounts: Map<string, number> = new Map();
  private static lastReset: Date = new Date();

  /**
   * Record an error occurrence
   */
  static record(classification: ErrorClassification, context?: { userId?: string; operation?: string }): void {
    const key = `${classification.category}:${classification.errorCode}`;
    const currentCount = this.errorCounts.get(key) || 0;
    this.errorCounts.set(key, currentCount + 1);

    logger.info({
      category: classification.category,
      errorCode: classification.errorCode,
      severity: classification.severity,
      count: currentCount + 1,
      context
    }, 'Error recorded');

    // Check for error rate thresholds
    this.checkThresholds(classification, currentCount + 1);
  }

  /**
   * Get current error metrics
   */
  static getMetrics(): { errorCounts: Record<string, number>; lastReset: Date } {
    const errorCounts: Record<string, number> = {};
    for (const [key, count] of this.errorCounts) {
      errorCounts[key] = count;
    }
    return { errorCounts, lastReset: this.lastReset };
  }

  /**
   * Reset error counters
   */
  static reset(): void {
    this.errorCounts.clear();
    this.lastReset = new Date();
    logger.info('Error metrics reset');
  }

  private static checkThresholds(classification: ErrorClassification, count: number): void {
    const thresholds = {
      [ErrorSeverity.CRITICAL]: 1,  // Alert immediately
      [ErrorSeverity.HIGH]: 5,      // Alert after 5 occurrences
      [ErrorSeverity.MEDIUM]: 20,   // Alert after 20 occurrences
      [ErrorSeverity.LOW]: 100      // Alert after 100 occurrences
    };

    const threshold = thresholds[classification.severity];
    if (count >= threshold && count % threshold === 0) {
      logger.error({
        category: classification.category,
        errorCode: classification.errorCode,
        severity: classification.severity,
        count,
        threshold
      }, 'Error threshold exceeded');
    }
  }
}
