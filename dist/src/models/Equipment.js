"use strict";
// Lightweight equipment catalog – no database reads.
// If you need dynamic equipment later, reintroduce a model and collection then.
Object.defineProperty(exports, "__esModule", { value: true });
exports.EQUIPMENT_CATALOG = void 0;
exports.listEquipment = listEquipment;
exports.findEquipment = findEquipment;
exports.isValidEquipment = isValidEquipment;
exports.normalizeEquipment = normalizeEquipment;
// Central catalog. Keep this list small and authoritative to avoid typos downstream.
// NOTE: Ensure frontend uses the same source (shared constant or API exposure) for consistency.
exports.EQUIPMENT_CATALOG = [
    { slug: 'bodyweight', label: 'Bodyweight' },
    { slug: 'dumbbells', label: 'Dumbbells' },
    { slug: 'barbell', label: 'Barbell' },
    { slug: 'kettlebell', label: 'Kettlebell' },
    { slug: 'bench', label: 'Bench' },
    { slug: 'resistance_bands', label: 'Resistance Bands' },
    { slug: 'pullup_bar', label: 'Pull-up Bar' },
    { slug: 'cable_machine', label: 'Cable Machine' },
    { slug: 'treadmill', label: 'Treadmill' },
    { slug: 'rowing_machine', label: 'Rowing Machine' },
    { slug: 'stationary_bike', label: 'Stationary Bike' },
    { slug: 'full_gym', label: 'Full Gym' },
];
/** Return all equipment, sorted by label. */
function listEquipment() {
    return [...exports.EQUIPMENT_CATALOG].sort((a, b) => a.label.localeCompare(b.label));
}
/** Find a single equipment item by slug. */
function findEquipment(slug) {
    return exports.EQUIPMENT_CATALOG.find((e) => e.slug === slug);
}
/** True if a slug exists in the catalog. */
function isValidEquipment(slug) {
    return !!findEquipment(slug);
}
/** Filter an incoming array of slugs down to valid, de-duplicated, catalog entries. */
function normalizeEquipment(slugs) {
    if (!Array.isArray(slugs))
        return [];
    const seen = new Set();
    for (const raw of slugs) {
        const slug = String(raw || '').trim().toLowerCase();
        if (slug && isValidEquipment(slug))
            seen.add(slug);
    }
    return Array.from(seen);
}
//# sourceMappingURL=Equipment.js.map