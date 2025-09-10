import pino from 'pino';
import crypto from 'crypto';

const logger = pino({
  name: 'request-deduplication',
  level: process.env['NODE_ENV'] === 'development' ? 'debug' : 'info'
});

/**
 * Request status for tracking ongoing requests
 */
export enum RequestStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

/**
 * Pending request information
 */
export interface PendingRequest<T> {
  id: string;
  status: RequestStatus;
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  timestamp: number;
  timeout?: NodeJS.Timeout;
  subscribers: Array<{
    resolve: (value: T) => void;
    reject: (error: Error) => void;
  }>;
}

/**
 * Deduplication configuration
 */
export interface DeduplicationConfig {
  enabled: boolean;
  timeoutMs: number;
  maxPendingRequests: number;
  keyGenerator?: (params: any) => string;
  shouldDeduplicate?: (params: any) => boolean;
}

/**
 * Request deduplication metrics
 */
export interface DeduplicationMetrics {
  totalRequests: number;
  deduplicatedRequests: number;
  deduplicationRate: number;
  pendingRequests: number;
  timeouts: number;
  errors: number;
}

/**
 * Request deduplication service to prevent duplicate API calls
 * 
 * This service ensures that identical requests are not made simultaneously,
 * instead sharing the result of the first request with all subsequent identical requests.
 */
export class RequestDeduplicationService {
  private pendingRequests: Map<string, PendingRequest<any>> = new Map();
  private config: DeduplicationConfig;
  private metrics: DeduplicationMetrics;

  constructor(config: Partial<DeduplicationConfig> = {}) {
    this.config = {
      enabled: true,
      timeoutMs: 30000, // 30 seconds
      maxPendingRequests: 100,
      keyGenerator: this.defaultKeyGenerator,
      shouldDeduplicate: () => true,
      ...config
    };

    this.metrics = {
      totalRequests: 0,
      deduplicatedRequests: 0,
      deduplicationRate: 0,
      pendingRequests: 0,
      timeouts: 0,
      errors: 0
    };

    logger.info({
      enabled: this.config.enabled,
      timeoutMs: this.config.timeoutMs,
      maxPendingRequests: this.config.maxPendingRequests
    }, 'Request deduplication service initialized');
  }

  /**
   * Execute a function with request deduplication
   */
  async execute<T>(
    fn: () => Promise<T>,
    params: any = {},
    options: { key?: string; timeout?: number } = {}
  ): Promise<T> {
    this.metrics.totalRequests++;

    // Check if deduplication is enabled and should be applied
    if (!this.config.enabled || !this.config.shouldDeduplicate!(params)) {
      return await fn();
    }

    // Generate deduplication key
    const key = options.key || this.config.keyGenerator!(params);
    
    logger.debug({
      key,
      hasPending: this.pendingRequests.has(key)
    }, 'Request deduplication check');

    // Check if there's already a pending request for this key
    const existingRequest = this.pendingRequests.get(key);
    if (existingRequest && existingRequest.status === RequestStatus.PENDING) {
      this.metrics.deduplicatedRequests++;
      this.updateDeduplicationRate();

      logger.debug({ key }, 'Request deduplicated - joining existing request');
      
      // Return a promise that resolves/rejects with the existing request
      return new Promise<T>((resolve, reject) => {
        existingRequest.subscribers.push({ resolve, reject });
      });
    }

    // Check if we've exceeded the maximum number of pending requests
    if (this.pendingRequests.size >= this.config.maxPendingRequests) {
      const error = new Error('Maximum pending requests exceeded');
      this.metrics.errors++;
      logger.warn({
        current: this.pendingRequests.size,
        max: this.config.maxPendingRequests
      }, 'Maximum pending requests exceeded');
      throw error;
    }

    // Create new pending request
    const pendingRequest = this.createPendingRequest<T>(key, fn, options.timeout);
    this.pendingRequests.set(key, pendingRequest);
    this.metrics.pendingRequests = this.pendingRequests.size;

    logger.debug({
      key,
      pendingCount: this.pendingRequests.size
    }, 'New request created');

    return pendingRequest.promise;
  }

