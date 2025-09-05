import { z } from 'zod';
export declare const PreWorkoutSchema: z.ZodObject<{
    userId: z.ZodString;
    time_available_min: z.ZodNumber;
    start_time_iso: z.ZodOptional<z.ZodString>;
    energy_level: z.ZodNumber;
    workout_type: z.ZodEnum<["full_body", "upper_lower", "push", "pull", "legs", "core", "conditioning", "mobility", "recovery"]>;
    equipment_override: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    new_injuries: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId?: string;
    time_available_min?: number;
    start_time_iso?: string;
    energy_level?: number;
    workout_type?: "push" | "full_body" | "upper_lower" | "pull" | "legs" | "core" | "conditioning" | "mobility" | "recovery";
    equipment_override?: string[];
    new_injuries?: string;
}, {
    userId?: string;
    time_available_min?: number;
    start_time_iso?: string;
    energy_level?: number;
    workout_type?: "push" | "full_body" | "upper_lower" | "pull" | "legs" | "core" | "conditioning" | "mobility" | "recovery";
    equipment_override?: string[];
    new_injuries?: string;
}>;
export type PreWorkout = z.infer<typeof PreWorkoutSchema>;
//# sourceMappingURL=preworkout.d.ts.map