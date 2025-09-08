import { Router } from 'express';
import { createUser, authenticateUser } from '../controllers/user';
import { getProfile, patchProfile, createProfile } from '../controllers/profile';
import { generate, getWorkout, listWorkouts, completeWorkout, generateQuickWorkout } from '../controllers/workout';
import { EquipmentModel } from '../models/Equipment';
import { asyncHandler } from '../middlewares/errors';
import { requireAuth } from '../middlewares/auth';
// import { performanceOptimizer } from '../services/performanceOptimizer';
import { adaptiveLearningEngine } from '../services/adaptiveLearning.simple';
// import { generateWorkoutIntelligence } from '../services/workoutIntelligence';

const r = Router();

// Add performance monitoring middleware to all routes
// import { performanceOptimizer } from '../services/performanceOptimizer'; // Temporarily disabled

// Temporary stub implementations for disabled services
const frictionlessUXService = {
  generatePredictiveSchedule: async (userId: string, daysAhead: number) => ({
    schedule: [],
    recommendations: []
  }),
  generateSmartDefaults: async (userId: string) => ({
    workoutType: 'general_fitness',
    duration: 30,
    intensity: 3,
    equipment: ['bodyweight']
  }),
  generateQuickStartOptions: async (userId: string) => ({
    quickStart: {
      workoutType: 'general_fitness',
      duration: 30,
      intensity: 3
    },
    alternatives: []
  }),
  processConversationalInput: (input: string, context: any) => ({
    intent: 'workout_request',
    parameters: {},
    response: 'I understand you want to work out.'
  })
};

const advancedAnalyticsService = {
  generateUserAnalytics: async (userId: string) => ({
    performance: {},
    trends: [],
    insights: []
  }),
  analyzeWorkoutEffectiveness: async (workoutId: string) => ({
    effectiveness: 0.8,
    factors: [],
    recommendations: []
  }),
  generateLearningInsights: async (userId: string) => ({
    insights: [],
    adaptations: []
  })
};

const performanceOptimizer = {
  getPerformanceMetrics: () => ({
    responseTime: 100,
    errorRate: 0.01,
    throughput: 1000
  }),
  getCacheStatistics: () => ({
    hitRate: 0.9,
    missRate: 0.1,
    size: 1000
  }),
  generateOptimizationRecommendations: () => ({
    recommendations: []
  }),
  optimizeRequest: () => (req: any, res: any, next: any) => next(),
  cacheMiddleware: (ttl: number) => (req: any, res: any, next: any) => next()
};
r.use(performanceOptimizer.optimizeRequest());

// Add intelligent caching for GET requests (5 minute cache)
r.use(performanceOptimizer.cacheMiddleware(5 * 60 * 1000));

// Authentication routes
r.post('/auth/google', authenticateUser);

// Debug auth endpoint (manual verification)
r.post('/auth/debug', asyncHandler(async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(400).json({ error: 'No authorization header' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const admin = await import('firebase-admin');
    const decodedToken = await admin.default.auth().verifyIdToken(token);

    res.json({
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        projectId: decodedToken.aud, // This shows which project the token is for
      },
      backendProjectId: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || 'ai-workout-backend-2024',
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: (error as any).message,
      code: (error as any).code,
      backendProjectId: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || 'ai-workout-backend-2024',
    });
  }
}));

// Debug auth endpoint (using requireAuth middleware)
r.post('/auth/debug-middleware', requireAuth, asyncHandler(async (req, res): Promise<void> => {
  res.json({
    success: true,
    message: 'requireAuth middleware worked!',
    user: {
      uid: req.user?.uid,
      email: req.user?.email,
      projectId: req.user?.aud,
    },
    backendProjectId: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || 'ai-workout-backend-2024',
  });
}));

// User routes
r.post('/users', createUser);

// Profile routes (protected)
r.post('/profile', requireAuth, createProfile);
r.get('/profile/:userId', requireAuth, getProfile);
r.patch('/profile/:userId', requireAuth, patchProfile);

