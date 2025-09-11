import { z } from 'zod';

/**
 * Optimized validation utilities with comprehensive input sanitization and validation
 * Enhanced for performance and security
 */

// Optimized validation patterns with better performance
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^\+?[\d\s\-\(\)]{10,}$/;
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

// Security-focused patterns
const XSS_PATTERNS = /<script|javascript:|on\w+\s*=/i;
const SQL_INJECTION_PATTERNS = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)|('|(\\x27)|(\\x2D\\x2D))/i;

// Enhanced sanitization functions with security focus
export const sanitizeString = (str: string): string => {
  if (typeof str !== 'string') return '';

  return str
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .slice(0, 1000); // Prevent extremely long strings
};

export const sanitizeHtml = (str: string): string => {
  if (typeof str !== 'string') return '';

  return str
    .replace(/[<>'"&]/g, (match) => {
      const htmlEntities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;',
      };
      return htmlEntities[match] || match;
    })
    .slice(0, 2000); // Prevent extremely long HTML strings
};

// Advanced security validation
export const detectXSS = (str: string): boolean => {
  return XSS_PATTERNS.test(str);
};

export const detectSQLInjection = (str: string): boolean => {
  return SQL_INJECTION_PATTERNS.test(str);
};

export const sanitizeForSecurity = (str: string): string => {
  if (typeof str !== 'string') return '';

  // Check for malicious patterns
  if (detectXSS(str) || detectSQLInjection(str)) {
    throw new Error('Potentially malicious input detected');
  }

  return sanitizeString(str);
};

// Legacy function for backward compatibility
export const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

// Enhanced base schemas
export const SafeStringSchema = z
  .string()
  .min(1, 'Field is required')
  .max(1000, 'Field is too long')
  .transform(sanitizeString);

export const EmailSchema = z
  .string()
  .email('Invalid email format')
  .regex(EMAIL_REGEX, 'Invalid email format')
  .max(254, 'Email is too long')
  .transform((email) => email.toLowerCase().trim());

export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const PhoneSchema = z
  .string()
  .regex(PHONE_REGEX, 'Invalid phone number format')
  .optional();

export const UrlSchema = z
  .string()
  .regex(URL_REGEX, 'Invalid URL format')
  .optional();

// User validation schemas
export const CreateUserSchema = z.object({
  email: EmailSchema.optional(),
  firebaseUid: z.string().min(1, 'Firebase UID is required').optional(),
});

// Profile validation schemas
export const ExperienceSchema = z.enum(['beginner', 'intermediate', 'advanced'], {
  errorMap: () => ({ message: 'Experience must be beginner, intermediate, or advanced' }),
});

export const SexSchema = z.enum(['male', 'female', 'prefer_not_to_say'], {
  errorMap: () => ({ message: 'Sex must be male, female, or prefer_not_to_say' }),
});

export const GoalsSchema = z
  .array(z.string().min(1, 'Goal cannot be empty').max(100, 'Goal is too long'))
  .min(1, 'At least one goal is required')
  .max(10, 'Too many goals selected')
  .transform((goals) => goals.map(sanitizeString));

export const EquipmentSchema = z
  .array(z.string().min(1, 'Equipment name cannot be empty').max(50, 'Equipment name is too long'))
  .max(50, 'Too many equipment items selected')
  .transform((equipment) => equipment.map(sanitizeString));

export const ConstraintsSchema = z
  .array(z.string().max(200, 'Constraint is too long'))
  .max(20, 'Too many constraints')
  .transform((constraints) => constraints.map(sanitizeString));

// Utility function to validate ObjectId format
export const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id) || /^[0-9a-zA-Z]{20,}$/.test(id); // Support both MongoDB ObjectId and Firestore document ID formats
};

export const ObjectIdSchema = z
  .string()
  .min(1, 'ID is required')
  .refine(isValidObjectId, 'Invalid ID format');

