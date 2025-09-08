import pino from 'pino';
import { circuitBreakerRegistry } from '../utils/circuitBreaker';

const logger = pino({
  name: 'graceful-degradation',
  level: process.env['NODE_ENV'] === 'development' ? 'debug' : 'info'
});

/**
 * Service health status
 */
export enum ServiceHealth {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  UNHEALTHY = 'UNHEALTHY'
}

/**
 * Fallback strategy types
 */
export enum FallbackStrategy {
  CACHED_RESPONSE = 'CACHED_RESPONSE',
  SIMPLIFIED_RESPONSE = 'SIMPLIFIED_RESPONSE',
  DEFAULT_RESPONSE = 'DEFAULT_RESPONSE',
  QUEUE_REQUEST = 'QUEUE_REQUEST',
  FAIL_FAST = 'FAIL_FAST'
}

/**
 * Service configuration for graceful degradation
 */
export interface ServiceConfig {
  name: string;
  healthCheckUrl?: string;
  fallbackStrategy: FallbackStrategy;
  fallbackData?: any;
  maxQueueSize?: number;
  healthCheckInterval?: number;
}

/**
 * Graceful degradation manager that handles service outages intelligently
 */
export class GracefulDegradationManager {
  private serviceHealth: Map<string, ServiceHealth> = new Map();
  private fallbackCache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private requestQueue: Map<string, Array<{ request: any; resolve: Function; reject: Function }>> = new Map();
  private healthCheckIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(private services: ServiceConfig[]) {
    this.initializeServices();
  }

  /**
   * Initialize all services and start health monitoring
   */
  private initializeServices(): void {
    for (const service of this.services) {
      this.serviceHealth.set(service.name, ServiceHealth.HEALTHY);
      this.requestQueue.set(service.name, []);
      
      if (service.healthCheckUrl && service.healthCheckInterval) {
        this.startHealthCheck(service);
      }

      logger.info({
        serviceName: service.name,
        fallbackStrategy: service.fallbackStrategy
      }, 'Service initialized for graceful degradation');
    }
  }

  /**
   * Execute a service call with graceful degradation
   */
  async executeWithDegradation<T>(
    serviceName: string,
    operation: () => Promise<T>,
    context?: { cacheKey?: string; fallbackData?: any }
  ): Promise<T> {
    const service = this.getServiceConfig(serviceName);
    const health = this.serviceHealth.get(serviceName) || ServiceHealth.HEALTHY;

    logger.debug({
      serviceName,
      health,
      fallbackStrategy: service.fallbackStrategy
    }, 'Executing service call with degradation');

    // If service is healthy, try normal execution
    if (health === ServiceHealth.HEALTHY) {
      try {
        const result = await operation();
        
        // Cache successful responses for future fallback
        if (context?.cacheKey) {
          this.cacheFallbackData(serviceName, context.cacheKey, result);
        }
        
        return result;
      } catch (error) {
        logger.warn({
          serviceName,
          error: (error as Error).message
        }, 'Service call failed, checking for degradation');
        
        // Mark service as degraded and apply fallback
        this.updateServiceHealth(serviceName, ServiceHealth.DEGRADED);
        return this.applyFallbackStrategy(service, context, error as Error);
      }
    }

    // Service is degraded or unhealthy, apply fallback immediately
    return this.applyFallbackStrategy(service, context, new Error(`Service ${serviceName} is ${health}`));
  }

  /**
   * Apply the configured fallback strategy
   */
  private async applyFallbackStrategy<T>(
    service: ServiceConfig,
    context?: { cacheKey?: string; fallbackData?: any },
    error?: Error
  ): Promise<T> {
    logger.info({
      serviceName: service.name,
      strategy: service.fallbackStrategy,
      error: error?.message
    }, 'Applying fallback strategy');

    switch (service.fallbackStrategy) {
      case FallbackStrategy.CACHED_RESPONSE:
        return this.getCachedResponse(service.name, context?.cacheKey);

      case FallbackStrategy.SIMPLIFIED_RESPONSE:
        return this.getSimplifiedResponse(service.name, context?.fallbackData);

      case FallbackStrategy.DEFAULT_RESPONSE:
        return this.getDefaultResponse(service.name, service.fallbackData);

      case FallbackStrategy.QUEUE_REQUEST:
        return this.queueRequest(service, context);

      case FallbackStrategy.FAIL_FAST:
      default:
        throw new GracefulDegradationError(
          `Service ${service.name} is unavailable`,
          'SERVICE_UNAVAILABLE',
          service.name
        );
    }
  }

  /**
   * Get cached response as fallback
   */
  private getCachedResponse<T>(serviceName: string, cacheKey?: string): T {
    if (!cacheKey) {
      throw new GracefulDegradationError(
        'No cache key provided for cached response fallback',
        'NO_CACHE_KEY',
        serviceName
      );
    }

    const cached = this.fallbackCache.get(`${serviceName}:${cacheKey}`);
    if (!cached || Date.now() - cached.timestamp > cached.ttl) {
      throw new GracefulDegradationError(
        'No valid cached response available',
        'NO_CACHED_RESPONSE',
        serviceName
      );
    }

    logger.info({
      serviceName,
      cacheKey,
      age: Date.now() - cached.timestamp
    }, 'Using cached response as fallback');

    return cached.data;
  }

