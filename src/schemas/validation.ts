import { z } from 'zod';

// Common validation schemas
export const ExperienceLevel = z.enum(['beginner', 'intermediate', 'advanced']);
export const Sex = z.enum(['male', 'female', 'prefer_not_to_say']);
export const DifficultyLevel = z.enum(['beginner', 'intermediate', 'advanced']);

// User validation schemas
export const CreateUserSchema = z.object({
  email: z.string().email().optional(),
  firebaseUid: z.string().optional(),
  // Profile fields (all optional for user creation)
  experience: ExperienceLevel.optional(),
  goals: z.array(z.string()).optional(),
  equipmentAvailable: z.array(z.string()).optional(),
  age: z.number().int().min(13).max(120).optional(),
  sex: Sex.optional(),
  height_ft: z.number().int().min(0).max(10).optional(),
  height_in: z.number().int().min(0).max(11).optional(),
  weight_lb: z.number().positive().max(1000).optional(),
  injury_notes: z.string().max(1000).optional(),
  constraints: z.array(z.string()).optional(),
  health_ack: z.boolean().optional(),
  data_consent: z.boolean().optional()
});

export const AuthSchema = z.object({
  idToken: z.string().min(1, 'ID token is required')
});

// Profile validation schemas
export const CreateProfileSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  experience: ExperienceLevel.default('beginner'),
  goals: z.array(z.string()).min(1, 'At least one goal is required'),
  equipmentAvailable: z.array(z.string()).default([]),
  age: z.number().int().min(13).max(120).optional(),
  sex: Sex.default('prefer_not_to_say'),
  height_ft: z.number().int().min(0).max(10).optional(),
  height_in: z.number().int().min(0).max(11).optional(),
  weight_lb: z.number().positive().max(1000).optional(),
  injury_notes: z.string().max(1000).optional(),
  constraints: z.array(z.string()).default([]),
  health_ack: z.boolean().default(false),
  data_consent: z.boolean().default(false)
});

export const UpdateProfileSchema = CreateProfileSchema.partial().omit({ userId: true });

// Exercise validation schemas
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
  difficulty_level: DifficultyLevel,
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

// Pre-workout validation schemas
export const PreWorkoutDataSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  workout_type: z.string().min(1, 'Workout type is required'),
  experience: ExperienceLevel,
  goals: z.array(z.string()).min(1, 'At least one goal is required'),
  time_available_min: z.number().int().min(5).max(300),
  equipment_override: z.array(z.string()).optional(),
  injury_notes: z.string().max(1000).optional(),
  constraints: z.array(z.string()).optional()
});

// Workout generation request schema
export const GenerateWorkoutRequestSchema = z.object({
  workout_type: z.string().min(1, 'Workout type is required'),
  time_available_min: z.number().int().min(5).max(300),
  equipment_override: z.array(z.string()).optional(),
  injury_notes: z.string().max(1000).optional(),
  constraints: z.array(z.string()).optional(),
  intensity_preference: z.enum(['low', 'moderate', 'high']).optional(),
  focus_areas: z.array(z.string()).optional()
});

// Workout plan creation schema
export const CreateWorkoutPlanSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  model: z.string().min(1, 'Model is required'),
  promptVersion: z.string().min(1, 'Prompt version is required'),
  preWorkout: PreWorkoutDataSchema,
  plan: WorkoutPlanDataSchema
});

// Workout session schemas
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

// Equipment validation schema
export const CreateEquipmentSchema = z.object({
  slug: z.string().min(1, 'Equipment slug is required').regex(/^[a-z0-9_-]+$/, 'Invalid slug format'),
  label: z.string().min(1, 'Equipment label is required').max(100)
});

export const UpdateEquipmentSchema = CreateEquipmentSchema.partial();

// Health check schema
export const HealthCheckResponseSchema = z.object({
  ok: z.boolean(),
  timestamp: z.string(),
  version: z.string(),
  environment: z.string(),
  dependencies: z.record(z.object({
    status: z.enum(['healthy', 'unhealthy', 'degraded']),
    responseTime: z.number().optional(),
    error: z.string().optional()
  })).optional()
});

// Error response schema
export const ErrorResponseSchema = z.object({
  error: z.string(),
  code: z.string(),
  details: z.any().optional(),
  errorId: z.string().optional(),
  timestamp: z.string().optional()
});

// Pagination schemas
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) => z.object({
  data: z.array(itemSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean()
  })
});

// Type exports for use in controllers
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type AuthInput = z.infer<typeof AuthSchema>;
export type CreateProfileInput = z.infer<typeof CreateProfileSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type GenerateWorkoutRequest = z.infer<typeof GenerateWorkoutRequestSchema>;
export type CreateWorkoutPlanInput = z.infer<typeof CreateWorkoutPlanSchema>;
export type CreateWorkoutSessionInput = z.infer<typeof CreateWorkoutSessionSchema>;
export type UpdateWorkoutSessionInput = z.infer<typeof UpdateWorkoutSessionSchema>;
export type CreateEquipmentInput = z.infer<typeof CreateEquipmentSchema>;
export type UpdateEquipmentInput = z.infer<typeof UpdateEquipmentSchema>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