export const CreateProfileSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  experience: ExperienceSchema,
  goals: GoalsSchema,
  equipmentAvailable: EquipmentSchema,
  age: z
    .number()
    .int('Age must be a whole number')
    .min(13, 'Must be at least 13 years old')
    .max(120, 'Age must be realistic')
    .optional(),
  sex: SexSchema,
  height_ft: z
    .number()
    .int('Height (feet) must be a whole number')
    .min(3, 'Height must be realistic')
    .max(8, 'Height must be realistic')
    .optional(),
  height_in: z
    .number()
    .int('Height (inches) must be a whole number')
    .min(0, 'Inches cannot be negative')
    .max(11, 'Inches must be less than 12')
    .optional(),
  weight_lb: z
    .number()
    .positive('Weight must be positive')
    .min(50, 'Weight must be realistic')
    .max(1000, 'Weight must be realistic')
    .optional(),
  injury_notes: z
    .string()
    .max(1000, 'Injury notes are too long')
    .transform(sanitizeHtml)
    .optional(),
  constraints: ConstraintsSchema,
  health_ack: z.boolean(),
  data_consent: z.boolean(),
});

// Workout validation schemas
export const WorkoutTypeSchema = z.enum([
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

export const GenerateWorkoutSchema = z.object({
  experience: ExperienceSchema,
  goals: GoalsSchema,
  workoutType: z.string()
    .min(1, 'Workout type is required')
    .max(50, 'Workout type is too long')
    .regex(/^[a-zA-Z0-9_\s\/-]+$/, 'Invalid workout type format')
    .transform(sanitizeString),
  equipmentAvailable: EquipmentSchema,
  duration: z
    .number()
    .int('Duration must be a whole number')
    .min(10, 'Minimum workout duration is 10 minutes')
    .max(180, 'Maximum workout duration is 180 minutes'),
  constraints: ConstraintsSchema.optional().default([]),
});

export const CompleteWorkoutSchema = z.object({
  feedback: z
    .string()
    .max(2000, 'Feedback is too long')
    .transform(sanitizeHtml)
    .optional(),
  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5')
    .optional(),
  startedAt: z.string().datetime('Invalid start time format').optional(),
  completedAt: z.string().datetime('Invalid completion time format').optional(),
});

// Pre-workout validation schemas (consolidated from schemas/preworkout.ts)
export const PreWorkoutSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  time_available_min: z.number().int().min(10).max(120),
  start_time_iso: z.string().datetime().optional(),
  energy_level: z.number().int().min(1).max(5),
  workout_type: WorkoutTypeSchema,
  equipment_override: EquipmentSchema.optional(),
  new_injuries: z.string().max(1000, 'Injury notes are too long').transform(sanitizeHtml).optional(),
});

// Authentication schema (consolidated from schemas/validation.ts)
export const AuthSchema = z.object({
  idToken: z.string().min(1, 'ID token is required')
});

// Exercise validation schemas (consolidated from schemas/validation.ts)
export const ExerciseSchema = z.object({
  name: z.string().min(1, 'Exercise name is required'),
  sets: z.number().int().min(1).max(20),
  reps: z.union([z.number().int().min(1).max(1000), z.string()]).optional(),
  weight: z.string().optional(),
  duration_sec: z.number().int().min(1).max(3600).optional(),
  rest_sec: z.number().int().min(0).max(600).optional(),
  notes: z.string().max(500).optional(),
  equipment: z.array(z.string()).optional(),
  muscle_groups: z.array(z.string()).optional()
});

export const WorkoutBlockSchema = z.object({
  name: z.string().min(1, 'Block name is required'),
  exercises: z.array(ExerciseSchema).min(1, 'At least one exercise is required'),
  rest_between_exercises_sec: z.number().int().min(0).max(600).optional(),
  notes: z.string().max(500).optional()
});

export const WorkoutMetaSchema = z.object({
  est_duration_min: z.number().int().min(1).max(300),
  difficulty_level: ExperienceSchema,
  equipment_needed: z.array(z.string()),
  muscle_groups_targeted: z.array(z.string()),
  calories_estimate: z.number().int().min(0).max(2000).optional()
});

