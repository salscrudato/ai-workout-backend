import pino from 'pino';
// import { cacheManager } from './intelligentCache'; // Available for future cache monitoring

const logger = pino({
  name: 'advanced-performance-monitor',
  level: process.env['NODE_ENV'] === 'development' ? 'debug' : 'info'
});

/**
 * Enhanced performance metric data structure
 */
export interface RequestPerformance {
  method: string;
  url: string;
  responseTime: number;
  statusCode: number;
  timestamp: number;
  userId?: string;
  memoryUsage?: number;
  cpuUsage?: number;
  cacheHit?: boolean;
  requestSize?: number;
  responseSize?: number;
}

/**
 * Comprehensive performance statistics
 */
export interface PerformanceStats {
  averageResponseTime: number;
  medianResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
  totalRequests: number;
  totalErrors: number;
  memoryUsage: number;
  cpuUsage: number;
  cacheHitRate: number;
  throughput: number;
  concurrentRequests: number;
  slowestEndpoints: Array<{ endpoint: string; averageTime: number }>;
  errorsByEndpoint: Array<{ endpoint: string; errorCount: number; errorRate: number }>;
}

/**
 * Performance regression detection
 */
export interface RegressionAlert {
  metric: string;
  currentValue: number;
  baselineValue: number;
  threshold: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: number;
  description: string;
  recommendation?: string;
}

/**
 * Performance baseline for regression detection
 */
export interface PerformanceBaseline {
  averageResponseTime: number;
  p95ResponseTime: number;
  errorRate: number;
  throughput: number;
  timestamp: number;
  sampleSize: number;
  period: string; // e.g., 'hourly', 'daily', 'weekly'
}

/**
 * Performance trend analysis
 */
export interface PerformanceTrend {
  metric: string;
  trend: 'IMPROVING' | 'STABLE' | 'DEGRADING';
  changePercent: number;
  confidence: number;
  dataPoints: Array<{ timestamp: number; value: number }>;
}

/**
 * Advanced performance monitoring service with regression detection and intelligent alerting
 */
export class AdvancedPerformanceMonitor {
  private metrics: {
    requests: RequestPerformance[];
    cacheHits: number;
    cacheMisses: number;
    startTime: number;
    concurrentRequests: number;
    baselines: PerformanceBaseline[];
    alerts: RegressionAlert[];
  };
  
  private readonly maxRequestHistory = 10000;
  private readonly maxBaselines = 100;
  private readonly maxAlerts = 1000;
  private readonly alertThresholds = {
    responseTime: 2000, // 2 seconds
    errorRate: 0.05, // 5%
    requestsPerSecond: 1000,
    memoryUsage: 512 * 1024 * 1024, // 512MB
    regressionThreshold: 0.2 // 20% degradation
  };

  constructor() {
    this.metrics = {
      requests: [],
      cacheHits: 0,
      cacheMisses: 0,
      startTime: Date.now(),
      concurrentRequests: 0,
      baselines: [],
      alerts: []
    };

    // Start periodic monitoring
    this.startPeriodicMonitoring();
    this.startBaselineCollection();
  }

  /**
   * Records a request performance metric with enhanced data
   */
  recordRequest(performance: RequestPerformance): void {
    this.metrics.requests.push({
      ...performance,
      memoryUsage: process.memoryUsage().heapUsed,
      cpuUsage: process.cpuUsage().user / 1000000 // Convert to milliseconds
    });

    // Keep only recent requests to prevent memory leaks
    if (this.metrics.requests.length > this.maxRequestHistory) {
      this.metrics.requests.shift();
    }

    // Check for performance regressions
    this.checkForRegressions(performance);

    // Check for immediate alerts
    this.checkPerformanceAlerts(performance);

    logger.debug({
      method: performance.method,
      url: performance.url,
      responseTime: performance.responseTime,
      statusCode: performance.statusCode,
      memoryUsage: performance.memoryUsage,
      cacheHit: performance.cacheHit
    }, 'Request recorded with enhanced metrics');
  }

