import { Router } from 'express';
import { createUser } from '../controllers/user';
import { getProfile, patchProfile } from '../controllers/profile';
import { generate, getWorkout, listWorkouts, completeWorkout } from '../controllers/workout';
import { EquipmentModel } from '../models/Equipment';
import { asyncHandler } from '../middlewares/errors';

const r = Router();

// User routes
r.post('/users', createUser);

// Profile routes
r.get('/profile/:userId', getProfile);
r.patch('/profile/:userId', patchProfile);

// Equipment routes
r.get('/equipment', asyncHandler(async (_req, res): Promise<void> => {
  const items = await EquipmentModel.find();
  res.json({ items: items.map(i => ({ slug: i.slug, label: i.label })) });
}));

// Workout routes
r.post('/workouts/generate', generate);
r.get('/workouts/:workoutId', getWorkout);
r.get('/workouts', listWorkouts);
r.post('/workouts/:workoutId/complete', completeWorkout);

export default r;