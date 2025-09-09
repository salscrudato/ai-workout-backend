import pino from 'pino';

/**
 * Error Classification & Metrics (Disabled Minimal Stub)
 *
 * Classification and custom metrics are disabled to keep the runtime lean.
 * This stub preserves the public API to avoid broad refactors while relying
 * on simpler error handling and standard logging elsewhere.
 */

const logger = pino({
  name: 'error-classification',
  level: process.env['NODE_ENV'] === 'development' ? 'debug' : 'info'
});

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  SYSTEM = 'SYSTEM',
  SECURITY = 'SECURITY',
  RATE_LIMIT = 'RATE_LIMIT',
  UNKNOWN = 'UNKNOWN'
}

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

export class ErrorClassifier {
  /**
   * Return a generic, user-safe classification. Callers should prefer
   * simple status-based handling in the error middleware.
   */
  static classify(error: Error, _context?: { operation?: string; userId?: string }): ErrorClassification {
    const technical = error?.message || 'Error';
    return {
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      isRetryable: false,
      isUserError: false,
      requiresAlert: false,
      userMessage: 'An error occurred. Please try again.',
      technicalMessage: technical,
      errorCode: 'UNKNOWN_ERROR'
    };
  }

  static shouldAlert(_classification: ErrorClassification): boolean {
    return false;
  }

  static getUserMessage(classification: ErrorClassification): string {
    return classification.userMessage;
  }

  static getTechnicalDetails(error: Error, classification: ErrorClassification): object {
    return {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
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

export class ErrorMetrics {
  private static errorCounts: Map<string, number> = new Map();
  private static lastReset: Date = new Date();

  static record(_classification: ErrorClassification, _context?: { userId?: string; operation?: string }): void {
    // no-op while disabled
  }

  static getMetrics(): { errorCounts: Record<string, number>; lastReset: Date } {
    const errorCounts: Record<string, number> = {};
    return { errorCounts, lastReset: this.lastReset };
  }

  static reset(): void {
    this.errorCounts.clear();
    this.lastReset = new Date();
    logger.info('Error metrics reset (no-op)');
  }
}