  /**
   * Get comprehensive performance statistics
   */
  getStats(): PerformanceStats {
    const recentRequests = this.getRecentRequests(300000); // Last 5 minutes
    const responseTimes = recentRequests.map(r => r.responseTime).sort((a, b) => a - b);
    const errors = recentRequests.filter(r => r.statusCode >= 400);
    
    const timeWindow = 60000; // 1 minute
    const recentRequestsInWindow = this.getRecentRequests(timeWindow);
    const requestsPerSecond = recentRequestsInWindow.length / (timeWindow / 1000);

    // Calculate cache hit rate
    const totalCacheRequests = this.metrics.cacheHits + this.metrics.cacheMisses;
    const cacheHitRate = totalCacheRequests > 0 ? (this.metrics.cacheHits / totalCacheRequests) * 100 : 0;

    // Calculate throughput (requests per second over last minute)
    const throughput = this.calculateThroughput();

    // Get slowest endpoints
    const slowestEndpoints = this.getSlowestEndpoints();

    // Get errors by endpoint
    const errorsByEndpoint = this.getErrorsByEndpoint();

    return {
      averageResponseTime: this.calculateAverage(responseTimes),
      medianResponseTime: this.calculatePercentile(responseTimes, 50),
      p95ResponseTime: this.calculatePercentile(responseTimes, 95),
      p99ResponseTime: this.calculatePercentile(responseTimes, 99),
      requestsPerSecond,
      errorRate: recentRequests.length > 0 ? (errors.length / recentRequests.length) * 100 : 0,
      totalRequests: this.metrics.requests.length,
      totalErrors: errors.length,
      memoryUsage: process.memoryUsage().heapUsed,
      cpuUsage: process.cpuUsage().user / 1000000,
      cacheHitRate,
      throughput,
      concurrentRequests: this.metrics.concurrentRequests,
      slowestEndpoints,
      errorsByEndpoint
    };
  }

  /**
   * Get performance trends analysis
   */
  getPerformanceTrends(): PerformanceTrend[] {
    const trends: PerformanceTrend[] = [];
    const timeWindows = [
      { name: 'last_hour', duration: 3600000 },
      { name: 'last_day', duration: 86400000 },
      { name: 'last_week', duration: 604800000 }
    ];

    for (const window of timeWindows) {
      const requests = this.getRecentRequests(window.duration);
      if (requests.length < 10) continue; // Need minimum data points

      // Analyze response time trend
      const responseTimeTrend = this.analyzeTrend(
        requests.map(r => ({ timestamp: r.timestamp, value: r.responseTime })),
        'response_time'
      );
      trends.push(responseTimeTrend);

      // Analyze error rate trend
      const errorRateTrend = this.analyzeErrorRateTrend(requests, 'error_rate');
      trends.push(errorRateTrend);
    }

    return trends;
  }

  /**
   * Get recent regression alerts
   */
  getRecentAlerts(timeWindow: number = 3600000): RegressionAlert[] {
    const cutoff = Date.now() - timeWindow;
    return this.metrics.alerts.filter(alert => alert.timestamp > cutoff);
  }

  /**
   * Create a performance baseline
   */
  createBaseline(period: string = 'hourly'): PerformanceBaseline {
    const stats = this.getStats();
    const baseline: PerformanceBaseline = {
      averageResponseTime: stats.averageResponseTime,
      p95ResponseTime: stats.p95ResponseTime,
      errorRate: stats.errorRate,
      throughput: stats.throughput,
      timestamp: Date.now(),
      sampleSize: stats.totalRequests,
      period
    };

    this.metrics.baselines.push(baseline);
    
    // Keep only recent baselines
    if (this.metrics.baselines.length > this.maxBaselines) {
      this.metrics.baselines.shift();
    }

    logger.info({
      period,
      averageResponseTime: baseline.averageResponseTime,
      p95ResponseTime: baseline.p95ResponseTime,
      errorRate: baseline.errorRate,
      sampleSize: baseline.sampleSize
    }, 'Performance baseline created');

    return baseline;
  }

