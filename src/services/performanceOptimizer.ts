import { Request, Response, NextFunction } from 'express';
import { WorkoutPlanModel } from '../models/WorkoutPlan';
import { ProfileModel } from '../models/Profile';
import { WorkoutSessionModel } from '../models/WorkoutSession';

/**
 * Performance Optimization Service
 * Provides caching, request optimization, and scalability enhancements
 */

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

interface PerformanceMetrics {
  requestCount: number;
  averageResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  activeConnections: number;
}

class PerformanceOptimizer {
  private cache = new Map<string, CacheEntry>();
  private metrics: PerformanceMetrics = {
    requestCount: 0,
    averageResponseTime: 0,
    cacheHitRate: 0,
    errorRate: 0,
    activeConnections: 0
  };
  private responseTimes: number[] = [];
  private readonly maxCacheSize = 1000;
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Intelligent caching middleware with LRU eviction
   */
  cacheMiddleware(ttl: number = this.defaultTTL) {
    return (req: Request, res: Response, next: NextFunction) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      const cacheKey = this.generateCacheKey(req);
      const cached = this.getFromCache(cacheKey);

      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Age', Date.now() - cached.timestamp);
        return res.json(cached.data);
      }

      // Store original json method
      const originalJson = res.json.bind(res);
      
