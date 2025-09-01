import { getFirestore } from '../config/db';
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

export class WorkoutPlanModel {
  private static collection = 'workoutPlans';

  static async create(data: CreateWorkoutPlanInput): Promise<WorkoutPlan> {
    const db = getFirestore();
    const now = Timestamp.now();

    const workoutPlanData: Omit<WorkoutPlan, 'id'> = {
      userId: data.userId,
      model: data.model,
      promptVersion: data.promptVersion,
      preWorkout: data.preWorkout,
      plan: data.plan,
      createdAt: now,
    };

    const docRef = await db.collection(this.collection).add(workoutPlanData);

    return {
      id: docRef.id,
      ...workoutPlanData,
    };
  }

  static async findById(id: string): Promise<WorkoutPlan | null> {
    const db = getFirestore();
    const doc = await db.collection(this.collection).doc(id).get();

    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
    } as WorkoutPlan;
  }

  static async findOne(filter: {
    userId?: string;
    promptVersion?: string;
    preWorkout?: any;
  }): Promise<WorkoutPlan | null> {
    const db = getFirestore();
    let query = db.collection(this.collection) as any;

    if (filter.userId) {
      query = query.where('userId', '==', filter.userId);
    }
    if (filter.promptVersion) {
      query = query.where('promptVersion', '==', filter.promptVersion);
    }
    // Note: Firestore doesn't support deep object equality queries
    // We'll need to handle preWorkout matching in the application layer

    const snapshot = await query.limit(1).get();

    if (snapshot.empty) {
      return null;
    }

    const docs = snapshot.docs;

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
    filter: { userId?: string },
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