import { Timestamp } from 'firebase-admin/firestore';
export interface WorkoutPlan {
    id?: string;
    userId: string;
    model: string;
    promptVersion: string;
    preWorkout: any;
    plan: any;
    createdAt: Timestamp;
}
export interface CreateWorkoutPlanInput {
    userId: string;
    model: string;
    promptVersion: string;
    preWorkout: any;
    plan: any;
}
export declare class WorkoutPlanModel {
    private static collection;
    static create(data: CreateWorkoutPlanInput): Promise<WorkoutPlan>;
    static findById(id: string): Promise<WorkoutPlan | null>;
    static findOne(filter: {
        userId?: string;
        promptVersion?: string;
        preWorkout?: any;
    }): Promise<WorkoutPlan | null>;
    static find(filter: {
        userId?: string;
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