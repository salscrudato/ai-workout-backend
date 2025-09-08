import pino from 'pino';
import { Request, Response, NextFunction } from 'express';

const logger = pino({
  name: 'advanced-rate-limit',
  level: process.env['NODE_ENV'] === 'development' ? 'debug' : 'info'
});

/**
 * Rate limit violation types
 */
export enum RateLimitViolationType {
  BURST_LIMIT = 'BURST_LIMIT',
  SUSTAINED_LIMIT = 'SUSTAINED_LIMIT',
  ENDPOINT_LIMIT = 'ENDPOINT_LIMIT',
  USER_LIMIT = 'USER_LIMIT',
  IP_LIMIT = 'IP_LIMIT',
  SUSPICIOUS_PATTERN = 'SUSPICIOUS_PATTERN'
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  burstLimit?: number;
  burstWindowMs?: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  onLimitReached?: (req: Request, res: Response) => void;
  whitelist?: string[];
  blacklist?: string[];
}

/**
 * Rate limit entry
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
  burstCount: number;
  burstResetTime: number;
  firstRequest: number;
  lastRequest: number;
  violations: number;
  blocked: boolean;
  suspiciousActivity: boolean;
}

/**
 * Rate limit violation
 */
export interface RateLimitViolation {
  type: RateLimitViolationType;
  key: string;
  count: number;
  limit: number;
  windowMs: number;
  timestamp: number;
  userAgent?: string;
  ipAddress?: string;
  endpoint?: string;
}

/**
 * Advanced rate limiting service with intelligent threat detection
 */
