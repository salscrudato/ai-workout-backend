/**
 * Advanced caching utility with TTL, memory management, and persistence
 */

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items
  persistent?: boolean; // Store in localStorage
  serialize?: boolean; // Serialize complex objects
}

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

class AdvancedCache<T = any> {
  private cache = new Map<string, CacheItem<T>>();
  private options: Required<CacheOptions>;
  private storageKey: string;

  constructor(name: string, options: CacheOptions = {}) {
    this.storageKey = `cache_${name}`;
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutes default
      maxSize: options.maxSize || 100,
      persistent: options.persistent || false,
      serialize: options.serialize || true,
    };

    // Load from localStorage if persistent
    if (this.options.persistent) {
      this.loadFromStorage();
    }

    // Cleanup expired items periodically
    setInterval(() => this.cleanup(), 60000); // Every minute
  }

  set(key: string, data: T, customTtl?: number): void {
    const ttl = customTtl || this.options.ttl;
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0,
    };

    // Remove oldest items if cache is full
    if (this.cache.size >= this.options.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, item);

    if (this.options.persistent) {
      this.saveToStorage();
    }
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      if (this.options.persistent) {
        this.saveToStorage();
      }
      return null;
    }

    // Update hit count for LRU
    item.hits++;
    item.timestamp = Date.now(); // Update access time

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted && this.options.persistent) {
      this.saveToStorage();
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    if (this.options.persistent) {
      localStorage.removeItem(this.storageKey);
    }
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Get cache statistics
  getStats() {
    const items = Array.from(this.cache.values());
    const now = Date.now();
    
    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      expired: items.filter(item => now - item.timestamp > item.ttl).length,
      totalHits: items.reduce((sum, item) => sum + item.hits, 0),
      averageAge: items.length > 0 
        ? items.reduce((sum, item) => sum + (now - item.timestamp), 0) / items.length 
        : 0,
    };
  }

  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    let lowestHits = Infinity;

    for (const [key, item] of this.cache.entries()) {
      // Prioritize by hits, then by age
      if (item.hits < lowestHits || (item.hits === lowestHits && item.timestamp < oldestTime)) {
        oldestKey = key;
        oldestTime = item.timestamp;
        lowestHits = item.hits;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));

    if (keysToDelete.length > 0 && this.options.persistent) {
      this.saveToStorage();
    }
  }

  private saveToStorage(): void {
    try {
      const data = Array.from(this.cache.entries());
      const serialized = this.options.serialize 
        ? JSON.stringify(data)
        : data;
      localStorage.setItem(this.storageKey, serialized as string);
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return;

      const data = this.options.serialize 
        ? JSON.parse(stored)
        : stored;

      const now = Date.now();
      
      for (const [key, item] of data) {
        // Only load non-expired items
        if (now - item.timestamp <= item.ttl) {
          this.cache.set(key, item);
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
      localStorage.removeItem(this.storageKey);
    }
  }
}

// Determine cache TTLs based on environment
const isDev = import.meta.env.DEV;
const isMobileDev = window.location.hostname.includes('192.168') || window.location.hostname.includes('10.0');
const minimizeCache = isDev || isMobileDev || new URLSearchParams(window.location.search).has('no-cache');

// Reduced TTLs for development/mobile testing
const cacheTTLs = minimizeCache ? {
  api: 30 * 1000,      // 30 seconds
  user: 60 * 1000,     // 1 minute
  workout: 30 * 1000,  // 30 seconds
  image: 5 * 60 * 1000 // 5 minutes
} : {
  api: 5 * 60 * 1000,      // 5 minutes
  user: 30 * 60 * 1000,    // 30 minutes
  workout: 10 * 60 * 1000, // 10 minutes
  image: 60 * 60 * 1000    // 1 hour
};

// Create singleton instances for different data types
export const apiCache = new AdvancedCache('api', {
  ttl: cacheTTLs.api,
  maxSize: 50,
  persistent: !minimizeCache, // Disable persistence in dev for immediate updates
});

export const userCache = new AdvancedCache('user', {
  ttl: cacheTTLs.user,
  maxSize: 20,
  persistent: !minimizeCache,
});

export const workoutCache = new AdvancedCache('workout', {
  ttl: cacheTTLs.workout,
  maxSize: 30,
  persistent: !minimizeCache,
});

export const imageCache = new AdvancedCache('image', {
  ttl: cacheTTLs.image,
  maxSize: 100,
  persistent: !minimizeCache,
});

// Cache key generators
export const generateCacheKey = {
  workout: (userId: string, workoutId: string) => `workout_${userId}_${workoutId}`,
  workoutList: (userId: string, page = 1, limit = 10) => `workouts_${userId}_${page}_${limit}`,
  profile: (userId: string) => `profile_${userId}`,
  equipment: () => 'equipment_list',
  analytics: (userId: string, timeframe: string) => `analytics_${userId}_${timeframe}`,
};

// Utility functions
export const invalidateCache = (pattern: string) => {
  [apiCache, userCache, workoutCache, imageCache].forEach(cache => {
    const keys = cache.keys().filter(key => key.includes(pattern));
    keys.forEach(key => cache.delete(key));
  });
};

// Clear all caches (useful for development and mobile testing)
export const clearAllCaches = async () => {
  console.log('🧹 Clearing all application caches...');

  // Clear application-level caches
  [apiCache, userCache, workoutCache, imageCache].forEach(cache => {
    cache.clear();
  });

  // Clear service worker caches
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => {
        console.log(`🗑️ Deleting cache: ${cacheName}`);
        return caches.delete(cacheName);
      })
    );
  }

  // Clear localStorage cache data
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('cache_')) {
      localStorage.removeItem(key);
    }
  });

  console.log('✅ All caches cleared');
};

// Force refresh without cache
export const forceRefresh = () => {
  console.log('🔄 Force refreshing page...');
  window.location.reload();
};

// Development helper to add cache control to window
if (minimizeCache && typeof window !== 'undefined') {
  (window as any).cacheControl = {
    clear: clearAllCaches,
    refresh: forceRefresh,
    invalidate: invalidateCache,
    status: () => ({
      minimizeCache,
      cacheTTLs,
      cacheKeys: {
        api: apiCache.keys(),
        user: userCache.keys(),
        workout: workoutCache.keys(),
        image: imageCache.keys()
      }
    })
  };
  console.log('🛠️ Cache control available at window.cacheControl');
}

export const getCacheStats = () => ({
  api: apiCache.getStats(),
  user: userCache.getStats(),
  workout: workoutCache.getStats(),
  image: imageCache.getStats(),
});

export default AdvancedCache;
