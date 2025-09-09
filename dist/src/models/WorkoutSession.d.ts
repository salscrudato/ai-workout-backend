import { Timestamp } from 'firebase-admin/firestore';
export interface WorkoutSession {
    id?: string;
    planId: string;
    userId: string;
    startedAt?: Timestamp | undefined;
    completedAt?: Timestamp | undefined;
    feedback: any;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
export interface CreateWorkoutSessionInput {
    planId: string;
    userId: string;
    startedAt?: Date | Timestamp | undefined;
    completedAt?: Date | Timestamp | undefined;
    feedback?: any;
}
export declare class WorkoutSessionModel {
    private static collection;
    static create(data: CreateWorkoutSessionInput): Promise<WorkoutSession>;
    static start(planId: string, userId: string): Promise<WorkoutSession>;
    static complete(sessionId: string, feedback?: any): Promise<WorkoutSession | null>;
    static findById(id: string): Promise<WorkoutSession | null>;
    static find(filter: {
        userId?: string;
        planId?: string;
    }, options?: {
        sort?: {
            [key: string]: 1 | -1;
        };
        limit?: number;
    }): Promise<WorkoutSession[]>;
    static countDocuments(filter: {
        userId?: string;
        planId?: string;
    }): Promise<number>;
}
//# sourceMappingURL=WorkoutSession.d.ts.map