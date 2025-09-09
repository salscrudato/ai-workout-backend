"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutPlanModel = void 0;
const db_1 = require("../config/db");
const firestore_1 = require("firebase-admin/firestore");
const hash_1 = require("../libs/hash");
class WorkoutPlanModel {
    static collection = 'workoutPlans';
    static cache = new Map();
    static CACHE_TTL = 10 * 60 * 1000;
    static setCacheEntry(key, plan) {
        this.cache.set(key, { plan, timestamp: Date.now() });
    }
    static getCacheEntry(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        if (Date.now() - entry.timestamp > this.CACHE_TTL) {
            this.cache.delete(key);
            return null;
        }
        return entry.plan;
    }
    static async create(data) {
        const db = (0, db_1.getFirestore)();
        const now = firestore_1.Timestamp.now();
        const base = data.preWorkout;
        const canonical = {
            userId: data.userId,
            workout_type: base.workout_type,
            experience: base.experience,
            time_available_min: base.time_available_min,
            goals: Array.isArray(base.goals) ? [...base.goals].sort() : [],
            equipment_override: Array.isArray(base.equipment_override) ? [...base.equipment_override].sort() : [],
        };
        const dedupKey = data.dedupKey || (0, hash_1.sha256)(canonical);
        const cached = this.getCacheEntry(dedupKey);
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
        const workoutPlanData = {
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
        this.setCacheEntry(dedupKey, workoutPlan);
        return workoutPlan;
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
    static async findOne(filter) {
        const db = (0, db_1.getFirestore)();
        let query = db.collection(this.collection);
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
            return { id: doc.id, ...doc.data() };
        }
        const snapshot = await query.limit(1).get();
        if (snapshot.empty) {
            return null;
        }
        const docs = snapshot.docs;
        if (filter.preWorkout) {
            for (const doc of docs) {
                const data = doc.data();
                if (JSON.stringify(data.preWorkout) === JSON.stringify(filter.preWorkout)) {
                    return { id: doc.id, ...data };
                }
            }
            return null;
        }
        const doc = docs[0];
        return { id: doc.id, ...doc.data() };
    }
    static async find(filter, options = {}) {
        const db = (0, db_1.getFirestore)();
        let query = db.collection(this.collection);
        if (filter.userId) {
            query = query.where('userId', '==', filter.userId);
        }
        if (options.sort) {
            for (const [field, direction] of Object.entries(options.sort)) {
                query = query.orderBy(field, direction === 1 ? 'asc' : 'desc');
            }
        }
        if (options.limit) {
            query = query.limit(options.limit);
        }
        const snapshot = await query.get();
        let results = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        if (options.select) {
            results = results.map(item => {
                const filtered = { id: item.id };
                for (const [field, include] of Object.entries(options.select || {})) {
                    if (include === 1 && field !== 'id') {
                        filtered[field] = item[field];
                    }
                    else if (include === 0 && field !== 'id') {
                    }
                }
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
exports.WorkoutPlanModel = WorkoutPlanModel;
//# sourceMappingURL=WorkoutPlan.js.map