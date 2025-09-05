import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errors';
import { buildWorkoutPrompt } from '../services/prompt';
import { generateWorkout } from '../services/generator';
import { WorkoutPlanModel } from '../models/WorkoutPlan';
import { WorkoutSessionModel } from '../models/WorkoutSession';
import {
  isValidObjectId,
  GenerateWorkoutSchema,
  CompleteWorkoutSchema
} from '../utils/validation';
import { UserModel } from '../models/User';
import {
  generateSetsProgramming,
  generateProgressiveReps,
  type WorkoutProgrammingOptions
} from '../services/workoutProgramming';
import { frictionlessUXService } from '../services/frictionlessUX';
import { workoutIntelligenceAdvanced } from '../services/workoutIntelligenceAdvanced';
import { workoutProgrammingEngine } from '../services/workoutProgrammingEngine';

const PROMPT_VERSION = 'v1.0.1';

// Ensure exercises have proper sets programming using advanced programming service
function ensureProperSets(
  exercise: any,
  exerciseType: 'warmup' | 'main' | 'cooldown',
  programmingOptions?: WorkoutProgrammingOptions
): any {
  if (!exercise.sets || exercise.sets.length === 0 || (exercise.sets.length === 1 && exerciseType === 'main')) {
    // Determine exercise category for programming
    const exerciseName = exercise.name?.toLowerCase() || '';
    let category: 'compound' | 'isolation' | 'cardio' | 'core' | 'mobility' = 'isolation';

    if (exerciseType === 'warmup' || exerciseType === 'cooldown') {
      category = 'mobility';
    } else if (exerciseName.includes('squat') || exerciseName.includes('deadlift') ||
               exerciseName.includes('press') || exerciseName.includes('row') ||
               exerciseName.includes('pull-up') || exerciseName.includes('chin-up')) {
      category = 'compound';
    } else if (exerciseName.includes('plank') || exerciseName.includes('crunch') ||
               exerciseName.includes('core') || exerciseName.includes('abs')) {
      category = 'core';
    } else if (exerciseName.includes('cardio') || exerciseName.includes('hiit') ||
               exerciseName.includes('burpee') || exerciseName.includes('jump')) {
      category = 'cardio';
    }

    // Use advanced programming if options provided, otherwise use defaults
    if (programmingOptions && exerciseType === 'main') {
      const programming = generateSetsProgramming(category, programmingOptions);
      const progressiveReps = generateProgressiveReps(programming, category);

      exercise.sets = progressiveReps.map((reps, i) => ({
        reps: category === 'cardio' ? 0 : reps,
        time_sec: category === 'cardio' ? 30 + (i * 5) : 0, // Progressive time for cardio
        rest_sec: programming.restSeconds,
        tempo: programming.tempoPattern,
        intensity: programming.intensityProgression[i] || 'moderate',
        notes: i === 0 ? 'warm-up set' : i === progressiveReps.length - 1 ? 'final set' : 'working set',
        weight_guidance: i === 0 ? 'light' : i === progressiveReps.length - 1 ? 'heavy' : 'moderate',
        rpe: programming.rpeProgression[i] || (6 + i),
        rest_type: programming.restSeconds > 120 ? 'complete' : 'active'
      }));
    } else {
      // Fallback to simple programming
      const defaultSets = exerciseType === 'warmup' || exerciseType === 'cooldown' ? 1 : 3;
      const defaultReps = exerciseType === 'warmup' ? 10 : exerciseType === 'cooldown' ? 8 : 12;
      const defaultRest = exerciseType === 'warmup' ? 30 : exerciseType === 'cooldown' ? 30 : 90;

      exercise.sets = Array.from({ length: defaultSets }, (_, i) => ({
        reps: category === 'cardio' ? 0 : Math.max(5, defaultReps - (i * 2)),
        time_sec: category === 'cardio' ? 30 + (i * 10) : 0,
        rest_sec: defaultRest,
        tempo: '2-1-2-1',
        intensity: i === 0 ? 'moderate' : i === defaultSets - 1 ? 'high' : 'moderate',
        notes: i === 0 ? 'warm-up set' : i === defaultSets - 1 ? 'final set' : 'working set',
        weight_guidance: i === 0 ? 'light' : i === defaultSets - 1 ? 'heavy' : 'moderate',
        rpe: Math.min(9, 6 + i),
        rest_type: 'active'
      }));
    }
  }

  return exercise;
}

