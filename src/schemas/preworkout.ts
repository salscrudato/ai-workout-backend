import { z } from 'zod';

export const PreWorkoutSchema = z.object({
  userId: z.string(),
  time_available_min: z.number().int().min(10).max(120),
  start_time_iso: z.string().datetime().optional(),
  energy_level: z.number().int().min(1).max(5),
  workout_type: z.enum(['full_body','upper_lower','push','pull','legs','core','conditioning','mobility','recovery']),
  equipment_override: z.array(z.string()).optional(),
  new_injuries: z.string().optional(),
});
export type PreWorkout = z.infer<typeof PreWorkoutSchema>;