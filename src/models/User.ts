import { getFirestore } from '../config/db';
import { Timestamp } from 'firebase-admin/firestore';

export interface User {
  id?: string;
  email?: string;
  firebaseUid?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateUserInput {
  email?: string;
  firebaseUid?: string;
}

export class UserModel {
  private static collection = 'users';

  static async create(data: CreateUserInput): Promise<User> {
    const db = getFirestore();
    const now = Timestamp.now();

    const userData = {
      email: data.email || '',
      firebaseUid: data.firebaseUid,
      createdAt: now,
      updatedAt: now,
    } as Omit<User, 'id'>;

    const docRef = await db.collection(this.collection).add(userData);

    return {
      id: docRef.id,
      ...userData,
    };
  }

  static async findByEmail(email: string): Promise<User | null> {
    const db = getFirestore();
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
    } as User;
  }

  static async findById(id: string): Promise<User | null> {
    const db = getFirestore();
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
    } as User;
  }

  static async findOneAndUpdate(
    filter: { email?: string; id?: string },
    update: Partial<User>,
    options: { upsert?: boolean } = {}
  ): Promise<User> {
    const db = getFirestore();
    const now = Timestamp.now();

    if (filter.email) {
      const existing = await this.findByEmail(filter.email);
      if (existing) {
        const updatedData = {
          ...update,
          updatedAt: now,
        };
        await db.collection(this.collection).doc(existing.id!).update(updatedData);
        return {
          ...existing,
          ...updatedData,
        };
      } else if (options.upsert) {
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