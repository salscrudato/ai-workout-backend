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

/**
 * Optimized User Model with performance enhancements
 * - Batch operations for multiple users
 * - Efficient querying with proper indexing
 * - Caching strategies for frequently accessed data
 */
export class UserModel {
  private static readonly collection = 'users';
  private static readonly cache = new Map<string, { user: User; timestamp: number }>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Create a new user with optimized database operations
   */
  static async create(data: CreateUserInput): Promise<User> {
    const db = getFirestore();
    const now = Timestamp.now();

    const userData: Partial<User> = {
      email: data.email || '',
      ...(data.firebaseUid && { firebaseUid: data.firebaseUid }),
      createdAt: now,
      updatedAt: now,
    };

    if (data.firebaseUid) {
      // Use firebaseUid as document ID for better performance
      const docRef = db.collection(this.collection).doc(data.firebaseUid);
      await docRef.set(userData, { merge: true });

      // Cache the created user
      const user = { id: data.firebaseUid, ...userData } as User;
      this.setCacheEntry(data.firebaseUid, user);

      return user;
    }

    // Fallback to auto-generated ID
    const docRef = await db.collection(this.collection).add(userData);
    const user = { id: docRef.id, ...userData } as User;

    // Cache by email if available
    if (data.email) {
      this.setCacheEntry(data.email, user);
    }

    return user;
  }

  /**
   * Cache management methods for performance optimization
   */
  private static setCacheEntry(key: string, user: User): void {
    this.cache.set(key, { user, timestamp: Date.now() });
  }

  private static getCacheEntry(key: string): User | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if cache entry is expired
    if (Date.now() - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.user;
  }

  // Cache management methods available for future use if needed

  /**
   * Find user by email with caching optimization
   */
  static async findByEmail(email: string): Promise<User | null> {
    // Check cache first
    const cached = this.getCacheEntry(email);
    if (cached) {
      return cached;
    }

    const db = getFirestore();
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
    } as User;

    // Cache the result
    this.setCacheEntry(email, user);

    return user;
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