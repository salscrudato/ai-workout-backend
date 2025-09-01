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
export declare class EquipmentModel {
    private static collection;
    static create(data: CreateEquipmentInput): Promise<Equipment>;
    static find(_filter?: {}): Promise<Equipment[]>;
    static findOne(filter: {
        slug?: string;
        id?: string;
    }): Promise<Equipment | null>;
    static updateOne(filter: {
        slug?: string;
        id?: string;
    }, update: Partial<CreateEquipmentInput>, options?: {
        upsert?: boolean;
    }): Promise<void>;
}
//# sourceMappingURL=Equipment.d.ts.map