"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQuickWorkout = exports.completeWorkout = exports.listWorkouts = exports.getWorkout = exports.generate = void 0;
const pino_1 = __importDefault(require("pino"));
// Core dependencies
const errors_1 = require("../middlewares/errors");
// import { buildWorkoutPrompt } from '../services/prompt'; // Temporarily disabled
const generator_1 = require("../services/generator");
// Data models
const WorkoutPlan_1 = require("../models/WorkoutPlan");
const WorkoutSession_1 = require("../models/WorkoutSession");
const User_1 = require("../models/User");
// Validation and utilities
const validation_1 = require("../utils/validation");
// Initialize logger for this controller
const baseLogger = (0, pino_1.default)({
    name: 'workout-controller',
    level: process.env['NODE_ENV'] === 'development' ? 'debug' : 'info'
});
// Create logger wrapper that accepts any parameters
const logger = {
    info: (msg, obj) => baseLogger.info(obj || {}, msg),
    error: (msg, obj) => baseLogger.error(obj || {}, msg),
    warn: (msg, obj) => baseLogger.warn(obj || {}, msg),
    debug: (msg, obj) => baseLogger.debug(obj || {}, msg),
};
// Temporary stub implementations for disabled services
const buildWorkoutPrompt = async (userId, preWorkout) => {
    return {
        prompt: `Create a ${preWorkout.workout_type} workout for ${preWorkout.time_available_min} minutes at ${preWorkout.experience} level.`,
        variant: preWorkout
    };
};
const generateSetsProgramming = (category, options) => {
    return {
        sets: 3,
        reps: [10, 10, 10],
        rest: 60,
        restSeconds: 60,
        tempoPattern: '2-1-2-1',
        intensityProgression: ['moderate', 'moderate', 'moderate'],
        rpeProgression: [6, 7, 8]
    };
};
const generateProgressiveReps = (programming, category) => {
    return [10, 10, 10];
};
/**
 * Current prompt version for workout generation
 * Used for caching and A/B testing different prompt variations
 */
const PROMPT_VERSION = 'v2.1.0';
/**
 * Configuration constants for workout generation
 */
const WORKOUT_CONFIG = {
    MAX_GENERATION_TIME_MS: 120_000, // 2 minutes
    CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes
    MAX_RETRY_ATTEMPTS: 3,
    DEFAULT_TIMEOUT_MS: 30_000
};
/**
 * Generates a unique request ID for tracking and logging
 * @returns Unique request identifier
 */
function generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
/**
 * Formats rest time in seconds to a human-readable string
 * @param seconds - Rest time in seconds
 * @returns Formatted rest time string
 */
function formatRestTime(seconds) {
    if (seconds >= 60) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }
    return `${seconds}s`;
}
/**
 * Normalizes workout type from frontend format to backend enum
 * @param workoutType - Frontend workout type string
 * @returns Normalized workout type for backend processing
 */
function normalizeWorkoutType(workoutType) {
    return workoutType.toLowerCase().replace(/[^a-z0-9]/g, '_');
}
/**
 * Determines equipment level based on available equipment
 * @param equipmentOverride - Array of available equipment
 * @returns Equipment level classification
 */
function determineEquipmentLevel(equipmentOverride) {
    if (!equipmentOverride || equipmentOverride.length === 0) {
        return 'minimal';
    }
    if (equipmentOverride.includes('full_gym')) {
        return 'full';
    }
    return equipmentOverride.length > 3 ? 'moderate' : 'minimal';
}
/**
 * Ensure exercises have proper sets programming using advanced programming service
 * Applies intelligent programming based on exercise type and user experience level
 */
