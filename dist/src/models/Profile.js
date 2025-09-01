import { getFirestore } from '../config/db';
import { Timestamp } from 'firebase-admin/firestore';
export class ProfileModel {
    static collection = 'profiles';
    static async create(data) {
        const db = getFirestore();
        const now = Timestamp.now();
        const profileData = {
            userId: data.userId,
            experience: data.experience || 'beginner',
            goals: data.goals || [],
            equipmentAvailable: data.equipmentAvailable || [],
            age: data.age,
            sex: data.sex || 'prefer_not_to_say',
            height_ft: data.height_ft,
            height_in: data.height_in,
            weight_lb: data.weight_lb,
            injury_notes: data.injury_notes,
            constraints: data.constraints || [],
            health_ack: data.health_ack || false,
            data_consent: data.data_consent || false,
            createdAt: now,
            updatedAt: now,
        };
        const docRef = await db.collection(this.collection).add(profileData);
        return {
            id: docRef.id,
            ...profileData,
        };
    }
    static async findOne(filter) {
        const db = getFirestore();
        if (filter.id) {
            const doc = await db.collection(this.collection).doc(filter.id).get();
            if (!doc.exists)
                return null;
            return { id: doc.id, ...doc.data() };
        }
        if (filter.userId) {
            const snapshot = await db.collection(this.collection)
                .where('userId', '==', filter.userId)
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
    static async findOneAndUpdate(filter, update, options = {}) {
        const db = getFirestore();
        const now = Timestamp.now();
        if (filter.userId) {
            const existing = await this.findOne({ userId: filter.userId });
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
                return this.create({ userId: filter.userId, ...update });
            }
        }
        throw new Error('Profile not found and upsert not enabled');
    }
}
//# sourceMappingURL=Profile.js.map