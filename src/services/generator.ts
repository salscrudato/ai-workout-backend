import pino from 'pino';

import { openai } from '../libs/openai';
import { env } from '../config/env';
import { WorkoutPlanJsonSchema } from '../utils/validation';

// Optimized logger for workout generation service
const baseLogger = pino({
  name: 'workout-generator',
  level: process.env['NODE_ENV'] === 'development' ? 'debug' : 'info',
});

const logger = {
  info: (msg: string, obj?: Record<string, any>) => baseLogger.info(obj || {}, msg),
  error: (msg: string, obj?: Record<string, any>) => baseLogger.error(obj || {}, msg),
  warn: (msg: string, obj?: Record<string, any>) => baseLogger.warn(obj || {}, msg),
  debug: (msg: string, obj?: Record<string, any>) => baseLogger.debug(obj || {}, msg),
};

/**
 * Get optimal model parameters for workout generation
 * Tuned for consistent, high-quality outputs
 */
function getOptimalModelParameters(): { temperature: number; topP: number } {
  return {
    temperature: 0.2, // Low temperature for consistency
    topP: 0.9, // High top-p for quality
  };
}

/**
 * Determine if an error is retryable
 * Handles rate limits, server errors, and timeouts
 */
function isRetryableError(err: any): boolean {
  const msg = (err?.message || '').toLowerCase();
  const status = err?.status;
  return (
    status === 429 || // Rate limit
    (status >= 500 && status < 600) || // Server errors
    msg.includes('timeout') ||
    msg.includes('network') ||
    msg.includes('connection')
  );
}

const SYSTEM_PROMPT = `You are an expert strength & conditioning coach and exercise physiologist. Create safe, effective workouts that follow proper training principles.

CRITICAL REQUIREMENTS FOR SETS:
1. Each main exercise MUST have 2-5 sets in the "sets" array
2. NEVER create single-set workouts for main exercises - this is a critical error
3. Each set object must include: reps, time_sec, rest_sec, tempo, intensity, notes, weight_guidance, rpe, rest_type
4. For strength exercises: typically 3-4 sets with 6-12 reps each
5. For endurance exercises: typically 2-3 sets with 12-20 reps each
6. For cardio exercises: typically 2-4 sets with time_sec > 0 and reps = 0

WORKOUT STRUCTURE:
- Warmup: 1 set per exercise (mobility/activation)
- Main exercises: 2-5 sets per exercise (strength/conditioning)
- Finisher: 1-3 rounds (high intensity)
- Cooldown: 1 set per exercise (stretching/recovery)

Return ONLY valid JSON that exactly follows the provided schema. No additional text or explanations outside of JSON.`;

/**
 * Generate AI-powered workout plan with optimized performance
 * Includes retry logic, fallback handling, and comprehensive logging
 */
