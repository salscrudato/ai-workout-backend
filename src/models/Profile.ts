import { getFirestore } from '../config/db';
import { Timestamp } from 'firebase-admin/firestore';

export interface Profile {
  id?: string;
  userId: string;

  // Step 1
  experience: 'beginner' | 'intermediate' | 'advanced';

  // Step 2
  goals: string[];

  // Step 3
  equipmentAvailable: string[];

  // Step 4
  age?: number | undefined;
  sex: 'male' | 'female' | 'prefer_not_to_say';
  height_ft?: number | undefined;
  height_in?: number | undefined;
  weight_lb?: number | undefined;

  // Step 5
  injury_notes?: string | undefined;
  constraints: string[];
  health_ack: boolean;
  data_consent: boolean;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateProfileInput {
  userId: string;
  experience?: 'beginner' | 'intermediate' | 'advanced' | undefined;
  goals?: string[] | undefined;
  equipmentAvailable?: string[] | undefined;
  age?: number | undefined;
  sex?: 'male' | 'female' | 'prefer_not_to_say' | undefined;
  height_ft?: number | undefined;
  height_in?: number | undefined;
  weight_lb?: number | undefined;
  injury_notes?: string | undefined;
  constraints?: string[] | undefined;
  health_ack?: boolean | undefined;
  data_consent?: boolean | undefined;
}

export class ProfileModel {
  private static collection = 'profiles';

  static async create(data: CreateProfileInput): Promise<Profile> {
    const db = getFirestore();
    const now = Timestamp.now();

    const profileData: Omit<Profile, 'id'> = {
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

    const docRef = db.collection(this.collection).doc(profileData.userId);
    await docRef.set(profileData, { merge: false });
    return { id: docRef.id, ...profileData };
  }

  static async findOne(filter: { userId?: string; id?: string }): Promise<Profile | null> {
    const db = getFirestore();

    if (filter.id) {
      const doc = await db.collection(this.collection).doc(filter.id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() } as Profile;
    }

    if (filter.userId) {
      const direct = await db.collection(this.collection).doc(filter.userId).get();
      if (direct.exists) {
        return { id: direct.id, ...(direct.data() as any) } as Profile;
      }
      // Legacy fallback: older docs may have random IDs with userId as a field
      const snapshot = await db.collection(this.collection)
        .where('userId', '==', filter.userId)
        .limit(1)
        .get();
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      const data = doc?.data();
      if (!data) return null;
      return { id: doc?.id || '', ...data } as Profile;
    }

    return null;
  }

  static async findOneAndUpdate(
    filter: { userId?: string; id?: string },
    update: Partial<CreateProfileInput>,
    options: { upsert?: boolean; setDefaultsOnInsert?: boolean } = {}
  ): Promise<Profile> {
    const db = getFirestore();
    const now = Timestamp.now();

    if (filter.userId) {
      const docRef = db.collection(this.collection).doc(filter.userId);
      const docSnap = await docRef.get();

      if (!docSnap.exists && !options.upsert) {
        throw new Error('Profile not found and upsert not enabled');
      }

      const patch: Record<string, any> = { ...update, updatedAt: now };
      // Never overwrite createdAt on update
      if (!docSnap.exists) {
        patch['createdAt'] = now;
      }

      await docRef.set(patch, { merge: true });
      const saved = await docRef.get();
      return { id: saved.id, ...(saved.data() as any) } as Profile;
    }

    if (filter.id) {
      const docRef = db.collection(this.collection).doc(filter.id);
      const docSnap = await docRef.get();
      if (!docSnap.exists && !options.upsert) {
        throw new Error('Profile not found and upsert not enabled');
      }
      const patch: Record<string, any> = { ...update, updatedAt: now };
      if (!docSnap.exists) {
        patch['createdAt'] = now;
        // If creating via id, ensure userId field is populated for consistency
        if ((update as any)?.userId) {
          patch['userId'] = (update as any).userId;
        }
      }
      await docRef.set(patch, { merge: true });
      const saved = await docRef.get();
      return { id: saved.id, ...(saved.data() as any) } as Profile;
    }

    throw new Error('Profile not found and upsert not enabled');
  }
}