// Transform AI output format to frontend format
function transformAIPlanToFrontendFormat(aiPlan: any, programmingOptions?: WorkoutProgrammingOptions) {
  const formatRestTime = (restSec: number): string => {
    if (restSec >= 60) {
      const minutes = Math.floor(restSec / 60);
      const seconds = restSec % 60;
      return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
    }
    return `${restSec}s`;
  };

  const transformExercise = (exercise: any) => {
    const firstSet = exercise.sets?.[0] || {};
    const isTimeBased = firstSet.time_sec > 0;
    const isRepBased = firstSet.reps > 0;

    // Create comprehensive exercise info
    let repsDisplay = 'N/A';
    let durationDisplay = undefined;

    if (isRepBased) {
      repsDisplay = firstSet.reps.toString();
    } else if (isTimeBased) {
      repsDisplay = 'Time-based';
      durationDisplay = `${firstSet.time_sec}s`;
    }

    return {
      name: exercise.display_name || exercise.name,
      sets: exercise.sets?.length || 1,
      reps: repsDisplay,
      duration: durationDisplay,
      rest: firstSet.rest_sec ? formatRestTime(firstSet.rest_sec) : undefined,
      weight: firstSet.weight_guidance || undefined,
      tempo: firstSet.tempo || undefined,
      intensity: firstSet.intensity || undefined,
      rpe: firstSet.rpe || undefined,
      restType: firstSet.rest_type || 'active',
      notes: firstSet.notes || exercise.notes || undefined,
      equipment: exercise.equipment?.join(', ') || undefined,
      primaryMuscles: exercise.primary_muscles?.join(', ') || undefined,
      instructions: exercise.instructions || undefined,
    };
  };

  const transformWarmupCooldown = (item: any) => ({
    name: item.name,
    sets: 1,
    reps: 'Time-based',
    duration: item.duration_sec ? `${item.duration_sec}s` : undefined,
    rest: '10s', // Short transition time for warmup/cooldown
    notes: item.cues || undefined,
    instructions: item.instructions || undefined,
  });

  // Extract main exercises from blocks with block information
  const mainExercises = aiPlan.blocks?.flatMap((block: any, blockIndex: number) => {
    const blockExercises = block.exercises?.map((exercise: any, exerciseIndex: number) => {
      // Ensure proper sets before transformation
      const exerciseWithSets = ensureProperSets(exercise, 'main', programmingOptions);
      return {
        ...transformExercise(exerciseWithSets),
        blockName: block.name,
        blockIndex,
        exerciseIndex,
      };
    }) || [];
    return blockExercises;
  }) || [];

  // Add finisher exercises to main exercises with enhanced formatting
  const finisherExercises = aiPlan.finisher?.map((item: any, index: number) => ({
    name: item.name,
    sets: item.rounds || 1,
    reps: 'Time-based',
    duration: `${item.work_sec}s work`,
    rest: formatRestTime(item.rest_sec),
    restType: 'active',
    notes: item.notes || 'High intensity finisher',
    blockName: 'Finisher',
    blockIndex: (aiPlan.blocks?.length || 0) + 1,
    exerciseIndex: index,
  })) || [];

  return {
    meta: aiPlan.meta || {},
    warmup: aiPlan.warmup?.map((exercise: any) => {
      const exerciseWithSets = ensureProperSets(exercise, 'warmup', programmingOptions);
      return transformWarmupCooldown(exerciseWithSets);
    }) || [],
    exercises: [...mainExercises, ...finisherExercises],
    cooldown: aiPlan.cooldown?.map((exercise: any) => {
      const exerciseWithSets = ensureProperSets(exercise, 'cooldown', programmingOptions);
      return transformWarmupCooldown(exerciseWithSets);
    }) || [],
    notes: aiPlan.notes || '',
    estimatedDuration: aiPlan.meta?.est_duration_min || undefined,
  };
}

