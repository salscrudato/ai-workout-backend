export interface Equipment {
    slug: string;
    label: string;
}
export declare const EQUIPMENT_CATALOG: ReadonlyArray<Equipment>;
/** Return all equipment, sorted by label. */
export declare function listEquipment(): Equipment[];
/** Find a single equipment item by slug. */
export declare function findEquipment(slug: string): Equipment | undefined;
/** True if a slug exists in the catalog. */
export declare function isValidEquipment(slug: string): boolean;
/** Filter an incoming array of slugs down to valid, de-duplicated, catalog entries. */
export declare function normalizeEquipment(slugs: string[] | undefined | null): string[];
//# sourceMappingURL=Equipment.d.ts.map