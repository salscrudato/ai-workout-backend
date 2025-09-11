import { getFirestore } from '../config/db';
import { Timestamp } from 'firebase-admin/firestore';
import { sha256 } from '../libs/hash';
import { workoutCache, CacheKeys } from '../services/cache';

// Proper type definitions for workout plan data
export interface PreWorkoutData {
  userId: string;
  workout_type: string;
  experience: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  time_available_min: number;
  equipment_override?: string[];
  injury_notes?: string;
  constraints?: string[];
}

export interface WorkoutBlock {
  name: string;
  exercises: Exercise[];
  rest_between_exercises_sec?: number;
  notes?: string;
}

export interface Exercise {
  name: string;
  sets: number;
  setsData?: Array<{
    reps: number;
    time_sec: number;
    rest_sec: number;
    tempo: string;
    intensity: string;
    notes: string;
    weight_guidance: string;
    rpe: number;
    rest_type: string;
  }>; // Store the detailed sets data from AI generation
  reps?: number | string;
  weight?: string;
  duration_sec?: number;
  rest_sec?: number;
  notes?: string;
  equipment?: string[];
  muscle_groups?: string[];
}

export interface WorkoutPlanData {
  title: string;
  description: string;
  blocks: WorkoutBlock[];
  meta: {
    est_duration_min: number;
    difficulty_level: 'beginner' | 'intermediate' | 'advanced';
    equipment_needed: string[];
    muscle_groups_targeted: string[];
    calories_estimate?: number;
  };
  warm_up?: {
    exercises: Exercise[];
    duration_min: number;
  };
  cool_down?: {
    exercises: Exercise[];
    duration_min: number;
  };
}

export interface WorkoutPlan {
  id?: string;
  userId: string;
  model: string;
  promptVersion: string;
  preWorkout: PreWorkoutData;
  plan: WorkoutPlanData;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  dedupKey?: string;
  summary?: {
    workoutType: string;
    experience: 'beginner' | 'intermediate' | 'advanced';
    durationMin: number;
    goals: string[];
    equipment: string[];
  };
}

export interface CreateWorkoutPlanInput {
  userId: string;
  model: string;
  promptVersion: string;
  preWorkout: PreWorkoutData;
  plan: WorkoutPlanData;
  dedupKey?: string;
  summary?: {
    workoutType: string;
    experience: 'beginner' | 'intermediate' | 'advanced';
    durationMin: number;
    goals: string[];
    equipment: string[];
  };
}

/**
 * Optimized WorkoutPlan Model with performance enhancements
 * - Efficient querying with compound indexes
 * - Batch operations for multiple plans
 * - Optimized deduplication logic
 */
export class WorkoutPlanModel {
  private static readonly collection = 'workoutPlans';

  /**
   * Create a new workout plan with optimized deduplication
   */
  static async create(data: CreateWorkoutPlanInput): Promise<WorkoutPlan> {
    const db = getFirestore();
    const now = Timestamp.now();

    // Optimized canonical representation for deduplication
    const base = data.preWorkout;
    const canonical = {
      userId: data.userId,
      workout_type: base.workout_type,
      experience: base.experience,
      time_available_min: base.time_available_min,
      goals: Array.isArray(base.goals) ? [...base.goals].sort() : [],
      equipment_override: Array.isArray(base.equipment_override) ? [...base.equipment_override].sort() : [],
    };
    const dedupKey = data.dedupKey || sha256(canonical);

    // Check cache first for recent duplicates
    const cacheKey = CacheKeys.workout(data.userId, dedupKey);
    const cached = workoutCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const summary = data.summary || {
      workoutType: base.workout_type,
      experience: base.experience,
      durationMin: base.time_available_min,
      goals: Array.isArray(base.goals) ? [...base.goals].sort() : [],
      equipment: Array.isArray(base.equipment_override) ? [...base.equipment_override].sort() : [],
    };

    // Optimized data structure for Firestore
    const workoutPlanData: Omit<WorkoutPlan, 'id'> = {
      userId: data.userId,
      model: data.model,
      promptVersion: data.promptVersion,
      preWorkout: data.preWorkout,
      plan: data.plan,
      createdAt: now,
      updatedAt: now,
      dedupKey,
      summary,
    };

    const docRef = await db.collection(this.collection).add(workoutPlanData);

    const workoutPlan = {
      id: docRef.id,
      ...workoutPlanData,
    };

    // Cache the created workout plan
    workoutCache.set(cacheKey, workoutPlan);

    return workoutPlan;
  }