  /**
   * Get simplified response for degraded service
   */
  private getSimplifiedResponse<T>(serviceName: string, fallbackData?: any): T {
    if (!fallbackData) {
      throw new GracefulDegradationError(
        'No fallback data provided for simplified response',
        'NO_FALLBACK_DATA',
        serviceName
      );
    }

    logger.info({ serviceName }, 'Using simplified response as fallback');
    return fallbackData;
  }

  /**
   * Get default response from service configuration
   */
  private getDefaultResponse<T>(serviceName: string, defaultData?: any): T {
    if (!defaultData) {
      throw new GracefulDegradationError(
        'No default response configured',
        'NO_DEFAULT_RESPONSE',
        serviceName
      );
    }

    logger.info({ serviceName }, 'Using default response as fallback');
    return defaultData;
  }

  /**
   * Queue request for later processing
   */
  private async queueRequest<T>(service: ServiceConfig, context?: any): Promise<T> {
    const queue = this.requestQueue.get(service.name) || [];
    
    if (queue.length >= (service.maxQueueSize || 100)) {
      throw new GracefulDegradationError(
        'Request queue is full',
        'QUEUE_FULL',
        service.name
      );
    }

    return new Promise((resolve, reject) => {
      queue.push({ request: context, resolve, reject });
      this.requestQueue.set(service.name, queue);
      
      logger.info({
        serviceName: service.name,
        queueSize: queue.length
      }, 'Request queued for later processing');
    });
  }

  /**
   * Cache fallback data for future use
   */
  private cacheFallbackData(serviceName: string, cacheKey: string, data: any, ttl: number = 3600000): void {
    const key = `${serviceName}:${cacheKey}`;
    this.fallbackCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    logger.debug({
      serviceName,
      cacheKey,
      ttl
    }, 'Cached fallback data');
  }

  /**
   * Update service health status
   */
  private updateServiceHealth(serviceName: string, health: ServiceHealth): void {
    const previousHealth = this.serviceHealth.get(serviceName);
    this.serviceHealth.set(serviceName, health);

    if (previousHealth !== health) {
      logger.info({
        serviceName,
        previousHealth,
        newHealth: health
      }, 'Service health status changed');

      // Process queued requests if service becomes healthy
      if (health === ServiceHealth.HEALTHY) {
        this.processQueuedRequests(serviceName);
      }
    }
  }

  /**
   * Process queued requests when service becomes healthy
   */
  private async processQueuedRequests(serviceName: string): Promise<void> {
    const queue = this.requestQueue.get(serviceName) || [];
    if (queue.length === 0) return;

    logger.info({
      serviceName,
      queueSize: queue.length
    }, 'Processing queued requests');

    // Clear the queue
    this.requestQueue.set(serviceName, []);

    // Process each queued request
    for (const { request, resolve, reject } of queue) {
      try {
        // This would need to be implemented based on the specific service
        // For now, we'll resolve with a placeholder
        resolve({ processed: true, originalRequest: request });
      } catch (error) {
        reject(error);
      }
    }
  }

  /**
   * Start health check for a service
   */
  private startHealthCheck(service: ServiceConfig): void {
    const interval = setInterval(async () => {
      try {
        // Implement actual health check logic here
        // For now, we'll use circuit breaker stats
        const breaker = circuitBreakerRegistry.getBreaker(service.name);
        const stats = breaker.getStats();
        
        const health = stats.state === 'OPEN' ? ServiceHealth.UNHEALTHY :
                      stats.failureCount > 0 ? ServiceHealth.DEGRADED :
                      ServiceHealth.HEALTHY;
        
        this.updateServiceHealth(service.name, health);
      } catch (error) {
        logger.error({
          serviceName: service.name,
          error: (error as Error).message
        }, 'Health check failed');
        this.updateServiceHealth(service.name, ServiceHealth.UNHEALTHY);
      }
    }, service.healthCheckInterval);

    this.healthCheckIntervals.set(service.name, interval);
  }

  /**
   * Get service configuration
   */
  private getServiceConfig(serviceName: string): ServiceConfig {
    const service = this.services.find(s => s.name === serviceName);
    if (!service) {
      throw new Error(`Service configuration not found: ${serviceName}`);
    }
    return service;
  }

  /**
   * Get current service health status
   */
  getServiceHealth(serviceName: string): ServiceHealth {
    return this.serviceHealth.get(serviceName) || ServiceHealth.HEALTHY;
  }

  /**
   * Get all service health statuses
   */
  getAllServiceHealth(): Record<string, ServiceHealth> {
    const health: Record<string, ServiceHealth> = {};
    for (const [serviceName, status] of this.serviceHealth) {
      health[serviceName] = status;
    }
    return health;
  }

  /**
   * Manually set service health (for testing or manual intervention)
   */
  setServiceHealth(serviceName: string, health: ServiceHealth): void {
    this.updateServiceHealth(serviceName, health);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    for (const interval of this.healthCheckIntervals.values()) {
      clearInterval(interval);
    }
    this.healthCheckIntervals.clear();
    this.fallbackCache.clear();
    this.requestQueue.clear();
    
    logger.info('Graceful degradation manager destroyed');
  }
}

/**
 * Custom error for graceful degradation failures
 */
export class GracefulDegradationError extends Error {
  public readonly code: string;
  public readonly serviceName: string;
  public readonly timestamp: string;

  constructor(message: string, code: string, serviceName: string) {
    super(message);
    this.name = 'GracefulDegradationError';
    this.code = code;
    this.serviceName = serviceName;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}
