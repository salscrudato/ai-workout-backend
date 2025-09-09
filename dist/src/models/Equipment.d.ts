export interface Equipment {
    slug: string;
    label: string;
}
export declare const EQUIPMENT_CATALOG: ReadonlyArray<Equipment>;
export declare function listEquipment(): Equipment[];
export declare function findEquipment(slug: string): Equipment | undefined;
export declare function isValidEquipment(slug: string): boolean;
export declare function normalizeEquipment(slugs: string[] | undefined | null): string[];
//# sourceMappingURL=Equipment.d.ts.map