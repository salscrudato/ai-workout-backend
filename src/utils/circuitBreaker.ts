import pino from 'pino';

const baseLogger = pino({
  name: 'circuit-breaker',
  level: process.env['NODE_ENV'] === 'development' ? 'debug' : 'info'
});

// Create logger wrapper that accepts any parameters
const logger = {
  info: (msg: string, obj?: any) => baseLogger.info(obj || {}, msg),
  error: (msg: string, obj?: any) => baseLogger.error(obj || {}, msg),
  warn: (msg: string, obj?: any) => baseLogger.warn(obj || {}, msg),
  debug: (msg: string, obj?: any) => baseLogger.debug(obj || {}, msg),
};

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export interface CircuitBreakerOptions {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
  expectedErrors?: (error: Error) => boolean;
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  totalRequests: number;
  lastFailureTime?: Date;
  nextAttemptTime?: Date;
}

/**
 * Circuit Breaker implementation for external service calls
 * 
 * Prevents cascading failures by monitoring service health and
 * temporarily blocking requests when failure threshold is exceeded.
 */
export class CircuitBreaker<T = any> {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private totalRequests: number = 0;
  private lastFailureTime?: Date;
  private nextAttemptTime?: Date;
  private readonly options: CircuitBreakerOptions;
  private readonly serviceName: string;

  constructor(serviceName: string, options: Partial<CircuitBreakerOptions> = {}) {
    this.serviceName = serviceName;
    this.options = {
      failureThreshold: options.failureThreshold || 5,
      recoveryTimeout: options.recoveryTimeout || 60000, // 1 minute
      monitoringPeriod: options.monitoringPeriod || 300000, // 5 minutes
      expectedErrors: options.expectedErrors || (() => true)
    };

    logger.info('Circuit breaker initialized', {
      serviceName: this.serviceName,
      options: this.options
    });
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<R>(fn: () => Promise<R>): Promise<R> {
    const requestId = this.generateRequestId();
    this.totalRequests++;

    logger.debug('Circuit breaker execution requested', {
      serviceName: this.serviceName,
      requestId,
      state: this.state,
      failureCount: this.failureCount
    });

    // Check if circuit is open
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        logger.info('Circuit breaker transitioning to HALF_OPEN', {
          serviceName: this.serviceName,
          requestId
        });
      } else {
        const error = new CircuitBreakerError(
          `Circuit breaker is OPEN for service: ${this.serviceName}`,
          'CIRCUIT_OPEN'
        );
        logger.warn('Circuit breaker rejected request', {
          serviceName: this.serviceName,
          requestId,
          nextAttemptTime: this.nextAttemptTime
        });
        throw error;
      }
    }

    try {
      const startTime = Date.now();
      const result = await fn();
      const responseTime = Date.now() - startTime;

      this.onSuccess(requestId, responseTime);
      return result;
    } catch (error) {
      this.onFailure(error as Error, requestId);
      throw error;
    }
  }

  /**
   * Get current circuit breaker statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      totalRequests: this.totalRequests,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime
    };
  }

  /**
   * Reset circuit breaker to closed state
   */
  reset(): void {
    logger.info('Circuit breaker manually reset', {
      serviceName: this.serviceName,
      previousState: this.state
    });

    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = undefined;
    this.nextAttemptTime = undefined;
  }

  private onSuccess(requestId: string, responseTime: number): void {
    this.successCount++;

    logger.debug('Circuit breaker request succeeded', {
      serviceName: this.serviceName,
      requestId,
      responseTime,
      state: this.state
    });

    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.CLOSED;
      this.failureCount = 0;
      this.lastFailureTime = undefined;
      this.nextAttemptTime = undefined;

      logger.info('Circuit breaker reset to CLOSED after successful request', {
        serviceName: this.serviceName,
        requestId
      });
    }
  }

  private onFailure(error: Error, requestId: string): void {
    // Check if this is an expected error that should trigger circuit breaker
    if (!this.options.expectedErrors!(error)) {
      logger.debug('Circuit breaker ignoring expected error', {
        serviceName: this.serviceName,
        requestId,
        error: error.message
      });
      return;
    }

    this.failureCount++;
    this.lastFailureTime = new Date();

    logger.warn('Circuit breaker request failed', {
      serviceName: this.serviceName,
      requestId,
      error: error.message,
      failureCount: this.failureCount,
      threshold: this.options.failureThreshold
    });

    if (this.failureCount >= this.options.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = new Date(Date.now() + this.options.recoveryTimeout);

      logger.error('Circuit breaker opened due to failure threshold', {
        serviceName: this.serviceName,
        requestId,
        failureCount: this.failureCount,
        threshold: this.options.failureThreshold,
        nextAttemptTime: this.nextAttemptTime
      });
    }
  }

  private shouldAttemptReset(): boolean {
    return this.nextAttemptTime ? Date.now() >= this.nextAttemptTime.getTime() : false;
  }

  private generateRequestId(): string {
    return `${this.serviceName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Custom error class for circuit breaker failures
 */
export class CircuitBreakerError extends Error {
  public readonly code: string;
  public readonly timestamp: string;

  constructor(message: string, code: string = 'CIRCUIT_BREAKER_ERROR') {
    super(message);
    this.name = 'CircuitBreakerError';
    this.code = code;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Circuit breaker registry for managing multiple service circuit breakers
 */
export class CircuitBreakerRegistry {
  private static instance: CircuitBreakerRegistry;
  private breakers: Map<string, CircuitBreaker> = new Map();

  private constructor() {}

  static getInstance(): CircuitBreakerRegistry {
    if (!CircuitBreakerRegistry.instance) {
      CircuitBreakerRegistry.instance = new CircuitBreakerRegistry();
    }
    return CircuitBreakerRegistry.instance;
  }

  /**
   * Get or create a circuit breaker for a service
   */
  getBreaker(serviceName: string, options?: Partial<CircuitBreakerOptions>): CircuitBreaker {
    if (!this.breakers.has(serviceName)) {
      this.breakers.set(serviceName, new CircuitBreaker(serviceName, options));
    }
    return this.breakers.get(serviceName)!;
  }

  /**
   * Get statistics for all circuit breakers
   */
  getAllStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {};
    for (const [serviceName, breaker] of this.breakers) {
      stats[serviceName] = breaker.getStats();
    }
    return stats;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
    logger.info('All circuit breakers reset');
  }
}

// Export singleton instance
export const circuitBreakerRegistry = CircuitBreakerRegistry.getInstance();
