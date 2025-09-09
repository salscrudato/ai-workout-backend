"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Equipment_1 = require("../src/models/Equipment");
const EQUIPMENT = [
    ['bodyweight', 'Bodyweight'],
    ['dumbbells', 'Dumbbells'],
    ['barbell', 'Barbell'],
    ['bench', 'Flat/Adjustable Bench'],
    ['kettlebell', 'Kettlebell'],
    ['bands', 'Resistance Bands'],
    ['pullup_bar', 'Pull-up Bar'],
    ['cable_machine', 'Cable Machine'],
    ['treadmill', 'Treadmill'],
    ['bike', 'Stationary Bike'],
    ['rower', 'Rower'],
];
async function main() {
    // Equipment is now a static catalog, no database seeding needed
    console.log('Equipment catalog is static - no seeding required.');
    console.log('Available equipment:', Equipment_1.EQUIPMENT_CATALOG.map(e => `${e.slug}: ${e.label}`).join(', '));
    process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
//# sourceMappingURL=seedEquipment.js.map