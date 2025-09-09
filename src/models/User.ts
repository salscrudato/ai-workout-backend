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

    const userData: Omit<User, 'id'> = {
      email: data.email || '',
      firebaseUid: data.firebaseUid,
      createdAt: now,
      updatedAt: now,
    };

    if (data.firebaseUid) {
      const docRef = db.collection(this.collection).doc(data.firebaseUid);
      await docRef.set(userData, { merge: true });
      const saved = await docRef.get();
      return { id: saved.id, ...(saved.data() as any) } as User;
    }

    const docRef = await db.collection(this.collection).add(userData);
    return { id: docRef.id, ...userData } as User;
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

  // NOTE: Ensure a Firestore index on `users.email` exists for production performance.

  static async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const db = getFirestore();
    const doc = await db.collection(this.collection).doc(firebaseUid).get();
    if (!doc.exists) return null;
    const data = doc.data();
    if (!data) return null;
    return { id: doc.id, ...data } as User;
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

    // Ensure we never overwrite timestamps incorrectly
    const patch: Record<string, any> = { ...update, updatedAt: now };

    if (filter.id) {
      const docRef = db.collection(this.collection).doc(filter.id);
      if (!options.upsert) {
        const exists = await docRef.get();
        if (!exists.exists) throw new Error('User not found and upsert not enabled');
      }
      await docRef.set(patch, { merge: true });
      const saved = await docRef.get();
      return { id: saved.id, ...(saved.data() as any) } as User;
    }

    if (filter.email) {
      // Try fast path: find by email
      const existing = await this.findByEmail(filter.email);
      if (existing) {
        const docRef = db.collection(this.collection).doc(existing.id!);
        await docRef.set(patch, { merge: true });
        const saved = await docRef.get();
        return { id: saved.id, ...(saved.data() as any) } as User;
      }
      if (options.upsert) {
        // Create new doc; prefer firebaseUid if provided in update
        const uid = (update && update.firebaseUid) ? String(update.firebaseUid) : undefined;
        if (uid) {
          const docRef = db.collection(this.collection).doc(uid);
          await docRef.set({ email: filter.email, firebaseUid: uid, createdAt: now, updatedAt: now }, { merge: true });
          const saved = await docRef.get();
          return { id: saved.id, ...(saved.data() as any) } as User;
        } else {
          return this.create({ email: filter.email });
        }
      }
    }

    throw new Error('User not found and upsert not enabled');
  }
}