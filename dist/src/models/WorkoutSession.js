"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutSessionModel = void 0;
const db_1 = require("../config/db");
const firestore_1 = require("firebase-admin/firestore");
class WorkoutSessionModel {
    static collection = 'workoutSessions';
    static async create(data) {
        const db = (0, db_1.getFirestore)();
        const now = firestore_1.Timestamp.now();
        const workoutSessionData = {
            planId: data.planId,
            userId: data.userId,
            startedAt: data.startedAt ? (data.startedAt instanceof Date ? firestore_1.Timestamp.fromDate(data.startedAt) : data.startedAt) : undefined,
            completedAt: data.completedAt ? (data.completedAt instanceof Date ? firestore_1.Timestamp.fromDate(data.completedAt) : data.completedAt) : undefined,
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
        const db = (0, db_1.getFirestore)();
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
        const db = (0, db_1.getFirestore)();
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
        const db = (0, db_1.getFirestore)();
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
exports.WorkoutSessionModel = WorkoutSessionModel;
//# sourceMappingURL=WorkoutSession.js.map