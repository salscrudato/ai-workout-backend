"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentModel = void 0;
const db_1 = require("../config/db");
const firestore_1 = require("firebase-admin/firestore");
class EquipmentModel {
    static collection = 'equipment';
    static async create(data) {
        const db = (0, db_1.getFirestore)();
        const now = firestore_1.Timestamp.now();
        const equipmentData = {
            slug: data.slug,
            label: data.label,
            createdAt: now,
            updatedAt: now,
        };
        const docRef = await db.collection(this.collection).add(equipmentData);
        return {
            id: docRef.id,
            ...equipmentData,
        };
    }
    static async find(_filter = {}) {
        const db = (0, db_1.getFirestore)();
        const snapshot = await db.collection(this.collection)
            .orderBy('label', 'asc')
            .get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    }
    static async findOne(filter) {
        const db = (0, db_1.getFirestore)();
        if (filter.id) {
            const doc = await db.collection(this.collection).doc(filter.id).get();
            if (!doc.exists)
                return null;
            return { id: doc.id, ...doc.data() };
        }
        if (filter.slug) {
            const snapshot = await db.collection(this.collection)
                .where('slug', '==', filter.slug)
                .limit(1)
                .get();
            if (snapshot.empty)
                return null;
            const doc = snapshot.docs[0];
            if (!doc)
                return null;
            const data = doc.data();
            if (!data)
                return null;
            return { id: doc.id, ...data };
        }
        return null;
    }
    static async updateOne(filter, update, options = {}) {
        const db = (0, db_1.getFirestore)();
        const now = firestore_1.Timestamp.now();
        if (filter.slug) {
            const existing = await this.findOne({ slug: filter.slug });
            if (existing) {
                const updatedData = {
                    ...update,
                    updatedAt: now,
                };
                await db.collection(this.collection).doc(existing.id).update(updatedData);
                return;
            }
            else if (options.upsert) {
                await this.create({ slug: filter.slug, label: update.label || filter.slug });
                return;
            }
        }
        throw new Error('Equipment not found and upsert not enabled');
    }
}
exports.EquipmentModel = EquipmentModel;
//# sourceMappingURL=Equipment.js.map