import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errors';
import { z } from 'zod';
import { PreWorkoutSchema } from '../schemas/preworkout';
import { buildWorkoutPrompt } from '../services/prompt';
import { generateWorkout } from '../services/generator';
import { WorkoutPlanModel } from '../models/WorkoutPlan';
import { WorkoutSessionModel } from '../models/WorkoutSession';
import { isValidObjectId } from '../utils/validation';

// Validation schemas
const CompleteWorkoutSchema = z.object({
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  feedback: z.record(z.any()).optional()
});

const PROMPT_VERSION = 'v1.0.1';

export const generate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const pre = PreWorkoutSchema.parse(req.body);

  // Idempotency: reuse identical requests (per prompt version)
  const dup = await WorkoutPlanModel.findOne({ userId: pre.userId, promptVersion: PROMPT_VERSION, preWorkout: pre });
  if (dup) {
    res.json({ workoutId: dup.id, plan: dup.plan, deduped: true });
    return;
  }

  const prompt = await buildWorkoutPrompt(pre.userId, pre);
  const plan = await generateWorkout(prompt);

  const wp = await WorkoutPlanModel.create({
    userId: pre.userId,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    promptVersion: PROMPT_VERSION,
    preWorkout: pre,
    plan
  });

  res.status(201).json({ workoutId: wp.id, plan });
});

export const getWorkout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { workoutId } = req.params;

  if (!workoutId || !isValidObjectId(workoutId)) {
    res.status(400).json({ error: 'Invalid workoutId format' });
    return;
  }

  const w = await WorkoutPlanModel.findById(workoutId);
  if (!w) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json({ workoutId: w.id, plan: w.plan, meta: { createdAt: w.createdAt, model: w.model } });
});

export const listWorkouts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.query;
  if (!userId || typeof userId !== 'string') {
    res.status(400).json({ error: 'userId query parameter is required' });
    return;
  }

  const items = await WorkoutPlanModel.find({ userId }, { sort: { createdAt: -1 }, limit: 20, select: { plan: 0 } });
  res.json({ items: items.map(x => ({ id: x.id, createdAt: x.createdAt, model: x.model })) });
});

export const completeWorkout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { workoutId: planId } = req.params;

  if (!planId || !isValidObjectId(planId)) {
    res.status(400).json({ error: 'Invalid workoutId format' });
    return;
  }

  const validatedData = CompleteWorkoutSchema.parse(req.body ?? {});

  const workoutPlan = await WorkoutPlanModel.findById(planId);
  if (!workoutPlan) {
    res.status(404).json({ error: 'Workout plan not found' });
    return;
  }

  const session = await WorkoutSessionModel.create({
    planId,
    userId: workoutPlan.userId,
    startedAt: validatedData.startedAt ? new Date(validatedData.startedAt) : undefined,
    completedAt: validatedData.completedAt ? new Date(validatedData.completedAt) : new Date(),
    feedback: validatedData.feedback ?? {}
  });
  res.status(201).json({ session });
});