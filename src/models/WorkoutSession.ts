import { getFirestore } from '../config/db';
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

export class WorkoutSessionModel {
  private static collection = 'workoutSessions';

  static async create(data: CreateWorkoutSessionInput): Promise<WorkoutSession> {
    const db = getFirestore();
    const now = Timestamp.now();

    const workoutSessionData: Omit<WorkoutSession, 'id'> = {
      planId: data.planId,
      userId: data.userId,
      startedAt: data.startedAt ? (data.startedAt instanceof Date ? Timestamp.fromDate(data.startedAt) : data.startedAt) : undefined,
      completedAt: data.completedAt ? (data.completedAt instanceof Date ? Timestamp.fromDate(data.completedAt) : data.completedAt) : undefined,
      feedback: data.feedback || {},
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection(this.collection).add(workoutSessionData);

    return {
      id: docRef.id,
      ...workoutSessionData,
    };
  }

  static async findById(id: string): Promise<WorkoutSession | null> {
    const db = getFirestore();
    const doc = await db.collection(this.collection).doc(id).get();

    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
    } as WorkoutSession;
  }

  static async find(
    filter: { userId?: string; planId?: string },
    options: { sort?: { [key: string]: 1 | -1 }; limit?: number } = {}
  ): Promise<WorkoutSession[]> {
    const db = getFirestore();
    let query = db.collection(this.collection) as any;

    if (filter.userId) {
      query = query.where('userId', '==', filter.userId);
    }
    if (filter.planId) {
      query = query.where('planId', '==', filter.planId);
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

    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as WorkoutSession[];
  }

  static async countDocuments(filter: { userId?: string; planId?: string }): Promise<number> {
    const db = getFirestore();
    let query = db.collection(this.collection) as any;

    if (filter.userId) {
      query = query.where('userId', '==', filter.userId);
    }
    if (filter.planId) {
      query = query.where('planId', '==', filter.planId);
    }

    const snapshot = await query.get();
    return snapshot.size;
  }
}