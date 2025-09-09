"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQuickWorkout = exports.completeWorkout = exports.listWorkouts = exports.getWorkout = exports.generate = void 0;
const tslib_1 = require("tslib");
const pino_1 = tslib_1.__importDefault(require("pino"));
const errors_1 = require("../middlewares/errors");
const generator_1 = require("../services/generator");
const hash_1 = require("../libs/hash");
const WorkoutPlan_1 = require("../models/WorkoutPlan");
const WorkoutSession_1 = require("../models/WorkoutSession");
const User_1 = require("../models/User");
const validation_1 = require("../utils/validation");
const baseLogger = (0, pino_1.default)({
    name: 'workout-controller',
    level: process.env['NODE_ENV'] === 'development' ? 'debug' : 'info',
});
const logger = {
    info: (msg, obj) => baseLogger.info(obj || {}, msg),
    error: (msg, obj) => baseLogger.error(obj || {}, msg),
    warn: (msg, obj) => baseLogger.warn(obj || {}, msg),
    debug: (msg, obj) => baseLogger.debug(obj || {}, msg),
};
const buildWorkoutPrompt = async (userId, preWorkout) => {
    const goals = Array.isArray(preWorkout.goals) && preWorkout.goals.length
        ? preWorkout.goals.join(', ')
        : 'general_fitness';
    const equipment = Array.isArray(preWorkout.equipment_override) && preWorkout.equipment_override.length
        ? preWorkout.equipment_override.join(', ')
        : 'bodyweight only';
    const constraints = preWorkout.new_injuries ? String(preWorkout.new_injuries) : '';
    const prompt = `User: ${userId}
Context:
- Experience: ${preWorkout.experience}
- Workout type: ${preWorkout.workout_type}
- Duration: ${preWorkout.time_available_min} minutes
- Goals: ${goals}
- Equipment available: ${equipment}${constraints ? `\n- Constraints/Injuries: ${constraints}` : ''}
Requirements:
- Produce a single-session workout optimized for the above.
- Respect the provided duration budget.
- Choose safe, common movements available with the listed equipment.
- Use progressive overload appropriate for ${preWorkout.experience}.
- Output only JSON conforming to the provided schema.`;
    return { prompt, variant: null };
};
const PROMPT_VERSION = 'v2.1.0';
function generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}
function normalizeWorkoutType(workoutType) {
    return workoutType.toLowerCase().replace(/[^a-z0-9]/g, '_');
}
function determineEquipmentLevel(equipmentOverride) {
    if (!equipmentOverride || equipmentOverride.length === 0) {
        return 'minimal';
    }
    if (equipmentOverride.includes('full_gym')) {
        return 'full';
    }
    return equipmentOverride.length > 3 ? 'moderate' : 'minimal';
}
function computeDedupKey(userId, pre) {
    const canonical = {
        userId,
        workout_type: pre.workout_type,
        experience: pre.experience,
        time_available_min: pre.time_available_min,
        goals: Array.isArray(pre.goals) ? [...pre.goals].sort() : [],
        equipment_override: Array.isArray(pre.equipment_override) ? [...pre.equipment_override].sort() : [],
    };
    return (0, hash_1.sha256)(canonical);
}
function ensureProperSets(exercise, exerciseType, programmingOptions) {
    if (!exercise.sets || exercise.sets.length === 0 || (exercise.sets.length === 1 && exerciseType === 'main')) {
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
        if (programmingOptions && exerciseType === 'main') {
            const programming = {
                sets: 3,
                reps: [10, 10, 10],
                rest: 60,
                restSeconds: 60,
                tempoPattern: '2-1-2-1',
                intensityProgression: ['moderate', 'moderate', 'moderate'],
                rpeProgression: [6, 7, 8]
            };
            const progressiveReps = [10, 10, 10];
            exercise.sets = progressiveReps.map((reps, i) => ({
                reps: category === 'cardio' ? 0 : reps,
                time_sec: category === 'cardio' ? 30 + (i * 5) : 0,
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
function transformDatabasePlanToFrontendFormat(dbPlan) {
    const warmupExercises = dbPlan.warm_up?.exercises || dbPlan.warmup || [];
    const mainExercises = dbPlan.blocks?.[0]?.exercises || dbPlan.exercises || [];
    const cooldownExercises = dbPlan.cool_down?.exercises || dbPlan.cooldown || [];
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
            sets: exercise.setsData || exercise.sets || 1,
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
    return transformedPlan;
}
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
        rest: '10s',
        notes: item.cues || undefined,
        instructions: item.instructions || undefined,
    });
    const mainExercises = aiPlan.blocks?.flatMap((block, blockIndex) => {
        const blockExercises = block.exercises?.map((exercise, exerciseIndex) => {
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
    return transformedPlan;
}
exports.generate = (0, errors_1.asyncHandler)(async (req, res) => {
    const startTime = performance.now();
    const requestId = generateRequestId();
    try {
        const userId = req.user?.uid;
        if (!userId) {
            logger.warn('Workout generation attempted without authentication', { requestId });
            res.status(401).json({
                error: 'User authentication required',
                code: 'AUTH_REQUIRED',
                requestId,
            });
            return;
        }
        const validationStart = performance.now();
        const frontendData = validation_1.GenerateWorkoutSchema.parse(req.body);
        const validationTime = performance.now() - validationStart;
        logger.info('Workout generation started', {
            userId,
            requestId,
            workoutType: frontendData.workoutType,
            experience: frontendData.experience,
            validationTime: `${validationTime.toFixed(2)}ms`,
            duration: frontendData.duration
        });
        const pre = {
            userId,
            time_available_min: frontendData.duration,
            energy_level: 3,
            workout_type: normalizeWorkoutType(frontendData.workoutType),
            equipment_override: frontendData.equipmentAvailable,
            new_injuries: frontendData.constraints?.join(', ') || undefined,
            experience: frontendData.experience,
            goals: frontendData.goals,
        };
        logger.debug('Pre-workout data prepared', { userId, requestId, pre });
        const dedupKey = computeDedupKey(pre.userId, pre);
        const existingWorkout = await WorkoutPlan_1.WorkoutPlanModel.findOne({
            userId: pre.userId,
            promptVersion: PROMPT_VERSION,
            dedupKey
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
        const promptStart = performance.now();
        logger.debug('Building personalized prompt', { userId, requestId });
        const promptData = await buildWorkoutPrompt(pre.userId, pre);
        const promptTime = performance.now() - promptStart;
        const aiStart = performance.now();
        logger.debug('Calling AI service for workout generation', { userId, requestId });
        const aiPlan = await (0, generator_1.generateWorkout)(promptData, {
            workoutType: pre.workout_type,
            experience: pre.experience,
            duration: pre.time_available_min,
        });
        const aiTime = performance.now() - aiStart;
        const programmingOptions = {
            experience: pre.experience,
            primaryGoal: pre.goals?.[0] || 'general_fitness',
            workoutType: pre.workout_type,
            timeAvailable: pre.time_available_min,
            equipmentLevel: determineEquipmentLevel(pre.equipment_override)
        };
        logger.debug('Skipping advanced programming (services removed)', { userId, requestId });
        const transformedPlan = transformAIPlanToFrontendFormat(aiPlan, programmingOptions);
        logger.debug('Storing workout plan', { userId, requestId });
        const workoutPlanData = {
            title: `${pre.workout_type} Workout`,
            description: `Personalized ${pre.workout_type.toLowerCase()} workout for ${pre.experience} level`,
            blocks: [{
                    name: 'Main Workout',
                    exercises: transformedPlan.exercises.map((ex) => ({
                        name: ex.name,
                        sets: Array.isArray(ex.sets) ? ex.sets.length : (ex.sets || 3),
                        setsData: Array.isArray(ex.sets) ? ex.sets : undefined,
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
            plan: workoutPlanData,
            dedupKey
        });
        const responseTime = performance.now() - startTime;
        logger.info('Workout generation completed successfully', {
            userId,
            requestId,
            workoutId: workoutPlan.id,
            responseTime: `${responseTime.toFixed(2)}ms`,
            promptTime: `${promptTime.toFixed(2)}ms`,
            aiTime: `${aiTime.toFixed(2)}ms`,
        });
        res.status(201).json({
            workoutId: workoutPlan.id,
            plan: transformedPlan,
            metadata: {
                responseTime: Math.round(responseTime),
                cached: false,
                requestId,
                promptVersion: PROMPT_VERSION,
                performance: {
                    total: `${responseTime.toFixed(2)}ms`,
                    prompt: `${promptTime.toFixed(2)}ms`,
                    ai: `${aiTime.toFixed(2)}ms`,
                },
            },
        });
    }
    catch (error) {
        const responseTime = Date.now() - startTime;
        const userId = req.user?.uid;
        logger.error('Workout generation failed', {
            userId,
            requestId,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            responseTime
        });
        if (error instanceof Error && error.name === 'ZodError') {
            const zodError = error;
            res.status(400).json({
                error: 'Invalid request parameters',
                code: 'VALIDATION_ERROR',
                details: zodError.errors,
                requestId
            });
            return;
        }
        if (error instanceof Error) {
            if (error.message.includes('Profile not found')) {
                res.status(400).json({
                    error: 'Profile not found. Please complete your profile setup first.',
                    code: 'PROFILE_REQUIRED',
                    details: 'A user profile is required to generate personalized workouts.',
                    requestId
                });
                return;
            }
            if (error.message.includes('OpenAI') || error.message.includes('AI service')) {
                res.status(503).json({
                    error: 'AI service temporarily unavailable. Please try again.',
                    code: 'AI_SERVICE_ERROR',
                    requestId
                });
                return;
            }
            if (error.message.includes('Database') || error.message.includes('Firestore')) {
                res.status(503).json({
                    error: 'Database service temporarily unavailable. Please try again.',
                    code: 'DATABASE_ERROR',
                    requestId
                });
                return;
            }
            if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
                res.status(408).json({
                    error: 'Workout generation timed out. Please try again.',
                    code: 'TIMEOUT_ERROR',
                    requestId
                });
                return;
            }
        }
        res.status(500).json({
            error: 'Failed to generate workout. Please try again.',
            code: 'GENERATION_ERROR',
            details: error instanceof Error ? error.message : 'Unknown error',
            requestId
        });
    }
});
exports.getWorkout = (0, errors_1.asyncHandler)(async (req, res) => {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const { workoutId } = req.params;
    const userId = req.user?.uid;
    logger.debug('Workout retrieval requested', { userId, workoutId, requestId });
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
        const responseTime = Date.now() - startTime;
        logger.info('Workout retrieved successfully', {
            userId,
            workoutId,
            requestId,
            responseTime
        });
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
    const workoutSessions = await WorkoutSession_1.WorkoutSessionModel.find({ userId }, { sort: { completedAt: -1 }, limit: 20 });
    const workouts = [];
    for (const session of workoutSessions) {
        try {
            const plan = await WorkoutPlan_1.WorkoutPlanModel.findById(session.planId);
            if (plan && plan.userId === userId) {
                const transformedPlan = transformDatabasePlanToFrontendFormat(plan.plan);
                workouts.push({
                    id: plan.id,
                    userId: plan.userId,
                    model: plan.model,
                    promptVersion: plan.promptVersion,
                    preWorkout: plan.preWorkout,
                    plan: transformedPlan,
                    createdAt: plan.createdAt.toDate().toISOString(),
                    completedAt: session.completedAt?.toDate().toISOString(),
                    feedback: session.feedback,
                    isCompleted: true,
                });
            }
        }
        catch (error) {
            logger.error(`Failed to fetch workout plan ${session.planId}`, { error });
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
        const pre = {
            userId,
            time_available_min: 30,
            energy_level: 3,
            workout_type: 'general_fitness',
            equipment_override: ['bodyweight'],
            new_injuries: undefined,
            experience: 'intermediate',
            goals: ['general_fitness'],
        };
        const dedupKey = computeDedupKey(pre.userId, pre);
        const dup = await WorkoutPlan_1.WorkoutPlanModel.findOne({ userId: pre.userId, promptVersion: PROMPT_VERSION, dedupKey });
        if (dup) {
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
        const programmingOptions = {
            experience: pre.experience,
            primaryGoal: pre.goals?.[0] || 'general_fitness',
            workoutType: pre.workout_type,
            timeAvailable: pre.time_available_min,
            equipmentLevel: pre.equipment_override?.includes('full_gym') ? 'full' :
                pre.equipment_override?.length > 3 ? 'moderate' : 'minimal'
        };
        const transformedPlan = transformAIPlanToFrontendFormat(aiPlan, programmingOptions);
        const workoutPlanData = {
            title: `${pre.workout_type} Workout`,
            description: `Personalized ${pre.workout_type.toLowerCase()} workout for ${pre.experience} level`,
            blocks: [{
                    name: 'Main Workout',
                    exercises: transformedPlan.exercises.map((ex) => ({
                        name: ex.name,
                        sets: Array.isArray(ex.sets) ? ex.sets.length : (ex.sets || 3),
                        setsData: Array.isArray(ex.sets) ? ex.sets : undefined,
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
            preWorkout: pre,
            plan: workoutPlanData,
            dedupKey
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