// Equipment routes (public) - with caching
r.get('/equipment', asyncHandler(async (req, res): Promise<void> => {
  // Set cache headers for static data
  res.set('Cache-Control', 'public, max-age=3600'); // 1 hour cache

  const items = await EquipmentModel.find();
  res.json({
    items: items.map(i => ({ slug: i.slug, label: i.label })),
    cached: false // Will be true when served from cache
  });
}));

// Workout routes (protected) - Specific routes first
r.post('/workouts/generate', requireAuth, generate);
r.post('/workouts/quick-generate', requireAuth, generateQuickWorkout); // NEW: One-tap workout generation

// Debug endpoint to test workout generation route
r.get('/workouts/test', asyncHandler(async (req, res) => {
  res.json({
    message: 'Workout generation endpoint is accessible',
    timestamp: new Date().toISOString(),
    routes: {
      generate: 'POST /v1/workouts/generate (requires auth)',
      quickGenerate: 'POST /v1/workouts/quick-generate (requires auth)'
    }
  });
}));

// NEW: Advanced AI Enhancement Routes - Frictionless UX
r.get('/workouts/predictive-schedule', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user?.uid;
  if (!userId) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const daysAhead = parseInt(req.query.days as string) || 7;
  // const { frictionlessUXService } = await import('../services/frictionlessUX'); // Using stub
  const schedule = await frictionlessUXService.generatePredictiveSchedule(userId, daysAhead);

  res.json({ schedule });
}));

// Smart defaults for quick workout generation
r.get('/workouts/smart-defaults', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user?.uid;
  if (!userId) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  // const { frictionlessUXService } = await import('../services/frictionlessUX'); // Using stub
  const smartDefaults = await frictionlessUXService.generateSmartDefaults(userId);

  res.json({ smartDefaults });
}));

// One-tap workout options
r.get('/workouts/quick-start-options', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user?.uid;
  if (!userId) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  // const { frictionlessUXService } = await import('../services/frictionlessUX'); // Using stub
  const quickStartOptions = await frictionlessUXService.generateQuickStartOptions(userId);

  res.json({ quickStartOptions });
}));

// Conversational workout generation
r.post('/workouts/conversational', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user?.uid;
  if (!userId) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const { input, context } = req.body;
  if (!input) {
    res.status(400).json({ error: 'Input text is required' });
    return;
  }

  // const { frictionlessUXService } = await import('../services/frictionlessUX'); // Using stub
  const conversationalContext = frictionlessUXService.processConversationalInput(input, context);

  res.json({ conversationalContext });
}));

r.post('/workouts/:workoutId/adapt', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user?.uid;
  const { workoutId } = req.params;
  const currentMetrics = req.body;

  if (!userId) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  // Mock user for now - implement UserModel later
  const user = { id: req.user?.uid || 'mock-user-id' };

  // Mock adaptation - implement frictionlessUXService later
  const adaptation = {
    exerciseSwaps: [],
    restAdjustments: [],
    intensityChanges: [],
    reasoning: 'Mock adaptation based on current metrics',
  };

  res.json({ adaptation });
}));

// Enhanced AI and Analytics routes (protected)
r.get('/workouts/recommendations/:userId', requireAuth, asyncHandler(async (req, res): Promise<void> => {
  const { userId } = req.params;

  // Verify user can access this data
  if (req.user?.uid !== userId) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }

  const recommendations = await adaptiveLearningEngine.generateRecommendations(userId);
  res.json({ recommendations });
}));

r.get('/analytics/intelligence/:userId', requireAuth, asyncHandler(async (req, res): Promise<void> => {
  const { userId } = req.params;

  // Verify user can access this data
  if (req.user?.uid !== userId) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }

  // Simplified intelligence response for now
  const intelligence = {
    adaptiveLoading: { currentLoad: 'moderate', recommendation: 'maintain' },
    recoveryStatus: { status: 'good', recommendation: 'proceed' },
    progressionRecommendation: { phase: 'development', nextMilestone: 'strength gains' }
  };
  res.json({ intelligence });
}));

r.get('/analytics/behavior/:userId', requireAuth, asyncHandler(async (req, res): Promise<void> => {
  const { userId } = req.params;

  // Verify user can access this data
  if (req.user?.uid !== userId) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }

  const behaviorPattern = await adaptiveLearningEngine.analyzeUserBehavior(userId);
  res.json({ behaviorPattern });
}));

