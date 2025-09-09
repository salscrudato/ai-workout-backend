"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutPlanJsonSchema = exports.AIWorkoutPlanSchema = exports.AIWorkoutMetaSchema = exports.AIFinisherSchema = exports.AIWarmupCooldownSchema = exports.AIWorkoutBlockSchema = exports.AIExerciseSchema = exports.AIWorkoutSetSchema = exports.UpdateProfileSchema = exports.GenerateWorkoutRequestSchema = exports.CreateWorkoutPlanSchema = exports.UpdateWorkoutSessionSchema = exports.CreateWorkoutSessionSchema = exports.UpdateEquipmentSchema = exports.CreateEquipmentSchema = exports.WorkoutPlanDataSchema = exports.WarmUpCoolDownSchema = exports.WorkoutMetaSchema = exports.WorkoutBlockSchema = exports.ExerciseSchema = exports.AuthSchema = exports.PreWorkoutSchema = exports.CompleteWorkoutSchema = exports.GenerateWorkoutSchema = exports.WorkoutTypeSchema = exports.CreateProfileSchema = exports.ObjectIdSchema = exports.isValidObjectId = exports.ConstraintsSchema = exports.EquipmentSchema = exports.GoalsSchema = exports.SexSchema = exports.ExperienceSchema = exports.CreateUserSchema = exports.UrlSchema = exports.PhoneSchema = exports.PasswordSchema = exports.EmailSchema = exports.SafeStringSchema = exports.validateEmail = exports.sanitizeForSecurity = exports.detectSQLInjection = exports.detectXSS = exports.sanitizeHtml = exports.sanitizeString = void 0;
const zod_1 = require("zod");
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^\+?[\d\s\-\(\)]{10,}$/;
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
const XSS_PATTERNS = /<script|javascript:|on\w+\s*=/i;
const SQL_INJECTION_PATTERNS = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)|('|(\\x27)|(\\x2D\\x2D))/i;
const sanitizeString = (str) => {
    if (typeof str !== 'string')
        return '';
    return str
        .trim()
        .replace(/[<>]/g, '')
        .replace(/\s+/g, ' ')
        .slice(0, 1000);
};
exports.sanitizeString = sanitizeString;
const sanitizeHtml = (str) => {
    if (typeof str !== 'string')
        return '';
    return str
        .replace(/[<>'"&]/g, (match) => {
        const htmlEntities = {
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '&': '&amp;',
        };
        return htmlEntities[match] || match;
    })
        .slice(0, 2000);
};
exports.sanitizeHtml = sanitizeHtml;
const detectXSS = (str) => {
    return XSS_PATTERNS.test(str);
};
exports.detectXSS = detectXSS;
const detectSQLInjection = (str) => {
    return SQL_INJECTION_PATTERNS.test(str);
};
exports.detectSQLInjection = detectSQLInjection;
const sanitizeForSecurity = (str) => {
    if (typeof str !== 'string')
        return '';
    if ((0, exports.detectXSS)(str) || (0, exports.detectSQLInjection)(str)) {
        throw new Error('Potentially malicious input detected');
    }
    return (0, exports.sanitizeString)(str);
};
exports.sanitizeForSecurity = sanitizeForSecurity;
const validateEmail = (email) => {
    return EMAIL_REGEX.test(email);
};
exports.validateEmail = validateEmail;
exports.SafeStringSchema = zod_1.z
    .string()
    .min(1, 'Field is required')
    .max(1000, 'Field is too long')
    .transform(exports.sanitizeString);
exports.EmailSchema = zod_1.z
    .string()
    .email('Invalid email format')
    .regex(EMAIL_REGEX, 'Invalid email format')
    .max(254, 'Email is too long')
    .transform((email) => email.toLowerCase().trim());
exports.PasswordSchema = zod_1.z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');
exports.PhoneSchema = zod_1.z
    .string()
    .regex(PHONE_REGEX, 'Invalid phone number format')
    .optional();
exports.UrlSchema = zod_1.z
    .string()
    .regex(URL_REGEX, 'Invalid URL format')
    .optional();
exports.CreateUserSchema = zod_1.z.object({
    email: exports.EmailSchema.optional(),
    firebaseUid: zod_1.z.string().min(1, 'Firebase UID is required').optional(),
});
exports.ExperienceSchema = zod_1.z.enum(['beginner', 'intermediate', 'advanced'], {
    errorMap: () => ({ message: 'Experience must be beginner, intermediate, or advanced' }),
});
exports.SexSchema = zod_1.z.enum(['male', 'female', 'prefer_not_to_say'], {
    errorMap: () => ({ message: 'Sex must be male, female, or prefer_not_to_say' }),
});
exports.GoalsSchema = zod_1.z
    .array(zod_1.z.string().min(1, 'Goal cannot be empty').max(100, 'Goal is too long'))
    .min(1, 'At least one goal is required')
    .max(10, 'Too many goals selected')
    .transform((goals) => goals.map(exports.sanitizeString));
exports.EquipmentSchema = zod_1.z
    .array(zod_1.z.string().min(1, 'Equipment name cannot be empty').max(50, 'Equipment name is too long'))
    .max(50, 'Too many equipment items selected')
    .transform((equipment) => equipment.map(exports.sanitizeString));
exports.ConstraintsSchema = zod_1.z
    .array(zod_1.z.string().max(200, 'Constraint is too long'))
    .max(20, 'Too many constraints')
    .transform((constraints) => constraints.map(exports.sanitizeString));
const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id) || /^[0-9a-zA-Z]{20,}$/.test(id);
};
exports.isValidObjectId = isValidObjectId;
exports.ObjectIdSchema = zod_1.z
    .string()
    .min(1, 'ID is required')
    .refine(exports.isValidObjectId, 'Invalid ID format');