export const generate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    // Parse frontend request format
    const frontendData = GenerateWorkoutSchema.parse(req.body);

    // Get Firebase UID from auth middleware
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) {
      res.status(401).json({ error: 'User not authenticated', code: 'AUTH_REQUIRED' });
      return;
    }

    // Get user ID from authenticated request
    const userId = req.user?.uid;
    if (!userId) {
      res.status(401).json({ error: 'User ID not found in request', code: 'USER_ID_MISSING' });
      return;
    }

    console.log('Workout generation started for user:', userId);

  // Convert frontend format to backend PreWorkout format
  const pre = {
    userId,
    time_available_min: frontendData.duration,
    energy_level: 3, // Default to medium energy
    workout_type: frontendData.workoutType.toLowerCase().replace(/[^a-z0-9]/g, '_') as any,
    equipment_override: frontendData.equipmentAvailable,
    new_injuries: frontendData.constraints?.join(', ') || undefined,
    // Use data from request (which comes from profile)
    experience: frontendData.experience,
    goals: frontendData.goals,
  };

  console.log('Pre-workout data being sent to prompt:', pre);
  console.log('Workout generation request:', {
    userId,
    workoutType: frontendData.workoutType,
    experience: frontendData.experience,
    duration: frontendData.duration,
    equipment: frontendData.equipmentAvailable,
    goals: frontendData.goals
  });

  // Idempotency: reuse identical requests (per prompt version)
  const dup = await WorkoutPlanModel.findOne({ userId: pre.userId, promptVersion: PROMPT_VERSION, preWorkout: pre });
  if (dup) {
    res.json({ workoutId: dup.id, plan: dup.plan, deduped: true });
    return;
  }

  const promptData = await buildWorkoutPrompt(pre.userId, pre);
  const aiPlan = await generateWorkout(promptData, {
    workoutType: pre.workout_type,
    experience: pre.experience,
    duration: pre.time_available_min
  });

  // Create programming options for advanced sets/reps programming
  const programmingOptions: WorkoutProgrammingOptions = {
    experience: pre.experience as 'beginner' | 'intermediate' | 'advanced',
    primaryGoal: pre.goals?.[0] || 'general_fitness',
    workoutType: pre.workout_type,
    timeAvailable: pre.time_available_min,
    equipmentLevel: pre.equipment_override?.includes('full_gym') ? 'full' :
                   pre.equipment_override?.length > 3 ? 'moderate' : 'minimal'
  };

  // Get advanced programming recommendations
  const adaptiveLoading = await workoutProgrammingEngine.generateAdaptiveLoading(pre.userId, programmingOptions);
  const biomechanicalConsiderations = await workoutProgrammingEngine.assessBiomechanicalConsiderations(pre.userId, programmingOptions);

  // Transform AI output to frontend format with advanced programming
  const transformedPlan = transformAIPlanToFrontendFormat(aiPlan, programmingOptions);

  const wp = await WorkoutPlanModel.create({
    userId: pre.userId,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    promptVersion: PROMPT_VERSION,
    preWorkout: pre,
    plan: transformedPlan
  });

  res.status(201).json({ workoutId: wp.id, plan: transformedPlan });

  } catch (error) {
    console.error('Workout generation error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Profile not found')) {
        res.status(400).json({
          error: 'Profile not found. Please complete your profile setup first.',
          code: 'PROFILE_REQUIRED',
          details: 'A user profile is required to generate personalized workouts.'
        });
        return;
      }

      if (error.message.includes('OpenAI')) {
        res.status(503).json({
          error: 'AI service temporarily unavailable. Please try again.',
          code: 'AI_SERVICE_ERROR'
        });
        return;
      }
    }

    // Generic error response
    res.status(500).json({
      error: 'Failed to generate workout. Please try again.',
      code: 'GENERATION_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
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

  // Return the full workout data including preWorkout information
  res.json({
    id: w.id,
    userId: w.userId,
    model: w.model,
    promptVersion: w.promptVersion,
    preWorkout: w.preWorkout,
    plan: w.plan,
    createdAt: w.createdAt.toDate().toISOString()
  });
});