  /**
   * Express middleware for automatic request performance tracking
   */
  middleware() {
    return (req: any, res: any, next: any) => {
      const startTime = Date.now();
      this.metrics.concurrentRequests++;

      // Capture request size
      const requestSize = req.get('content-length') ? parseInt(req.get('content-length')) : 0;

      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        this.metrics.concurrentRequests--;
        
        // Capture response size
        const responseSize = res.get('content-length') ? parseInt(res.get('content-length')) : 0;

        this.recordRequest({
          method: req.method,
          url: req.url,
          responseTime,
          statusCode: res.statusCode,
          timestamp: Date.now(),
          userId: req.user?.uid,
          requestSize,
          responseSize,
          cacheHit: res.get('X-Cache') === 'HIT'
        });
      });

      next();
    };
  }

  private startPeriodicMonitoring(): void {
    // Monitor every 30 seconds
    setInterval(() => {
      this.performPeriodicChecks();
    }, 30000);
  }

  private startBaselineCollection(): void {
    // Create hourly baselines
    setInterval(() => {
      this.createBaseline('hourly');
    }, 3600000); // 1 hour

    // Create daily baselines
    setInterval(() => {
      this.createBaseline('daily');
    }, 86400000); // 24 hours
  }

  private performPeriodicChecks(): void {
    const stats = this.getStats();
    
    // Check for memory leaks
    if (stats.memoryUsage > this.alertThresholds.memoryUsage) {
      this.createAlert({
        metric: 'memory_usage',
        currentValue: stats.memoryUsage,
        baselineValue: this.alertThresholds.memoryUsage,
        threshold: this.alertThresholds.memoryUsage,
        severity: 'HIGH',
        timestamp: Date.now(),
        description: `High memory usage detected: ${Math.round(stats.memoryUsage / 1024 / 1024)}MB`,
        recommendation: 'Consider investigating memory leaks or increasing memory allocation'
      });
    }

    // Check for high error rates
    if (stats.errorRate > this.alertThresholds.errorRate * 100) {
      this.createAlert({
        metric: 'error_rate',
        currentValue: stats.errorRate,
        baselineValue: this.alertThresholds.errorRate * 100,
        threshold: this.alertThresholds.errorRate * 100,
        severity: 'CRITICAL',
        timestamp: Date.now(),
        description: `High error rate detected: ${stats.errorRate.toFixed(2)}%`,
        recommendation: 'Investigate recent deployments or external service issues'
      });
    }
  }

  private checkForRegressions(performance: RequestPerformance): void {
    if (this.metrics.baselines.length === 0) return;

    const latestBaseline = this.metrics.baselines[this.metrics.baselines.length - 1];
    const regressionThreshold = this.alertThresholds.regressionThreshold;

    // Check response time regression
    if (latestBaseline && performance.responseTime > latestBaseline.averageResponseTime * (1 + regressionThreshold)) {
      this.createAlert({
        metric: 'response_time_regression',
        currentValue: performance.responseTime,
        baselineValue: latestBaseline.averageResponseTime,
        threshold: latestBaseline.averageResponseTime * (1 + regressionThreshold),
        severity: 'MEDIUM',
        timestamp: Date.now(),
        description: `Response time regression detected for ${performance.method} ${performance.url}`,
        recommendation: 'Check for recent code changes or database performance issues'
      });
    }
  }

  private checkPerformanceAlerts(performance: RequestPerformance): void {
    // Check for slow requests
    if (performance.responseTime > this.alertThresholds.responseTime) {
      logger.warn({
        method: performance.method,
        url: performance.url,
        responseTime: performance.responseTime,
        threshold: this.alertThresholds.responseTime
      }, 'Slow request detected');
    }
  }

  private createAlert(alert: RegressionAlert): void {
    this.metrics.alerts.push(alert);
    
    // Keep only recent alerts
    if (this.metrics.alerts.length > this.maxAlerts) {
      this.metrics.alerts.shift();
    }

    logger.warn({
      metric: alert.metric,
      severity: alert.severity,
      description: alert.description,
      currentValue: alert.currentValue,
      baselineValue: alert.baselineValue
    }, 'Performance alert created');
  }

  private getRecentRequests(timeWindow: number): RequestPerformance[] {
    const cutoff = Date.now() - timeWindow;
    return this.metrics.requests.filter(r => r.timestamp > cutoff);
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculatePercentile(sortedValues: number[], percentile: number): number {
    if (sortedValues.length === 0) return 0;
    const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, index)] || 0;
  }

  private calculateThroughput(): number {
    const oneMinuteAgo = Date.now() - 60000;
    const recentRequests = this.metrics.requests.filter(r => r.timestamp > oneMinuteAgo);
    return recentRequests.length / 60; // requests per second
  }

  private getSlowestEndpoints(): Array<{ endpoint: string; averageTime: number }> {
    const endpointTimes: Map<string, number[]> = new Map();
    
    this.getRecentRequests(300000).forEach(req => {
      const endpoint = `${req.method} ${req.url}`;
      if (!endpointTimes.has(endpoint)) {
        endpointTimes.set(endpoint, []);
      }
      endpointTimes.get(endpoint)!.push(req.responseTime);
    });

    return Array.from(endpointTimes.entries())
      .map(([endpoint, times]) => ({
        endpoint,
        averageTime: this.calculateAverage(times)
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 5);
  }

  private getErrorsByEndpoint(): Array<{ endpoint: string; errorCount: number; errorRate: number }> {
    const endpointStats: Map<string, { total: number; errors: number }> = new Map();
    
    this.getRecentRequests(300000).forEach(req => {
      const endpoint = `${req.method} ${req.url}`;
      if (!endpointStats.has(endpoint)) {
        endpointStats.set(endpoint, { total: 0, errors: 0 });
      }
      const stats = endpointStats.get(endpoint)!;
      stats.total++;
      if (req.statusCode >= 400) {
        stats.errors++;
      }
    });

    return Array.from(endpointStats.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        errorCount: stats.errors,
        errorRate: (stats.errors / stats.total) * 100
      }))
      .filter(item => item.errorCount > 0)
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 5);
  }

  private analyzeTrend(dataPoints: Array<{ timestamp: number; value: number }>, metric: string): PerformanceTrend {
    if (dataPoints.length < 2) {
      return {
        metric,
        trend: 'STABLE',
        changePercent: 0,
        confidence: 0,
        dataPoints
      };
    }

    // Simple linear regression to detect trend
    const n = dataPoints.length;
    const sumX = dataPoints.reduce((sum, _point, index) => sum + index, 0);
    const sumY = dataPoints.reduce((sum, point) => sum + point.value, 0);
    const sumXY = dataPoints.reduce((sum, point, index) => sum + (index * point.value), 0);
    const sumXX = dataPoints.reduce((sum, _point, index) => sum + (index * index), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const avgY = sumY / n;
    
    const changePercent = (slope / avgY) * 100;
    const confidence = Math.min(Math.abs(changePercent) / 10, 1); // Simplified confidence calculation

    let trend: 'IMPROVING' | 'STABLE' | 'DEGRADING';
    if (Math.abs(changePercent) < 5) {
      trend = 'STABLE';
    } else if (changePercent < 0) {
      trend = metric.includes('error') ? 'IMPROVING' : 'IMPROVING'; // Lower is better for most metrics
    } else {
      trend = metric.includes('error') ? 'DEGRADING' : 'DEGRADING'; // Higher is worse for most metrics
    }

    return {
      metric,
      trend,
      changePercent,
      confidence,
      dataPoints
    };
  }

  private analyzeErrorRateTrend(requests: RequestPerformance[], metric: string): PerformanceTrend {
    // Group requests by time buckets (e.g., 5-minute intervals)
    const bucketSize = 300000; // 5 minutes
    const buckets: Map<number, { total: number; errors: number }> = new Map();

    requests.forEach(req => {
      const bucket = Math.floor(req.timestamp / bucketSize) * bucketSize;
      if (!buckets.has(bucket)) {
        buckets.set(bucket, { total: 0, errors: 0 });
      }
      const bucketData = buckets.get(bucket)!;
      bucketData.total++;
      if (req.statusCode >= 400) {
        bucketData.errors++;
      }
    });

    const dataPoints = Array.from(buckets.entries())
      .map(([timestamp, data]) => ({
        timestamp,
        value: data.total > 0 ? (data.errors / data.total) * 100 : 0
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    return this.analyzeTrend(dataPoints, metric);
  }
}

// Export singleton instance
export const advancedPerformanceMonitor = new AdvancedPerformanceMonitor();