exports.CreateProfileSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, 'User ID is required'),
    experience: exports.ExperienceSchema,
    goals: exports.GoalsSchema,
    equipmentAvailable: exports.EquipmentSchema,
    age: zod_1.z
        .number()
        .int('Age must be a whole number')
        .min(13, 'Must be at least 13 years old')
        .max(120, 'Age must be realistic')
        .optional(),
    sex: exports.SexSchema,
    height_ft: zod_1.z
        .number()
        .int('Height (feet) must be a whole number')
        .min(3, 'Height must be realistic')
        .max(8, 'Height must be realistic')
        .optional(),
    height_in: zod_1.z
        .number()
        .int('Height (inches) must be a whole number')
        .min(0, 'Inches cannot be negative')
        .max(11, 'Inches must be less than 12')
        .optional(),
    weight_lb: zod_1.z
        .number()
        .positive('Weight must be positive')
        .min(50, 'Weight must be realistic')
        .max(1000, 'Weight must be realistic')
        .optional(),
    injury_notes: zod_1.z
        .string()
        .max(1000, 'Injury notes are too long')
        .transform(exports.sanitizeHtml)
        .optional(),
    constraints: exports.ConstraintsSchema,
    health_ack: zod_1.z.boolean(),
    data_consent: zod_1.z.boolean(),
});
exports.WorkoutTypeSchema = zod_1.z.enum([
    'full_body',
    'upper_lower',
    'push',
    'pull',
    'legs',
    'core',
    'conditioning',
    'mobility',
    'recovery'
], {
    errorMap: () => ({ message: 'Invalid workout type' }),
});
exports.GenerateWorkoutSchema = zod_1.z.object({
    experience: exports.ExperienceSchema,
    goals: exports.GoalsSchema,
    workoutType: zod_1.z.string().min(1, 'Workout type is required').max(50, 'Workout type is too long'),
    equipmentAvailable: exports.EquipmentSchema,
    duration: zod_1.z
        .number()
        .int('Duration must be a whole number')
        .min(10, 'Minimum workout duration is 10 minutes')
        .max(180, 'Maximum workout duration is 180 minutes'),
    constraints: exports.ConstraintsSchema.optional().default([]),
});
exports.CompleteWorkoutSchema = zod_1.z.object({
    feedback: zod_1.z
        .string()
        .max(2000, 'Feedback is too long')
        .transform(exports.sanitizeHtml)
        .optional(),
    rating: zod_1.z
        .number()
        .int('Rating must be a whole number')
        .min(1, 'Rating must be at least 1')
        .max(5, 'Rating must be at most 5')
        .optional(),
    startedAt: zod_1.z.string().datetime('Invalid start time format').optional(),
    completedAt: zod_1.z.string().datetime('Invalid completion time format').optional(),
});
exports.PreWorkoutSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, 'User ID is required'),
    time_available_min: zod_1.z.number().int().min(10).max(120),
    start_time_iso: zod_1.z.string().datetime().optional(),
    energy_level: zod_1.z.number().int().min(1).max(5),
    workout_type: exports.WorkoutTypeSchema,
    equipment_override: exports.EquipmentSchema.optional(),
    new_injuries: zod_1.z.string().max(1000, 'Injury notes are too long').transform(exports.sanitizeHtml).optional(),
});
exports.AuthSchema = zod_1.z.object({
    idToken: zod_1.z.string().min(1, 'ID token is required')
});
exports.ExerciseSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Exercise name is required'),
    sets: zod_1.z.number().int().min(1).max(20),
    reps: zod_1.z.union([zod_1.z.number().int().min(1).max(1000), zod_1.z.string()]).optional(),
    weight: zod_1.z.string().optional(),
    duration_sec: zod_1.z.number().int().min(1).max(3600).optional(),
    rest_sec: zod_1.z.number().int().min(0).max(600).optional(),
    notes: zod_1.z.string().max(500).optional(),
    equipment: zod_1.z.array(zod_1.z.string()).optional(),
    muscle_groups: zod_1.z.array(zod_1.z.string()).optional()
});
exports.WorkoutBlockSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Block name is required'),
    exercises: zod_1.z.array(exports.ExerciseSchema).min(1, 'At least one exercise is required'),
    rest_between_exercises_sec: zod_1.z.number().int().min(0).max(600).optional(),
    notes: zod_1.z.string().max(500).optional()
});
exports.WorkoutMetaSchema = zod_1.z.object({
    est_duration_min: zod_1.z.number().int().min(1).max(300),
    difficulty_level: exports.ExperienceSchema,
    equipment_needed: zod_1.z.array(zod_1.z.string()),
    muscle_groups_targeted: zod_1.z.array(zod_1.z.string()),
    calories_estimate: zod_1.z.number().int().min(0).max(2000).optional()
});
exports.WarmUpCoolDownSchema = zod_1.z.object({
    exercises: zod_1.z.array(exports.ExerciseSchema),
    duration_min: zod_1.z.number().int().min(1).max(30)
});
exports.WorkoutPlanDataSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Workout title is required').max(100),
    description: zod_1.z.string().max(500).optional(),
    blocks: zod_1.z.array(exports.WorkoutBlockSchema).min(1, 'At least one workout block is required'),
    meta: exports.WorkoutMetaSchema,
    warm_up: exports.WarmUpCoolDownSchema.optional(),
    cool_down: exports.WarmUpCoolDownSchema.optional()
});
exports.CreateEquipmentSchema = zod_1.z.object({
    slug: zod_1.z.string().min(1, 'Equipment slug is required').regex(/^[a-z0-9_-]+$/, 'Invalid slug format'),
    label: zod_1.z.string().min(1, 'Equipment label is required').max(100)
});
exports.UpdateEquipmentSchema = exports.CreateEquipmentSchema.partial();
exports.CreateWorkoutSessionSchema = zod_1.z.object({
    planId: zod_1.z.string().min(1, 'Plan ID is required'),
    userId: zod_1.z.string().min(1, 'User ID is required'),
    startedAt: zod_1.z.date().optional(),
    completedAt: zod_1.z.date().optional(),
    feedback: zod_1.z.record(zod_1.z.any()).optional()
});
exports.UpdateWorkoutSessionSchema = exports.CreateWorkoutSessionSchema.partial().omit({
    planId: true,
    userId: true
});
exports.CreateWorkoutPlanSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, 'User ID is required'),
    model: zod_1.z.string().min(1, 'Model is required'),
    promptVersion: zod_1.z.string().min(1, 'Prompt version is required'),
    preWorkout: exports.PreWorkoutSchema,
    plan: exports.WorkoutPlanDataSchema
});
exports.GenerateWorkoutRequestSchema = zod_1.z.object({
    workout_type: zod_1.z.string().min(1, 'Workout type is required'),
    time_available_min: zod_1.z.number().int().min(5).max(300),
    equipment_override: exports.EquipmentSchema.optional(),
    injury_notes: zod_1.z.string().max(1000).optional(),
    constraints: exports.ConstraintsSchema.optional(),
    intensity_preference: zod_1.z.enum(['low', 'moderate', 'high']).optional(),
    focus_areas: zod_1.z.array(zod_1.z.string()).optional()
});
exports.UpdateProfileSchema = exports.CreateProfileSchema.partial().omit({ userId: true });
exports.AIWorkoutSetSchema = zod_1.z.object({
    reps: zod_1.z.number(),
    time_sec: zod_1.z.number(),
    rest_sec: zod_1.z.number(),
    tempo: zod_1.z.string(),
    intensity: zod_1.z.string(),
    notes: zod_1.z.string(),
    weight_guidance: zod_1.z.string(),
    rpe: zod_1.z.number(),
    rest_type: zod_1.z.string()
});
exports.AIExerciseSchema = zod_1.z.object({
    slug: zod_1.z.string(),
    display_name: zod_1.z.string(),
    type: zod_1.z.string(),
    equipment: zod_1.z.array(zod_1.z.string()),
    primary_muscles: zod_1.z.array(zod_1.z.string()),
    instructions: zod_1.z.array(zod_1.z.string()).min(3).max(3),
    sets: zod_1.z.array(exports.AIWorkoutSetSchema).min(2).max(6)
});
exports.AIWorkoutBlockSchema = zod_1.z.object({
    name: zod_1.z.string(),
    exercises: zod_1.z.array(exports.AIExerciseSchema)
});
exports.AIWarmupCooldownSchema = zod_1.z.object({
    name: zod_1.z.string(),
    duration_sec: zod_1.z.number(),
    cues: zod_1.z.string(),
    instructions: zod_1.z.array(zod_1.z.string()).min(3).max(3)
});
exports.AIFinisherSchema = zod_1.z.object({
    name: zod_1.z.string(),
    work_sec: zod_1.z.number(),
    rest_sec: zod_1.z.number(),
    rounds: zod_1.z.number(),
    notes: zod_1.z.string()
});
exports.AIWorkoutMetaSchema = zod_1.z.object({
    date_iso: zod_1.z.string(),
    session_type: zod_1.z.string(),
    goal: zod_1.z.string(),
    experience: zod_1.z.string(),
    est_duration_min: zod_1.z.number(),
    equipment_used: zod_1.z.array(zod_1.z.string()),
    workout_name: zod_1.z.string(),
    instructions: zod_1.z.array(zod_1.z.string()).min(4).max(4)
});
exports.AIWorkoutPlanSchema = zod_1.z.object({
    meta: exports.AIWorkoutMetaSchema,
    warmup: zod_1.z.array(exports.AIWarmupCooldownSchema),
    blocks: zod_1.z.array(exports.AIWorkoutBlockSchema),
    finisher: zod_1.z.array(exports.AIFinisherSchema),
    cooldown: zod_1.z.array(exports.AIWarmupCooldownSchema),
    notes: zod_1.z.string()
});
exports.WorkoutPlanJsonSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        meta: {
            type: 'object', additionalProperties: false,
            properties: {
                date_iso: { type: 'string' },
                session_type: { type: 'string' },
                goal: { type: 'string' },
                experience: { type: 'string' },
                est_duration_min: { type: 'number' },
                equipment_used: { type: 'array', items: { type: 'string' } },
                workout_name: { type: 'string' },
                instructions: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 }
            },
            required: ['date_iso', 'session_type', 'goal', 'experience', 'est_duration_min', 'equipment_used', 'workout_name', 'instructions']
        },
        warmup: {
            type: 'array',
            items: { type: 'object', additionalProperties: false,
                properties: { name: { type: 'string' }, duration_sec: { type: 'number' }, cues: { type: 'string' }, instructions: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3 } },
                required: ['name', 'duration_sec', 'cues', 'instructions']
            }
        },
        blocks: {
            type: 'array',
            items: { type: 'object', additionalProperties: false, properties: {
                    name: { type: 'string' },
                    exercises: { type: 'array', items: { type: 'object', additionalProperties: false, properties: {
                                slug: { type: 'string' },
                                display_name: { type: 'string' },
                                type: { type: 'string' },
                                equipment: { type: 'array', items: { type: 'string' } },
                                primary_muscles: { type: 'array', items: { type: 'string' } },
                                instructions: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3 },
                                sets: { type: 'array', minItems: 2, maxItems: 6, items: { type: 'object', additionalProperties: false, properties: {
                                            reps: { type: 'number' }, time_sec: { type: 'number' }, rest_sec: { type: 'number' },
                                            tempo: { type: 'string' }, intensity: { type: 'string' }, notes: { type: 'string' },
                                            weight_guidance: { type: 'string' }, rpe: { type: 'number' }, rest_type: { type: 'string' }
                                        }, required: ['reps', 'time_sec', 'rest_sec', 'tempo', 'intensity', 'notes', 'weight_guidance', 'rpe', 'rest_type'] } }
                            }, required: ['slug', 'display_name', 'type', 'equipment', 'primary_muscles', 'instructions', 'sets'] } }
                }, required: ['name', 'exercises'] }
        },
        finisher: {
            type: 'array',
            items: { type: 'object', additionalProperties: false, properties: {
                    name: { type: 'string' }, work_sec: { type: 'number' }, rest_sec: { type: 'number' }, rounds: { type: 'number' }, notes: { type: 'string' }
                }, required: ['name', 'work_sec', 'rest_sec', 'rounds', 'notes'] }
        },
        cooldown: {
            type: 'array',
            items: { type: 'object', additionalProperties: false, properties: {
                    name: { type: 'string' }, duration_sec: { type: 'number' }, cues: { type: 'string' }, instructions: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3 }
                }, required: ['name', 'duration_sec', 'cues', 'instructions'] }
        },
        notes: { type: 'string' }
    },
    required: ['meta', 'warmup', 'blocks', 'finisher', 'cooldown', 'notes']
};
//# sourceMappingURL=validation.js.map