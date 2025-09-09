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
export declare class UserModel {
    private static readonly collection;
    private static readonly cache;
    private static readonly CACHE_TTL;
    static create(data: CreateUserInput): Promise<User>;
    private static setCacheEntry;
    private static getCacheEntry;
    static findByEmail(email: string): Promise<User | null>;
    static findByFirebaseUid(firebaseUid: string): Promise<User | null>;
    static findById(id: string): Promise<User | null>;
    static findOneAndUpdate(filter: {
        email?: string;
        id?: string;
    }, update: Partial<User>, options?: {
        upsert?: boolean;
    }): Promise<User>;
}
//# sourceMappingURL=User.d.ts.map