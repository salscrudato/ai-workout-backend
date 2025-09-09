import pino from 'pino';
import NodeCache from 'node-cache';
import { LRUCache } from 'lru-cache';

const logger = pino({
  name: 'intelligent-cache',
  level: process.env['NODE_ENV'] === 'development' ? 'debug' : 'info'
});

/**
 * Cache tier levels for hierarchical caching
 */
export enum CacheTier {
  L1_MEMORY = 'L1_MEMORY',       // Fast in-memory cache
  L2_PERSISTENT = 'L2_PERSISTENT', // Persistent cache (Redis-like)
  L3_DISTRIBUTED = 'L3_DISTRIBUTED' // Distributed cache
}

/**
 * Cache strategy types
 */
export enum CacheStrategy {
  LRU = 'LRU',                   // Least Recently Used
  LFU = 'LFU',                   // Least Frequently Used
  TTL = 'TTL',                   // Time To Live
  ADAPTIVE = 'ADAPTIVE'          // Adaptive based on usage patterns
}

/**
 * Cache configuration options
 */
export interface CacheConfig {
  name: string;
  strategy: CacheStrategy;
  maxSize: number;
  ttl: number; // Time to live in milliseconds
  tier: CacheTier;
  compressionEnabled?: boolean;
  encryptionEnabled?: boolean;
  metricsEnabled?: boolean;
}

/**
 * Cache entry metadata
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  lastAccessed: number;
  size: number;
  compressed?: boolean;
  encrypted?: boolean;
}

/**
 * Cache performance metrics
 */
export interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  totalRequests: number;
  averageResponseTime: number;
  memoryUsage: number;
  evictions: number;
  errors: number;
}

/**
 * Intelligent multi-tier caching system with adaptive strategies
 */
export class IntelligentCache<T = any> {
  private l1Cache: LRUCache<string, CacheEntry<T>>;
  private l2Cache: NodeCache;
  private config: CacheConfig;
  private metrics: CacheMetrics;
  private accessPatterns: Map<string, { frequency: number; lastAccess: number }>;

  constructor(config: CacheConfig) {
    this.config = config;
    this.metrics = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalRequests: 0,
      averageResponseTime: 0,
      memoryUsage: 0,
      evictions: 0,
      errors: 0
    };
    this.accessPatterns = new Map();

    // Initialize L1 cache (LRU)
    this.l1Cache = new LRUCache({
      max: Math.floor(config.maxSize * 0.3), // 30% of total size for L1
      ttl: config.ttl,
      updateAgeOnGet: true,
      allowStale: false
    });

    // Initialize L2 cache (NodeCache)
    this.l2Cache = new NodeCache({
      stdTTL: Math.floor(config.ttl / 1000), // Convert to seconds
      checkperiod: Math.floor(config.ttl / 1000 / 10), // Check every 10% of TTL
      useClones: false,
      deleteOnExpire: true,
      maxKeys: Math.floor(config.maxSize * 0.7) // 70% of total size for L2
    });

    // Set up event listeners for metrics
    this.setupEventListeners();

