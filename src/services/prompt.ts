import { ProfileModel } from '../models/Profile';

export async function buildWorkoutPrompt(userId: string, pre: any) {
  const profile = await ProfileModel.findOne({ userId });
  if (!profile) throw Object.assign(new Error('Profile not found'), { status: 404 });

  const p: any = profile;
  const equipmentToday = (pre.equipment_override ?? p.equipmentAvailable ?? ['bodyweight']).join(', ');

  const lines = [
    `You are an expert strength & conditioning coach.`,
    `Goal(s): ${(p.goals ?? ['general_fitness']).join(', ')}. Experience: ${p.experience}.`,
    `User (imperial): age ${p.age ?? 'n/a'}, sex ${p.sex ?? 'n/a'}, height ${p.height_in ?? 'n/a'} in, weight ${p.weight_lb ?? 'n/a'} lb.`,
    `Today's workout_type: ${pre.workout_type}. Time available: ${pre.time_available_min} min. Energy: ${pre.energy_level}/5.`,
    `Available equipment today: ${equipmentToday}.`,
    `Constraints: ${[...(p.constraints ?? []), p.injury_notes, pre.new_injuries].filter(Boolean).join('; ') || 'none'}.`,
    `Rules:`,
    `- Use only listed equipment.`,
    `- Respect constraints and safety; avoid contraindicated moves.`,
    `- Total duration <= ${pre.time_available_min} min including warmup/cooldown.`,
    `- For each set: either reps>0 (time_sec=0) OR time_sec>0 (reps=0).`,
    `- Provide substitutions in "notes".`,
    `Output strictly as JSON matching the provided schema.`,
  ];
  return lines.join('\n');
}