export class AdvancedRateLimitService {
  private store: Map<string, RateLimitEntry> = new Map();
  private violations: RateLimitViolation[] = [];
  private readonly maxViolations = 1000;
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 300000);
  }

  /**
   * Create rate limit middleware
   */
  createMiddleware(config: RateLimitConfig) {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = config.keyGenerator ? config.keyGenerator(req) : this.defaultKeyGenerator(req);
      
      // Check whitelist
      if (config.whitelist && this.isWhitelisted(key, config.whitelist)) {
        return next();
      }

      // Check blacklist
      if (config.blacklist && this.isBlacklisted(key, config.blacklist)) {
        return this.blockRequest(req, res, 'IP_BLACKLISTED');
      }

      const result = this.checkRateLimit(key, config, req);
      
      if (!result.allowed) {
        this.recordViolation(result.violation!);
        return this.handleRateLimitExceeded(req, res, result.violation!, config);
      }

      // Add rate limit headers
      this.addRateLimitHeaders(res, result.entry!);
      
      next();
    };
  }

  /**
   * Check if request is within rate limits
   */
  private checkRateLimit(
    key: string,
    config: RateLimitConfig,
    req: Request
  ): {
    allowed: boolean;
    entry?: RateLimitEntry;
    violation?: RateLimitViolation;
  } {
    const now = Date.now();
    let entry = this.store.get(key);

    if (!entry) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
        burstCount: 0,
        burstResetTime: now + (config.burstWindowMs || 60000),
        firstRequest: now,
        lastRequest: now,
        violations: 0,
        blocked: false,
        suspiciousActivity: false
      };
      this.store.set(key, entry);
    }

    // Reset counters if windows have expired
    if (now >= entry.resetTime) {
      entry.count = 0;
      entry.resetTime = now + config.windowMs;
    }

    if (config.burstLimit && now >= entry.burstResetTime) {
      entry.burstCount = 0;
      entry.burstResetTime = now + (config.burstWindowMs || 60000);
    }

    // Update entry
    entry.count++;
    entry.lastRequest = now;
    if (config.burstLimit) {
      entry.burstCount++;
    }

    // Check for suspicious patterns
    this.detectSuspiciousActivity(entry, req);

    // Check burst limit first
    if (config.burstLimit && entry.burstCount > config.burstLimit) {
      return {
        allowed: false,
        violation: {
          type: RateLimitViolationType.BURST_LIMIT,
          key,
          count: entry.burstCount,
          limit: config.burstLimit,
          windowMs: config.burstWindowMs || 60000,
          timestamp: now,
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip,
          endpoint: `${req.method} ${req.path}`
        }
      };
    }

    // Check sustained limit
    if (entry.count > config.maxRequests) {
      return {
        allowed: false,
        violation: {
          type: RateLimitViolationType.SUSTAINED_LIMIT,
          key,
          count: entry.count,
          limit: config.maxRequests,
          windowMs: config.windowMs,
          timestamp: now,
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip,
          endpoint: `${req.method} ${req.path}`
        }
      };
    }

    // Check if marked as suspicious
    if (entry.suspiciousActivity && entry.count > Math.floor(config.maxRequests * 0.5)) {
      return {
        allowed: false,
        violation: {
          type: RateLimitViolationType.SUSPICIOUS_PATTERN,
          key,
          count: entry.count,
          limit: Math.floor(config.maxRequests * 0.5),
          windowMs: config.windowMs,
          timestamp: now,
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip,
          endpoint: `${req.method} ${req.path}`
        }
      };
    }

    return { allowed: true, entry };
  }

  /**
   * Detect suspicious activity patterns
   */
  private detectSuspiciousActivity(entry: RateLimitEntry, req: Request): void {
    const now = Date.now();
    const timeSinceFirst = now - entry.firstRequest;
    const timeSinceLast = now - entry.lastRequest;

    // Detect rapid-fire requests (less than 100ms between requests)
    if (timeSinceLast < 100 && entry.count > 5) {
      entry.suspiciousActivity = true;
      logger.warn({
        key: this.defaultKeyGenerator(req),
        timeSinceLast,
        count: entry.count
      }, 'Rapid-fire requests detected');
    }

    // Detect consistent timing patterns (bot-like behavior)
    if (entry.count > 10) {
      const averageInterval = timeSinceFirst / entry.count;
      if (averageInterval < 500 && averageInterval > 450) { // Very consistent ~500ms intervals
        entry.suspiciousActivity = true;
        logger.warn({
          key: this.defaultKeyGenerator(req),
          averageInterval,
          count: entry.count
        }, 'Bot-like timing pattern detected');
      }
    }

    // Detect unusual user agent patterns
    const userAgent = req.get('User-Agent') || '';
    const suspiciousUserAgents = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /^$/
    ];

    if (suspiciousUserAgents.some(pattern => pattern.test(userAgent))) {
      entry.suspiciousActivity = true;
      logger.warn({
        key: this.defaultKeyGenerator(req),
        userAgent
      }, 'Suspicious user agent detected');
    }
  }

  /**
   * Record rate limit violation
   */
  private recordViolation(violation: RateLimitViolation): void {
    this.violations.push(violation);
    
    // Keep only recent violations
    if (this.violations.length > this.maxViolations) {
      this.violations.shift();
    }

    // Update entry violation count
    const entry = this.store.get(violation.key);
    if (entry) {
      entry.violations++;
      
      // Block repeat offenders
      if (entry.violations > 5) {
        entry.blocked = true;
        logger.error({
          key: violation.key,
          violations: entry.violations
        }, 'IP blocked due to repeated violations');
      }
    }

    logger.warn({
      type: violation.type,
      key: violation.key,
      count: violation.count,
      limit: violation.limit,
      endpoint: violation.endpoint
    }, 'Rate limit violation recorded');
  }

  /**
   * Handle rate limit exceeded
   */
  private handleRateLimitExceeded(
    req: Request,
    res: Response,
    violation: RateLimitViolation,
    config: RateLimitConfig
  ): void {
    const entry = this.store.get(violation.key);
    const retryAfter = entry ? Math.ceil((entry.resetTime - Date.now()) / 1000) : 60;

    res.set({
      'Retry-After': retryAfter.toString(),
      'X-RateLimit-Limit': violation.limit.toString(),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': entry ? new Date(entry.resetTime).toISOString() : new Date(Date.now() + 60000).toISOString()
    });

    if (config.onLimitReached) {
      config.onLimitReached(req, res);
    } else {
      res.status(429).json({
        error: 'Too Many Requests',
        message: this.getViolationMessage(violation),
        retryAfter,
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }
  }

  /**
   * Block request immediately
   */
  private blockRequest(req: Request, res: Response, reason: string): void {
    logger.error({
      reason,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: `${req.method} ${req.path}`
    }, 'Request blocked');

    res.status(403).json({
      error: 'Forbidden',
      message: 'Request blocked due to security policy',
      code: 'REQUEST_BLOCKED'
    });
  }

  /**
   * Add rate limit headers to response
   */
  private addRateLimitHeaders(res: Response, entry: RateLimitEntry): void {
    const remaining = Math.max(0, entry.resetTime - Date.now());
    
    res.set({
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': new Date(entry.resetTime).toISOString()
    });
  }

  /**
   * Default key generator (IP-based)
   */
  private defaultKeyGenerator(req: Request): string {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }

  /**
   * Check if key is whitelisted
   */
  private isWhitelisted(key: string, whitelist: string[]): boolean {
    return whitelist.includes(key) || whitelist.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(key);
      }
      return false;
    });
  }

  /**
   * Check if key is blacklisted
   */
  private isBlacklisted(key: string, blacklist: string[]): boolean {
    return blacklist.includes(key) || blacklist.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(key);
      }
      return false;
    });
  }

  /**
   * Get violation message
   */
  private getViolationMessage(violation: RateLimitViolation): string {
    switch (violation.type) {
      case RateLimitViolationType.BURST_LIMIT:
        return `Burst limit exceeded. Maximum ${violation.limit} requests per ${violation.windowMs / 1000} seconds.`;
      case RateLimitViolationType.SUSTAINED_LIMIT:
        return `Rate limit exceeded. Maximum ${violation.limit} requests per ${violation.windowMs / 1000} seconds.`;
      case RateLimitViolationType.SUSPICIOUS_PATTERN:
        return 'Suspicious activity detected. Request rate limited.';
      default:
        return 'Rate limit exceeded. Please try again later.';
    }
  }

  /**
   * Get current violations
   */
  getViolations(timeWindow: number = 3600000): RateLimitViolation[] {
    const cutoff = Date.now() - timeWindow;
    return this.violations.filter(v => v.timestamp > cutoff);
  }

  /**
   * Get rate limit statistics
   */
  getStats(): {
    totalEntries: number;
    blockedIPs: number;
    suspiciousIPs: number;
    recentViolations: number;
  } {
    const blockedIPs = Array.from(this.store.values()).filter(entry => entry.blocked).length;
    const suspiciousIPs = Array.from(this.store.values()).filter(entry => entry.suspiciousActivity).length;
    const recentViolations = this.getViolations(3600000).length; // Last hour

    return {
      totalEntries: this.store.size,
      blockedIPs,
      suspiciousIPs,
      recentViolations
    };
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.store) {
      // Remove entries that haven't been accessed in the last hour and aren't blocked
      if (now - entry.lastRequest > 3600000 && !entry.blocked) {
        this.store.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.debug({ cleanedCount }, 'Rate limit store cleanup completed');
    }
  }

  /**
   * Destroy the service and cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
    this.violations.length = 0;
  }
}

// Export singleton instance
export const advancedRateLimitService = new AdvancedRateLimitService();
