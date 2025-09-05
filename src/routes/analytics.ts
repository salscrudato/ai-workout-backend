import { Router } from 'express';
import { asyncHandler } from '../middlewares/errors';
import { promptAnalytics } from '../services/promptAnalytics';

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

export default router;