    logger.info({
      name: config.name,
      strategy: config.strategy,
      maxSize: config.maxSize,
      tier: config.tier
    }, 'Intelligent cache initialized');
  }

  /**
   * Get value from cache with intelligent tier selection
   */
  async get(key: string): Promise<T | null> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      // Update access patterns
      this.updateAccessPattern(key);

      // Try L1 cache first
      const l1Entry = this.l1Cache.get(key);
      if (l1Entry && this.isValidEntry(l1Entry)) {
        this.recordHit(startTime);
        l1Entry.hits++;
        l1Entry.lastAccessed = Date.now();
        
        logger.debug({ key, tier: 'L1' }, 'Cache hit in L1');
        return l1Entry.data;
      }

      // Try L2 cache
      const l2Entry = this.l2Cache.get<CacheEntry<T>>(key);
      if (l2Entry && this.isValidEntry(l2Entry)) {
        this.recordHit(startTime);
        l2Entry.hits++;
        l2Entry.lastAccessed = Date.now();

        // Promote to L1 if frequently accessed
        if (this.shouldPromoteToL1(key, l2Entry)) {
          this.l1Cache.set(key, l2Entry);
          logger.debug({ key }, 'Promoted entry from L2 to L1');
        }

        logger.debug({ key, tier: 'L2' }, 'Cache hit in L2');
        return l2Entry.data;
      }

      // Cache miss
      this.recordMiss(startTime);
      logger.debug({ key }, 'Cache miss');
      return null;

    } catch (error) {
      this.metrics.errors++;
      logger.error({ key, error: (error as Error).message }, 'Cache get error');
      return null;
    }
  }

  /**
   * Set value in cache with intelligent tier placement
   */
  async set(key: string, value: T, customTtl?: number): Promise<void> {
    // const startTime = Date.now(); // Available for performance monitoring

    try {
      const ttl = customTtl || this.config.ttl;
      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        ttl,
        hits: 0,
        lastAccessed: Date.now(),
        size: this.estimateSize(value),
        compressed: this.config.compressionEnabled,
        encrypted: this.config.encryptionEnabled
      };

      // Apply compression if enabled
      if (this.config.compressionEnabled) {
        entry.data = await this.compress(value);
        entry.compressed = true;
      }

      // Apply encryption if enabled
      if (this.config.encryptionEnabled) {
        entry.data = await this.encrypt(entry.data);
        entry.encrypted = true;
      }

      // Determine optimal tier based on strategy
      const tier = this.determineOptimalTier(key, entry);

      if (tier === CacheTier.L1_MEMORY) {
        this.l1Cache.set(key, entry);
        logger.debug({ key, size: entry.size }, 'Cached in L1');
      } else {
        this.l2Cache.set(key, entry, Math.floor(ttl / 1000));
        logger.debug({ key, size: entry.size }, 'Cached in L2');
      }

      // Update metrics
      this.updateMemoryUsage();

    } catch (error) {
      this.metrics.errors++;
      logger.error({ key, error: (error as Error).message }, 'Cache set error');
    }
  }

  /**
   * Delete value from all cache tiers
   */
  async delete(key: string): Promise<boolean> {
    try {
      const l1Deleted = this.l1Cache.delete(key);
      const l2Deleted = this.l2Cache.del(key) > 0;
      
      this.accessPatterns.delete(key);
      this.updateMemoryUsage();

      logger.debug({ key, l1Deleted, l2Deleted }, 'Cache entry deleted');
      return l1Deleted || l2Deleted;

    } catch (error) {
      this.metrics.errors++;
      logger.error({ key, error: (error as Error).message }, 'Cache delete error');
      return false;
    }
  }

  /**
   * Clear all cache tiers
   */
  async clear(): Promise<void> {
    try {
      this.l1Cache.clear();
      this.l2Cache.flushAll();
      this.accessPatterns.clear();
      
      this.metrics.memoryUsage = 0;
      logger.info({ name: this.config.name }, 'Cache cleared');

    } catch (error) {
      this.metrics.errors++;
      logger.error({ error: (error as Error).message }, 'Cache clear error');
    }
  }

  /**
   * Get cache performance metrics
   */
  getMetrics(): CacheMetrics {
    this.updateHitRate();
    return { ...this.metrics };
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    l1Stats: { size: number; max: number };
    l2Stats: { keys: number; hits: number; misses: number };
    accessPatterns: number;
  } {
    return {
      l1Stats: {
        size: this.l1Cache.size,
        max: this.l1Cache.max
      },
      l2Stats: {
        keys: this.l2Cache.keys().length,
        hits: this.l2Cache.getStats().hits,
        misses: this.l2Cache.getStats().misses
      },
      accessPatterns: this.accessPatterns.size
    };
  }

  /**
   * Optimize cache based on access patterns
   */
  async optimize(): Promise<void> {
    try {
      logger.info({ name: this.config.name }, 'Starting cache optimization');

      // Analyze access patterns
      const hotKeys = this.identifyHotKeys();
      const coldKeys = this.identifyColdKeys();

      // Promote hot keys to L1
      for (const key of hotKeys) {
        const l2Entry = this.l2Cache.get<CacheEntry<T>>(key);
        if (l2Entry && !this.l1Cache.has(key)) {
          this.l1Cache.set(key, l2Entry);
          logger.debug({ key }, 'Promoted hot key to L1');
        }
      }

      // Demote cold keys from L1
      for (const key of coldKeys) {
        if (this.l1Cache.has(key)) {
          const entry = this.l1Cache.get(key);
          if (entry) {
            this.l2Cache.set(key, entry, Math.floor(entry.ttl / 1000));
            this.l1Cache.delete(key);
            logger.debug({ key }, 'Demoted cold key to L2');
          }
        }
      }

      logger.info({
        name: this.config.name,
        hotKeysPromoted: hotKeys.length,
        coldKeysDemoted: coldKeys.length
      }, 'Cache optimization completed');

    } catch (error) {
      this.metrics.errors++;
      logger.error({ error: (error as Error).message }, 'Cache optimization error');
    }
  }

  private setupEventListeners(): void {
    this.l2Cache.on('expired', (key, value) => {
      logger.debug({ key }, 'Cache entry expired');
    });

    this.l2Cache.on('del', (key, value) => {
      this.metrics.evictions++;
    });
  }

  private updateAccessPattern(key: string): void {
    const pattern = this.accessPatterns.get(key) || { frequency: 0, lastAccess: 0 };
    pattern.frequency++;
    pattern.lastAccess = Date.now();
    this.accessPatterns.set(key, pattern);
  }

  private isValidEntry(entry: CacheEntry<T>): boolean {
    const now = Date.now();
    return (now - entry.timestamp) < entry.ttl;
  }

  private shouldPromoteToL1(key: string, entry: CacheEntry<T>): boolean {
    const pattern = this.accessPatterns.get(key);
    if (!pattern) return false;

    // Promote if accessed frequently in recent time
    const recentAccesses = pattern.frequency;
    const timeSinceLastAccess = Date.now() - pattern.lastAccess;
    
    return recentAccesses > 3 && timeSinceLastAccess < 60000; // 1 minute
  }

  private determineOptimalTier(key: string, entry: CacheEntry<T>): CacheTier {
    const pattern = this.accessPatterns.get(key);
    
    // New entries go to L2 by default
    if (!pattern) return CacheTier.L2_PERSISTENT;
    
    // Frequently accessed entries go to L1
    if (pattern.frequency > 5) return CacheTier.L1_MEMORY;
    
    return CacheTier.L2_PERSISTENT;
  }

  private recordHit(startTime: number): void {
    this.metrics.hits++;
    const responseTime = Date.now() - startTime;
    this.updateAverageResponseTime(responseTime);
  }

  private recordMiss(startTime: number): void {
    this.metrics.misses++;
    const responseTime = Date.now() - startTime;
    this.updateAverageResponseTime(responseTime);
  }

  private updateHitRate(): void {
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0;
  }

  private updateAverageResponseTime(responseTime: number): void {
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.averageResponseTime = 
      ((this.metrics.averageResponseTime * (total - 1)) + responseTime) / total;
  }

  private updateMemoryUsage(): void {
    // Estimate memory usage (simplified)
    const l1Size = this.l1Cache.size * 1024; // Rough estimate
    const l2Size = this.l2Cache.keys().length * 1024; // Rough estimate
    this.metrics.memoryUsage = l1Size + l2Size;
  }

  private identifyHotKeys(): string[] {
    const hotKeys: string[] = [];
    const threshold = 5; // Minimum frequency to be considered hot
    
    for (const [key, pattern] of this.accessPatterns) {
      if (pattern.frequency >= threshold) {
        hotKeys.push(key);
      }
    }
    
    return hotKeys.sort((a, b) => {
      const patternA = this.accessPatterns.get(a)!;
      const patternB = this.accessPatterns.get(b)!;
      return patternB.frequency - patternA.frequency;
    }).slice(0, 10); // Top 10 hot keys
  }

  private identifyColdKeys(): string[] {
    const coldKeys: string[] = [];
    const threshold = Date.now() - 300000; // 5 minutes ago
    
    for (const [key, pattern] of this.accessPatterns) {
      if (pattern.lastAccess < threshold) {
        coldKeys.push(key);
      }
    }
    
    return coldKeys;
  }

  private estimateSize(value: T): number {
    // Simplified size estimation
    return JSON.stringify(value).length;
  }

  private async compress(value: T): Promise<T> {
    // Placeholder for compression logic
    // In a real implementation, you would use a compression library
    return value;
  }

  private async encrypt(value: T): Promise<T> {
    // Placeholder for encryption logic
    // In a real implementation, you would use an encryption library
    return value;
  }
}