export const WarmUpCoolDownSchema = z.object({
  exercises: z.array(ExerciseSchema),
  duration_min: z.number().int().min(1).max(30)
});

export const WorkoutPlanDataSchema = z.object({
  title: z.string().min(1, 'Workout title is required').max(100),
  description: z.string().max(500).optional(),
  blocks: z.array(WorkoutBlockSchema).min(1, 'At least one workout block is required'),
  meta: WorkoutMetaSchema,
  warm_up: WarmUpCoolDownSchema.optional(),
  cool_down: WarmUpCoolDownSchema.optional()
});

// Equipment validation schema (consolidated from schemas/validation.ts)
export const CreateEquipmentSchema = z.object({
  slug: z.string().min(1, 'Equipment slug is required').regex(/^[a-z0-9_-]+$/, 'Invalid slug format'),
  label: z.string().min(1, 'Equipment label is required').max(100)
});

export const UpdateEquipmentSchema = CreateEquipmentSchema.partial();

// Workout session schemas (consolidated from schemas/validation.ts)
export const CreateWorkoutSessionSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  feedback: z.record(z.any()).optional()
});

export const UpdateWorkoutSessionSchema = CreateWorkoutSessionSchema.partial().omit({
  planId: true,
  userId: true
});

// Workout plan creation schema (consolidated from schemas/validation.ts)
export const CreateWorkoutPlanSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  model: z.string().min(1, 'Model is required'),
  promptVersion: z.string().min(1, 'Prompt version is required'),
  preWorkout: PreWorkoutSchema,
  plan: WorkoutPlanDataSchema
});

// Enhanced workout generation request schema
export const GenerateWorkoutRequestSchema = z.object({
  workout_type: z.string().min(1, 'Workout type is required'),
  time_available_min: z.number().int().min(5).max(300),
  equipment_override: EquipmentSchema.optional(),
  injury_notes: z.string().max(1000).optional(),
  constraints: ConstraintsSchema.optional(),
  intensity_preference: z.enum(['low', 'moderate', 'high']).optional(),
  focus_areas: z.array(z.string()).optional()
});

// Update profile schema
export const UpdateProfileSchema = CreateProfileSchema.partial().omit({ userId: true });

// AI Workout Output Schema (converted from JSON Schema in workoutOutput.ts)
// This is used for validating AI-generated workout plans
export const AIWorkoutSetSchema = z.object({
  reps: z.number(),
  time_sec: z.number(),
  rest_sec: z.number(),
  tempo: z.string(),
  intensity: z.string(),
  notes: z.string(),
  weight_guidance: z.string(),
  rpe: z.number(),
  rest_type: z.string()
});

export const AIExerciseSchema = z.object({
  slug: z.string(),
  display_name: z.string(),
  type: z.string(),
  equipment: z.array(z.string()),
  primary_muscles: z.array(z.string()),
  instructions: z.array(z.string()).min(3).max(3),
  sets: z.array(AIWorkoutSetSchema).min(2).max(6)
});

export const AIWorkoutBlockSchema = z.object({
  name: z.string(),
  exercises: z.array(AIExerciseSchema)
});

export const AIWarmupCooldownSchema = z.object({
  name: z.string(),
  duration_sec: z.number(),
  cues: z.string(),
  instructions: z.array(z.string()).min(3).max(3)
});

export const AIFinisherSchema = z.object({
  name: z.string(),
  work_sec: z.number(),
  rest_sec: z.number(),
  rounds: z.number(),
  notes: z.string()
});

export const AIWorkoutMetaSchema = z.object({
  date_iso: z.string(),
  session_type: z.string(),
  goal: z.string(),
  experience: z.string(),
  est_duration_min: z.number(),
  equipment_used: z.array(z.string()),
  workout_name: z.string(),
  instructions: z.array(z.string()).min(4).max(4)
});

