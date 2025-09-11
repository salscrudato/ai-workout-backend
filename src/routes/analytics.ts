import { Router } from 'express';
import { asyncHandler } from '../middlewares/errors';
import { requestDeduplicationService } from '../services/requestDeduplication';
import { maybeApiKey } from '../middlewares/auth';

const analyticsEnabled = process.env['ANALYTICS_MODE'] === 'on';

const router = Router();

/**
 * GET /analytics/prompt-performance
 * Get prompt performance metrics
 */
router.get('/prompt-performance', maybeApiKey, asyncHandler(async (_req, res): Promise<void> => {
  if (!analyticsEnabled) {
    res.status(503).json({
      error: 'Analytics computations disabled. Enable batch/precomputed analytics or set ANALYTICS_MODE=on for controlled environments.',
      code: 'ANALYTICS_DISABLED'
    });
    return;
  }
  res.json({
    metrics: [],
    summary: {
      totalVersions: 0,
      bestPerformingVersion: null,
      overallStats: {
        totalGenerations: 0,
        averageCompletionRate: 0,
        averageRating: 0
      }
    },
    message: 'Analytics simplified - detailed metrics removed for codebase consolidation'
  });
}));

/**
 * GET /analytics/optimization-suggestions
 * Get prompt optimization suggestions
 */
router.get('/optimization-suggestions', maybeApiKey, asyncHandler(async (_req, res): Promise<void> => {
  if (!analyticsEnabled) {
    res.status(503).json({
      error: 'Analytics computations disabled. Enable batch/precomputed analytics or set ANALYTICS_MODE=on for controlled environments.',
      code: 'ANALYTICS_DISABLED'
    });
  }
  res.json({
    suggestions: [],
    prioritySummary: {
      high: 0,
      medium: 0,
      low: 0
    },
    categories: {
      structure: 0,
      content: 0,
      parameters: 0,
      personalization: 0
    },
    message: 'Analytics simplified - detailed suggestions removed for codebase consolidation'
  });
}));

/**
 * GET /analytics/ab-test-recommendations
 * Get A/B testing recommendations for prompt optimization
 */
router.get('/ab-test-recommendations', maybeApiKey, asyncHandler(async (_req, res): Promise<void> => {
  if (!analyticsEnabled) {
    res.status(503).json({
      error: 'Analytics computations disabled. Enable batch/precomputed analytics or set ANALYTICS_MODE=on for controlled environments.',
      code: 'ANALYTICS_DISABLED'
    });
  }
  res.json({
    recommendations: [],
    testingStrategy: {
      recommendedOrder: [],
      totalEstimatedDuration: '0 weeks - testing simplified',
      minimumSampleSize: '0 workouts per variant per test'
    },
    message: 'Analytics simplified - A/B testing removed for codebase consolidation'
  });
}));

/**
 * GET /analytics/performance-metrics
 * Get advanced performance metrics
 */
router.get('/performance-metrics', maybeApiKey, asyncHandler(async (_req, res) => {
  const performanceStats = { requests: 0, errors: 0, avgResponseTime: 0 };
  const performanceTrends: any[] = [];
  const recentAlerts: any[] = [];

  res.json({
    timestamp: new Date().toISOString(),
    performance: performanceStats,
    trends: performanceTrends,
    alerts: recentAlerts
  });
}));

/**
 * GET /analytics/cache-metrics
 * Get cache performance metrics
 */
router.get('/cache-metrics', maybeApiKey, asyncHandler(async (_req, res) => {
  const cacheMetrics = { hits: 0, misses: 0, hitRate: 0 };

  res.json({
    timestamp: new Date().toISOString(),
    caches: cacheMetrics
  });
}));

/**
 * GET /analytics/system-overview
 * Get comprehensive system metrics overview
 */
router.get('/system-overview', maybeApiKey, asyncHandler(async (_req, res) => {
  const performanceStats = { requests: 0, errors: 0, avgResponseTime: 0 };
  const cacheMetrics = { hits: 0, misses: 0, hitRate: 0 };
  const deduplicationMetrics = requestDeduplicationService.getMetrics();

  res.json({
    timestamp: new Date().toISOString(),
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      version: process.version,
      platform: process.platform,
      arch: process.arch
    },
    performance: performanceStats,
    caching: cacheMetrics,
    deduplication: deduplicationMetrics
  });
}));

export default router;
