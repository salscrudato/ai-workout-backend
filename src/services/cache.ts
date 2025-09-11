import { LRUCache } from 'lru-cache';
import NodeCache from 'node-cache';
import pino from 'pino';

const logger = pino({
  name: 'unified-cache-service',
  level: process.env['NODE_ENV'] === 'development' ? 'debug' : 'info'
});

/**
 * Cache configuration options
 */
interface CacheOptions {
  maxSize?: number;
  ttl?: number; // Time to live in milliseconds
  name?: string;
  enableAdvancedFeatures?: boolean; // Enable multi-tier caching
}

/**
 * Cache metrics for monitoring
 */
interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  totalRequests: number;
  l1Hits?: number;
  l2Hits?: number;
  evictions?: number;
}

/**
 * Cache entry with metadata
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  lastAccessed: number;
  size?: number;
}

/**
 * Unified caching service with configurable complexity levels
 * Simple mode: Basic LRU cache
 * Advanced mode: Multi-tier caching with intelligent promotion
 */
export class UnifiedCacheService<T extends {} = any> {
  private l1Cache: LRUCache<string, CacheEntry<T>>;
  private l2Cache?: NodeCache;
  private metrics: CacheMetrics;
  private name: string;
  private enableAdvanced: boolean;

  constructor(options: CacheOptions = {}) {
    this.name = options.name || 'default';
    this.enableAdvanced = options.enableAdvancedFeatures ?? false;

    this.metrics = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalRequests: 0,
      ...(this.enableAdvanced && {
        l1Hits: 0,
        l2Hits: 0,
        evictions: 0
      })
    };

    // Initialize L1 cache (always present)
    const maxSize = options.maxSize || 1000;
    const ttl = options.ttl || 15 * 60 * 1000;

    this.l1Cache = new LRUCache({
      max: this.enableAdvanced ? Math.floor(maxSize * 0.3) : maxSize,
      ttl,
      updateAgeOnGet: true,
      allowStale: false
    });

    // Initialize L2 cache if advanced features are enabled
    if (this.enableAdvanced) {
      this.l2Cache = new NodeCache({
        stdTTL: Math.floor(ttl / 1000),
        checkperiod: Math.floor(ttl / 1000 / 10),
        useClones: false,
        deleteOnExpire: true,
        maxKeys: Math.floor(maxSize * 0.7)
      });
    }

