// Lightweight equipment catalog – no database reads.
// If you need dynamic equipment later, reintroduce a model and collection then.

export interface Equipment {
  slug: string;
  label: string;
}

// Central catalog. Keep this list small and authoritative to avoid typos downstream.
// NOTE: Ensure frontend uses the same source (shared constant or API exposure) for consistency.
export const EQUIPMENT_CATALOG: ReadonlyArray<Equipment> = [
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
export function listEquipment(): Equipment[] {
  return [...EQUIPMENT_CATALOG].sort((a, b) => a.label.localeCompare(b.label));
}

/** Find a single equipment item by slug. */
export function findEquipment(slug: string): Equipment | undefined {
  return EQUIPMENT_CATALOG.find((e) => e.slug === slug);
}

/** True if a slug exists in the catalog. */
export function isValidEquipment(slug: string): boolean {
  return !!findEquipment(slug);
}

/** Filter an incoming array of slugs down to valid, de-duplicated, catalog entries. */
export function normalizeEquipment(slugs: string[] | undefined | null): string[] {
  if (!Array.isArray(slugs)) return [];
  const seen = new Set<string>();
  for (const raw of slugs) {
    const slug = String(raw || '').trim().toLowerCase();
    if (slug && isValidEquipment(slug)) seen.add(slug);
  }
  return Array.from(seen);
}