export async function generateWorkout(
  promptData: { prompt: string; variant: any },
  options: { workoutType?: string; experience?: string; duration?: number } = {}
): Promise<any> {
  const startTime = Date.now();
  const requestId = `workout-gen-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  logger.info('Starting AI workout generation', {
    requestId,
    workoutType: options.workoutType,
    experience: options.experience,
    duration: options.duration,
    promptLength: promptData.prompt.length,
  });

  const { temperature, topP } = getOptimalModelParameters();

  // Optimized AI request configuration
  const aiRequest = {
    model: env.OPENAI_MODEL,
    messages: [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      { role: 'user' as const, content: promptData.prompt },
    ],
    temperature,
    top_p: topP,
    max_tokens: 4000, // Limit response size for performance
    response_format: {
      type: 'json_schema' as const,
      json_schema: {
        name: 'workout_plan',
        schema: WorkoutPlanJsonSchema,
        strict: true,
      },
    },
  };

  // Optimized API call with better error handling
  const callOpenAI = async () => {
    try {
      return await openai.chat.completions.create(aiRequest);
    } catch (error) {
      logger.debug('OpenAI API call failed', { requestId, error: (error as Error).message });
      throw error;
    }
  };

  let response: any;
  try {
    response = await callOpenAI();
  } catch (err: any) {
    if (isRetryableError(err)) {
      logger.warn('Retrying OpenAI call after error', { requestId, error: err?.message });
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Increased retry delay
      try {
        response = await callOpenAI();
      } catch (retryErr: any) {
        logger.error('OpenAI retry failed', { requestId, error: retryErr?.message });
        return buildFallbackPlan(options, requestId, Date.now() - startTime);
      }
    } else {
      logger.error('Non-retryable OpenAI error', { requestId, error: err?.message });
      return buildFallbackPlan(options, requestId, Date.now() - startTime);
    }
  }

  // Process AI response with validation
  const text = response?.choices?.[0]?.message?.content;
  if (!text) {
    logger.warn('Empty AI response, using fallback', { requestId });
    return buildFallbackPlan(options, requestId, Date.now() - startTime);
  }

  try {
    let parsed = JSON.parse(text);
    const responseTime = Date.now() - startTime;

    // Validate basic structure
    if (!parsed.meta || !parsed.warmup || !parsed.blocks || !parsed.cooldown) {
      logger.warn('Invalid workout structure from AI, using fallback', { requestId });
      return buildFallbackPlan(options, requestId, responseTime);
    }

    // Validate and fix sets structure to ensure multiple sets
    parsed = validateAndFixSets(parsed, requestId);

    logger.info('AI workout generation completed successfully', {
      requestId,
      responseTime,
      workoutType: options.workoutType,
      estimatedDuration: parsed?.meta?.est_duration_min,
      exerciseCount: parsed?.main?.length || 0,
    });

    return parsed;
  } catch (parseError: any) {
    logger.warn('Invalid JSON from AI, using fallback', {
      requestId,
      error: parseError?.message,
      textLength: text.length,
    });
    return buildFallbackPlan(options, requestId, Date.now() - startTime);
  }
}

/**
 * Validate and fix sets structure to ensure multiple sets per exercise
 * This is critical to fix the single-set workout issue
 */
function validateAndFixSets(workoutPlan: any, requestId: string): any {
  logger.debug('Validating and fixing sets structure', { requestId });

  // Fix main exercise blocks
  if (workoutPlan.blocks && Array.isArray(workoutPlan.blocks)) {
    workoutPlan.blocks.forEach((block: any, blockIndex: number) => {
      if (block.exercises && Array.isArray(block.exercises)) {
        block.exercises.forEach((exercise: any, exerciseIndex: number) => {
          if (!exercise.sets || !Array.isArray(exercise.sets) || exercise.sets.length < 2) {
            logger.warn('Fixing exercise with insufficient sets', {
              requestId,
              blockIndex,
              exerciseIndex,
              exerciseName: exercise.display_name || exercise.name,
              currentSets: exercise.sets?.length || 0
            });

            // Create proper sets structure
            const defaultSets = 3;
            const baseReps = 10;
            const baseRest = 60;

            exercise.sets = Array.from({ length: defaultSets }, (_, setIndex) => ({
              reps: Math.max(6, baseReps - setIndex),
              time_sec: 0,
              rest_sec: baseRest,
              tempo: '2-1-2-1',
              intensity: setIndex === 0 ? 'moderate' : setIndex === defaultSets - 1 ? 'high' : 'moderate',
              notes: setIndex === 0 ? 'warm-up set' : setIndex === defaultSets - 1 ? 'final set' : 'working set',
              weight_guidance: setIndex === 0 ? 'light' : setIndex === defaultSets - 1 ? 'heavy' : 'moderate',
              rpe: Math.min(9, 6 + setIndex),
              rest_type: 'active'
            }));
          }
        });
      }
    });
  }

  return workoutPlan;
}

/**
 * Build a high-quality fallback workout plan when AI generation fails
 * Ensures users always receive a safe, effective workout
 */
function buildFallbackPlan(
  options: { workoutType?: string; experience?: string; duration?: number },
  requestId?: string,
  responseTimeMs?: number
) {
  const nowIso = new Date().toISOString();
  const duration = Math.max(15, Math.min(60, Math.round(options.duration || 30)));
  const experience = options.experience || 'beginner';
  const goal = (options.workoutType || 'general_fitness').replace(/_/g, ' ');

  const plan = {
    meta: {
      date_iso: nowIso,
      session_type: 'single_session',
      goal,
      experience,
      est_duration_min: duration,
      equipment_used: ['bodyweight'],
      workout_name: `${goal} — quick plan`,
      instructions: [
        'Warm up thoroughly before main work.',
        'Prioritize form and controlled tempo.',
        'Rest as prescribed; extend rest if form breaks.',
        'Stop any movement that causes pain.'
      ]
    },
    warmup: [
      { name: 'Dynamic full-body warmup', duration_sec: 240, cues: 'Easy range, breathe', instructions: ['Neck to ankle mobility', 'Arm circles & hip openers', 'Light marching or jog'] }
    ],
    blocks: [
      {
        name: 'Main',
        exercises: [
          {
            slug: 'bodyweight_squat',
            display_name: 'Bodyweight Squat',
            type: 'strength',
            equipment: ['bodyweight'],
            primary_muscles: ['quadriceps','glutes'],
            instructions: ['Feet shoulder width, knees track toes', 'Brace core, neutral spine', 'Control down, drive up'],
            sets: [
              { reps: 12, time_sec: 0, rest_sec: 60, tempo: '2-1-2-0', intensity: 'moderate', notes: 'warm-up set', weight_guidance: 'bodyweight', rpe: 6, rest_type: 'active' },
              { reps: 12, time_sec: 0, rest_sec: 60, tempo: '2-1-2-0', intensity: 'moderate', notes: 'working set', weight_guidance: 'bodyweight', rpe: 7, rest_type: 'active' },
              { reps: 12, time_sec: 0, rest_sec: 60, tempo: '2-1-2-0', intensity: 'high', notes: 'final set', weight_guidance: 'bodyweight', rpe: 8, rest_type: 'active' }
            ]
          },
          {
            slug: 'push_up',
            display_name: 'Push-up',
            type: 'strength',
            equipment: ['bodyweight'],
            primary_muscles: ['chest','triceps'],
            instructions: ['Straight line head to heels', 'Elbows ~45°', 'Lower under control'],
            sets: [
              { reps: 10, time_sec: 0, rest_sec: 60, tempo: '2-1-2-0', intensity: 'moderate', notes: 'warm-up set', weight_guidance: 'bodyweight', rpe: 6, rest_type: 'active' },
              { reps: 10, time_sec: 0, rest_sec: 60, tempo: '2-1-2-0', intensity: 'moderate', notes: 'working set', weight_guidance: 'bodyweight', rpe: 7, rest_type: 'active' },
              { reps: 10, time_sec: 0, rest_sec: 60, tempo: '2-1-2-0', intensity: 'high', notes: 'final set', weight_guidance: 'bodyweight', rpe: 8, rest_type: 'active' }
            ]
          },
          {
            slug: 'plank_hold',
            display_name: 'Plank',
            type: 'core',
            equipment: ['bodyweight'],
            primary_muscles: ['core'],
            instructions: ['Elbows under shoulders', 'Ribs down, glutes tight', 'Even breathing'],
            sets: [
              { reps: 0, time_sec: 30, rest_sec: 45, tempo: 'iso', intensity: 'moderate', notes: 'Hold steady', weight_guidance: 'bodyweight', rpe: 7, rest_type: 'active' },
              { reps: 0, time_sec: 30, rest_sec: 45, tempo: 'iso', intensity: 'moderate', notes: 'Hold steady', weight_guidance: 'bodyweight', rpe: 7, rest_type: 'active' }
            ]
          }
        ]
      }
    ],
    finisher: [
      { name: 'Alternating Reverse Lunges', work_sec: 20, rest_sec: 25, rounds: 3, notes: 'Steady pace, good posture' }
    ],
    cooldown: [
      { name: 'Easy mobility & breathing', duration_sec: 180, cues: 'Nasal breathing', instructions: ['90/90 hip switch', 'Child’s pose to cobra flow', 'Box breathing 4-4-4-4'] }
    ],
    notes: 'Auto-generated fallback plan.'
  };

  const rt = responseTimeMs ?? (Date.now() - Date.parse(nowIso));
  logger.info('Fallback workout generated', { requestId, responseTime: rt, estimatedDuration: plan.meta.est_duration_min });
  return plan;
}