/**
 * Cache manager for managing multiple cache instances
 */
export class CacheManager {
  private static instance: CacheManager;
  private caches: Map<string, IntelligentCache> = new Map();

  private constructor() {}

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Create or get a cache instance
   */
  getCache<T>(name: string, config?: Partial<CacheConfig>): IntelligentCache<T> {
    if (!this.caches.has(name)) {
      const defaultConfig: CacheConfig = {
        name,
        strategy: CacheStrategy.ADAPTIVE,
        maxSize: 1000,
        ttl: 3600000, // 1 hour
        tier: CacheTier.L1_MEMORY,
        compressionEnabled: false,
        encryptionEnabled: false,
        metricsEnabled: true
      };

      const finalConfig = { ...defaultConfig, ...config };
      this.caches.set(name, new IntelligentCache<T>(finalConfig));
    }

    return this.caches.get(name) as IntelligentCache<T>;
  }

  /**
   * Get metrics for all caches
   */
  getAllMetrics(): Record<string, CacheMetrics> {
    const metrics: Record<string, CacheMetrics> = {};
    for (const [name, cache] of this.caches) {
      metrics[name] = cache.getMetrics();
    }
    return metrics;
  }

  /**
   * Optimize all caches
   */
  async optimizeAll(): Promise<void> {
    const promises = Array.from(this.caches.values()).map(cache => cache.optimize());
    await Promise.all(promises);
    logger.info('All caches optimized');
  }

  /**
   * Clear all caches
   */
  async clearAll(): Promise<void> {
    const promises = Array.from(this.caches.values()).map(cache => cache.clear());
    await Promise.all(promises);
    logger.info('All caches cleared');
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();