  static async findById(id: string): Promise<WorkoutPlan | null> {
    // Check cache first
    const cacheKey = CacheKeys.workoutPlan(id);
    const cached = workoutCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const db = getFirestore();
    const doc = await db.collection(this.collection).doc(id).get();

    if (!doc.exists) {
      return null;
    }

    const workoutPlan = {
      id: doc.id,
      ...doc.data(),
    } as WorkoutPlan;

    // Cache the result
    workoutCache.set(cacheKey, workoutPlan);

    return workoutPlan;
  }

  static async findOne(filter: {
    userId?: string;
    promptVersion?: string;
    preWorkout?: any;
    dedupKey?: string;
  }): Promise<WorkoutPlan | null> {
    const db = getFirestore();
    let query = db.collection(this.collection) as any;

    if (filter.userId) {
      query = query.where('userId', '==', filter.userId);
    }
    if (filter.promptVersion) {
      query = query.where('promptVersion', '==', filter.promptVersion);
    }
    if (filter.dedupKey) {
      query = query.where('dedupKey', '==', filter.dedupKey);
      const snapshot = await query.limit(1).get();
      if (snapshot.empty) {
        return null;
      }
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as WorkoutPlan;
    }
    // Note: Firestore doesn't support deep object equality queries
    // We'll need to handle preWorkout matching in the application layer

    const snapshot = await query.limit(1).get();

    if (snapshot.empty) {
      return null;
    }

    const {docs} = snapshot;

    // If preWorkout filter is provided, check it manually
    if (filter.preWorkout) {
      for (const doc of docs) {
        const data = doc.data();
        if (JSON.stringify(data.preWorkout) === JSON.stringify(filter.preWorkout)) {
          return { id: doc.id, ...data } as WorkoutPlan;
        }
      }
      return null;
    }

    const doc = docs[0];
    return { id: doc.id, ...doc.data() } as WorkoutPlan;
  }

  static async find(
    filter: { userId?: string; ids?: string[] },
    options: { sort?: { [key: string]: 1 | -1 }; limit?: number; select?: { [key: string]: 0 | 1 } } = {}
  ): Promise<WorkoutPlan[]> {
    const db = getFirestore();
    let query = db.collection(this.collection) as any;

    if (filter.userId) {
      query = query.where('userId', '==', filter.userId);
    }

    // Apply sorting
    if (options.sort) {
      for (const [field, direction] of Object.entries(options.sort)) {
        query = query.orderBy(field, direction === 1 ? 'asc' : 'desc');
      }
    }

    // Apply limit
    if (options.limit) {
      query = query.limit(options.limit);
    }

    const snapshot = await query.get();

    let results = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as WorkoutPlan[];

    // Apply field selection (projection)
    if (options.select) {
      results = results.map(item => {
        const filtered: any = { id: item.id };
        for (const [field, include] of Object.entries(options.select || {})) {
          if (include === 1 && field !== 'id') {
            filtered[field] = (item as any)[field];
          } else if (include === 0 && field !== 'id') {
            // Exclude field - don't add it to filtered
          }
        }
        // If no fields are explicitly included (only exclusions), include all except excluded
        if (!Object.values(options.select || {}).includes(1)) {
          for (const [key, value] of Object.entries(item)) {
            if (!(key in (options.select || {})) || (options.select && options.select[key] !== 0)) {
              filtered[key] = value;
            }
          }
        }
        return filtered;
      });
    }

    return results;
  }
}