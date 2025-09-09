import { Timestamp } from 'firebase-admin/firestore';
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
    }>;
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
export declare class WorkoutPlanModel {
    private static collection;
    static create(data: CreateWorkoutPlanInput): Promise<WorkoutPlan>;
    static findById(id: string): Promise<WorkoutPlan | null>;
    static findOne(filter: {
        userId?: string;
        promptVersion?: string;
        preWorkout?: any;
        dedupKey?: string;
    }): Promise<WorkoutPlan | null>;
    static find(filter: {
        userId?: string;
        ids?: string[];
    }, options?: {
        sort?: {
            [key: string]: 1 | -1;
        };
        limit?: number;
        select?: {
            [key: string]: 0 | 1;
        };
    }): Promise<WorkoutPlan[]>;
}
//# sourceMappingURL=WorkoutPlan.d.ts.map