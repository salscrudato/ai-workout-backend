import { z } from 'zod';
export declare const sanitizeString: (str: string) => string;
export declare const sanitizeHtml: (str: string) => string;
export declare const detectXSS: (str: string) => boolean;
export declare const detectSQLInjection: (str: string) => boolean;
export declare const sanitizeForSecurity: (str: string) => string;
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
    email?: string | undefined;
    firebaseUid?: string | undefined;
}, {
    email?: string | undefined;
    firebaseUid?: string | undefined;
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
    userId: string;
    experience: "beginner" | "intermediate" | "advanced";
    goals: string[];
    equipmentAvailable: string[];
    sex: "male" | "female" | "prefer_not_to_say";
    constraints: string[];
    health_ack: boolean;
    data_consent: boolean;
    age?: number | undefined;
    height_ft?: number | undefined;
    height_in?: number | undefined;
    weight_lb?: number | undefined;
    injury_notes?: string | undefined;
}, {
    userId: string;
    experience: "beginner" | "intermediate" | "advanced";
    goals: string[];
    equipmentAvailable: string[];
    sex: "male" | "female" | "prefer_not_to_say";
    constraints: string[];
    health_ack: boolean;
    data_consent: boolean;
    age?: number | undefined;
    height_ft?: number | undefined;
    height_in?: number | undefined;
    weight_lb?: number | undefined;
    injury_notes?: string | undefined;
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
    experience: "beginner" | "intermediate" | "advanced";
    goals: string[];
    equipmentAvailable: string[];
    constraints: string[];
    workoutType: string;
    duration: number;
}, {
    experience: "beginner" | "intermediate" | "advanced";
    goals: string[];
    equipmentAvailable: string[];
    workoutType: string;
    duration: number;
    constraints?: string[] | undefined;
}>;
export declare const CompleteWorkoutSchema: z.ZodObject<{
    feedback: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    rating: z.ZodOptional<z.ZodNumber>;
    startedAt: z.ZodOptional<z.ZodString>;
    completedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    feedback?: string | undefined;
    rating?: number | undefined;
    startedAt?: string | undefined;
    completedAt?: string | undefined;
}, {
    feedback?: string | undefined;
    rating?: number | undefined;
    startedAt?: string | undefined;
    completedAt?: string | undefined;
}>;
export declare const PreWorkoutSchema: z.ZodObject<{
    userId: z.ZodString;
    time_available_min: z.ZodNumber;
    start_time_iso: z.ZodOptional<z.ZodString>;
    energy_level: z.ZodNumber;
    workout_type: z.ZodEnum<["full_body", "upper_lower", "push", "pull", "legs", "core", "conditioning", "mobility", "recovery"]>;
    equipment_override: z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], string[]>>;
    new_injuries: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    time_available_min: number;
    energy_level: number;
    workout_type: "push" | "full_body" | "upper_lower" | "pull" | "legs" | "core" | "conditioning" | "mobility" | "recovery";
    start_time_iso?: string | undefined;
    equipment_override?: string[] | undefined;
    new_injuries?: string | undefined;
}, {
    userId: string;
    time_available_min: number;
    energy_level: number;
    workout_type: "push" | "full_body" | "upper_lower" | "pull" | "legs" | "core" | "conditioning" | "mobility" | "recovery";
    start_time_iso?: string | undefined;
    equipment_override?: string[] | undefined;
    new_injuries?: string | undefined;
}>;
export declare const AuthSchema: z.ZodObject<{
    idToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    idToken: string;
}, {
    idToken: string;
}>;
export declare const ExerciseSchema: z.ZodObject<{
    name: z.ZodString;
    sets: z.ZodNumber;
    reps: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodString]>>;
    weight: z.ZodOptional<z.ZodString>;
    duration_sec: z.ZodOptional<z.ZodNumber>;
    rest_sec: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
    equipment: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    muscle_groups: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    sets: number;
    reps?: string | number | undefined;
    weight?: string | undefined;
    duration_sec?: number | undefined;
    rest_sec?: number | undefined;
    notes?: string | undefined;
    equipment?: string[] | undefined;
    muscle_groups?: string[] | undefined;
}, {
    name: string;
    sets: number;
    reps?: string | number | undefined;
    weight?: string | undefined;
    duration_sec?: number | undefined;
    rest_sec?: number | undefined;
    notes?: string | undefined;
    equipment?: string[] | undefined;
    muscle_groups?: string[] | undefined;
}>;
export declare const WorkoutBlockSchema: z.ZodObject<{
    name: z.ZodString;
    exercises: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        sets: z.ZodNumber;
        reps: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodString]>>;
        weight: z.ZodOptional<z.ZodString>;
        duration_sec: z.ZodOptional<z.ZodNumber>;
        rest_sec: z.ZodOptional<z.ZodNumber>;
        notes: z.ZodOptional<z.ZodString>;
        equipment: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        muscle_groups: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        sets: number;
        reps?: string | number | undefined;
        weight?: string | undefined;
        duration_sec?: number | undefined;
        rest_sec?: number | undefined;
        notes?: string | undefined;
        equipment?: string[] | undefined;
        muscle_groups?: string[] | undefined;
    }, {
        name: string;
        sets: number;
        reps?: string | number | undefined;
        weight?: string | undefined;
        duration_sec?: number | undefined;
        rest_sec?: number | undefined;
        notes?: string | undefined;
        equipment?: string[] | undefined;
        muscle_groups?: string[] | undefined;
    }>, "many">;
    rest_between_exercises_sec: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    exercises: {
        name: string;
        sets: number;
        reps?: string | number | undefined;
        weight?: string | undefined;
        duration_sec?: number | undefined;
        rest_sec?: number | undefined;
        notes?: string | undefined;
        equipment?: string[] | undefined;
        muscle_groups?: string[] | undefined;
    }[];
    notes?: string | undefined;
    rest_between_exercises_sec?: number | undefined;
}, {
    name: string;
    exercises: {
        name: string;
        sets: number;
        reps?: string | number | undefined;
        weight?: string | undefined;
        duration_sec?: number | undefined;
        rest_sec?: number | undefined;
        notes?: string | undefined;
        equipment?: string[] | undefined;
        muscle_groups?: string[] | undefined;
    }[];
    notes?: string | undefined;
    rest_between_exercises_sec?: number | undefined;
}>;
export declare const WorkoutMetaSchema: z.ZodObject<{
    est_duration_min: z.ZodNumber;
    difficulty_level: z.ZodEnum<["beginner", "intermediate", "advanced"]>;
    equipment_needed: z.ZodArray<z.ZodString, "many">;
    muscle_groups_targeted: z.ZodArray<z.ZodString, "many">;
    calories_estimate: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    est_duration_min: number;
    difficulty_level: "beginner" | "intermediate" | "advanced";
    equipment_needed: string[];
    muscle_groups_targeted: string[];
    calories_estimate?: number | undefined;
}, {
    est_duration_min: number;
    difficulty_level: "beginner" | "intermediate" | "advanced";
    equipment_needed: string[];
    muscle_groups_targeted: string[];
    calories_estimate?: number | undefined;
}>;
export declare const WarmUpCoolDownSchema: z.ZodObject<{
    exercises: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        sets: z.ZodNumber;
        reps: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodString]>>;
        weight: z.ZodOptional<z.ZodString>;
        duration_sec: z.ZodOptional<z.ZodNumber>;
        rest_sec: z.ZodOptional<z.ZodNumber>;
        notes: z.ZodOptional<z.ZodString>;
        equipment: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        muscle_groups: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        sets: number;
        reps?: string | number | undefined;
        weight?: string | undefined;
        duration_sec?: number | undefined;
        rest_sec?: number | undefined;
        notes?: string | undefined;
        equipment?: string[] | undefined;
        muscle_groups?: string[] | undefined;
    }, {
        name: string;
        sets: number;
        reps?: string | number | undefined;
        weight?: string | undefined;
        duration_sec?: number | undefined;
        rest_sec?: number | undefined;
        notes?: string | undefined;
        equipment?: string[] | undefined;
        muscle_groups?: string[] | undefined;
    }>, "many">;
    duration_min: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    exercises: {
        name: string;
        sets: number;
        reps?: string | number | undefined;
        weight?: string | undefined;
        duration_sec?: number | undefined;
        rest_sec?: number | undefined;
        notes?: string | undefined;
        equipment?: string[] | undefined;
        muscle_groups?: string[] | undefined;
    }[];
    duration_min: number;
}, {
    exercises: {
        name: string;
        sets: number;
        reps?: string | number | undefined;
        weight?: string | undefined;
        duration_sec?: number | undefined;
        rest_sec?: number | undefined;
        notes?: string | undefined;
        equipment?: string[] | undefined;
        muscle_groups?: string[] | undefined;
    }[];
    duration_min: number;
}>;
export declare const WorkoutPlanDataSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    blocks: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        exercises: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            sets: z.ZodNumber;
            reps: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodString]>>;
            weight: z.ZodOptional<z.ZodString>;
            duration_sec: z.ZodOptional<z.ZodNumber>;
            rest_sec: z.ZodOptional<z.ZodNumber>;
            notes: z.ZodOptional<z.ZodString>;
            equipment: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            muscle_groups: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            sets: number;
            reps?: string | number | undefined;
            weight?: string | undefined;
            duration_sec?: number | undefined;
            rest_sec?: number | undefined;
            notes?: string | undefined;
            equipment?: string[] | undefined;
            muscle_groups?: string[] | undefined;
        }, {
            name: string;
            sets: number;
            reps?: string | number | undefined;
            weight?: string | undefined;
            duration_sec?: number | undefined;
            rest_sec?: number | undefined;
            notes?: string | undefined;
            equipment?: string[] | undefined;
            muscle_groups?: string[] | undefined;
        }>, "many">;
        rest_between_exercises_sec: z.ZodOptional<z.ZodNumber>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        exercises: {
            name: string;
            sets: number;
            reps?: string | number | undefined;
            weight?: string | undefined;
            duration_sec?: number | undefined;
            rest_sec?: number | undefined;
            notes?: string | undefined;
            equipment?: string[] | undefined;
            muscle_groups?: string[] | undefined;
        }[];
        notes?: string | undefined;
        rest_between_exercises_sec?: number | undefined;
    }, {
        name: string;
        exercises: {
            name: string;
            sets: number;
            reps?: string | number | undefined;
            weight?: string | undefined;
            duration_sec?: number | undefined;
            rest_sec?: number | undefined;
            notes?: string | undefined;
            equipment?: string[] | undefined;
            muscle_groups?: string[] | undefined;
        }[];
        notes?: string | undefined;
        rest_between_exercises_sec?: number | undefined;
    }>, "many">;
    meta: z.ZodObject<{
        est_duration_min: z.ZodNumber;
        difficulty_level: z.ZodEnum<["beginner", "intermediate", "advanced"]>;
        equipment_needed: z.ZodArray<z.ZodString, "many">;
        muscle_groups_targeted: z.ZodArray<z.ZodString, "many">;
        calories_estimate: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        est_duration_min: number;
        difficulty_level: "beginner" | "intermediate" | "advanced";
        equipment_needed: string[];
        muscle_groups_targeted: string[];
        calories_estimate?: number | undefined;
    }, {
        est_duration_min: number;
        difficulty_level: "beginner" | "intermediate" | "advanced";
        equipment_needed: string[];
        muscle_groups_targeted: string[];
        calories_estimate?: number | undefined;
    }>;
    warm_up: z.ZodOptional<z.ZodObject<{
        exercises: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            sets: z.ZodNumber;
            reps: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodString]>>;
            weight: z.ZodOptional<z.ZodString>;
            duration_sec: z.ZodOptional<z.ZodNumber>;
            rest_sec: z.ZodOptional<z.ZodNumber>;
            notes: z.ZodOptional<z.ZodString>;
            equipment: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            muscle_groups: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            sets: number;
            reps?: string | number | undefined;
            weight?: string | undefined;
            duration_sec?: number | undefined;
            rest_sec?: number | undefined;
            notes?: string | undefined;
            equipment?: string[] | undefined;
            muscle_groups?: string[] | undefined;
        }, {
            name: string;
            sets: number;
            reps?: string | number | undefined;
            weight?: string | undefined;
            duration_sec?: number | undefined;
            rest_sec?: number | undefined;
            notes?: string | undefined;
            equipment?: string[] | undefined;
            muscle_groups?: string[] | undefined;
        }>, "many">;
        duration_min: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        exercises: {
            name: string;
            sets: number;
            reps?: string | number | undefined;
            weight?: string | undefined;
            duration_sec?: number | undefined;
            rest_sec?: number | undefined;
            notes?: string | undefined;
            equipment?: string[] | undefined;
            muscle_groups?: string[] | undefined;
        }[];
        duration_min: number;
    }, {
        exercises: {
            name: string;
            sets: number;
            reps?: string | number | undefined;
            weight?: string | undefined;
            duration_sec?: number | undefined;
            rest_sec?: number | undefined;
            notes?: string | undefined;
            equipment?: string[] | undefined;
            muscle_groups?: string[] | undefined;
        }[];
        duration_min: number;
    }>>;
    cool_down: z.ZodOptional<z.ZodObject<{
        exercises: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            sets: z.ZodNumber;
            reps: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodString]>>;
            weight: z.ZodOptional<z.ZodString>;
            duration_sec: z.ZodOptional<z.ZodNumber>;
            rest_sec: z.ZodOptional<z.ZodNumber>;
            notes: z.ZodOptional<z.ZodString>;
            equipment: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            muscle_groups: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            sets: number;
            reps?: string | number | undefined;
            weight?: string | undefined;
            duration_sec?: number | undefined;
            rest_sec?: number | undefined;
            notes?: string | undefined;
            equipment?: string[] | undefined;
            muscle_groups?: string[] | undefined;
        }, {
            name: string;
            sets: number;
            reps?: string | number | undefined;
            weight?: string | undefined;
            duration_sec?: number | undefined;
            rest_sec?: number | undefined;
            notes?: string | undefined;
            equipment?: string[] | undefined;
            muscle_groups?: string[] | undefined;
        }>, "many">;
        duration_min: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        exercises: {
            name: string;
            sets: number;
            reps?: string | number | undefined;
            weight?: string | undefined;
            duration_sec?: number | undefined;
            rest_sec?: number | undefined;
            notes?: string | undefined;
            equipment?: string[] | undefined;
            muscle_groups?: string[] | undefined;
        }[];
        duration_min: number;
    }, {
        exercises: {
            name: string;
            sets: number;
            reps?: string | number | undefined;
            weight?: string | undefined;
            duration_sec?: number | undefined;
            rest_sec?: number | undefined;
            notes?: string | undefined;
            equipment?: string[] | undefined;
            muscle_groups?: string[] | undefined;
        }[];
        duration_min: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    blocks: {
        name: string;
        exercises: {
            name: string;
            sets: number;
            reps?: string | number | undefined;
            weight?: string | undefined;
            duration_sec?: number | undefined;
            rest_sec?: number | undefined;
            notes?: string | undefined;
            equipment?: string[] | undefined;
            muscle_groups?: string[] | undefined;
        }[];
        notes?: string | undefined;
        rest_between_exercises_sec?: number | undefined;
    }[];
    meta: {
        est_duration_min: number;
        difficulty_level: "beginner" | "intermediate" | "advanced";
        equipment_needed: string[];
        muscle_groups_targeted: string[];
        calories_estimate?: number | undefined;
    };
    description?: string | undefined;
    warm_up?: {
        exercises: {
            name: string;
            sets: number;
            reps?: string | number | undefined;
            weight?: string | undefined;
            duration_sec?: number | undefined;
            rest_sec?: number | undefined;
            notes?: string | undefined;
            equipment?: string[] | undefined;
            muscle_groups?: string[] | undefined;
        }[];
        duration_min: number;
    } | undefined;
    cool_down?: {
        exercises: {
            name: string;
            sets: number;
            reps?: string | number | undefined;
            weight?: string | undefined;
            duration_sec?: number | undefined;
            rest_sec?: number | undefined;
            notes?: string | undefined;
            equipment?: string[] | undefined;
            muscle_groups?: string[] | undefined;
        }[];
        duration_min: number;
    } | undefined;
}, {
    title: string;
    blocks: {
        name: string;
        exercises: {
            name: string;
            sets: number;
            reps?: string | number | undefined;
            weight?: string | undefined;
            duration_sec?: number | undefined;
            rest_sec?: number | undefined;
            notes?: string | undefined;
            equipment?: string[] | undefined;
            muscle_groups?: string[] | undefined;
        }[];
        notes?: string | undefined;
        rest_between_exercises_sec?: number | undefined;
    }[];
    meta: {
        est_duration_min: number;
        difficulty_level: "beginner" | "intermediate" | "advanced";
        equipment_needed: string[];
        muscle_groups_targeted: string[];
        calories_estimate?: number | undefined;
    };
    description?: string | undefined;
    warm_up?: {
        exercises: {
            name: string;
            sets: number;
            reps?: string | number | undefined;
            weight?: string | undefined;
            duration_sec?: number | undefined;
            rest_sec?: number | undefined;
            notes?: string | undefined;
            equipment?: string[] | undefined;
            muscle_groups?: string[] | undefined;
        }[];
        duration_min: number;
    } | undefined;
    cool_down?: {
        exercises: {
            name: string;
            sets: number;
            reps?: string | number | undefined;
            weight?: string | undefined;
            duration_sec?: number | undefined;
            rest_sec?: number | undefined;
            notes?: string | undefined;
            equipment?: string[] | undefined;
            muscle_groups?: string[] | undefined;
        }[];
        duration_min: number;
    } | undefined;
}>;
export declare const CreateEquipmentSchema: z.ZodObject<{
    slug: z.ZodString;
    label: z.ZodString;
}, "strip", z.ZodTypeAny, {
    slug: string;
    label: string;
}, {
    slug: string;
    label: string;
}>;
export declare const UpdateEquipmentSchema: z.ZodObject<{
    slug: z.ZodOptional<z.ZodString>;
    label: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    slug?: string | undefined;
    label?: string | undefined;
}, {
    slug?: string | undefined;
    label?: string | undefined;
}>;
export declare const CreateWorkoutSessionSchema: z.ZodObject<{
    planId: z.ZodString;
    userId: z.ZodString;
    startedAt: z.ZodOptional<z.ZodDate>;
    completedAt: z.ZodOptional<z.ZodDate>;
    feedback: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    planId: string;
    feedback?: Record<string, any> | undefined;
    startedAt?: Date | undefined;
    completedAt?: Date | undefined;
}, {
    userId: string;
    planId: string;
    feedback?: Record<string, any> | undefined;
    startedAt?: Date | undefined;
    completedAt?: Date | undefined;
}>;
export declare const UpdateWorkoutSessionSchema: z.ZodObject<Omit<{
    planId: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
    startedAt: z.ZodOptional<z.ZodOptional<z.ZodDate>>;
    completedAt: z.ZodOptional<z.ZodOptional<z.ZodDate>>;
    feedback: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
}, "userId" | "planId">, "strip", z.ZodTypeAny, {
    feedback?: Record<string, any> | undefined;
    startedAt?: Date | undefined;
    completedAt?: Date | undefined;
}, {
    feedback?: Record<string, any> | undefined;
    startedAt?: Date | undefined;
    completedAt?: Date | undefined;
}>;
export declare const CreateWorkoutPlanSchema: z.ZodObject<{
    userId: z.ZodString;
    model: z.ZodString;
    promptVersion: z.ZodString;
    preWorkout: z.ZodObject<{
        userId: z.ZodString;
        time_available_min: z.ZodNumber;
        start_time_iso: z.ZodOptional<z.ZodString>;
        energy_level: z.ZodNumber;
        workout_type: z.ZodEnum<["full_body", "upper_lower", "push", "pull", "legs", "core", "conditioning", "mobility", "recovery"]>;
        equipment_override: z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], string[]>>;
        new_injuries: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    }, "strip", z.ZodTypeAny, {
        userId: string;
        time_available_min: number;
        energy_level: number;
        workout_type: "push" | "full_body" | "upper_lower" | "pull" | "legs" | "core" | "conditioning" | "mobility" | "recovery";
        start_time_iso?: string | undefined;
        equipment_override?: string[] | undefined;
        new_injuries?: string | undefined;
    }, {
        userId: string;
        time_available_min: number;
        energy_level: number;
        workout_type: "push" | "full_body" | "upper_lower" | "pull" | "legs" | "core" | "conditioning" | "mobility" | "recovery";
        start_time_iso?: string | undefined;
        equipment_override?: string[] | undefined;
        new_injuries?: string | undefined;
    }>;
    plan: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        blocks: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            exercises: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                sets: z.ZodNumber;
                reps: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodString]>>;
                weight: z.ZodOptional<z.ZodString>;
                duration_sec: z.ZodOptional<z.ZodNumber>;
                rest_sec: z.ZodOptional<z.ZodNumber>;
                notes: z.ZodOptional<z.ZodString>;
                equipment: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                muscle_groups: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                sets: number;
                reps?: string | number | undefined;
                weight?: string | undefined;
                duration_sec?: number | undefined;
                rest_sec?: number | undefined;
                notes?: string | undefined;
                equipment?: string[] | undefined;
                muscle_groups?: string[] | undefined;
            }, {
                name: string;
                sets: number;
                reps?: string | number | undefined;
                weight?: string | undefined;
                duration_sec?: number | undefined;
                rest_sec?: number | undefined;
                notes?: string | undefined;
                equipment?: string[] | undefined;
                muscle_groups?: string[] | undefined;
            }>, "many">;
            rest_between_exercises_sec: z.ZodOptional<z.ZodNumber>;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            exercises: {
                name: string;
                sets: number;
                reps?: string | number | undefined;
                weight?: string | undefined;
                duration_sec?: number | undefined;
                rest_sec?: number | undefined;
                notes?: string | undefined;
                equipment?: string[] | undefined;
                muscle_groups?: string[] | undefined;
            }[];
            notes?: string | undefined;
            rest_between_exercises_sec?: number | undefined;
        }, {
            name: string;
            exercises: {
                name: string;
                sets: number;
                reps?: string | number | undefined;
                weight?: string | undefined;
                duration_sec?: number | undefined;
                rest_sec?: number | undefined;
                notes?: string | undefined;
                equipment?: string[] | undefined;
                muscle_groups?: string[] | undefined;
            }[];
            notes?: string | undefined;
            rest_between_exercises_sec?: number | undefined;
        }>, "many">;
        meta: z.ZodObject<{
            est_duration_min: z.ZodNumber;
            difficulty_level: z.ZodEnum<["beginner", "intermediate", "advanced"]>;
            equipment_needed: z.ZodArray<z.ZodString, "many">;
            muscle_groups_targeted: z.ZodArray<z.ZodString, "many">;
            calories_estimate: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            est_duration_min: number;
            difficulty_level: "beginner" | "intermediate" | "advanced";
            equipment_needed: string[];
            muscle_groups_targeted: string[];
            calories_estimate?: number | undefined;
        }, {
            est_duration_min: number;
            difficulty_level: "beginner" | "intermediate" | "advanced";
            equipment_needed: string[];
            muscle_groups_targeted: string[];
            calories_estimate?: number | undefined;
        }>;
        warm_up: z.ZodOptional<z.ZodObject<{
            exercises: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                sets: z.ZodNumber;
                reps: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodString]>>;
                weight: z.ZodOptional<z.ZodString>;
                duration_sec: z.ZodOptional<z.ZodNumber>;
                rest_sec: z.ZodOptional<z.ZodNumber>;
                notes: z.ZodOptional<z.ZodString>;
                equipment: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                muscle_groups: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                sets: number;
                reps?: string | number | undefined;
                weight?: string | undefined;
                duration_sec?: number | undefined;
                rest_sec?: number | undefined;
                notes?: string | undefined;
                equipment?: string[] | undefined;
                muscle_groups?: string[] | undefined;
            }, {
                name: string;
                sets: number;
                reps?: string | number | undefined;
                weight?: string | undefined;
                duration_sec?: number | undefined;
                rest_sec?: number | undefined;
                notes?: string | undefined;
                equipment?: string[] | undefined;
                muscle_groups?: string[] | undefined;
            }>, "many">;
            duration_min: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            exercises: {
                name: string;
                sets: number;
                reps?: string | number | undefined;
                weight?: string | undefined;
                duration_sec?: number | undefined;
                rest_sec?: number | undefined;
                notes?: string | undefined;
                equipment?: string[] | undefined;
                muscle_groups?: string[] | undefined;
            }[];
            duration_min: number;
        }, {
            exercises: {
                name: string;
                sets: number;
                reps?: string | number | undefined;
                weight?: string | undefined;
                duration_sec?: number | undefined;
                rest_sec?: number | undefined;
                notes?: string | undefined;
                equipment?: string[] | undefined;
                muscle_groups?: string[] | undefined;
            }[];
            duration_min: number;
        }>>;
        cool_down: z.ZodOptional<z.ZodObject<{
            exercises: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                sets: z.ZodNumber;
                reps: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodString]>>;
                weight: z.ZodOptional<z.ZodString>;
                duration_sec: z.ZodOptional<z.ZodNumber>;
                rest_sec: z.ZodOptional<z.ZodNumber>;
                notes: z.ZodOptional<z.ZodString>;
                equipment: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                muscle_groups: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                sets: number;
                reps?: string | number | undefined;
                weight?: string | undefined;
                duration_sec?: number | undefined;
                rest_sec?: number | undefined;
                notes?: string | undefined;
                equipment?: string[] | undefined;
                muscle_groups?: string[] | undefined;
            }, {
                name: string;
                sets: number;
                reps?: string | number | undefined;
                weight?: string | undefined;
                duration_sec?: number | undefined;
                rest_sec?: number | undefined;
                notes?: string | undefined;
                equipment?: string[] | undefined;
                muscle_groups?: string[] | undefined;
            }>, "many">;
            duration_min: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            exercises: {
                name: string;
                sets: number;
                reps?: string | number | undefined;
                weight?: string | undefined;
                duration_sec?: number | undefined;
                rest_sec?: number | undefined;
                notes?: string | undefined;
                equipment?: string[] | undefined;
                muscle_groups?: string[] | undefined;
            }[];
            duration_min: number;
        }, {
            exercises: {
                name: string;
                sets: number;
                reps?: string | number | undefined;
                weight?: string | undefined;
                duration_sec?: number | undefined;
                rest_sec?: number | undefined;
                notes?: string | undefined;
                equipment?: string[] | undefined;
                muscle_groups?: string[] | undefined;
            }[];
            duration_min: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        blocks: {
            name: string;
            exercises: {
                name: string;
                sets: number;
                reps?: string | number | undefined;
                weight?: string | undefined;
                duration_sec?: number | undefined;
                rest_sec?: number | undefined;
                notes?: string | undefined;
                equipment?: string[] | undefined;
                muscle_groups?: string[] | undefined;
            }[];
            notes?: string | undefined;
            rest_between_exercises_sec?: number | undefined;
        }[];
        meta: {
            est_duration_min: number;
            difficulty_level: "beginner" | "intermediate" | "advanced";
            equipment_needed: string[];
            muscle_groups_targeted: string[];
            calories_estimate?: number | undefined;
        };
        description?: string | undefined;
        warm_up?: {
            exercises: {
                name: string;
                sets: number;
                reps?: string | number | undefined;
                weight?: string | undefined;
                duration_sec?: number | undefined;
                rest_sec?: number | undefined;
                notes?: string | undefined;
                equipment?: string[] | undefined;
                muscle_groups?: string[] | undefined;
            }[];
            duration_min: number;
        } | undefined;
        cool_down?: {
            exercises: {
                name: string;
                sets: number;
                reps?: string | number | undefined;
                weight?: string | undefined;
                duration_sec?: number | undefined;
                rest_sec?: number | undefined;
                notes?: string | undefined;
                equipment?: string[] | undefined;
                muscle_groups?: string[] | undefined;
            }[];
            duration_min: number;
        } | undefined;
    }, {
        title: string;
        blocks: {
            name: string;
            exercises: {
                name: string;
                sets: number;
                reps?: string | number | undefined;
                weight?: string | undefined;
                duration_sec?: number | undefined;
                rest_sec?: number | undefined;
                notes?: string | undefined;
                equipment?: string[] | undefined;
                muscle_groups?: string[] | undefined;
            }[];
            notes?: string | undefined;
            rest_between_exercises_sec?: number | undefined;
        }[];
        meta: {
            est_duration_min: number;
            difficulty_level: "beginner" | "intermediate" | "advanced";
            equipment_needed: string[];
            muscle_groups_targeted: string[];
            calories_estimate?: number | undefined;
        };
        description?: string | undefined;
        warm_up?: {
            exercises: {
                name: string;
                sets: number;
                reps?: string | number | undefined;
                weight?: string | undefined;
                duration_sec?: number | undefined;
                rest_sec?: number | undefined;
                notes?: string | undefined;
                equipment?: string[] | undefined;
                muscle_groups?: string[] | undefined;
            }[];
            duration_min: number;
        } | undefined;
        cool_down?: {
            exercises: {
                name: string;
                sets: number;
                reps?: string | number | undefined;
                weight?: string | undefined;
                duration_sec?: number | undefined;
                rest_sec?: number | undefined;
                notes?: string | undefined;
                equipment?: string[] | undefined;
                muscle_groups?: string[] | undefined;
            }[];
            duration_min: number;
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    model: string;
    userId: string;
    promptVersion: string;
    preWorkout: {
        userId: string;
        time_available_min: number;
        energy_level: number;
        workout_type: "push" | "full_body" | "upper_lower" | "pull" | "legs" | "core" | "conditioning" | "mobility" | "recovery";
        start_time_iso?: string | undefined;
        equipment_override?: string[] | undefined;
        new_injuries?: string | undefined;
    };
    plan: {
        title: string;
        blocks: {
            name: string;
            exercises: {
                name: string;
                sets: number;
                reps?: string | number | undefined;
                weight?: string | undefined;
                duration_sec?: number | undefined;
                rest_sec?: number | undefined;
                notes?: string | undefined;
                equipment?: string[] | undefined;
                muscle_groups?: string[] | undefined;
            }[];
            notes?: string | undefined;
            rest_between_exercises_sec?: number | undefined;
        }[];
        meta: {
            est_duration_min: number;
            difficulty_level: "beginner" | "intermediate" | "advanced";
            equipment_needed: string[];
            muscle_groups_targeted: string[];
            calories_estimate?: number | undefined;
        };
        description?: string | undefined;
        warm_up?: {
            exercises: {
                name: string;
                sets: number;
                reps?: string | number | undefined;
                weight?: string | undefined;
                duration_sec?: number | undefined;
                rest_sec?: number | undefined;
                notes?: string | undefined;
                equipment?: string[] | undefined;
                muscle_groups?: string[] | undefined;
            }[];
            duration_min: number;
        } | undefined;
        cool_down?: {
            exercises: {
                name: string;
                sets: number;
                reps?: string | number | undefined;
                weight?: string | undefined;
                duration_sec?: number | undefined;
                rest_sec?: number | undefined;
                notes?: string | undefined;
                equipment?: string[] | undefined;
                muscle_groups?: string[] | undefined;
            }[];
            duration_min: number;
        } | undefined;
    };
}, {
    model: string;
    userId: string;
    promptVersion: string;
    preWorkout: {
        userId: string;
        time_available_min: number;
        energy_level: number;
        workout_type: "push" | "full_body" | "upper_lower" | "pull" | "legs" | "core" | "conditioning" | "mobility" | "recovery";
        start_time_iso?: string | undefined;
        equipment_override?: string[] | undefined;
        new_injuries?: string | undefined;
    };
    plan: {
        title: string;
        blocks: {
            name: string;
            exercises: {
                name: string;
                sets: number;
                reps?: string | number | undefined;
                weight?: string | undefined;
                duration_sec?: number | undefined;
                rest_sec?: number | undefined;
                notes?: string | undefined;
                equipment?: string[] | undefined;
                muscle_groups?: string[] | undefined;
            }[];
            notes?: string | undefined;
            rest_between_exercises_sec?: number | undefined;
        }[];
        meta: {
            est_duration_min: number;
            difficulty_level: "beginner" | "intermediate" | "advanced";
            equipment_needed: string[];
            muscle_groups_targeted: string[];
            calories_estimate?: number | undefined;
        };
        description?: string | undefined;
        warm_up?: {
            exercises: {
                name: string;
                sets: number;
                reps?: string | number | undefined;
                weight?: string | undefined;
                duration_sec?: number | undefined;
                rest_sec?: number | undefined;
                notes?: string | undefined;
                equipment?: string[] | undefined;
                muscle_groups?: string[] | undefined;
            }[];
            duration_min: number;
        } | undefined;
        cool_down?: {
            exercises: {
                name: string;
                sets: number;
                reps?: string | number | undefined;
                weight?: string | undefined;
                duration_sec?: number | undefined;
                rest_sec?: number | undefined;
                notes?: string | undefined;
                equipment?: string[] | undefined;
                muscle_groups?: string[] | undefined;
            }[];
            duration_min: number;
        } | undefined;
    };
}>;
export declare const GenerateWorkoutRequestSchema: z.ZodObject<{
    workout_type: z.ZodString;
    time_available_min: z.ZodNumber;
    equipment_override: z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], string[]>>;
    injury_notes: z.ZodOptional<z.ZodString>;
    constraints: z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], string[]>>;
    intensity_preference: z.ZodOptional<z.ZodEnum<["low", "moderate", "high"]>>;
    focus_areas: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    time_available_min: number;
    workout_type: string;
    injury_notes?: string | undefined;
    constraints?: string[] | undefined;
    equipment_override?: string[] | undefined;
    intensity_preference?: "low" | "high" | "moderate" | undefined;
    focus_areas?: string[] | undefined;
}, {
    time_available_min: number;
    workout_type: string;
    injury_notes?: string | undefined;
    constraints?: string[] | undefined;
    equipment_override?: string[] | undefined;
    intensity_preference?: "low" | "high" | "moderate" | undefined;
    focus_areas?: string[] | undefined;
}>;
export declare const UpdateProfileSchema: z.ZodObject<Omit<{
    userId: z.ZodOptional<z.ZodString>;
    experience: z.ZodOptional<z.ZodEnum<["beginner", "intermediate", "advanced"]>>;
    goals: z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], string[]>>;
    equipmentAvailable: z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], string[]>>;
    age: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    sex: z.ZodOptional<z.ZodEnum<["male", "female", "prefer_not_to_say"]>>;
    height_ft: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    height_in: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    weight_lb: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    injury_notes: z.ZodOptional<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>;
    constraints: z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], string[]>>;
    health_ack: z.ZodOptional<z.ZodBoolean>;
    data_consent: z.ZodOptional<z.ZodBoolean>;
}, "userId">, "strip", z.ZodTypeAny, {
    experience?: "beginner" | "intermediate" | "advanced" | undefined;
    goals?: string[] | undefined;
    equipmentAvailable?: string[] | undefined;
    age?: number | undefined;
    sex?: "male" | "female" | "prefer_not_to_say" | undefined;
    height_ft?: number | undefined;
    height_in?: number | undefined;
    weight_lb?: number | undefined;
    injury_notes?: string | undefined;
    constraints?: string[] | undefined;
    health_ack?: boolean | undefined;
    data_consent?: boolean | undefined;
}, {
    experience?: "beginner" | "intermediate" | "advanced" | undefined;
    goals?: string[] | undefined;
    equipmentAvailable?: string[] | undefined;
    age?: number | undefined;
    sex?: "male" | "female" | "prefer_not_to_say" | undefined;
    height_ft?: number | undefined;
    height_in?: number | undefined;
    weight_lb?: number | undefined;
    injury_notes?: string | undefined;
    constraints?: string[] | undefined;
    health_ack?: boolean | undefined;
    data_consent?: boolean | undefined;
}>;
export declare const AIWorkoutSetSchema: z.ZodObject<{
    reps: z.ZodNumber;
    time_sec: z.ZodNumber;
    rest_sec: z.ZodNumber;
    tempo: z.ZodString;
    intensity: z.ZodString;
    notes: z.ZodString;
    weight_guidance: z.ZodString;
    rpe: z.ZodNumber;
    rest_type: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reps: number;
    rest_sec: number;
    notes: string;
    time_sec: number;
    tempo: string;
    intensity: string;
    weight_guidance: string;
    rpe: number;
    rest_type: string;
}, {
    reps: number;
    rest_sec: number;
    notes: string;
    time_sec: number;
    tempo: string;
    intensity: string;
    weight_guidance: string;
    rpe: number;
    rest_type: string;
}>;
export declare const AIExerciseSchema: z.ZodObject<{
    slug: z.ZodString;
    display_name: z.ZodString;
    type: z.ZodString;
    equipment: z.ZodArray<z.ZodString, "many">;
    primary_muscles: z.ZodArray<z.ZodString, "many">;
    instructions: z.ZodArray<z.ZodString, "many">;
    sets: z.ZodArray<z.ZodObject<{
        reps: z.ZodNumber;
        time_sec: z.ZodNumber;
        rest_sec: z.ZodNumber;
        tempo: z.ZodString;
        intensity: z.ZodString;
        notes: z.ZodString;
        weight_guidance: z.ZodString;
        rpe: z.ZodNumber;
        rest_type: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        reps: number;
        rest_sec: number;
        notes: string;
        time_sec: number;
        tempo: string;
        intensity: string;
        weight_guidance: string;
        rpe: number;
        rest_type: string;
    }, {
        reps: number;
        rest_sec: number;
        notes: string;
        time_sec: number;
        tempo: string;
        intensity: string;
        weight_guidance: string;
        rpe: number;
        rest_type: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    type: string;
    sets: {
        reps: number;
        rest_sec: number;
        notes: string;
        time_sec: number;
        tempo: string;
        intensity: string;
        weight_guidance: string;
        rpe: number;
        rest_type: string;
    }[];
    equipment: string[];
    slug: string;
    display_name: string;
    primary_muscles: string[];
    instructions: string[];
}, {
    type: string;
    sets: {
        reps: number;
        rest_sec: number;
        notes: string;
        time_sec: number;
        tempo: string;
        intensity: string;
        weight_guidance: string;
        rpe: number;
        rest_type: string;
    }[];
    equipment: string[];
    slug: string;
    display_name: string;
    primary_muscles: string[];
    instructions: string[];
}>;
export declare const AIWorkoutBlockSchema: z.ZodObject<{
    name: z.ZodString;
    exercises: z.ZodArray<z.ZodObject<{
        slug: z.ZodString;
        display_name: z.ZodString;
        type: z.ZodString;
        equipment: z.ZodArray<z.ZodString, "many">;
        primary_muscles: z.ZodArray<z.ZodString, "many">;
        instructions: z.ZodArray<z.ZodString, "many">;
        sets: z.ZodArray<z.ZodObject<{
            reps: z.ZodNumber;
            time_sec: z.ZodNumber;
            rest_sec: z.ZodNumber;
            tempo: z.ZodString;
            intensity: z.ZodString;
            notes: z.ZodString;
            weight_guidance: z.ZodString;
            rpe: z.ZodNumber;
            rest_type: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            reps: number;
            rest_sec: number;
            notes: string;
            time_sec: number;
            tempo: string;
            intensity: string;
            weight_guidance: string;
            rpe: number;
            rest_type: string;
        }, {
            reps: number;
            rest_sec: number;
            notes: string;
            time_sec: number;
            tempo: string;
            intensity: string;
            weight_guidance: string;
            rpe: number;
            rest_type: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        type: string;
        sets: {
            reps: number;
            rest_sec: number;
            notes: string;
            time_sec: number;
            tempo: string;
            intensity: string;
            weight_guidance: string;
            rpe: number;
            rest_type: string;
        }[];
        equipment: string[];
        slug: string;
        display_name: string;
        primary_muscles: string[];
        instructions: string[];
    }, {
        type: string;
        sets: {
            reps: number;
            rest_sec: number;
            notes: string;
            time_sec: number;
            tempo: string;
            intensity: string;
            weight_guidance: string;
            rpe: number;
            rest_type: string;
        }[];
        equipment: string[];
        slug: string;
        display_name: string;
        primary_muscles: string[];
        instructions: string[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    name: string;
    exercises: {
        type: string;
        sets: {
            reps: number;
            rest_sec: number;
            notes: string;
            time_sec: number;
            tempo: string;
            intensity: string;
            weight_guidance: string;
            rpe: number;
            rest_type: string;
        }[];
        equipment: string[];
        slug: string;
        display_name: string;
        primary_muscles: string[];
        instructions: string[];
    }[];
}, {
    name: string;
    exercises: {
        type: string;
        sets: {
            reps: number;
            rest_sec: number;
            notes: string;
            time_sec: number;
            tempo: string;
            intensity: string;
            weight_guidance: string;
            rpe: number;
            rest_type: string;
        }[];
        equipment: string[];
        slug: string;
        display_name: string;
        primary_muscles: string[];
        instructions: string[];
    }[];
}>;
export declare const AIWarmupCooldownSchema: z.ZodObject<{
    name: z.ZodString;
    duration_sec: z.ZodNumber;
    cues: z.ZodString;
    instructions: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    name: string;
    duration_sec: number;
    instructions: string[];
    cues: string;
}, {
    name: string;
    duration_sec: number;
    instructions: string[];
    cues: string;
}>;
export declare const AIFinisherSchema: z.ZodObject<{
    name: z.ZodString;
    work_sec: z.ZodNumber;
    rest_sec: z.ZodNumber;
    rounds: z.ZodNumber;
    notes: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    rest_sec: number;
    notes: string;
    work_sec: number;
    rounds: number;
}, {
    name: string;
    rest_sec: number;
    notes: string;
    work_sec: number;
    rounds: number;
}>;
export declare const AIWorkoutMetaSchema: z.ZodObject<{
    date_iso: z.ZodString;
    session_type: z.ZodString;
    goal: z.ZodString;
    experience: z.ZodString;
    est_duration_min: z.ZodNumber;
    equipment_used: z.ZodArray<z.ZodString, "many">;
    workout_name: z.ZodString;
    instructions: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    experience: string;
    est_duration_min: number;
    instructions: string[];
    date_iso: string;
    session_type: string;
    goal: string;
    equipment_used: string[];
    workout_name: string;
}, {
    experience: string;
    est_duration_min: number;
    instructions: string[];
    date_iso: string;
    session_type: string;
    goal: string;
    equipment_used: string[];
    workout_name: string;
}>;
export declare const AIWorkoutPlanSchema: z.ZodObject<{
    meta: z.ZodObject<{
        date_iso: z.ZodString;
        session_type: z.ZodString;
        goal: z.ZodString;
        experience: z.ZodString;
        est_duration_min: z.ZodNumber;
        equipment_used: z.ZodArray<z.ZodString, "many">;
        workout_name: z.ZodString;
        instructions: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        experience: string;
        est_duration_min: number;
        instructions: string[];
        date_iso: string;
        session_type: string;
        goal: string;
        equipment_used: string[];
        workout_name: string;
    }, {
        experience: string;
        est_duration_min: number;
        instructions: string[];
        date_iso: string;
        session_type: string;
        goal: string;
        equipment_used: string[];
        workout_name: string;
    }>;
    warmup: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        duration_sec: z.ZodNumber;
        cues: z.ZodString;
        instructions: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        name: string;
        duration_sec: number;
        instructions: string[];
        cues: string;
    }, {
        name: string;
        duration_sec: number;
        instructions: string[];
        cues: string;
    }>, "many">;
    blocks: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        exercises: z.ZodArray<z.ZodObject<{
            slug: z.ZodString;
            display_name: z.ZodString;
            type: z.ZodString;
            equipment: z.ZodArray<z.ZodString, "many">;
            primary_muscles: z.ZodArray<z.ZodString, "many">;
            instructions: z.ZodArray<z.ZodString, "many">;
            sets: z.ZodArray<z.ZodObject<{
                reps: z.ZodNumber;
                time_sec: z.ZodNumber;
                rest_sec: z.ZodNumber;
                tempo: z.ZodString;
                intensity: z.ZodString;
                notes: z.ZodString;
                weight_guidance: z.ZodString;
                rpe: z.ZodNumber;
                rest_type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                reps: number;
                rest_sec: number;
                notes: string;
                time_sec: number;
                tempo: string;
                intensity: string;
                weight_guidance: string;
                rpe: number;
                rest_type: string;
            }, {
                reps: number;
                rest_sec: number;
                notes: string;
                time_sec: number;
                tempo: string;
                intensity: string;
                weight_guidance: string;
                rpe: number;
                rest_type: string;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            type: string;
            sets: {
                reps: number;
                rest_sec: number;
                notes: string;
                time_sec: number;
                tempo: string;
                intensity: string;
                weight_guidance: string;
                rpe: number;
                rest_type: string;
            }[];
            equipment: string[];
            slug: string;
            display_name: string;
            primary_muscles: string[];
            instructions: string[];
        }, {
            type: string;
            sets: {
                reps: number;
                rest_sec: number;
                notes: string;
                time_sec: number;
                tempo: string;
                intensity: string;
                weight_guidance: string;
                rpe: number;
                rest_type: string;
            }[];
            equipment: string[];
            slug: string;
            display_name: string;
            primary_muscles: string[];
            instructions: string[];
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        name: string;
        exercises: {
            type: string;
            sets: {
                reps: number;
                rest_sec: number;
                notes: string;
                time_sec: number;
                tempo: string;
                intensity: string;
                weight_guidance: string;
                rpe: number;
                rest_type: string;
            }[];
            equipment: string[];
            slug: string;
            display_name: string;
            primary_muscles: string[];
            instructions: string[];
        }[];
    }, {
        name: string;
        exercises: {
            type: string;
            sets: {
                reps: number;
                rest_sec: number;
                notes: string;
                time_sec: number;
                tempo: string;
                intensity: string;
                weight_guidance: string;
                rpe: number;
                rest_type: string;
            }[];
            equipment: string[];
            slug: string;
            display_name: string;
            primary_muscles: string[];
            instructions: string[];
        }[];
    }>, "many">;
    finisher: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        work_sec: z.ZodNumber;
        rest_sec: z.ZodNumber;
        rounds: z.ZodNumber;
        notes: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        rest_sec: number;
        notes: string;
        work_sec: number;
        rounds: number;
    }, {
        name: string;
        rest_sec: number;
        notes: string;
        work_sec: number;
        rounds: number;
    }>, "many">;
    cooldown: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        duration_sec: z.ZodNumber;
        cues: z.ZodString;
        instructions: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        name: string;
        duration_sec: number;
        instructions: string[];
        cues: string;
    }, {
        name: string;
        duration_sec: number;
        instructions: string[];
        cues: string;
    }>, "many">;
    notes: z.ZodString;
}, "strip", z.ZodTypeAny, {
    notes: string;
    blocks: {
        name: string;
        exercises: {
            type: string;
            sets: {
                reps: number;
                rest_sec: number;
                notes: string;
                time_sec: number;
                tempo: string;
                intensity: string;
                weight_guidance: string;
                rpe: number;
                rest_type: string;
            }[];
            equipment: string[];
            slug: string;
            display_name: string;
            primary_muscles: string[];
            instructions: string[];
        }[];
    }[];
    meta: {
        experience: string;
        est_duration_min: number;
        instructions: string[];
        date_iso: string;
        session_type: string;
        goal: string;
        equipment_used: string[];
        workout_name: string;
    };
    warmup: {
        name: string;
        duration_sec: number;
        instructions: string[];
        cues: string;
    }[];
    finisher: {
        name: string;
        rest_sec: number;
        notes: string;
        work_sec: number;
        rounds: number;
    }[];
    cooldown: {
        name: string;
        duration_sec: number;
        instructions: string[];
        cues: string;
    }[];
}, {
    notes: string;
    blocks: {
        name: string;
        exercises: {
            type: string;
            sets: {
                reps: number;
                rest_sec: number;
                notes: string;
                time_sec: number;
                tempo: string;
                intensity: string;
                weight_guidance: string;
                rpe: number;
                rest_type: string;
            }[];
            equipment: string[];
            slug: string;
            display_name: string;
            primary_muscles: string[];
            instructions: string[];
        }[];
    }[];
    meta: {
        experience: string;
        est_duration_min: number;
        instructions: string[];
        date_iso: string;
        session_type: string;
        goal: string;
        equipment_used: string[];
        workout_name: string;
    };
    warmup: {
        name: string;
        duration_sec: number;
        instructions: string[];
        cues: string;
    }[];
    finisher: {
        name: string;
        rest_sec: number;
        notes: string;
        work_sec: number;
        rounds: number;
    }[];
    cooldown: {
        name: string;
        duration_sec: number;
        instructions: string[];
        cues: string;
    }[];
}>;
export declare const WorkoutPlanJsonSchema: {
    type: string;
    additionalProperties: boolean;
    properties: {
        meta: {
            type: string;
            additionalProperties: boolean;
            properties: {
                date_iso: {
                    type: string;
                };
                session_type: {
                    type: string;
                };
                goal: {
                    type: string;
                };
                experience: {
                    type: string;
                };
                est_duration_min: {
                    type: string;
                };
                equipment_used: {
                    type: string;
                    items: {
                        type: string;
                    };
                };
                workout_name: {
                    type: string;
                };
                instructions: {
                    type: string;
                    items: {
                        type: string;
                    };
                    minItems: number;
                    maxItems: number;
                };
            };
            required: string[];
        };
        warmup: {
            type: string;
            items: {
                type: string;
                additionalProperties: boolean;
                properties: {
                    name: {
                        type: string;
                    };
                    duration_sec: {
                        type: string;
                    };
                    cues: {
                        type: string;
                    };
                    instructions: {
                        type: string;
                        items: {
                            type: string;
                        };
                        minItems: number;
                        maxItems: number;
                    };
                };
                required: string[];
            };
        };
        blocks: {
            type: string;
            items: {
                type: string;
                additionalProperties: boolean;
                properties: {
                    name: {
                        type: string;
                    };
                    exercises: {
                        type: string;
                        items: {
                            type: string;
                            additionalProperties: boolean;
                            properties: {
                                slug: {
                                    type: string;
                                };
                                display_name: {
                                    type: string;
                                };
                                type: {
                                    type: string;
                                };
                                equipment: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                                primary_muscles: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                                instructions: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                    minItems: number;
                                    maxItems: number;
                                };
                                sets: {
                                    type: string;
                                    minItems: number;
                                    maxItems: number;
                                    items: {
                                        type: string;
                                        additionalProperties: boolean;
                                        properties: {
                                            reps: {
                                                type: string;
                                            };
                                            time_sec: {
                                                type: string;
                                            };
                                            rest_sec: {
                                                type: string;
                                            };
                                            tempo: {
                                                type: string;
                                            };
                                            intensity: {
                                                type: string;
                                            };
                                            notes: {
                                                type: string;
                                            };
                                            weight_guidance: {
                                                type: string;
                                            };
                                            rpe: {
                                                type: string;
                                            };
                                            rest_type: {
                                                type: string;
                                            };
                                        };
                                        required: string[];
                                    };
                                };
                            };
                            required: string[];
                        };
                    };
                };
                required: string[];
            };
        };
        finisher: {
            type: string;
            items: {
                type: string;
                additionalProperties: boolean;
                properties: {
                    name: {
                        type: string;
                    };
                    work_sec: {
                        type: string;
                    };
                    rest_sec: {
                        type: string;
                    };
                    rounds: {
                        type: string;
                    };
                    notes: {
                        type: string;
                    };
                };
                required: string[];
            };
        };
        cooldown: {
            type: string;
            items: {
                type: string;
                additionalProperties: boolean;
                properties: {
                    name: {
                        type: string;
                    };
                    duration_sec: {
                        type: string;
                    };
                    cues: {
                        type: string;
                    };
                    instructions: {
                        type: string;
                        items: {
                            type: string;
                        };
                        minItems: number;
                        maxItems: number;
                    };
                };
                required: string[];
            };
        };
        notes: {
            type: string;
        };
    };
    required: string[];
};
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type CreateProfileInput = z.infer<typeof CreateProfileSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type GenerateWorkoutInput = z.infer<typeof GenerateWorkoutSchema>;
export type GenerateWorkoutRequest = z.infer<typeof GenerateWorkoutRequestSchema>;
export type CompleteWorkoutInput = z.infer<typeof CompleteWorkoutSchema>;
export type AuthInput = z.infer<typeof AuthSchema>;
export type PreWorkout = z.infer<typeof PreWorkoutSchema>;
export type CreateWorkoutPlanInput = z.infer<typeof CreateWorkoutPlanSchema>;
export type CreateWorkoutSessionInput = z.infer<typeof CreateWorkoutSessionSchema>;
export type UpdateWorkoutSessionInput = z.infer<typeof UpdateWorkoutSessionSchema>;
export type CreateEquipmentInput = z.infer<typeof CreateEquipmentSchema>;
export type UpdateEquipmentInput = z.infer<typeof UpdateEquipmentSchema>;
export type AIWorkoutPlan = z.infer<typeof AIWorkoutPlanSchema>;
//# sourceMappingURL=validation.d.ts.map