export const listWorkouts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.query;
  if (!userId || typeof userId !== 'string') {
    res.status(400).json({ error: 'userId query parameter is required' });
    return;
  }

  // Get completed workout sessions for this user (sorted by completion date)
  const workoutSessions = await WorkoutSessionModel.find({ userId }, { sort: { completedAt: -1 }, limit: 20 });

  // Get the workout plans for completed sessions by fetching them individually
  const workouts = [];
  for (const session of workoutSessions) {
    try {
      const plan = await WorkoutPlanModel.findById(session.planId);
      if (plan && plan.userId === userId) {
        workouts.push({
          id: plan.id,
          userId: plan.userId,
          model: plan.model,
          promptVersion: plan.promptVersion,
          preWorkout: plan.preWorkout,
          plan: plan.plan,
          createdAt: plan.createdAt.toDate().toISOString(),
          // Add completion information
          completedAt: session.completedAt?.toDate().toISOString(),
          feedback: session.feedback,
          isCompleted: true // All workouts in history are completed
        });
      }
    } catch (error) {
      console.error(`Failed to fetch workout plan ${session.planId}:`, error);
      // Continue with other sessions
    }
  }

  res.json({ workouts });
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
    feedback: {
      comment: validatedData.feedback || '',
      rating: validatedData.rating || undefined
    }
  });
  res.status(201).json({
    sessionId: session.id,
    workoutPlanId: planId,
    completedAt: session.completedAt,
    feedback: session.feedback
  });
});

// NEW: Quick workout generation with intelligent defaults
export const generateQuickWorkout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const firebaseUid = req.user?.uid;
  if (!firebaseUid) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const user = await UserModel.findByEmail(req.user?.email!);
  if (!user) {
    res.status(401).json({ error: 'User not found in database' });
    return;
  }

  const userId = user.id!;

  try {
    // Get intelligent workout options
    const quickOptions = await frictionlessUXService.generateQuickWorkoutOptions(userId);

    // Use the quick start option for immediate generation
    const quickStart = quickOptions.quickStart;

    console.log('🚀 Quick workout generation with smart defaults:', quickStart);

    // Convert to backend format
    const pre = {
      userId,
      time_available_min: quickStart.duration,
      energy_level: 3, // Default to medium energy
      workout_type: quickStart.workoutType.toLowerCase().replace(/[^a-z0-9]/g, '_') as any,
      equipment_override: quickStart.equipmentAvailable,
      new_injuries: quickStart.constraints?.join(', ') || undefined,
      experience: 'intermediate', // Will be overridden by profile data
      goals: ['general_fitness'], // Will be overridden by profile data
    };

    // Check for duplicate (idempotency)
    const dup = await WorkoutPlanModel.findOne({ userId: pre.userId, promptVersion: PROMPT_VERSION, preWorkout: pre });
    if (dup) {
      res.json({
        workoutId: dup.id,
        plan: dup.plan,
        deduped: true,
        quickOptions: quickOptions,
        reasoning: quickOptions.reasoning
      });
      return;
    }

    const promptData = await buildWorkoutPrompt(pre.userId, pre);
    const aiPlan = await generateWorkout(promptData, {
      workoutType: pre.workout_type,
      experience: pre.experience,
      duration: pre.time_available_min
    });

    // Validation and programming options (same as regular generation)
    if (aiPlan.blocks) {
      aiPlan.blocks.forEach((block: any) => {
        if (block.exercises) {
          block.exercises.forEach((exercise: any) => {
            if (!exercise.sets || exercise.sets.length < 2) {
              console.warn(`⚠️ Quick AI generated ${exercise.sets?.length || 0} sets for main exercise: ${exercise.display_name || exercise.name}`);
            }
          });
        }
      });
    }

    const programmingOptions: WorkoutProgrammingOptions = {
      experience: pre.experience as 'beginner' | 'intermediate' | 'advanced',
      primaryGoal: pre.goals?.[0] || 'general_fitness',
      workoutType: pre.workout_type,
      timeAvailable: pre.time_available_min,
      equipmentLevel: pre.equipment_override?.includes('full_gym') ? 'full' :
                     pre.equipment_override?.length > 3 ? 'moderate' : 'minimal'
    };

    const transformedPlan = transformAIPlanToFrontendFormat(aiPlan, programmingOptions);

    const wp = await WorkoutPlanModel.create({
      userId: pre.userId,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      promptVersion: PROMPT_VERSION,
      preWorkout: pre,
      plan: transformedPlan
    });

    res.status(201).json({
      workoutId: wp.id,
      plan: transformedPlan,
      quickOptions: quickOptions,
      reasoning: quickOptions.reasoning,
      confidence: quickStart.confidence
    });

  } catch (error) {
    console.error('Quick workout generation error:', error);
    res.status(500).json({
      error: 'Failed to generate quick workout',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});