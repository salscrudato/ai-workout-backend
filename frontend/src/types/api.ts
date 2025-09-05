/**
 * Comprehensive API Types for the AI Workout application
 *
 * This file contains all type definitions for:
 * - API requests and responses
 * - Database models
 * - Business logic types
 * - Validation schemas
 */

// Base utility types
export interface Timestamp {
  seconds: number;
  nanoseconds: number;
  toDate(): Date;
}

// Strict literal types for better type safety
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type Sex = 'male' | 'female' | 'prefer_not_to_say';
export type WorkoutType = 'full_body' | 'upper_lower' | 'push' | 'pull' | 'legs' | 'core' | 'conditioning' | 'mobility' | 'recovery';

// API Response wrapper types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
  timestamp: string;
}

export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// User types
export interface User {
  readonly id: string;
  readonly email: string;
  readonly firebaseUid: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// Input type for creating users (with optional fields)
export interface CreateUserInput {
  email?: string;
  firebaseUid?: string;
}

// Profile types with enhanced type safety
export interface Profile {
  readonly id: string;
  readonly userId: string;
  readonly experience: ExperienceLevel;
  readonly goals: readonly string[];
  readonly equipmentAvailable: readonly string[];
  readonly age?: number;
  readonly sex: Sex;
  readonly height_ft?: number;
  readonly height_in?: number;
  readonly weight_lb?: number;
  readonly injury_notes?: string;
  readonly constraints: readonly string[];
  readonly health_ack: boolean;
  readonly data_consent: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateProfileInput {
  userId: string;
  experience?: 'beginner' | 'intermediate' | 'advanced';
  goals?: string[];
  equipmentAvailable?: string[];
  age?: number;
  sex?: 'male' | 'female' | 'prefer_not_to_say';
  height_ft?: number;
  height_in?: number;
  weight_lb?: number;
  injury_notes?: string;
  constraints?: string[];
  health_ack?: boolean;
  data_consent?: boolean;
}

// Equipment types
export interface Equipment {
  slug: string;
  label: string;
}

// Workout types
export interface WorkoutExercise {
  name: string;
  display_name?: string; // Alternative display name
  sets: number | { reps: string; weight?: string; rest?: string }[]; // Can be number or array of set objects
  reps: string;
  weight?: string;
  duration?: string;
  rest?: string;
  tempo?: string;
  intensity?: string;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  restType?: 'active' | 'passive';
  notes?: string;
  equipment?: string;
  primaryMuscles?: string;
  instructions?: string[];
  blockName?: string;
  blockIndex?: number;
  exerciseIndex?: number;
}

export interface WorkoutPlan {
  meta?: {
    date_iso: string;
    session_type: string;
    goal: string;
    experience: string;
    est_duration_min: number;
    equipment_used: string[];
    workout_name?: string;
    instructions?: string[];
  };
  warmup: WorkoutExercise[];
  exercises: WorkoutExercise[];
  cooldown: WorkoutExercise[];
  notes?: string;
  estimatedDuration?: number;
}

export interface PreWorkout {
  experience: 'beginner' | 'intermediate' | 'advanced';
  goals: readonly string[] | string[];
  workoutType?: string; // Made optional to handle undefined values from API
  equipmentAvailable: readonly string[] | string[];
  duration: number;
  time_available_min?: number; // Backend field name
  constraints: readonly string[] | string[];
  energy_level?: number; // Energy level (1-5)
}

export interface WorkoutPlanResponse {
  id?: string;
  userId: string;
  model: string;
  promptVersion: string;
  preWorkout: PreWorkout;
  plan: WorkoutPlan;
  createdAt: string;
  // Completion information
  completedAt?: string;
  feedback?: {
    comment?: string;
    rating?: number;
  };
  isCompleted?: boolean;
}

export interface GenerateWorkoutRequest {
  experience: 'beginner' | 'intermediate' | 'advanced';
  goals: readonly string[] | string[];
  workoutType: string;
  equipmentAvailable: readonly string[] | string[];
  duration: number;
  constraints?: readonly string[] | string[];
}

export interface GenerateWorkoutResponse {
  workoutId: string;
  plan: WorkoutPlan;
  deduped?: boolean;
}

export interface WorkoutSession {
  id?: string;
  userId: string;
  workoutPlanId: string;
  completedAt: string;
  feedback?: string;
  rating?: number;
}

// Authentication types
export interface AuthResponse {
  user: User;
  profile?: Profile;
  token: string;
  isNewUser: boolean;
}

// API Error types
export interface ApiError {
  error: string;
  details?: any;
}

// API Response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
