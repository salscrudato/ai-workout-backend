"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutSessionModel = void 0;
const db_1 = require("../config/db");
const firestore_1 = require("firebase-admin/firestore");
function sanitizeFeedback(input) {
    if (input == null)
        return {};
    // If plain string, cap to 2000 chars
    if (typeof input === 'string') {
        return input.length > 2000 ? input.slice(0, 2000) : input;
    }
    // If object, cap common fields
    const out = { ...input };
    if (typeof out.comment === 'string') {
        out.comment = out.comment.length > 2000 ? out.comment.slice(0, 2000) : out.comment;
    }
    return out;
}
class WorkoutSessionModel {
    static collection = 'workoutSessions';
    static async create(data) {
        const db = (0, db_1.getFirestore)();
        const workoutSessionData = {
            planId: data.planId,
            userId: data.userId,
            startedAt: data.startedAt
                ? data.startedAt instanceof Date
                    ? firestore_1.Timestamp.fromDate(data.startedAt)
                    : data.startedAt
                : undefined,
            completedAt: data.completedAt
                ? data.completedAt instanceof Date
                    ? firestore_1.Timestamp.fromDate(data.completedAt)
                    : data.completedAt
                : undefined,
            feedback: sanitizeFeedback(data.feedback) || {},
            createdAt: firestore_1.FieldValue.serverTimestamp(),
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        };
        const docRef = await db.collection(this.collection).add(workoutSessionData);
        return {
            id: docRef.id,
            ...workoutSessionData,
        };
    }
    static async start(planId, userId) {
        const db = (0, db_1.getFirestore)();
        const now = firestore_1.FieldValue.serverTimestamp();
        const workoutSessionData = {
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
    static async complete(sessionId, feedback) {
        const db = (0, db_1.getFirestore)();
        const docRef = db.collection(this.collection).doc(sessionId);
        const snap = await docRef.get();
        if (!snap.exists)
            return null;
        const patch = {
            completedAt: firestore_1.FieldValue.serverTimestamp(),
            feedback: sanitizeFeedback(feedback) || {},
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        };
        await docRef.set(patch, { merge: true });
        const saved = await docRef.get();
        return { id: saved.id, ...saved.data() };
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