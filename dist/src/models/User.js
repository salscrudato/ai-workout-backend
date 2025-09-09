"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const db_1 = require("../config/db");
const firestore_1 = require("firebase-admin/firestore");
class UserModel {
    static collection = 'users';
    static cache = new Map();
    static CACHE_TTL = 5 * 60 * 1000;
    static async create(data) {
        const db = (0, db_1.getFirestore)();
        const now = firestore_1.Timestamp.now();
        const userData = {
            email: data.email || '',
            ...(data.firebaseUid && { firebaseUid: data.firebaseUid }),
            createdAt: now,
            updatedAt: now,
        };
        if (data.firebaseUid) {
            const docRef = db.collection(this.collection).doc(data.firebaseUid);
            await docRef.set(userData, { merge: true });
            const user = { id: data.firebaseUid, ...userData };
            this.setCacheEntry(data.firebaseUid, user);
            return user;
        }
        const docRef = await db.collection(this.collection).add(userData);
        const user = { id: docRef.id, ...userData };
        if (data.email) {
            this.setCacheEntry(data.email, user);
        }
        return user;
    }
    static setCacheEntry(key, user) {
        this.cache.set(key, { user, timestamp: Date.now() });
    }
    static getCacheEntry(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        if (Date.now() - entry.timestamp > this.CACHE_TTL) {
            this.cache.delete(key);
            return null;
        }
        return entry.user;
    }
    static async findByEmail(email) {
        const cached = this.getCacheEntry(email);
        if (cached) {
            return cached;
        }
        const db = (0, db_1.getFirestore)();
        const snapshot = await db.collection(this.collection)
            .where('email', '==', email)
            .limit(1)
            .get();
        if (snapshot.empty) {
            return null;
        }
        const doc = snapshot.docs[0];
        if (!doc?.exists) {
            return null;
        }
        const data = doc.data();
        if (!data) {
            return null;
        }
        const user = {
            id: doc.id,
            ...data,
        };
        this.setCacheEntry(email, user);
        return user;
    }
    static async findByFirebaseUid(firebaseUid) {
        const db = (0, db_1.getFirestore)();
        const doc = await db.collection(this.collection).doc(firebaseUid).get();
        if (!doc.exists)
            return null;
        const data = doc.data();
        if (!data)
            return null;
        return { id: doc.id, ...data };
    }
    static async findById(id) {
        const db = (0, db_1.getFirestore)();
        const doc = await db.collection(this.collection).doc(id).get();
        if (!doc.exists) {
            return null;
        }
        if (!doc) {
            return null;
        }
        const data = doc.data();
        if (!data) {
            return null;
        }
        return {
            id: doc.id,
            ...data,
        };
    }
    static async findOneAndUpdate(filter, update, options = {}) {
        const db = (0, db_1.getFirestore)();
        const now = firestore_1.Timestamp.now();
        const patch = { ...update, updatedAt: now };
        if (filter.id) {
            const docRef = db.collection(this.collection).doc(filter.id);
            if (!options.upsert) {
                const exists = await docRef.get();
                if (!exists.exists)
                    throw new Error('User not found and upsert not enabled');
            }
            await docRef.set(patch, { merge: true });
            const saved = await docRef.get();
            return { id: saved.id, ...saved.data() };
        }
        if (filter.email) {
            const existing = await this.findByEmail(filter.email);
            if (existing) {
                const docRef = db.collection(this.collection).doc(existing.id);
                await docRef.set(patch, { merge: true });
                const saved = await docRef.get();
                return { id: saved.id, ...saved.data() };
            }
            if (options.upsert) {
                const uid = (update && update.firebaseUid) ? String(update.firebaseUid) : undefined;
                if (uid) {
                    const docRef = db.collection(this.collection).doc(uid);
                    await docRef.set({ email: filter.email, firebaseUid: uid, createdAt: now, updatedAt: now }, { merge: true });
                    const saved = await docRef.get();
                    return { id: saved.id, ...saved.data() };
                }
                else {
                    return this.create({ email: filter.email });
                }
            }
        }
        throw new Error('User not found and upsert not enabled');
    }
}
exports.UserModel = UserModel;
//# sourceMappingURL=User.js.map