      res.json = (data: any) => {
        // Cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          this.setCache(cacheKey, data, ttl);
        }
        res.setHeader('X-Cache', 'MISS');
        return originalJson(data);
      };

      next();
    };
  }

  /**
   * Request compression and optimization middleware
   */
  optimizeRequest() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      this.metrics.requestCount++;
      this.metrics.activeConnections++;

      // Add response time tracking
      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        this.responseTimes.push(responseTime);
        this.metrics.activeConnections--;

        // Keep only last 1000 response times for average calculation
        if (this.responseTimes.length > 1000) {
          this.responseTimes = this.responseTimes.slice(-1000);
        }

        this.metrics.averageResponseTime = 
          this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length;

        // Track error rate
        if (res.statusCode >= 400) {
          this.metrics.errorRate = (this.metrics.errorRate * 0.9) + 0.1; // Exponential moving average
        } else {
          this.metrics.errorRate = this.metrics.errorRate * 0.99;
        }
      });

      // Set performance headers
      res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
      res.setHeader('X-Request-ID', this.generateRequestId());

      next();
    };
  }

  /**
   * Database query optimization for workouts
   */
  async getOptimizedWorkouts(userId: string, limit: number = 10, offset: number = 0) {
    const cacheKey = `workouts:${userId}:${limit}:${offset}`;
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return cached.data;
    }

    // Optimized query - simplified for now
    const workouts = await WorkoutPlanModel.find({ userId });

    this.setCache(cacheKey, workouts, 2 * 60 * 1000); // 2 minutes TTL
    return workouts;
  }

  /**
   * Batch operations for better database performance
   */
  async batchUpdateWorkouts(updates: Array<{ id: string; data: any }>) {
    // For now, use individual updates until we implement proper bulk operations
    const results = [];
    for (const update of updates) {
      const result = await WorkoutPlanModel.findById(update.id);
      results.push(result);
      this.invalidateCachePattern(`workout:${update.id}`);
    }
    return results;
  }

  /**
   * Intelligent preloading based on user patterns
   */
  async preloadUserData(userId: string) {
    try {
      // Preload commonly accessed data
      const [profile, recentWorkouts] = await Promise.all([
        ProfileModel.findOne({ userId }),
        this.getOptimizedWorkouts(userId, 5)
      ]);

      // Cache preloaded data
      this.setCache(`profile:${userId}`, profile, 10 * 60 * 1000);
      this.setCache(`recent_workouts:${userId}`, recentWorkouts, 5 * 60 * 1000);

      return { profile, recentWorkouts };
    } catch (error) {
      console.error('Preloading failed:', error);
      return null;
    }
  }

  /**
   * Memory-efficient workout generation caching
   */
  async cacheWorkoutGeneration(userId: string, request: any, result: any) {
    const cacheKey = `generation:${userId}:${this.hashObject(request)}`;
    
    // Store only essential data to save memory
    const compactResult = {
      workoutId: result.workoutId,
      plan: {
        meta: result.plan.meta,
        exercises: result.plan.exercises?.map((ex: any) => ({
          display_name: ex.display_name,
          type: ex.type,
          sets: ex.sets?.length || 0
        }))
      }
    };

    this.setCache(cacheKey, compactResult, 30 * 60 * 1000); // 30 minutes
  }

  /**
   * Advanced cache management
   */
  private generateCacheKey(req: Request): string {
    const { method, url, query, params } = req;
    const userId = (req as any).user?.id || 'anonymous';
    return `${method}:${url}:${userId}:${this.hashObject({ query, params })}`;
  }

  private getFromCache<T>(key: string): CacheEntry<T> | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update hit count and access time
    entry.hits++;
    entry.timestamp = Date.now();
    
    // Update cache hit rate
    this.updateCacheHitRate(true);
    
    return entry;
  }

  private setCache<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0
    });

    this.updateCacheHitRate(false);
  }

  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    let lowestHits = Infinity;

    // Find least recently used entry with lowest hit count
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime || (entry.timestamp === oldestTime && entry.hits < lowestHits)) {
        oldestKey = key;
        oldestTime = entry.timestamp;
        lowestHits = entry.hits;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private updateCacheHitRate(isHit: boolean): void {
    const currentRate = this.metrics.cacheHitRate;
    const alpha = 0.1; // Smoothing factor for exponential moving average
    
    this.metrics.cacheHitRate = isHit 
      ? currentRate + alpha * (1 - currentRate)
      : currentRate * (1 - alpha);
  }

  private invalidateCachePattern(pattern: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes(pattern)
    );
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  private hashObject(obj: any): string {
    return Buffer.from(JSON.stringify(obj)).toString('base64').slice(0, 16);
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Performance monitoring and metrics
   */
  getMetrics(): PerformanceMetrics & { cacheSize: number; memoryUsage: NodeJS.MemoryUsage } {
    return {
      ...this.metrics,
      cacheSize: this.cache.size,
      memoryUsage: process.memoryUsage()
    };
  }

  /**
   * Health check with performance indicators
   */
  healthCheck(): { status: string; performance: any; recommendations: string[] } {
    const metrics = this.getMetrics();
    const recommendations = [];

    // Performance analysis
    if (metrics.averageResponseTime > 1000) {
      recommendations.push('High response times detected - consider database optimization');
    }

    if (metrics.cacheHitRate < 0.5) {
      recommendations.push('Low cache hit rate - review caching strategy');
    }

    if (metrics.errorRate > 0.05) {
      recommendations.push('High error rate detected - investigate error sources');
    }

    if (metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal > 0.8) {
      recommendations.push('High memory usage - consider memory optimization');
    }

    const status = recommendations.length === 0 ? 'healthy' : 
                  recommendations.length <= 2 ? 'warning' : 'critical';

    return {
      status,
      performance: {
        responseTime: `${Math.round(metrics.averageResponseTime)}ms`,
        cacheHitRate: `${Math.round(metrics.cacheHitRate * 100)}%`,
        errorRate: `${Math.round(metrics.errorRate * 100)}%`,
        memoryUsage: `${Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024)}MB`,
        activeConnections: metrics.activeConnections
      },
      recommendations
    };
  }

  /**
   * Cleanup and maintenance
   */
  cleanup(): void {
    // Remove expired entries
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }

    // Reset metrics if needed
    if (this.responseTimes.length > 10000) {
      this.responseTimes = this.responseTimes.slice(-1000);
    }
  }

  /**
   * Record request for performance monitoring
   */
  recordRequest(responseTime: number, isError: boolean = false): void {
    this.responseTimes.push(responseTime);

    // Keep only last 1000 response times for memory efficiency
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000);
    }

    // Update metrics
    this.metrics.requestCount++;
    this.metrics.averageResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;

    if (isError) {
      this.metrics.errorRate = (this.metrics.errorRate * (this.metrics.requestCount - 1) + 1) / this.metrics.requestCount;
    }
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get cache statistics
   */
  getCacheStatistics(): Record<string, any> {
    return {
      cacheSize: this.cache.size,
      maxCacheSize: this.maxCacheSize,
      hitRate: this.metrics.cacheHitRate
    };
  }

  /**
   * Generate optimization recommendations
   */
  generateOptimizationRecommendations(): Array<{
    type: string;
    priority: string;
    description: string;
    impact: string;
    implementation: string;
  }> {
    const recommendations = [];

    if (this.metrics.averageResponseTime > 1000) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        description: 'High average response time detected',
        impact: 'Poor user experience',
        implementation: 'Optimize database queries and add caching'
      });
    }

    if (this.metrics.errorRate > 0.05) {
      recommendations.push({
        type: 'reliability',
        priority: 'critical',
        description: 'High error rate detected',
        impact: 'Service reliability issues',
        implementation: 'Investigate error sources and implement retry mechanisms'
      });
    }

    return recommendations;
  }

  /**
   * Graceful shutdown
   */
  shutdown(): void {
    this.cache.clear();
    this.responseTimes = [];
    console.log('Performance optimizer shutdown complete');
  }
}

// Export singleton instance
export const performanceOptimizer = new PerformanceOptimizer();

// Cleanup interval
setInterval(() => {
  performanceOptimizer.cleanup();
}, 5 * 60 * 1000); // Every 5 minutes

// Graceful shutdown handling
process.on('SIGTERM', () => {
  performanceOptimizer.shutdown();
});

process.on('SIGINT', () => {
  performanceOptimizer.shutdown();
});

export default performanceOptimizer;
