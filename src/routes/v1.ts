import { Router } from 'express';
import { createUser, authenticateUser } from '../controllers/user';
import { getProfile, patchProfile, createProfile } from '../controllers/profile';
import { generate, getWorkout, listWorkouts, completeWorkout } from '../controllers/workout';
import { EquipmentModel } from '../models/Equipment';
import { asyncHandler } from '../middlewares/errors';
import { requireAuth } from '../middlewares/auth';

const r = Router();

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

// Equipment routes (public)
r.get('/equipment', asyncHandler(async (_req, res): Promise<void> => {
  const items = await EquipmentModel.find();
  res.json({ items: items.map(i => ({ slug: i.slug, label: i.label })) });
}));

// Workout routes (protected)
r.post('/workouts/generate', requireAuth, generate);
r.get('/workouts/:workoutId', requireAuth, getWorkout);
r.get('/workouts', requireAuth, listWorkouts);
r.post('/workouts/:workoutId/complete', requireAuth, completeWorkout);

export default r;