  /**
   * Cancel a pending request
   */
  cancel(key: string): boolean {
    const pendingRequest = this.pendingRequests.get(key);
    if (!pendingRequest || pendingRequest.status !== RequestStatus.PENDING) {
      return false;
    }

    pendingRequest.status = RequestStatus.CANCELLED;
    
    // Clear timeout if exists
    if (pendingRequest.timeout) {
      clearTimeout(pendingRequest.timeout);
    }

    // Reject all subscribers
    const error = new Error(`Request cancelled: ${key}`);
    pendingRequest.reject(error);
    pendingRequest.subscribers.forEach(subscriber => {
      subscriber.reject(error);
    });

    this.pendingRequests.delete(key);
    this.metrics.pendingRequests = this.pendingRequests.size;

    logger.debug({ key }, 'Request cancelled');
    return true;
  }

  /**
   * Cancel all pending requests
   */
  cancelAll(): number {
    const cancelledCount = this.pendingRequests.size;
    const error = new Error('All requests cancelled');

    for (const [_key, pendingRequest] of this.pendingRequests) {
      if (pendingRequest.status === RequestStatus.PENDING) {
        pendingRequest.status = RequestStatus.CANCELLED;
        
        if (pendingRequest.timeout) {
          clearTimeout(pendingRequest.timeout);
        }

        pendingRequest.reject(error);
        pendingRequest.subscribers.forEach(subscriber => {
          subscriber.reject(error);
        });
      }
    }

    this.pendingRequests.clear();
    this.metrics.pendingRequests = 0;

    logger.info({ count: cancelledCount }, 'All pending requests cancelled');
    return cancelledCount;
  }

  /**
   * Get current metrics
   */
  getMetrics(): DeduplicationMetrics {
    this.updateDeduplicationRate();
    return { ...this.metrics };
  }

  /**
   * Get pending request information
   */
  getPendingRequests(): Array<{
    key: string;
    status: RequestStatus;
    timestamp: number;
    subscriberCount: number;
  }> {
    return Array.from(this.pendingRequests.entries()).map(([key, request]) => ({
      key,
      status: request.status,
      timestamp: request.timestamp,
      subscriberCount: request.subscribers.length
    }));
  }

  /**
   * Clear completed and failed requests from memory
   */
  cleanup(): number {
    const initialSize = this.pendingRequests.size;
    const cutoffTime = Date.now() - (this.config.timeoutMs * 2); // Keep for 2x timeout period

    for (const [key, request] of this.pendingRequests) {
      if (
        (request.status === RequestStatus.COMPLETED || 
         request.status === RequestStatus.FAILED ||
         request.status === RequestStatus.CANCELLED) &&
        request.timestamp < cutoffTime
      ) {
        this.pendingRequests.delete(key);
      }
    }

    const cleanedCount = initialSize - this.pendingRequests.size;
    this.metrics.pendingRequests = this.pendingRequests.size;

    if (cleanedCount > 0) {
      logger.debug({ count: cleanedCount }, 'Cleaned up completed requests');
    }

    return cleanedCount;
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      deduplicatedRequests: 0,
      deduplicationRate: 0,
      pendingRequests: this.pendingRequests.size,
      timeouts: 0,
      errors: 0
    };

