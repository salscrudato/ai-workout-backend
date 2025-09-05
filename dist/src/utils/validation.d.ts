import { z } from 'zod';
export declare const sanitizeString: (str: string) => string;
export declare const sanitizeHtml: (str: string) => string;
export declare const validateEmail: (email: string) => boolean;
export declare const SafeStringSchema: z.ZodEffects<z.ZodString, string, string>;
export declare const EmailSchema: z.ZodEffects<z.ZodString, string, string>;
export declare const PasswordSchema: z.ZodString;
export declare const PhoneSchema: z.ZodOptional<z.ZodString>;
export declare const UrlSchema: z.ZodOptional<z.ZodString>;
export declare const CreateUserSchema: z.ZodObject<{
    email: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    firebaseUid: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email?: string;
    firebaseUid?: string;
}, {
    email?: string;
    firebaseUid?: string;
}>;
export declare const ExperienceSchema: z.ZodEnum<["beginner", "intermediate", "advanced"]>;
export declare const SexSchema: z.ZodEnum<["male", "female", "prefer_not_to_say"]>;
export declare const GoalsSchema: z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], string[]>;
export declare const EquipmentSchema: z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], string[]>;
export declare const ConstraintsSchema: z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], string[]>;
export declare const isValidObjectId: (id: string) => boolean;
export declare const ObjectIdSchema: z.ZodEffects<z.ZodString, string, string>;
export declare const CreateProfileSchema: z.ZodObject<{
    userId: z.ZodString;
    experience: z.ZodEnum<["beginner", "intermediate", "advanced"]>;
    goals: z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], string[]>;
    equipmentAvailable: z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], string[]>;
    age: z.ZodOptional<z.ZodNumber>;
    sex: z.ZodEnum<["male", "female", "prefer_not_to_say"]>;
    height_ft: z.ZodOptional<z.ZodNumber>;
    height_in: z.ZodOptional<z.ZodNumber>;
    weight_lb: z.ZodOptional<z.ZodNumber>;
    injury_notes: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    constraints: z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], string[]>;
    health_ack: z.ZodBoolean;
    data_consent: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    userId?: string;
    experience?: "beginner" | "intermediate" | "advanced";
    goals?: string[];
    equipmentAvailable?: string[];
    age?: number;
    sex?: "male" | "female" | "prefer_not_to_say";
    height_ft?: number;
    height_in?: number;
    weight_lb?: number;
    injury_notes?: string;
    constraints?: string[];
    health_ack?: boolean;
    data_consent?: boolean;
}, {
    userId?: string;
    experience?: "beginner" | "intermediate" | "advanced";
    goals?: string[];
    equipmentAvailable?: string[];
    age?: number;
    sex?: "male" | "female" | "prefer_not_to_say";
    height_ft?: number;
    height_in?: number;
    weight_lb?: number;
    injury_notes?: string;
    constraints?: string[];
    health_ack?: boolean;
    data_consent?: boolean;
}>;
export declare const WorkoutTypeSchema: z.ZodEnum<["full_body", "upper_lower", "push", "pull", "legs", "core", "conditioning", "mobility", "recovery"]>;
export declare const GenerateWorkoutSchema: z.ZodObject<{
    experience: z.ZodEnum<["beginner", "intermediate", "advanced"]>;
    goals: z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], string[]>;
    workoutType: z.ZodString;
    equipmentAvailable: z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], string[]>;
    duration: z.ZodNumber;
    constraints: z.ZodDefault<z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], string[]>>>;
}, "strip", z.ZodTypeAny, {
    experience?: "beginner" | "intermediate" | "advanced";
    goals?: string[];
    equipmentAvailable?: string[];
    constraints?: string[];
    workoutType?: string;
    duration?: number;
}, {
    experience?: "beginner" | "intermediate" | "advanced";
    goals?: string[];
    equipmentAvailable?: string[];
    constraints?: string[];
    workoutType?: string;
    duration?: number;
}>;
export declare const CompleteWorkoutSchema: z.ZodObject<{
    feedback: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    rating: z.ZodOptional<z.ZodNumber>;
    startedAt: z.ZodOptional<z.ZodString>;
    completedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    feedback?: string;
    rating?: number;
    startedAt?: string;
    completedAt?: string;
}, {
    feedback?: string;
    rating?: number;
    startedAt?: string;
    completedAt?: string;
}>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type CreateProfileInput = z.infer<typeof CreateProfileSchema>;
export type GenerateWorkoutInput = z.infer<typeof GenerateWorkoutSchema>;
export type CompleteWorkoutInput = z.infer<typeof CompleteWorkoutSchema>;
//# sourceMappingURL=validation.d.ts.map