function ensureProperSets(exercise, exerciseType, programmingOptions) {
    if (!exercise.sets || exercise.sets.length === 0 || (exercise.sets.length === 1 && exerciseType === 'main')) {
        // Determine exercise category for programming
        const exerciseName = exercise.name?.toLowerCase() || '';
        let category = 'isolation';
        if (exerciseType === 'warmup' || exerciseType === 'cooldown') {
            category = 'mobility';
        }
        else if (exerciseName.includes('squat') || exerciseName.includes('deadlift') ||
            exerciseName.includes('press') || exerciseName.includes('row') ||
            exerciseName.includes('pull-up') || exerciseName.includes('chin-up')) {
            category = 'compound';
        }
        else if (exerciseName.includes('plank') || exerciseName.includes('crunch') ||
            exerciseName.includes('core') || exerciseName.includes('abs')) {
            category = 'core';
        }
        else if (exerciseName.includes('cardio') || exerciseName.includes('hiit') ||
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
        }
        else {
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
// Transform database format to frontend format
function transformDatabasePlanToFrontendFormat(dbPlan) {
    console.log('🔄 Transforming database plan to frontend format:', JSON.stringify(dbPlan, null, 2));
    // Extract warmup exercises
    const warmupExercises = dbPlan.warm_up?.exercises || dbPlan.warmup || [];
    console.log('🔥 Warmup exercises found:', warmupExercises.length);
    // Extract main exercises from blocks
    const mainExercises = dbPlan.blocks?.[0]?.exercises || dbPlan.exercises || [];
    console.log('💪 Main exercises found:', mainExercises.length);
    // Extract cooldown exercises
    const cooldownExercises = dbPlan.cool_down?.exercises || dbPlan.cooldown || [];
    console.log('🧘 Cooldown exercises found:', cooldownExercises.length);
    const transformedPlan = {
        meta: dbPlan.meta || {},
        warmup: warmupExercises.map((exercise) => ({
            name: exercise.name || 'Unknown Exercise',
            sets: exercise.sets || 1,
            reps: exercise.reps || '10',
            duration: exercise.duration_sec ? `${exercise.duration_sec}s` : '30s',
            rest: '30s',
            notes: exercise.notes || '',
        })),
        exercises: mainExercises.map((exercise, index) => ({
            name: exercise.name || 'Unknown Exercise',
            sets: exercise.sets || 1,
            reps: exercise.reps || '10',
            weight: exercise.weight || '',
            duration: exercise.duration_sec ? `${exercise.duration_sec}s` : undefined,
            rest: exercise.rest_sec ? `${exercise.rest_sec}s` : '60s',
            notes: exercise.notes || '',
            equipment: exercise.equipment || [],
            muscleGroups: exercise.muscle_groups || [],
            blockName: dbPlan.blocks?.[0]?.name || 'Main Workout',
            blockIndex: 0,
            exerciseIndex: index,
        })),
        cooldown: cooldownExercises.map((exercise) => ({
            name: exercise.name || 'Unknown Exercise',
            sets: exercise.sets || 1,
            reps: exercise.reps || '10',
            duration: exercise.duration_sec ? `${exercise.duration_sec}s` : '30s',
            rest: '30s',
            notes: exercise.notes || '',
        })),
        notes: dbPlan.blocks?.[0]?.notes || '',
        estimatedDuration: dbPlan.meta?.est_duration_min || undefined,
    };
    console.log('✅ Transformed plan summary:', {
        warmupCount: transformedPlan.warmup.length,
        exercisesCount: transformedPlan.exercises.length,
        cooldownCount: transformedPlan.cooldown.length,
        estimatedDuration: transformedPlan.estimatedDuration
    });
    return transformedPlan;
}
// Transform AI output format to frontend format
function transformAIPlanToFrontendFormat(aiPlan, programmingOptions) {
    const formatRestTime = (restSec) => {
        if (restSec >= 60) {
            const minutes = Math.floor(restSec / 60);
            const seconds = restSec % 60;
            return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
        }
        return `${restSec}s`;
    };
    const transformExercise = (exercise) => {
        const firstSet = exercise.sets?.[0] || {};
        const isTimeBased = firstSet.time_sec > 0;
        const isRepBased = firstSet.reps > 0;
        // Create comprehensive exercise info
        let repsDisplay = 'N/A';
        let durationDisplay = undefined;
        if (isRepBased) {
            repsDisplay = firstSet.reps.toString();
        }
        else if (isTimeBased) {
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
    const transformWarmupCooldown = (item) => ({
        name: item.name,
        sets: 1,
        reps: 'Time-based',
        duration: item.duration_sec ? `${item.duration_sec}s` : undefined,
        rest: '10s', // Short transition time for warmup/cooldown
        notes: item.cues || undefined,
        instructions: item.instructions || undefined,
    });
    // Extract main exercises from blocks with block information
    const mainExercises = aiPlan.blocks?.flatMap((block, blockIndex) => {
        const blockExercises = block.exercises?.map((exercise, exerciseIndex) => {
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
    const finisherExercises = aiPlan.finisher?.map((item, index) => ({
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
    const transformedPlan = {
        meta: aiPlan.meta || {},
        warmup: aiPlan.warmup?.map((exercise) => {
            const exerciseWithSets = ensureProperSets(exercise, 'warmup', programmingOptions);
            return transformWarmupCooldown(exerciseWithSets);
        }) || [],
        exercises: [...mainExercises, ...finisherExercises],
        cooldown: aiPlan.cooldown?.map((exercise) => {
            const exerciseWithSets = ensureProperSets(exercise, 'cooldown', programmingOptions);
            return transformWarmupCooldown(exerciseWithSets);
        }) || [],
        notes: aiPlan.notes || '',
        estimatedDuration: aiPlan.meta?.est_duration_min || undefined,
    };
    console.log('🤖 AI Plan transformation summary:', {
        originalWarmup: aiPlan.warmup?.length || 0,
        originalBlocks: aiPlan.blocks?.length || 0,
        originalFinisher: aiPlan.finisher?.length || 0,
        originalCooldown: aiPlan.cooldown?.length || 0,
        transformedWarmup: transformedPlan.warmup.length,
        transformedExercises: transformedPlan.exercises.length,
        transformedCooldown: transformedPlan.cooldown.length,
        estimatedDuration: transformedPlan.estimatedDuration
    });
    return transformedPlan;
}
/**
 * Generates a personalized AI workout plan for the authenticated user
 *
 * This endpoint handles the complete workout generation pipeline:
 * 1. Validates user authentication and input parameters
 * 2. Builds personalized AI prompts based on user profile and history
 * 3. Calls OpenAI API for workout generation
 * 4. Applies advanced programming principles (sets, reps, intensity)
 * 5. Stores the workout plan in the database
 * 6. Returns the formatted workout to the client
 *
 * @route POST /v1/workouts/generate
 * @access Private (requires authentication)
 * @param req.body - Workout generation parameters (validated against GenerateWorkoutSchema)
 * @param req.user - Authenticated user information from auth middleware
 * @returns Generated workout plan with metadata
 *
 * @throws {401} When user is not authenticated
 * @throws {400} When input validation fails
 * @throws {503} When AI service is unavailable
 * @throws {500} When unexpected errors occur
 */
exports.generate = (0, errors_1.asyncHandler)(async (req, res) => {
    const startTime = Date.now();
    const requestId = generateRequestId();
    try {
        // 1. Validate authentication
        const userId = req.user?.uid;
        if (!userId) {
            logger.warn('Workout generation attempted without authentication', { requestId });
            res.status(401).json({
                error: 'User authentication required',
                code: 'AUTH_REQUIRED',
                requestId
            });
            return;
        }
        // 2. Parse and validate request data
        const frontendData = validation_1.GenerateWorkoutSchema.parse(req.body);
        logger.info('Workout generation started', {
            userId,
            requestId,
            workoutType: frontendData.workoutType,
            experience: frontendData.experience,
            duration: frontendData.duration
        });
        // 3. Convert frontend format to backend PreWorkout format
        const pre = {
            userId,
            time_available_min: frontendData.duration,
            energy_level: 3, // Default to medium energy level
            workout_type: normalizeWorkoutType(frontendData.workoutType),
            equipment_override: frontendData.equipmentAvailable,
            new_injuries: frontendData.constraints?.join(', ') || undefined,
            // Use data from request (which comes from profile)
            experience: frontendData.experience,
            goals: frontendData.goals,
        };
        logger.debug('Pre-workout data prepared', { userId, requestId, pre });
        // 4. Check for duplicate requests (idempotency)
        const existingWorkout = await WorkoutPlan_1.WorkoutPlanModel.findOne({
            userId: pre.userId,
            promptVersion: PROMPT_VERSION,
            preWorkout: pre
        });
        if (existingWorkout) {
            const responseTime = Date.now() - startTime;
            logger.info('Returning cached workout', {
                userId,
                requestId,
                workoutId: existingWorkout.id,
                responseTime
            });
            res.json({
                workoutId: existingWorkout.id,
                plan: existingWorkout.plan,
                deduped: true,
                metadata: {
                    responseTime,
                    cached: true,
                    requestId
                }
            });
            return;
        }
        // 5. Generate AI workout prompt
        logger.debug('Building personalized prompt', { userId, requestId });
        const promptData = await buildWorkoutPrompt(pre.userId, pre);
        // 6. Call AI service for workout generation
        logger.debug('Calling AI service for workout generation', { userId, requestId });
        const aiPlan = await (0, generator_1.generateWorkout)(promptData, {
            workoutType: pre.workout_type,
            experience: pre.experience,
            duration: pre.time_available_min
        });
        // 7. Create programming options for advanced sets/reps programming
        const programmingOptions = {
            experience: pre.experience,
            primaryGoal: pre.goals?.[0] || 'general_fitness',
            workoutType: pre.workout_type,
            timeAvailable: pre.time_available_min,
            equipmentLevel: determineEquipmentLevel(pre.equipment_override)
        };
        // 8. Skip advanced programming (services removed)
        logger.debug('Skipping advanced programming (services removed)', { userId, requestId });
        // 9. Transform AI output to frontend format with advanced programming
        const transformedPlan = transformAIPlanToFrontendFormat(aiPlan, programmingOptions);
        // 10. Store workout plan in database
        logger.debug('Storing workout plan', { userId, requestId });
        // Transform to proper WorkoutPlanData format
        const workoutPlanData = {
            title: `${pre.workout_type} Workout`,
            description: `Personalized ${pre.workout_type.toLowerCase()} workout for ${pre.experience} level`,
            blocks: [{
                    name: 'Main Workout',
                    exercises: transformedPlan.exercises.map((ex) => ({
                        name: ex.name,
                        sets: ex.sets || 1,
                        reps: ex.reps,
                        weight: ex.weight,
                        duration_sec: ex.duration,
                        rest_sec: ex.rest,
                        notes: ex.notes,
                        equipment: ex.equipment,
                        muscle_groups: ex.muscleGroups
                    })),
                    rest_between_exercises_sec: 60,
                    notes: transformedPlan.notes
                }],
            meta: {
                est_duration_min: transformedPlan.estimatedDuration || pre.time_available_min,
                difficulty_level: pre.experience,
                equipment_needed: pre.equipment_override || [],
                muscle_groups_targeted: [],
                calories_estimate: Math.round(pre.time_available_min * 8) // Rough estimate
            },
            warm_up: transformedPlan.warmup?.length > 0 ? {
                exercises: transformedPlan.warmup.map((ex) => ({
                    name: ex.name,
                    sets: 1,
                    reps: ex.reps,
                    duration_sec: ex.duration,
                    rest_sec: 30,
                    notes: ex.notes
                })),
                duration_min: 10
            } : undefined,
            cool_down: transformedPlan.cooldown?.length > 0 ? {
                exercises: transformedPlan.cooldown.map((ex) => ({
                    name: ex.name,
                    sets: 1,
                    reps: ex.reps,
                    duration_sec: ex.duration,
                    rest_sec: 30,
                    notes: ex.notes
                })),
                duration_min: 10
            } : undefined
        };
        const workoutPlan = await WorkoutPlan_1.WorkoutPlanModel.create({
            userId: pre.userId,
            model: process.env['OPENAI_MODEL'] || 'gpt-4o-mini',
            promptVersion: PROMPT_VERSION,
            preWorkout: pre,
            plan: workoutPlanData
        });
        // 11. Return successful response
        const responseTime = Date.now() - startTime;
        logger.info('Workout generation completed successfully', {
            userId,
            requestId,
            workoutId: workoutPlan.id,
            responseTime
        });
        res.status(201).json({
            workoutId: workoutPlan.id,
            plan: transformedPlan,
            metadata: {
                responseTime,
                cached: false,
                requestId,
                promptVersion: PROMPT_VERSION
            }
        });
    }
    catch (error) {
        const responseTime = Date.now() - startTime;
        const userId = req.user?.uid;
        // Log the error with context
        logger.error('Workout generation failed', {
            userId,
            requestId,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            responseTime
        });
        // Handle validation errors (from Zod schema)
        if (error instanceof Error && error.name === 'ZodError') {
            const zodError = error; // Type assertion for ZodError
            res.status(400).json({
                error: 'Invalid request parameters',
                code: 'VALIDATION_ERROR',
                details: zodError.errors,
                requestId
            });
            return;
        }
        // Handle specific business logic errors
        if (error instanceof Error) {
            // Profile not found error
            if (error.message.includes('Profile not found')) {
                res.status(400).json({
                    error: 'Profile not found. Please complete your profile setup first.',
                    code: 'PROFILE_REQUIRED',
                    details: 'A user profile is required to generate personalized workouts.',
                    requestId
                });
                return;
            }
            // AI service errors
            if (error.message.includes('OpenAI') || error.message.includes('AI service')) {
                res.status(503).json({
                    error: 'AI service temporarily unavailable. Please try again.',
                    code: 'AI_SERVICE_ERROR',
                    requestId
                });
                return;
            }
            // Database errors
            if (error.message.includes('Database') || error.message.includes('Firestore')) {
                res.status(503).json({
                    error: 'Database service temporarily unavailable. Please try again.',
                    code: 'DATABASE_ERROR',
                    requestId
                });
                return;
            }
            // Timeout errors
            if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
                res.status(408).json({
                    error: 'Workout generation timed out. Please try again.',
                    code: 'TIMEOUT_ERROR',
                    requestId
                });
                return;
            }
        }
        // Generic error response for unexpected errors
        res.status(500).json({
            error: 'Failed to generate workout. Please try again.',
            code: 'GENERATION_ERROR',
            details: error instanceof Error ? error.message : 'Unknown error',
            requestId
        });
    }
});
/**
 * Retrieves a specific workout plan by ID
 *
 * @route GET /v1/workouts/:workoutId
 * @access Private (requires authentication)
 * @param req.params.workoutId - Unique workout plan identifier
 * @returns Complete workout plan with metadata
 *
 * @throws {400} When workoutId format is invalid
 * @throws {404} When workout plan is not found
 * @throws {403} When user doesn't have access to the workout
 */
exports.getWorkout = (0, errors_1.asyncHandler)(async (req, res) => {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const { workoutId } = req.params;
    const userId = req.user?.uid;
    logger.debug('Workout retrieval requested', { userId, workoutId, requestId });
    // 1. Validate workout ID format
    if (!workoutId || !(0, validation_1.isValidObjectId)(workoutId)) {
        logger.warn('Invalid workout ID format', { userId, workoutId, requestId });
        res.status(400).json({
            error: 'Invalid workout ID format',
            code: 'INVALID_WORKOUT_ID',
            requestId
        });
        return;
    }
    try {
        // 2. Retrieve workout from database
        const workout = await WorkoutPlan_1.WorkoutPlanModel.findById(workoutId);
        if (!workout) {
            logger.warn('Workout not found', { userId, workoutId, requestId });
            res.status(404).json({
                error: 'Workout not found',
                code: 'WORKOUT_NOT_FOUND',
                requestId
            });
            return;
        }
        // 3. Check user authorization (users can only access their own workouts)
        if (workout.userId !== userId) {
            logger.warn('Unauthorized workout access attempt', {
                userId,
                workoutId,
                workoutUserId: workout.userId,
                requestId
            });
            res.status(403).json({
                error: 'Access denied',
                code: 'ACCESS_DENIED',
                requestId
            });
            return;
        }
        // 4. Return workout data
        const responseTime = Date.now() - startTime;
        logger.info('Workout retrieved successfully', {
            userId,
            workoutId,
            requestId,
            responseTime
        });
        // Transform database format to frontend format
        const transformedPlan = transformDatabasePlanToFrontendFormat(workout.plan);
        res.json({
            id: workout.id,
            userId: workout.userId,
            model: workout.model,
            promptVersion: workout.promptVersion,
            preWorkout: workout.preWorkout,
            plan: transformedPlan,
            createdAt: workout.createdAt.toDate().toISOString(),
            metadata: {
                responseTime,
                requestId
            }
        });
    }
    catch (error) {
        const responseTime = Date.now() - startTime;
        logger.error('Workout retrieval failed', {
            userId,
            workoutId,
            requestId,
            error: error instanceof Error ? error.message : 'Unknown error',
            responseTime
        });
        res.status(500).json({
            error: 'Failed to retrieve workout',
            code: 'RETRIEVAL_ERROR',
            requestId
        });
    }
});
exports.listWorkouts = (0, errors_1.asyncHandler)(async (req, res) => {
    const { userId } = req.query;
    if (!userId || typeof userId !== 'string') {
        res.status(400).json({ error: 'userId query parameter is required' });
        return;
    }
    // Get completed workout sessions for this user (sorted by completion date)
    const workoutSessions = await WorkoutSession_1.WorkoutSessionModel.find({ userId }, { sort: { completedAt: -1 }, limit: 20 });
    // Get the workout plans for completed sessions by fetching them individually
    const workouts = [];
    for (const session of workoutSessions) {
        try {
            const plan = await WorkoutPlan_1.WorkoutPlanModel.findById(session.planId);
            if (plan && plan.userId === userId) {
                // Transform database format to frontend format
                const transformedPlan = transformDatabasePlanToFrontendFormat(plan.plan);
                workouts.push({
                    id: plan.id,
                    userId: plan.userId,
                    model: plan.model,
                    promptVersion: plan.promptVersion,
                    preWorkout: plan.preWorkout,
                    plan: transformedPlan,
                    createdAt: plan.createdAt.toDate().toISOString(),
                    // Add completion information
                    completedAt: session.completedAt?.toDate().toISOString(),
                    feedback: session.feedback,
                    isCompleted: true // All workouts in history are completed
                });
            }
        }
        catch (error) {
            console.error(`Failed to fetch workout plan ${session.planId}:`, error);
            // Continue with other sessions
        }
    }
    res.json({ workouts });
});
exports.completeWorkout = (0, errors_1.asyncHandler)(async (req, res) => {
    const { workoutId: planId } = req.params;
    if (!planId || !(0, validation_1.isValidObjectId)(planId)) {
        res.status(400).json({ error: 'Invalid workoutId format' });
        return;
    }
    const validatedData = validation_1.CompleteWorkoutSchema.parse(req.body ?? {});
    const workoutPlan = await WorkoutPlan_1.WorkoutPlanModel.findById(planId);
    if (!workoutPlan) {
        res.status(404).json({ error: 'Workout plan not found' });
        return;
    }
    const session = await WorkoutSession_1.WorkoutSessionModel.create({
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
exports.generateQuickWorkout = (0, errors_1.asyncHandler)(async (req, res) => {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
    }
    const user = await User_1.UserModel.findByEmail(req.user?.email);
    if (!user) {
        res.status(401).json({ error: 'User not found in database' });
        return;
    }
    const userId = user.id;
    try {
        // Use simple defaults for quick workout generation
        console.log('🚀 Quick workout generation with simple defaults');
        // Convert to backend format with defaults
        const pre = {
            userId,
            time_available_min: 30, // Default 30 minutes
            energy_level: 3, // Default to medium energy
            workout_type: 'general_fitness',
            equipment_override: ['bodyweight'], // Default to bodyweight
            new_injuries: undefined,
            experience: 'intermediate', // Will be overridden by profile data
            goals: ['general_fitness'], // Will be overridden by profile data
        };
        // Check for duplicate (idempotency)
        const dup = await WorkoutPlan_1.WorkoutPlanModel.findOne({ userId: pre.userId, promptVersion: PROMPT_VERSION, preWorkout: pre });
        if (dup) {
            // Transform database format to frontend format
            const transformedPlan = transformDatabasePlanToFrontendFormat(dup.plan);
            res.json({
                workoutId: dup.id,
                plan: transformedPlan,
                deduped: true,
                reasoning: 'Quick workout with default settings'
            });
            return;
        }
        const promptData = await buildWorkoutPrompt(pre.userId, pre);
        const aiPlan = await (0, generator_1.generateWorkout)(promptData, {
            workoutType: pre.workout_type,
            experience: pre.experience,
            duration: pre.time_available_min
        });
        // Validation and programming options (same as regular generation)
        if (aiPlan.blocks) {
            aiPlan.blocks.forEach((block) => {
                if (block.exercises) {
                    block.exercises.forEach((exercise) => {
                        if (!exercise.sets || exercise.sets.length < 2) {
                            console.warn(`⚠️ Quick AI generated ${exercise.sets?.length || 0} sets for main exercise: ${exercise.display_name || exercise.name}`);
                        }
                    });
                }
            });
        }
        const programmingOptions = {
            experience: pre.experience,
            primaryGoal: pre.goals?.[0] || 'general_fitness',
            workoutType: pre.workout_type,
            timeAvailable: pre.time_available_min,
            equipmentLevel: pre.equipment_override?.includes('full_gym') ? 'full' :
                pre.equipment_override?.length > 3 ? 'moderate' : 'minimal'
        };
        const transformedPlan = transformAIPlanToFrontendFormat(aiPlan, programmingOptions);
        // Transform to proper WorkoutPlanData format
        const workoutPlanData = {
            title: `${pre.workout_type} Workout`,
            description: `Personalized ${pre.workout_type.toLowerCase()} workout for ${pre.experience} level`,
            blocks: [{
                    name: 'Main Workout',
                    exercises: transformedPlan.exercises.map((ex) => ({
                        name: ex.name,
                        sets: ex.sets || 1,
                        reps: ex.reps,
                        weight: ex.weight,
                        duration_sec: ex.duration,
                        rest_sec: ex.rest,
                        notes: ex.notes,
                        equipment: ex.equipment,
                        muscle_groups: ex.muscleGroups
                    })),
                    rest_between_exercises_sec: 60,
                    notes: transformedPlan.notes
                }],
            meta: {
                est_duration_min: transformedPlan.estimatedDuration || pre.time_available_min,
                difficulty_level: pre.experience,
                equipment_needed: pre.equipment_override || [],
                muscle_groups_targeted: [],
                calories_estimate: Math.round(pre.time_available_min * 8)
            }
        };
        const wp = await WorkoutPlan_1.WorkoutPlanModel.create({
            userId: pre.userId,
            model: process.env['OPENAI_MODEL'] || 'gpt-4o-mini',
            promptVersion: PROMPT_VERSION,
            preWorkout: pre, // Type assertion for compatibility
            plan: workoutPlanData // Type assertion for compatibility
        });
        res.status(201).json({
            workoutId: wp.id,
            plan: transformedPlan,
            reasoning: 'Quick workout with default settings',
            confidence: 0.8
        });
    }
    catch (error) {
        console.error('Quick workout generation error:', error);
        res.status(500).json({
            error: 'Failed to generate quick workout',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
//# sourceMappingURL=workout.js.map