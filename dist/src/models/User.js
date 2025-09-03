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
        const docRef = await db.collection(this.collection).add(userData);
        return {
            id: docRef.id,
            ...userData,
        };
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
        if (filter.email) {
            const existing = await this.findByEmail(filter.email);
            if (existing) {
                const updatedData = {
                    ...update,
                    updatedAt: now,
                };
                await db.collection(this.collection).doc(existing.id).update(updatedData);
                return {
                    ...existing,
                    ...updatedData,
                };
            }
            else if (options.upsert) {
                return this.create({ email: filter.email });
            }
        }
        if (filter.id) {
            const existing = await this.findById(filter.id);
            if (existing) {
                const updatedData = {
                    ...update,
                    updatedAt: now,
                };
                await db.collection(this.collection).doc(filter.id).update(updatedData);
                return {
                    ...existing,
                    ...updatedData,
                };
            }
        }
        throw new Error('User not found and upsert not enabled');
    }
}
exports.UserModel = UserModel;
//# sourceMappingURL=User.js.map