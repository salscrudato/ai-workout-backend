import { Timestamp } from 'firebase-admin/firestore';
export interface Profile {
    id?: string;
    userId: string;
    experience: 'beginner' | 'intermediate' | 'advanced';
    goals: string[];
    equipmentAvailable: string[];
    age?: number | undefined;
    sex: 'male' | 'female' | 'prefer_not_to_say';
    height_ft?: number | undefined;
    height_in?: number | undefined;
    weight_lb?: number | undefined;
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
export declare class ProfileModel {
    private static collection;
    static create(data: CreateProfileInput): Promise<Profile>;
    static findOne(filter: {
        userId?: string;
        id?: string;
    }): Promise<Profile | null>;
    static findOneAndUpdate(filter: {
        userId?: string;
        id?: string;
    }, update: Partial<CreateProfileInput>, options?: {
        upsert?: boolean;
        setDefaultsOnInsert?: boolean;
    }): Promise<Profile>;
}
//# sourceMappingURL=Profile.d.ts.map