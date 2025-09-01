import { getFirestore } from '../config/db';
import { Timestamp } from 'firebase-admin/firestore';
export class WorkoutSessionModel {
    static collection = 'workoutSessions';
    static async create(data) {
        const db = getFirestore();
        const now = Timestamp.now();
        const workoutSessionData = {
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
    static async findById(id) {
        const db = getFirestore();
        const doc = await db.collection(this.collection).doc(id).get();
        if (!doc.exists) {
            return null;
        }
        return {
            id: doc.id,
            ...doc.data(),
        };
    }
    static async find(filter, options = {}) {
        const db = getFirestore();
        let query = db.collection(this.collection);
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
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    }
    static async countDocuments(filter) {
        const db = getFirestore();
        let query = db.collection(this.collection);
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
//# sourceMappingURL=WorkoutSession.js.map