    logger.info('Metrics reset');
  }

  private createPendingRequest<T>(
    key: string,
    fn: () => Promise<T>,
    customTimeout?: number
  ): PendingRequest<T> {
    let resolve: (value: T) => void;
    let reject: (error: Error) => void;

    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    const pendingRequest: PendingRequest<T> = {
      id: key,
      status: RequestStatus.PENDING,
      promise,
      resolve: resolve!,
      reject: reject!,
      timestamp: Date.now(),
      subscribers: []
    };

    // Set up timeout
    const timeoutMs = customTimeout || this.config.timeoutMs;
    pendingRequest.timeout = setTimeout(() => {
      this.handleTimeout(key);
    }, timeoutMs);

    // Execute the function
    fn()
      .then((result) => {
        this.handleSuccess(key, result);
      })
      .catch((error) => {
        this.handleError(key, error);
      });

    return pendingRequest;
  }

  private handleSuccess<T>(key: string, result: T): void {
    const pendingRequest = this.pendingRequests.get(key);
    if (!pendingRequest || pendingRequest.status !== RequestStatus.PENDING) {
      return;
    }

    pendingRequest.status = RequestStatus.COMPLETED;
    
    // Clear timeout
    if (pendingRequest.timeout) {
      clearTimeout(pendingRequest.timeout);
    }

    // Resolve all subscribers
    pendingRequest.resolve(result);
    pendingRequest.subscribers.forEach(subscriber => {
      subscriber.resolve(result);
    });

    logger.debug({
      key,
      subscriberCount: pendingRequest.subscribers.length
    }, 'Request completed successfully');

    // Keep the request for a short time for potential cleanup
    setTimeout(() => {
      this.pendingRequests.delete(key);
      this.metrics.pendingRequests = this.pendingRequests.size;
    }, 5000); // 5 seconds
  }

  private handleError(key: string, error: Error): void {
    const pendingRequest = this.pendingRequests.get(key);
    if (!pendingRequest || pendingRequest.status !== RequestStatus.PENDING) {
      return;
    }

    pendingRequest.status = RequestStatus.FAILED;
    this.metrics.errors++;
    
    // Clear timeout
    if (pendingRequest.timeout) {
      clearTimeout(pendingRequest.timeout);
    }

    // Reject all subscribers
    pendingRequest.reject(error);
    pendingRequest.subscribers.forEach(subscriber => {
      subscriber.reject(error);
    });

    logger.debug({
      key,
      error: error.message,
      subscriberCount: pendingRequest.subscribers.length
    }, 'Request failed');

    // Keep the request for a short time for potential cleanup
    setTimeout(() => {
      this.pendingRequests.delete(key);
      this.metrics.pendingRequests = this.pendingRequests.size;
    }, 5000); // 5 seconds
  }

  private handleTimeout(key: string): void {
    const pendingRequest = this.pendingRequests.get(key);
    if (!pendingRequest || pendingRequest.status !== RequestStatus.PENDING) {
      return;
    }

    pendingRequest.status = RequestStatus.FAILED;
    this.metrics.timeouts++;
    this.metrics.errors++;

    const error = new Error(`Request timeout: ${key}`);
    
    // Reject all subscribers
    pendingRequest.reject(error);
    pendingRequest.subscribers.forEach(subscriber => {
      subscriber.reject(error);
    });

    logger.warn({
      key,
      timeout: this.config.timeoutMs,
      subscriberCount: pendingRequest.subscribers.length
    }, 'Request timed out');

    this.pendingRequests.delete(key);
    this.metrics.pendingRequests = this.pendingRequests.size;
  }

  private defaultKeyGenerator(params: any): string {
    // Create a hash of the parameters to use as the deduplication key
    const paramString = JSON.stringify(params, Object.keys(params).sort());
    return crypto.createHash('sha256').update(paramString).digest('hex');
  }

  private updateDeduplicationRate(): void {
    if (this.metrics.totalRequests > 0) {
      this.metrics.deduplicationRate = 
        (this.metrics.deduplicatedRequests / this.metrics.totalRequests) * 100;
    }
  }
}

/**
 * Global request deduplication service instance
 */
export const requestDeduplicationService = new RequestDeduplicationService({
  enabled: true,
  timeoutMs: 30000,
  maxPendingRequests: 100
});

/**
 * Decorator for automatic request deduplication
 */
export function deduplicate(options: { key?: string; timeout?: number } = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const key = options.key || `${target.constructor.name}.${propertyName}:${JSON.stringify(args)}`;
      
      return requestDeduplicationService.execute(
        () => method.apply(this, args),
        args,
        { key: key, timeout: options.timeout }
      );
    };

    return descriptor;
  };
}
