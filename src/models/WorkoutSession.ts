import { getFirestore } from '../config/db';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

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

function sanitizeFeedback(input: any): any {
  if (input == null) return {};
  // If plain string, cap to 2000 chars
  if (typeof input === 'string') {
    return input.length > 2000 ? input.slice(0, 2000) : input;
  }
  // If object, cap common fields
  const out: any = { ...input };
  if (typeof out.comment === 'string') {
    out.comment = out.comment.length > 2000 ? out.comment.slice(0, 2000) : out.comment;
  }
  return out;
}

export class WorkoutSessionModel {
  private static collection = 'workoutSessions';

  static async create(data: CreateWorkoutSessionInput): Promise<WorkoutSession> {
    const db = getFirestore();
    const workoutSessionData: Omit<WorkoutSession, 'id'> = {
      planId: data.planId,
      userId: data.userId,
      startedAt: data.startedAt
        ? data.startedAt instanceof Date
          ? Timestamp.fromDate(data.startedAt)
          : data.startedAt
        : undefined,
      completedAt: data.completedAt
        ? data.completedAt instanceof Date
          ? Timestamp.fromDate(data.completedAt)
          : data.completedAt
        : undefined,
      feedback: sanitizeFeedback(data.feedback) || {},
      createdAt: (FieldValue.serverTimestamp() as unknown) as Timestamp,
      updatedAt: (FieldValue.serverTimestamp() as unknown) as Timestamp,
    };

    const docRef = await db.collection(this.collection).add(workoutSessionData);

    return {
      id: docRef.id,
      ...workoutSessionData,
    };
  }

  static async start(planId: string, userId: string): Promise<WorkoutSession> {
    const db = getFirestore();
    const now = (FieldValue.serverTimestamp() as unknown) as Timestamp;
    const workoutSessionData: Omit<WorkoutSession, 'id'> = {
      planId,
      userId,
      startedAt: now,
      completedAt: undefined,
      feedback: {},
      createdAt: now,
      updatedAt: now,
    };
    const docRef = await db.collection(this.collection).add(workoutSessionData);
    return { id: docRef.id, ...workoutSessionData };
  }

  static async complete(sessionId: string, feedback?: any): Promise<WorkoutSession | null> {
    const db = getFirestore();
    const docRef = db.collection(this.collection).doc(sessionId);
    const snap = await docRef.get();
    if (!snap.exists) return null;
    const patch = {
      completedAt: (FieldValue.serverTimestamp() as unknown) as Timestamp,
      feedback: sanitizeFeedback(feedback) || {},
      updatedAt: (FieldValue.serverTimestamp() as unknown) as Timestamp,
    };
    await docRef.set(patch, { merge: true });
    const saved = await docRef.get();
    return { id: saved.id, ...(saved.data() as any) } as WorkoutSession;
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