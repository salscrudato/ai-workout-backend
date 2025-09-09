"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EQUIPMENT_CATALOG = void 0;
exports.listEquipment = listEquipment;
exports.findEquipment = findEquipment;
exports.isValidEquipment = isValidEquipment;
exports.normalizeEquipment = normalizeEquipment;
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
function listEquipment() {
    return [...exports.EQUIPMENT_CATALOG].sort((a, b) => a.label.localeCompare(b.label));
}
function findEquipment(slug) {
    return exports.EQUIPMENT_CATALOG.find((e) => e.slug === slug);
}
function isValidEquipment(slug) {
    return !!findEquipment(slug);
}
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