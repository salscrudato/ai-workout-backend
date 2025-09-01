export const WorkoutPlanJsonSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        meta: {
            type: 'object', additionalProperties: false,
            properties: {
                date_iso: { type: 'string' },
                session_type: { type: 'string' },
                goal: { type: 'string' },
                experience: { type: 'string' },
                est_duration_min: { type: 'number' },
                equipment_used: { type: 'array', items: { type: 'string' } }
            },
            required: ['date_iso', 'session_type', 'goal', 'experience', 'est_duration_min', 'equipment_used']
        },
        warmup: {
            type: 'array',
            items: { type: 'object', additionalProperties: false,
                properties: { name: { type: 'string' }, duration_sec: { type: 'number' }, cues: { type: 'string' } },
                required: ['name', 'duration_sec', 'cues']
            }
        },
        blocks: {
            type: 'array',
            items: { type: 'object', additionalProperties: false, properties: {
                    name: { type: 'string' },
                    exercises: { type: 'array', items: { type: 'object', additionalProperties: false, properties: {
                                slug: { type: 'string' },
                                display_name: { type: 'string' },
                                type: { type: 'string' },
                                equipment: { type: 'array', items: { type: 'string' } },
                                primary_muscles: { type: 'array', items: { type: 'string' } },
                                sets: { type: 'array', items: { type: 'object', additionalProperties: false, properties: {
                                            reps: { type: 'number' }, time_sec: { type: 'number' }, rest_sec: { type: 'number' },
                                            tempo: { type: 'string' }, intensity: { type: 'string' }, notes: { type: 'string' }
                                        }, required: ['reps', 'time_sec', 'rest_sec', 'tempo', 'intensity', 'notes'] } }
                            }, required: ['slug', 'display_name', 'type', 'equipment', 'primary_muscles', 'sets'] } }
                }, required: ['name', 'exercises'] }
        },
        finisher: {
            type: 'array',
            items: { type: 'object', additionalProperties: false, properties: {
                    name: { type: 'string' }, work_sec: { type: 'number' }, rest_sec: { type: 'number' }, rounds: { type: 'number' }, notes: { type: 'string' }
                }, required: ['name', 'work_sec', 'rest_sec', 'rounds', 'notes'] }
        },
        cooldown: {
            type: 'array',
            items: { type: 'object', additionalProperties: false, properties: {
                    name: { type: 'string' }, duration_sec: { type: 'number' }, cues: { type: 'string' }
                }, required: ['name', 'duration_sec', 'cues'] }
        },
        notes: { type: 'string' }
    },
    required: ['meta', 'warmup', 'blocks', 'finisher', 'cooldown', 'notes']
};
//# sourceMappingURL=workoutOutput.js.map