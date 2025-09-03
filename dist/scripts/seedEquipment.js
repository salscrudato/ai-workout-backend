"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../src/config/db");
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
    await (0, db_1.initializeFirebase)();
    for (const [slug, label] of EQUIPMENT) {
        try {
            await Equipment_1.EquipmentModel.updateOne({ slug }, { slug, label }, { upsert: true });
        }
        catch (error) {
            // If equipment already exists, that's fine
            console.log(`Equipment ${slug} already exists or created`);
        }
    }
    console.log('Equipment seeded.');
    process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
//# sourceMappingURL=seedEquipment.js.map