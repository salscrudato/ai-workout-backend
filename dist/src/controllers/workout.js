"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeWorkout = exports.listWorkouts = exports.getWorkout = exports.generate = void 0;
const errors_1 = require("../middlewares/errors");
const prompt_1 = require("../services/prompt");
const generator_1 = require("../services/generator");
const WorkoutPlan_1 = require("../models/WorkoutPlan");
const WorkoutSession_1 = require("../models/WorkoutSession");
const validation_1 = require("../utils/validation");
const User_1 = require("../models/User");
const PROMPT_VERSION = 'v1.0.1';
// Transform AI output format to frontend format
function transformAIPlanToFrontendFormat(aiPlan) {
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
        const blockExercises = block.exercises?.map((exercise, exerciseIndex) => ({
            ...transformExercise(exercise),
            blockName: block.name,
            blockIndex,
            exerciseIndex,
        })) || [];
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
    return {
        meta: aiPlan.meta || {},
        warmup: aiPlan.warmup?.map(transformWarmupCooldown) || [],
        exercises: [...mainExercises, ...finisherExercises],
        cooldown: aiPlan.cooldown?.map(transformWarmupCooldown) || [],
        notes: aiPlan.notes || '',
        estimatedDuration: aiPlan.meta?.est_duration_min || undefined,
    };
}
exports.generate = (0, errors_1.asyncHandler)(async (req, res) => {
    // Parse frontend request format
    const frontendData = validation_1.GenerateWorkoutSchema.parse(req.body);
    // Get Firebase UID from auth middleware
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
    }
    // Look up the user in our database using the Firebase UID
    const user = await User_1.UserModel.findByEmail(req.user?.email);
    if (!user) {
        res.status(401).json({ error: 'User not found in database' });
        return;
    }
    const userId = user.id;
    // Convert frontend format to backend PreWorkout format
    const pre = {
        userId,
        time_available_min: frontendData.duration,
        energy_level: 3, // Default to medium energy
        workout_type: frontendData.workoutType.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        equipment_override: frontendData.equipmentAvailable,
        new_injuries: frontendData.constraints?.join(', ') || undefined,
        // Use data from request (which comes from profile)
        experience: frontendData.experience,
        goals: frontendData.goals,
    };
    console.log('Pre-workout data being sent to prompt:', pre);
    // Idempotency: reuse identical requests (per prompt version)
    const dup = await WorkoutPlan_1.WorkoutPlanModel.findOne({ userId: pre.userId, promptVersion: PROMPT_VERSION, preWorkout: pre });
    if (dup) {
        res.json({ workoutId: dup.id, plan: dup.plan, deduped: true });
        return;
    }
    const prompt = await (0, prompt_1.buildWorkoutPrompt)(pre.userId, pre);
    const aiPlan = await (0, generator_1.generateWorkout)(prompt);
    // Transform AI output to frontend format
    const transformedPlan = transformAIPlanToFrontendFormat(aiPlan);
    const wp = await WorkoutPlan_1.WorkoutPlanModel.create({
        userId: pre.userId,
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        promptVersion: PROMPT_VERSION,
        preWorkout: pre,
        plan: transformedPlan
    });
    res.status(201).json({ workoutId: wp.id, plan: transformedPlan });
});
exports.getWorkout = (0, errors_1.asyncHandler)(async (req, res) => {
    const { workoutId } = req.params;
    if (!workoutId || !(0, validation_1.isValidObjectId)(workoutId)) {
        res.status(400).json({ error: 'Invalid workoutId format' });
        return;
    }
    const w = await WorkoutPlan_1.WorkoutPlanModel.findById(workoutId);
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
//# sourceMappingURL=workout.js.map