import { Router } from 'express';
import { asyncHandler } from '../middlewares/errors';
import { promptAnalytics } from '../services/promptAnalytics';
import { advancedPerformanceMonitor } from '../services/advancedPerformanceMonitor';
import { cacheManager } from '../services/intelligentCache';
import { requestDeduplicationService } from '../services/requestDeduplication';
import { maybeApiKey } from '../middlewares/auth';

const router = Router();

/**
 * GET /analytics/prompt-performance
 * Get prompt performance metrics
 */
router.get('/prompt-performance', asyncHandler(async (req, res) => {
  const { version } = req.query;
  const metrics = await promptAnalytics.analyzePromptPerformance(version as string);
  
  res.json({
    metrics,
    summary: {
      totalVersions: metrics.length,
      bestPerformingVersion: metrics.reduce((best, current) => 
        (current.averageRating * current.completionRate) > (best.averageRating * best.completionRate) 
          ? current : best
      ),
      overallStats: {
        totalGenerations: metrics.reduce((sum, m) => sum + m.totalGenerations, 0),
        averageCompletionRate: metrics.reduce((sum, m) => sum + m.completionRate, 0) / metrics.length,
        averageRating: metrics.reduce((sum, m) => sum + m.averageRating, 0) / metrics.length
      }
    }
  });
}));

/**
 * GET /analytics/optimization-suggestions
 * Get prompt optimization suggestions
 */
router.get('/optimization-suggestions', asyncHandler(async (req, res) => {
  const { version } = req.query;
  const suggestions = await promptAnalytics.generateOptimizationSuggestions(version as string);
  
  res.json({
    suggestions,
    prioritySummary: {
      high: suggestions.filter(s => s.priority === 'high').length,
      medium: suggestions.filter(s => s.priority === 'medium').length,
      low: suggestions.filter(s => s.priority === 'low').length
    },
    categories: {
      structure: suggestions.filter(s => s.category === 'structure').length,
      content: suggestions.filter(s => s.category === 'content').length,
      parameters: suggestions.filter(s => s.category === 'parameters').length,
      personalization: suggestions.filter(s => s.category === 'personalization').length
    }
  });
}));

/**
 * GET /analytics/ab-test-recommendations
 * Get A/B testing recommendations for prompt optimization
 */
router.get('/ab-test-recommendations', asyncHandler(async (req, res) => {
  const recommendations = await promptAnalytics.generateABTestRecommendations();
  
  res.json({
    recommendations,
    testingStrategy: {
      recommendedOrder: recommendations.map((r, i) => ({
        priority: i + 1,
        testName: r.testName,
        expectedImpact: 'high'
      })),
      totalEstimatedDuration: '6-12 weeks for all tests',
      minimumSampleSize: '100 workouts per variant per test'
    }
  });
}));

/**
 * GET /analytics/performance-metrics
 * Get advanced performance metrics
 */
router.get('/performance-metrics', maybeApiKey, asyncHandler(async (req, res) => {
  const performanceStats = advancedPerformanceMonitor.getStats();
  const performanceTrends = advancedPerformanceMonitor.getPerformanceTrends();
  const recentAlerts = advancedPerformanceMonitor.getRecentAlerts();

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
router.get('/cache-metrics', maybeApiKey, asyncHandler(async (req, res) => {
  const cacheMetrics = cacheManager.getAllMetrics();

  res.json({
    timestamp: new Date().toISOString(),
    caches: cacheMetrics
  });
}));

/**
 * GET /analytics/system-overview
 * Get comprehensive system metrics overview
 */
router.get('/system-overview', maybeApiKey, asyncHandler(async (req, res) => {
  const performanceStats = advancedPerformanceMonitor.getStats();
  const cacheMetrics = cacheManager.getAllMetrics();
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