export const AIWorkoutPlanSchema = z.object({
  meta: AIWorkoutMetaSchema,
  warmup: z.array(AIWarmupCooldownSchema),
  blocks: z.array(AIWorkoutBlockSchema),
  finisher: z.array(AIFinisherSchema),
  cooldown: z.array(AIWarmupCooldownSchema),
  notes: z.string()
});

// Convert Zod schema to JSON Schema format for OpenAI API compatibility
export const WorkoutPlanJsonSchema = {
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
      required: ['date_iso','session_type','goal','experience','est_duration_min','equipment_used','workout_name','instructions']
    },
    warmup: {
      type: 'array',
      items: { type:'object', additionalProperties:false,
        properties:{ name:{type:'string'}, duration_sec:{type:'number'}, cues:{type:'string'}, instructions:{type:'array', items:{type:'string'}, minItems:3, maxItems:3} },
        required:['name','duration_sec','cues','instructions']
      }
    },
    blocks: {
      type: 'array',
      items: { type:'object', additionalProperties:false, properties:{
        name:{type:'string'},
        exercises:{ type:'array', items:{ type:'object', additionalProperties:false, properties:{
          slug:{type:'string'},
          display_name:{type:'string'},
          type:{type:'string'},
          equipment:{type:'array', items:{type:'string'}},
          primary_muscles:{type:'array', items:{type:'string'}},
          instructions:{type:'array', items:{type:'string'}, minItems:3, maxItems:3},
          sets:{ type:'array', minItems:2, maxItems:6, items:{ type:'object', additionalProperties:false, properties:{
            reps:{type:'number'}, time_sec:{type:'number'}, rest_sec:{type:'number'},
            tempo:{type:'string'}, intensity:{type:'string'}, notes:{type:'string'},
            weight_guidance:{type:'string'}, rpe:{type:'number'}, rest_type:{type:'string'}
          }, required:['reps','time_sec','rest_sec','tempo','intensity','notes','weight_guidance','rpe','rest_type'] } }
        }, required:['slug','display_name','type','equipment','primary_muscles','instructions','sets'] } }
      }, required:['name','exercises'] }
    },
    finisher: {
      type:'array',
      items:{ type:'object', additionalProperties:false, properties:{
        name:{type:'string'}, work_sec:{type:'number'}, rest_sec:{type:'number'}, rounds:{type:'number'}, notes:{type:'string'}
      }, required:['name','work_sec','rest_sec','rounds','notes'] }
    },
    cooldown: {
      type:'array',
      items:{ type:'object', additionalProperties:false, properties:{
        name:{type:'string'}, duration_sec:{type:'number'}, cues:{type:'string'}, instructions:{type:'array', items:{type:'string'}, minItems:3, maxItems:3}
      }, required:['name','duration_sec','cues','instructions'] }
    },
    notes: { type:'string' }
  },
  required: ['meta','warmup','blocks','finisher','cooldown','notes']
};

// Type exports - consolidated from all schema files
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type CreateProfileInput = z.infer<typeof CreateProfileSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type GenerateWorkoutInput = z.infer<typeof GenerateWorkoutSchema>;
export type GenerateWorkoutRequest = z.infer<typeof GenerateWorkoutRequestSchema>;
export type CompleteWorkoutInput = z.infer<typeof CompleteWorkoutSchema>;
export type AuthInput = z.infer<typeof AuthSchema>;
export type PreWorkout = z.infer<typeof PreWorkoutSchema>;
export type CreateWorkoutPlanInput = z.infer<typeof CreateWorkoutPlanSchema>;
export type CreateWorkoutSessionInput = z.infer<typeof CreateWorkoutSessionSchema>;
export type UpdateWorkoutSessionInput = z.infer<typeof UpdateWorkoutSessionSchema>;
export type CreateEquipmentInput = z.infer<typeof CreateEquipmentSchema>;
export type UpdateEquipmentInput = z.infer<typeof UpdateEquipmentSchema>;
export type AIWorkoutPlan = z.infer<typeof AIWorkoutPlanSchema>;
