"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWorkout = generateWorkout;
const pino_1 = __importDefault(require("pino"));
const openai_1 = require("../libs/openai");
const env_1 = require("../config/env");
const validation_1 = require("../utils/validation");
const baseLogger = (0, pino_1.default)({
    name: 'workout-generator',
    level: process.env['NODE_ENV'] === 'development' ? 'debug' : 'info'
});
const logger = {
    info: (msg, obj) => baseLogger.info(obj || {}, msg),
    error: (msg, obj) => baseLogger.error(obj || {}, msg),
    warn: (msg, obj) => baseLogger.warn(obj || {}, msg),
    debug: (msg, obj) => baseLogger.debug(obj || {}, msg),
};
function getOptimalModelParameters() {
    return { temperature: 0.2, topP: 0.9 };
}
function isRetryableError(err) {
    const msg = (err?.message || '').toLowerCase();
    const status = err?.status;
    return status === 429 || (status >= 500 && status < 600) || msg.includes('timeout');
}
const SYSTEM_PROMPT = `You are an expert strength & conditioning coach. Return a safe, effective workout as **valid JSON** that exactly follows the provided JSON schema. Prioritize movement quality, progressive overload, and time efficiency. Tailor sets/reps or time and rest to the user's experience, duration, goals, and equipment. Do not include any text outside of JSON.`;
async function generateWorkout(promptData, options = {}) {
    const startTime = Date.now();
    const requestId = `workout-gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    logger.info('Starting AI workout generation', {
        requestId,
        workoutType: options.workoutType,
        experience: options.experience,
        duration: options.duration,
        promptLength: promptData.prompt.length
    });
    const { temperature, topP } = getOptimalModelParameters();
    const aiRequest = {
        model: env_1.env.OPENAI_MODEL,
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: promptData.prompt }
        ],
        temperature,
        top_p: topP,
        response_format: {
            type: 'json_schema',
            json_schema: { name: 'workout_plan', schema: validation_1.WorkoutPlanJsonSchema, strict: true }
        }
    };
    async function callOnce() {
        return await openai_1.openai.chat.completions.create(aiRequest);
    }
    let response;
    try {
        response = await callOnce();
    }
    catch (err) {
        if (isRetryableError(err)) {
            await new Promise(r => setTimeout(r, 500));
            response = await callOnce();
        }
        else {
            logger.error('OpenAI call failed', { requestId, error: err?.message });
            return buildFallbackPlan(options, requestId, Date.now() - startTime);
        }
    }
    const text = response?.choices?.[0]?.message?.content;
    if (!text) {
        logger.warn('Empty AI response, using fallback', { requestId });
        return buildFallbackPlan(options, requestId, Date.now() - startTime);
    }
    try {
        const parsed = JSON.parse(text);
        const rt = Date.now() - startTime;
        logger.info('AI workout generation completed', {
            requestId,
            responseTime: rt,
            workoutType: options.workoutType,
            estimatedDuration: parsed?.meta?.est_duration_min
        });
        return parsed;
    }
    catch (e) {
        logger.warn('Invalid JSON from AI, using fallback', { requestId, err: e?.message });
        return buildFallbackPlan(options, requestId, Date.now() - startTime);
    }
}
function buildFallbackPlan(options, requestId, responseTimeMs) {
    const nowIso = new Date().toISOString();
    const duration = Math.max(15, Math.min(60, Math.round(options.duration || 30)));
    const experience = (options.experience || 'beginner');
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
                        primary_muscles: ['quadriceps', 'glutes'],
                        instructions: ['Feet shoulder width, knees track toes', 'Brace core, neutral spine', 'Control down, drive up'],
                        sets: [
                            { reps: 12, time_sec: 0, rest_sec: 60, tempo: '2-1-2-0', intensity: 'moderate', notes: 'RPE ~7', weight_guidance: 'bodyweight', rpe: 7, rest_type: 'active' },
                            { reps: 12, time_sec: 0, rest_sec: 60, tempo: '2-1-2-0', intensity: 'moderate', notes: 'RPE ~7', weight_guidance: 'bodyweight', rpe: 7, rest_type: 'active' }
                        ]
                    },
                    {
                        slug: 'push_up',
                        display_name: 'Push-up',
                        type: 'strength',
                        equipment: ['bodyweight'],
                        primary_muscles: ['chest', 'triceps'],
                        instructions: ['Straight line head to heels', 'Elbows ~45°', 'Lower under control'],
                        sets: [
                            { reps: 10, time_sec: 0, rest_sec: 60, tempo: '2-1-2-0', intensity: 'moderate', notes: 'Knees down if needed', weight_guidance: 'bodyweight', rpe: 7, rest_type: 'active' },
                            { reps: 10, time_sec: 0, rest_sec: 60, tempo: '2-1-2-0', intensity: 'moderate', notes: 'Knees down if needed', weight_guidance: 'bodyweight', rpe: 7, rest_type: 'active' }
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
//# sourceMappingURL=generator.js.map