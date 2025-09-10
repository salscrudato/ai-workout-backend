import pino from 'pino';

/**
 * Circuit Breaker & Retry Utilities (Lean Version)
 *
 * In serverless environments, a full circuit breaker often adds overhead
 * without strong benefits. We keep a robust retry manager and expose a
 * no-op circuit breaker/registry to preserve API compatibility while
 * minimizing runtime cost.
 */

const baseLogger = pino({
  name: 'circuit-utils',
  level: process.env['NODE_ENV'] === 'development' ? 'debug' : 'info'
});

const logger = {
  info: (msg: string, obj?: any) => baseLogger.info(obj || {}, msg),
  error: (msg: string, obj?: any) => baseLogger.error(obj || {}, msg),
  warn: (msg: string, obj?: any) => baseLogger.warn(obj || {}, msg),
  debug: (msg: string, obj?: any) => baseLogger.debug(obj || {}, msg)
};

/** Retry configuration */
export interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
  retryCondition?: (error: Error) => boolean;
}

/** Enhanced retry with exponential backoff & jitter */
export class RetryManager {
  private readonly options: RetryOptions;

  constructor(options: Partial<RetryOptions> = {}) {
    this.options = {
      maxAttempts: options.maxAttempts || 3,
      baseDelay: options.baseDelay || 1000,
      maxDelay: options.maxDelay || 30000,
      backoffMultiplier: options.backoffMultiplier || 2,
      jitter: options.jitter !== false,
      retryCondition: options.retryCondition || this.defaultRetryCondition
    };
  }

  async execute<T>(fn: () => Promise<T>, context: { serviceName: string; operation: string }): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.options.maxAttempts; attempt++) {
      try {
        const result = await fn();
        if (attempt > 1) {
          logger.info('Retry succeeded', { ...context, attempt, totalAttempts: this.options.maxAttempts });
        }
        return result;
      } catch (error) {
        lastError = error as Error;
        logger.warn('Retry attempt failed', { ...context, attempt, totalAttempts: this.options.maxAttempts, error: lastError.message });

        if (!this.options.retryCondition!(lastError)) {
          logger.debug('Error not retryable, failing immediately', { ...context, error: lastError.message });
          throw lastError;
        }

        if (attempt < this.options.maxAttempts) {
          const delay = this.calculateDelay(attempt);
          logger.debug('Waiting before retry', { ...context, attempt, delay });
          await this.sleep(delay);
        }
      }
    }

    logger.error('All retry attempts exhausted', { ...context, totalAttempts: this.options.maxAttempts, finalError: lastError!.message });
    throw new RetryExhaustedError(`Failed after ${this.options.maxAttempts} attempts: ${lastError!.message}`, lastError!, this.options.maxAttempts);
  }

  private defaultRetryCondition(error: Error): boolean {
    const retryableCodes = ['ECONNRESET', 'ECONNABORTED', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN'];
    if ('code' in error && retryableCodes.includes((error as any).code)) return true;
    if ('status' in error) {
      const status = (error as any).status;
      return status >= 500 || status === 429;
    }
    const msg = (error.message || '').toLowerCase();
    return msg.includes('timeout') || msg.includes('network') || msg.includes('connection');
  }

  private calculateDelay(attempt: number): number {
    let delay = this.options.baseDelay * Math.pow(this.options.backoffMultiplier, attempt - 1);
    delay = Math.min(delay, this.options.maxDelay);
    if (this.options.jitter) delay = delay * (0.5 + Math.random() * 0.5);
    return Math.floor(delay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/** Custom error for retry exhaustion */
export class RetryExhaustedError extends Error {
  public readonly originalError: Error;
  public readonly attempts: number;
  public readonly code: string = 'RETRY_EXHAUSTED';

  constructor(message: string, originalError: Error, attempts: number) {
    super(message);
    this.name = 'RetryExhaustedError';
    this.originalError = originalError;
    this.attempts = attempts;
    Error.captureStackTrace(this, this.constructor);
  }
}

/** No-op Circuit Breaker types for API compatibility */
export enum CircuitState { CLOSED = 'CLOSED', OPEN = 'OPEN', HALF_OPEN = 'HALF_OPEN' }
export interface CircuitBreakerOptions { failureThreshold: number; recoveryTimeout: number; monitoringPeriod: number; expectedErrors?: (error: Error) => boolean; }
export interface CircuitBreakerStats { state: CircuitState; failureCount: number; successCount: number; totalRequests: number; lastFailureTime?: Date; nextAttemptTime?: Date; }

export class CircuitBreaker {
  constructor(_serviceName: string, _options: Partial<CircuitBreakerOptions> = {}) {}
  async execute<R>(fn: () => Promise<R>): Promise<R> { return await fn(); }
  getStats(): CircuitBreakerStats { return { state: CircuitState.CLOSED, failureCount: 0, successCount: 0, totalRequests: 0 }; }
  reset(): void { /* no-op */ }
}

export class CircuitBreakerRegistry {
  private static instance: CircuitBreakerRegistry;
  private breakers: Map<string, CircuitBreaker> = new Map();
  private constructor() {}
  static getInstance(): CircuitBreakerRegistry { if (!CircuitBreakerRegistry.instance) { CircuitBreakerRegistry.instance = new CircuitBreakerRegistry(); } return CircuitBreakerRegistry.instance; }
  getBreaker(serviceName: string, _options?: Partial<CircuitBreakerOptions>): CircuitBreaker {
    if (!this.breakers.has(serviceName)) this.breakers.set(serviceName, new CircuitBreaker(serviceName, _options));
    return this.breakers.get(serviceName)!;
  }
  getAllStats(): Record<string, CircuitBreakerStats> { const stats: Record<string, CircuitBreakerStats> = {}; for (const [name, breaker] of this.breakers) { stats[name] = breaker.getStats(); } return stats; }
  resetAll(): void { this.breakers.clear(); logger.info('All circuit breakers reset (no-op)'); }
}

export const circuitBreakerRegistry = CircuitBreakerRegistry.getInstance();
