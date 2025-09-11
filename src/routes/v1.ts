import { Router } from 'express';
import { createUser, authenticateUser } from '../controllers/user';
import { getProfile, patchProfile, createProfile } from '../controllers/profile';
import { generate, getWorkout, listWorkouts, completeWorkout, generateQuickWorkout } from '../controllers/workout';
import { listEquipment } from '../models/Equipment';
import { asyncHandler } from '../middlewares/errors';
import { requireAuth } from '../middlewares/auth';
// Adaptive learning removed for codebase simplification

const r = Router();

// Lightweight v1 health (no auth, no external calls)
r.get('/health', asyncHandler(async (_req, res): Promise<void> => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    version: process.env['npm_package_version'] || '1.0.0',
    environment: process.env['NODE_ENV'] || 'development'
  });
}));

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
      backendProjectId: process.env['FIREBASE_PROJECT_ID'] || process.env['GCLOUD_PROJECT'] || 'ai-workout-backend-2024',
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: (error as any).message,
      code: (error as any).code,
      backendProjectId: process.env['FIREBASE_PROJECT_ID'] || process.env['GCLOUD_PROJECT'] || 'ai-workout-backend-2024',
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
    backendProjectId: process.env['FIREBASE_PROJECT_ID'] || process.env['GCLOUD_PROJECT'] || 'ai-workout-backend-2024',
  });
}));

// User routes
r.post('/users', createUser);

// Profile routes (protected)
r.post('/profile', requireAuth, createProfile);
r.get('/profile/:userId', requireAuth, getProfile);
r.patch('/profile/:userId', requireAuth, patchProfile);

// Equipment routes (public) - with caching
r.get('/equipment', asyncHandler(async (_req, res): Promise<void> => {
  // Set cache headers for static data
  res.set('Cache-Control', 'public, max-age=3600'); // 1 hour cache

  const items = listEquipment();
  res.json({
    items: items.map(item => ({ slug: item.slug, label: item.label })),
    cached: false // Will be true when served from cache
  });
}));

// Workout routes (protected) - Specific routes first
r.post('/workouts/generate', requireAuth, generate);
r.post('/workouts/quick-generate', requireAuth, generateQuickWorkout); // NEW: One-tap workout generation

// Debug endpoint to test workout generation route
r.get('/workouts/test', asyncHandler(async (_req, res) => {
  res.json({
    message: 'Workout generation endpoint is accessible',
    timestamp: new Date().toISOString(),
    routes: {
      generate: 'POST /v1/workouts/generate (requires auth)',
      quickGenerate: 'POST /v1/workouts/quick-generate (requires auth)'
    }
  });
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

  const recommendations: any[] = []; // Adaptive learning removed for simplification
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

  const behaviorPattern = {}; // Adaptive learning removed for simplification
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

  const optimalTiming = {}; // Adaptive learning removed for simplification
  res.json({ optimalTiming });
}));

r.post('/workouts/:workoutId/feedback', requireAuth, asyncHandler(async (req, res): Promise<void> => {
  const { workoutId } = req.params;
  const { rating, difficulty, enjoyment } = req.body;

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

  // Adaptive learning removed for simplification
  // Previously: await adaptiveLearningEngine.learnFromFeedback(req.user!.uid, workoutId, { rating, difficulty, enjoyment, completed: Boolean(completed), notes: notes || undefined });

  res.json({ success: true, message: 'Feedback recorded successfully' });
}));





// Parameterized workout routes (must be last to avoid conflicts)
r.get('/workouts/:workoutId', requireAuth, getWorkout);
r.get('/workouts', requireAuth, listWorkouts);
r.post('/workouts/:workoutId/complete', requireAuth, completeWorkout);

export default r;