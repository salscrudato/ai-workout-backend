import { initializeFirebase } from '../src/config/db';
import { EQUIPMENT_CATALOG } from '../src/models/Equipment';

const EQUIPMENT = [
  ['bodyweight','Bodyweight'],
  ['dumbbells','Dumbbells'],
  ['barbell','Barbell'],
  ['bench','Flat/Adjustable Bench'],
  ['kettlebell','Kettlebell'],
  ['bands','Resistance Bands'],
  ['pullup_bar','Pull-up Bar'],
  ['cable_machine','Cable Machine'],
  ['treadmill','Treadmill'],
  ['bike','Stationary Bike'],
  ['rower','Rower'],
] as const;

async function main() {
  // Equipment is now a static catalog, no database seeding needed
  console.log('Equipment catalog is static - no seeding required.');
  console.log('Available equipment:', EQUIPMENT_CATALOG.map(e => `${e.slug}: ${e.label}`).join(', '));
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });