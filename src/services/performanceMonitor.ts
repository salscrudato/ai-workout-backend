import pino from 'pino';

// Initialize logger for performance monitoring
const logger = pino({
  name: 'performance-monitor',
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
});

/**
 * Performance metrics interface
 */
interface PerformanceMetrics {
  readonly requestCount: number;
  readonly averageResponseTime: number;
  readonly errorRate: number;
  readonly cacheHitRate: number;
  readonly memoryUsage: NodeJS.MemoryUsage;
  readonly uptime: number;
}

/**
 * Request performance data
 */
interface RequestPerformance {
  readonly method: string;
  readonly url: string;
  readonly responseTime: number;
  readonly statusCode: number;
  readonly timestamp: number;
  readonly userId?: string;
}

/**
 * Performance monitoring service for tracking application metrics
 * 
 * Features:
 * - Request/response time tracking
 * - Error rate monitoring
 * - Memory usage tracking
 * - Cache performance metrics
 * - Real-time performance alerts
 * - Historical data aggregation
 */
export class PerformanceMonitor {
  private readonly metrics: {
    requests: RequestPerformance[];
    cacheHits: number;
    cacheMisses: number;
    startTime: number;
  };

  private readonly maxRequestHistory = 1000; // Keep last 1000 requests
  private readonly alertThresholds = {
    responseTime: 2000, // 2 seconds
    errorRate: 0.05, // 5%
    memoryUsage: 0.85 // 85% of heap
  };

  constructor() {
    this.metrics = {
      requests: [],
      cacheHits: 0,
      cacheMisses: 0,
      startTime: Date.now()
    };

    // Start periodic monitoring
    this.startPeriodicMonitoring();
  }

  /**
   * Records a request performance metric
   * @param performance - Request performance data
   */
  recordRequest(performance: RequestPerformance): void {
    this.metrics.requests.push(performance);

    // Keep only recent requests to prevent memory leaks
    if (this.metrics.requests.length > this.maxRequestHistory) {
      this.metrics.requests.shift();
    }

    // Check for performance alerts
    this.checkPerformanceAlerts(performance);

    logger.debug('Request recorded', {
      method: performance.method,
      url: performance.url,
      responseTime: performance.responseTime,
      statusCode: performance.statusCode
    });
  }

  /**
   * Records cache hit/miss for cache performance tracking
   * @param hit - Whether the cache was hit or missed
   */
  recordCacheAccess(hit: boolean): void {
    if (hit) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
    }
  }

  /**
   * Gets current performance metrics
   * @returns Current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    const recentRequests = this.getRecentRequests(5 * 60 * 1000); // Last 5 minutes
    const totalRequests = recentRequests.length;
    const errorRequests = recentRequests.filter(r => r.statusCode >= 400).length;
    const totalCacheAccess = this.metrics.cacheHits + this.metrics.cacheMisses;

    return {
      requestCount: totalRequests,
      averageResponseTime: totalRequests > 0 
        ? recentRequests.reduce((sum, r) => sum + r.responseTime, 0) / totalRequests 
        : 0,
      errorRate: totalRequests > 0 ? errorRequests / totalRequests : 0,
      cacheHitRate: totalCacheAccess > 0 ? this.metrics.cacheHits / totalCacheAccess : 0,
      memoryUsage: process.memoryUsage(),
      uptime: Date.now() - this.metrics.startTime
    };
  }

  /**
   * Gets performance summary for health checks
   * @returns Performance summary with status
   */
  getHealthSummary(): {
    status: 'healthy' | 'warning' | 'critical';
    metrics: PerformanceMetrics;
    alerts: string[];
  } {
    const metrics = this.getMetrics();
    const alerts: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Check response time
    if (metrics.averageResponseTime > this.alertThresholds.responseTime) {
      alerts.push(`High average response time: ${metrics.averageResponseTime.toFixed(0)}ms`);
      status = 'warning';
    }

    // Check error rate
    if (metrics.errorRate > this.alertThresholds.errorRate) {
      alerts.push(`High error rate: ${(metrics.errorRate * 100).toFixed(1)}%`);
      status = 'critical';
    }

    // Check memory usage
    const memoryUsageRatio = metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal;
    if (memoryUsageRatio > this.alertThresholds.memoryUsage) {
      alerts.push(`High memory usage: ${(memoryUsageRatio * 100).toFixed(1)}%`);
      status = status === 'critical' ? 'critical' : 'warning';
    }

    return { status, metrics, alerts };
  }

  /**
   * Gets recent requests within a time window
   * @param timeWindowMs - Time window in milliseconds
   * @returns Array of recent requests
   */
  private getRecentRequests(timeWindowMs: number): RequestPerformance[] {
    const cutoffTime = Date.now() - timeWindowMs;
    return this.metrics.requests.filter(r => r.timestamp >= cutoffTime);
  }

  /**
   * Checks for performance alerts and logs warnings
   * @param performance - Latest request performance
   */
  private checkPerformanceAlerts(performance: RequestPerformance): void {
    // Alert on slow requests
    if (performance.responseTime > this.alertThresholds.responseTime) {
      logger.warn('Slow request detected', {
        method: performance.method,
        url: performance.url,
        responseTime: performance.responseTime,
        userId: performance.userId
      });
    }

    // Alert on errors
    if (performance.statusCode >= 500) {
      logger.error('Server error detected', {
        method: performance.method,
        url: performance.url,
        statusCode: performance.statusCode,
        userId: performance.userId
      });
    }
  }

  /**
   * Starts periodic monitoring and cleanup
   */
  private startPeriodicMonitoring(): void {
    // Log metrics every 5 minutes
    setInterval(() => {
      const metrics = this.getMetrics();
      logger.info('Performance metrics', metrics);
    }, 5 * 60 * 1000);

    // Cleanup old data every hour
    setInterval(() => {
      this.cleanupOldData();
    }, 60 * 60 * 1000);
  }

  /**
   * Cleans up old performance data to prevent memory leaks
   */
  private cleanupOldData(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    const initialLength = this.metrics.requests.length;
    
    this.metrics.requests = this.metrics.requests.filter(r => r.timestamp >= cutoffTime);
    
    const removedCount = initialLength - this.metrics.requests.length;
    if (removedCount > 0) {
      logger.debug('Cleaned up old performance data', { removedCount });
    }
  }

  /**
   * Express middleware for automatic request performance tracking
   * @returns Express middleware function
   */
  middleware() {
    return (req: any, res: any, next: any) => {
      const startTime = Date.now();

      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        
        this.recordRequest({
          method: req.method,
          url: req.url,
          responseTime,
          statusCode: res.statusCode,
          timestamp: Date.now(),
          userId: req.user?.uid
        });
      });

      next();
    };
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();