    logger.info({
      name: this.name,
      maxSize,
      ttl,
      advanced: this.enableAdvanced
    }, 'Unified cache service initialized');
  }

  /**
   * Get value from cache with intelligent tier selection
   */
  get(key: string): T | undefined {
    this.metrics.totalRequests++;

    // Try L1 cache first
    const l1Entry = this.l1Cache.get(key);
    if (l1Entry && this.isValidEntry(l1Entry)) {
      this.metrics.hits++;
      if (this.enableAdvanced) this.metrics.l1Hits!++;

      l1Entry.hits++;
      l1Entry.lastAccessed = Date.now();

      logger.debug({ key, cache: this.name, tier: 'L1' }, 'Cache hit');
      this.updateHitRate();
      return l1Entry.data;
    }

    // Try L2 cache if advanced features are enabled
    if (this.enableAdvanced && this.l2Cache) {
      const l2Entry = this.l2Cache.get<CacheEntry<T>>(key);
      if (l2Entry && this.isValidEntry(l2Entry)) {
        this.metrics.hits++;
        this.metrics.l2Hits!++;

        l2Entry.hits++;
        l2Entry.lastAccessed = Date.now();

        // Promote to L1 if frequently accessed
        if (l2Entry.hits > 2) {
          this.l1Cache.set(key, l2Entry);
          logger.debug({ key, cache: this.name }, 'Promoted from L2 to L1');
        }

        logger.debug({ key, cache: this.name, tier: 'L2' }, 'Cache hit');
        this.updateHitRate();
        return l2Entry.data;
      }
    }

    // Cache miss
    this.metrics.misses++;
    logger.debug({ key, cache: this.name }, 'Cache miss');
    this.updateHitRate();
    return undefined;
  }

  /**
   * Set value in cache with intelligent tier placement
   */
  set(key: string, value: T, customTtl?: number): void {
    const ttl = customTtl || 15 * 60 * 1000;
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl,
      hits: 0,
      lastAccessed: Date.now(),
      size: this.estimateSize(value)
    };

    // Always store in L1
    this.l1Cache.set(key, entry, { ttl });

    // Also store in L2 if advanced features are enabled
    if (this.enableAdvanced && this.l2Cache) {
      this.l2Cache.set(key, entry, Math.floor(ttl / 1000));
    }

    logger.debug({ key, cache: this.name, ttl, advanced: this.enableAdvanced }, 'Cache set');
  }

  /**
   * Delete value from cache
   */
  delete(key: string): boolean {
    const l1Deleted = this.l1Cache.delete(key);
    const l2Deleted = this.enableAdvanced && this.l2Cache ? this.l2Cache.del(key) > 0 : false;

    const deleted = l1Deleted || l2Deleted;
    if (deleted) {
      logger.debug({ key, cache: this.name }, 'Cache delete');
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.l1Cache.clear();
    if (this.enableAdvanced && this.l2Cache) {
      this.l2Cache.flushAll();
    }
    this.resetMetrics();
    logger.info({ cache: this.name }, 'Cache cleared');
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  /**
   * Get cache size
   */
  size(): number {
    const l1Size = this.l1Cache.size;
    const l2Size = this.enableAdvanced && this.l2Cache ? this.l2Cache.keys().length : 0;
    return l1Size + l2Size;
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    const inL1 = this.l1Cache.has(key);
    const inL2 = this.enableAdvanced && this.l2Cache ? this.l2Cache.has(key) : false;
    return inL1 || inL2;
  }

  /**
   * Get or set pattern - fetch from cache or compute and cache
   */
  async getOrSet<R = T>(
    key: string,
    factory: () => Promise<R>,
    ttl?: number
  ): Promise<R> {
    const cached = this.get(key) as R;
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    this.set(key, value as any, ttl);
    return value;
  }

  /**
   * Check if cache entry is valid (not expired)
   */
  private isValidEntry(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Estimate size of cached value (simple heuristic)
   */
  private estimateSize(value: T): number {
    try {
      return JSON.stringify(value).length;
    } catch {
      return 1000; // Default size estimate
    }
  }

  /**
   * Update hit rate calculation
   */
  private updateHitRate(): void {
    this.metrics.hitRate = this.metrics.totalRequests > 0
      ? this.metrics.hits / this.metrics.totalRequests
      : 0;
  }

  /**
   * Reset metrics
   */
  private resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalRequests: 0,
      ...(this.enableAdvanced && {
        l1Hits: 0,
        l2Hits: 0,
        evictions: 0
      })
    };
  }
}

// Global cache instances for different use cases
export const workoutCache = new UnifiedCacheService({
  name: 'workout-cache',
  maxSize: 500,
  ttl: 30 * 60 * 1000, // 30 minutes
  enableAdvancedFeatures: false // Simple caching for workouts
});

export const profileCache = new UnifiedCacheService({
  name: 'profile-cache',
  maxSize: 1000,
  ttl: 60 * 60 * 1000, // 1 hour
  enableAdvancedFeatures: true // Advanced caching for profiles
});

export const equipmentCache = new UnifiedCacheService({
  name: 'equipment-cache',
  maxSize: 100,
  ttl: 24 * 60 * 60 * 1000, // 24 hours
  enableAdvancedFeatures: false // Simple caching for equipment
});

// Backward compatibility alias
export const CacheService = UnifiedCacheService;

/**
 * Cache key generators for consistent key naming
 */
export const CacheKeys = {
  workout: (userId: string, hash: string) => `workout:${userId}:${hash}`,
  profile: (userId: string) => `profile:${userId}`,
  equipment: () => 'equipment:all',
  userWorkouts: (userId: string, limit?: number) => `user-workouts:${userId}:${limit || 'all'}`,
  workoutPlan: (planId: string) => `workout-plan:${planId}`,
};

/**
 * Cache warming utility
 */
export async function warmCache(): Promise<void> {
  logger.info('Starting cache warming...');
  
  try {
    // Warm equipment cache
    // This would typically load frequently accessed data
    logger.info('Cache warming completed');
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'Cache warming failed');
  }
}

/**
 * Cache monitoring utility
 */
export function getCacheStats(): Record<string, CacheMetrics> {
  return {
    workout: workoutCache.getMetrics(),
    profile: profileCache.getMetrics(),
    equipment: equipmentCache.getMetrics(),
  };
}
