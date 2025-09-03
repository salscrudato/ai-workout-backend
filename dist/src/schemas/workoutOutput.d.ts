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
//# sourceMappingURL=workoutOutput.d.ts.map