"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const db_1 = require("../config/db");
const firestore_1 = require("firebase-admin/firestore");
class UserModel {
    static collection = 'users';
    static async create(data) {
        const db = (0, db_1.getFirestore)();
        const now = firestore_1.Timestamp.now();
        const userData = {
            email: data.email || '',
            firebaseUid: data.firebaseUid,
            createdAt: now,
            updatedAt: now,
        };
        if (data.firebaseUid) {
            const docRef = db.collection(this.collection).doc(data.firebaseUid);
            await docRef.set(userData, { merge: true });
            const saved = await docRef.get();
            return { id: saved.id, ...saved.data() };
        }
        const docRef = await db.collection(this.collection).add(userData);
        return { id: docRef.id, ...userData };
    }
    static async findByEmail(email) {
        const db = (0, db_1.getFirestore)();
        const snapshot = await db.collection(this.collection)
            .where('email', '==', email)
            .limit(1)
            .get();
        if (snapshot.empty) {
            return null;
        }
        const doc = snapshot.docs[0];
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
    // NOTE: Ensure a Firestore index on `users.email` exists for production performance.
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
        // Ensure we never overwrite timestamps incorrectly
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
            // Try fast path: find by email
            const existing = await this.findByEmail(filter.email);
            if (existing) {
                const docRef = db.collection(this.collection).doc(existing.id);
                await docRef.set(patch, { merge: true });
                const saved = await docRef.get();
                return { id: saved.id, ...saved.data() };
            }
            if (options.upsert) {
                // Create new doc; prefer firebaseUid if provided in update
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