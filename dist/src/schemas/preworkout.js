"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreWorkoutSchema = void 0;
const zod_1 = require("zod");
exports.PreWorkoutSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    time_available_min: zod_1.z.number().int().min(10).max(120),
    start_time_iso: zod_1.z.string().datetime().optional(),
    energy_level: zod_1.z.number().int().min(1).max(5),
    workout_type: zod_1.z.enum(['full_body', 'upper_lower', 'push', 'pull', 'legs', 'core', 'conditioning', 'mobility', 'recovery']),
    equipment_override: zod_1.z.array(zod_1.z.string()).optional(),
    new_injuries: zod_1.z.string().optional(),
});
//# sourceMappingURL=preworkout.js.map