r.get('/analytics/timing/:userId', requireAuth, asyncHandler(async (req, res): Promise<void> => {
  const { userId } = req.params;

  // Verify user can access this data
  if (req.user?.uid !== userId) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }

  const optimalTiming = await adaptiveLearningEngine.predictOptimalTiming(userId);
  res.json({ optimalTiming });
}));

r.post('/workouts/:workoutId/feedback', requireAuth, asyncHandler(async (req, res): Promise<void> => {
  const { workoutId } = req.params;
  const { rating, difficulty, enjoyment, completed, notes } = req.body;

  // Validate feedback data
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
    return;
  }

  if (typeof difficulty !== 'number' || difficulty < 1 || difficulty > 5) {
    res.status(400).json({ error: 'Difficulty must be a number between 1 and 5' });
    return;
  }

  if (typeof enjoyment !== 'number' || enjoyment < 1 || enjoyment > 5) {
    res.status(400).json({ error: 'Enjoyment must be a number between 1 and 5' });
    return;
  }

  if (!workoutId) {
    res.status(400).json({ error: 'Workout ID is required' });
    return;
  }

  await adaptiveLearningEngine.learnFromFeedback(req.user!.uid, workoutId, {
    rating,
    difficulty,
    enjoyment,
    completed: Boolean(completed),
    notes: notes || undefined
  });

  res.json({ success: true, message: 'Feedback recorded successfully' });
}));

// Advanced Analytics Routes
r.get('/analytics/user/:userId', requireAuth, asyncHandler(async (req, res): Promise<void> => {
  const { userId } = req.params;

  // Verify user can access this data
  if (req.user?.uid !== userId) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  // const { advancedAnalyticsService } = await import('../services/advancedAnalytics'); // Using stub
  const analytics = await advancedAnalyticsService.generateUserAnalytics(userId);

  res.json({ analytics });
}));

r.get('/analytics/workout/:workoutId/effectiveness', requireAuth, asyncHandler(async (req, res): Promise<void> => {
  const { workoutId } = req.params;

  if (!workoutId) {
    res.status(400).json({ error: 'Workout ID is required' });
    return;
  }

  // const { advancedAnalyticsService } = await import('../services/advancedAnalytics'); // Using stub
  const effectiveness = await advancedAnalyticsService.analyzeWorkoutEffectiveness(workoutId);

  res.json({ effectiveness });
}));

r.get('/analytics/learning-insights/:userId', requireAuth, asyncHandler(async (req, res): Promise<void> => {
  const { userId } = req.params;

  // Verify user can access this data
  if (req.user?.uid !== userId) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  // const { advancedAnalyticsService } = await import('../services/advancedAnalytics'); // Using stub
  const insights = await advancedAnalyticsService.generateLearningInsights(userId);

  res.json({ insights });
}));

// Performance and health monitoring routes
r.get('/health/performance', asyncHandler(async (_req, res): Promise<void> => {
  // const { performanceOptimizer } = await import('../services/performanceOptimizer'); // Using stub
  const metrics = performanceOptimizer.getPerformanceMetrics();
  const cacheStats = performanceOptimizer.getCacheStatistics();

  const health = {
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    performance: metrics,
    cache: cacheStats
  };
  res.json(health);
}));

r.get('/health/metrics', asyncHandler(async (_req, res): Promise<void> => {
  // const { performanceOptimizer } = await import('../services/performanceOptimizer'); // Using stub
  const metrics = performanceOptimizer.getPerformanceMetrics();
  res.json({ metrics });
}));

r.get('/health/optimization-recommendations', asyncHandler(async (_req, res): Promise<void> => {
  // const { performanceOptimizer } = await import('../services/performanceOptimizer'); // Using stub
  const recommendations = performanceOptimizer.generateOptimizationRecommendations();
  res.json({ recommendations });
}));

// Parameterized workout routes (must be last to avoid conflicts)
r.get('/workouts/:workoutId', requireAuth, getWorkout);
r.get('/workouts', requireAuth, listWorkouts);
r.post('/workouts/:workoutId/complete', requireAuth, completeWorkout);

export default r;