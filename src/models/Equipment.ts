import { getFirestore } from '../config/db';
import { Timestamp } from 'firebase-admin/firestore';

export interface Equipment {
  id?: string;
  slug: string;
  label: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateEquipmentInput {
  slug: string;
  label: string;
}

export class EquipmentModel {
  private static collection = 'equipment';

  static async create(data: CreateEquipmentInput): Promise<Equipment> {
    const db = getFirestore();
    const now = Timestamp.now();

    const equipmentData: Omit<Equipment, 'id'> = {
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

  static async find(_filter: {} = {}): Promise<Equipment[]> {
    const db = getFirestore();
    const snapshot = await db.collection(this.collection)
      .orderBy('label', 'asc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Equipment[];
  }

  static async findOne(filter: { slug?: string; id?: string }): Promise<Equipment | null> {
    const db = getFirestore();

    if (filter.id) {
      const doc = await db.collection(this.collection).doc(filter.id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() } as Equipment;
    }

    if (filter.slug) {
      const snapshot = await db.collection(this.collection)
        .where('slug', '==', filter.slug)
        .limit(1)
        .get();

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      if (!doc) return null;
      const data = doc.data();
      if (!data) return null;
      return { id: doc.id, ...data } as Equipment;
    }

    return null;
  }

  static async updateOne(
    filter: { slug?: string; id?: string },
    update: Partial<CreateEquipmentInput>,
    options: { upsert?: boolean } = {}
  ): Promise<void> {
    const db = getFirestore();
    const now = Timestamp.now();

    if (filter.slug) {
      const existing = await this.findOne({ slug: filter.slug });

      if (existing) {
        const updatedData = {
          ...update,
          updatedAt: now,
        };
        await db.collection(this.collection).doc(existing.id!).update(updatedData);
        return;
      } else if (options.upsert) {
        await this.create({ slug: filter.slug, label: update.label || filter.slug });
        return;
      }
    }

    throw new Error('Equipment not found and upsert not enabled');
  }
}