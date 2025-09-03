import { ProfileModel } from '../models/Profile';

// Rest time recommendations based on exercise type and experience
const getRestTimeGuidelines = (experience: string) => {
  const guidelines = {
    beginner: {
      strength: '90-120 seconds',
      hypertrophy: '60-90 seconds',
      endurance: '30-60 seconds',
      power: '120-180 seconds',
      cardio: '15-30 seconds',
      mobility: '10-15 seconds'
    },
    intermediate: {
      strength: '120-180 seconds',
      hypertrophy: '60-90 seconds',
      endurance: '30-45 seconds',
      power: '180-240 seconds',
      cardio: '15-30 seconds',
      mobility: '10-15 seconds'
    },
    advanced: {
      strength: '180-300 seconds',
      hypertrophy: '60-120 seconds',
      endurance: '30-60 seconds',
      power: '240-360 seconds',
      cardio: '15-45 seconds',
      mobility: '15-30 seconds'
    }
  };
  return guidelines[experience as keyof typeof guidelines] || guidelines.beginner;
};

// Exercise intensity and tempo guidelines
const getIntensityGuidelines = (experience: string, workoutType: string) => {
  const isStrengthFocused = ['chest', 'back', 'legs', 'shoulders', 'push', 'pull'].some(type =>
    workoutType.toLowerCase().includes(type)
  );
  const isCardioFocused = ['cardio', 'hiit', 'conditioning'].some(type =>
    workoutType.toLowerCase().includes(type)
  );

  if (isStrengthFocused) {
    return {
      beginner: 'Focus on form and control. Use 2-1-2-1 tempo (2s eccentric, 1s pause, 2s concentric, 1s pause).',
      intermediate: 'Moderate to high intensity. Use 3-1-2-1 tempo for strength, 2-0-2-0 for hypertrophy.',
      advanced: 'High intensity with varied tempos. Use 4-2-1-1 for strength, 3-1-1-1 for power.'
    }[experience] || '';
  } else if (isCardioFocused) {
    return {
      beginner: 'Moderate intensity (60-70% max effort). Focus on maintaining good form throughout.',
      intermediate: 'Moderate to high intensity (70-85% max effort). Include brief recovery periods.',
      advanced: 'High intensity intervals (85-95% max effort) with strategic rest periods.'
    }[experience] || '';
  }
  return 'Adjust intensity based on your current fitness level and energy.';
};

export async function buildWorkoutPrompt(userId: string, pre: any) {
  const profile = await ProfileModel.findOne({ userId });
  if (!profile) throw Object.assign(new Error('Profile not found'), { status: 404 });

  const p: any = profile;
  const equipmentToday = (pre.equipment_override ?? p.equipmentAvailable ?? ['bodyweight']).join(', ');
  const goals = (pre.goals ?? p.goals ?? ['general_fitness']).join(', ');
  const experience = pre.experience ?? p.experience ?? 'beginner';
  const workoutTypeFormatted = pre.workout_type.replace(/_/g, ' ').replace(/\//g, ' and ');

  const restGuidelines = getRestTimeGuidelines(experience);
  const intensityGuidance = getIntensityGuidelines(experience, workoutTypeFormatted);
  const constraints = [...(p.constraints ?? []), p.injury_notes, pre.new_injuries].filter(Boolean).join('; ') || 'none';

  // Calculate time allocation
  const totalTime = pre.time_available_min;
  const warmupTime = Math.max(5, Math.min(10, Math.floor(totalTime * 0.15)));
  const cooldownTime = Math.max(5, Math.min(10, Math.floor(totalTime * 0.15)));
  const mainWorkoutTime = totalTime - warmupTime - cooldownTime;

  const lines = [
    `You are a world-class strength & conditioning coach with expertise in exercise physiology, biomechanics, and periodization.`,
    `Create an evidence-based ${workoutTypeFormatted} workout that maximizes training adaptations while ensuring safety.`,
    ``,
    `CLIENT PROFILE:`,
    `- Experience: ${experience} (adjust complexity and intensity accordingly)`,
    `- Primary goals: ${goals}`,
    `- Demographics: ${p.age || 'adult'} years old, ${p.sex || 'unspecified'}, ${p.height_ft || ''}ft ${p.height_in || ''}in, ${p.weight_lb || 'unspecified'} lb`,
    `- Current energy level: ${pre.energy_level}/5`,
    `- Available equipment: ${equipmentToday}`,
    `- Constraints/injuries: ${constraints}`,
    ``,
    `WORKOUT SPECIFICATIONS:`,
    `- Type: ${workoutTypeFormatted} (MUST target these specific muscle groups/movement patterns)`,
    `- Total duration: ${totalTime} minutes (${warmupTime}min warmup + ${mainWorkoutTime}min main + ${cooldownTime}min cooldown)`,
    `- Target muscle groups for ${workoutTypeFormatted}: ${getTargetMuscles(workoutTypeFormatted)}`,
    ``,
    `EXERCISE PROGRAMMING PRINCIPLES:`,
    `- Progressive overload: Structure exercises from foundational to challenging`,
    `- Movement quality: Prioritize proper form and full range of motion`,
    `- Muscle balance: Include opposing muscle groups when appropriate`,
    `- Energy system targeting: ${getEnergySystemFocus(workoutTypeFormatted)}`,
    `- ${intensityGuidance}`,
    ``,
    `REST TIME GUIDELINES (use rest_sec field):`,
    `- Strength/Power exercises: ${restGuidelines.strength} (${getRestSeconds(restGuidelines.strength)})`,
    `- Hypertrophy exercises: ${restGuidelines.hypertrophy} (${getRestSeconds(restGuidelines.hypertrophy)})`,
    `- Endurance exercises: ${restGuidelines.endurance} (${getRestSeconds(restGuidelines.endurance)})`,
    `- Cardio/HIIT exercises: ${restGuidelines.cardio} (${getRestSeconds(restGuidelines.cardio)})`,
    `- Mobility/stretching: ${restGuidelines.mobility} (${getRestSeconds(restGuidelines.mobility)})`,
    ``,
    `CRITICAL REQUIREMENTS:`,
    `1. WORKOUT TYPE ADHERENCE: This MUST be a ${workoutTypeFormatted} workout targeting the specified muscle groups`,
    `2. EQUIPMENT COMPLIANCE: Use ONLY the listed equipment: ${equipmentToday}`,
    `3. SAFETY FIRST: Avoid exercises contraindicated by constraints: ${constraints}`,
    `4. TIME MANAGEMENT: Total workout must fit within ${totalTime} minutes including transitions`,
    `5. REST PERIODS: Always specify appropriate rest_sec values based on exercise type and intensity`,
    `6. EXERCISE SELECTION: Choose exercises that match the user's experience level`,
    `7. PROGRESSION: Order exercises from most to least demanding (compound → isolation)`,
    ``,
    `TECHNICAL SPECIFICATIONS:`,
    `- For each exercise set: Use either reps>0 (time_sec=0) OR time_sec>0 (reps=0), never both`,
    `- Include specific rest_sec values for every exercise based on the guidelines above`,
    `- Provide exercise modifications/substitutions in the "notes" field`,
    `- Use proper exercise names and muscle group classifications`,
    `- REQUIRED FIELDS for each set:`,
    `  * tempo: Use format "eccentric-pause-concentric-pause" (e.g., "3-1-2-1")`,
    `  * intensity: Specify intensity level (e.g., "moderate", "high", "low")`,
    `  * weight_guidance: Provide weight recommendations (e.g., "bodyweight", "moderate weight", "heavy")`,
    `  * rpe: Rate of Perceived Exertion 1-10 (e.g., 7 for challenging but manageable)`,
    `  * rest_type: Either "active" (light movement) or "passive" (complete rest)`,
    `  * notes: Exercise cues, modifications, or safety tips`,
    ``,
    `WORKOUT NAMING AND INSTRUCTIONS:`,
    `- workout_name: Create a motivating, descriptive name that captures the workout's essence (e.g., "Power Surge HIIT", "Iron Core Crusher", "Upper Body Blitz")`,
    `- instructions: Provide exactly 4 bullet points with key guidance:`,
    `  1. Form/technique focus point`,
    `  2. Intensity/pacing guidance`,
    `  3. Safety or modification tip`,
    `  4. Motivational or mindset cue`,
    ``,
    `EXERCISE-SPECIFIC INSTRUCTIONS:`,
    `- For each exercise, provide exactly 3 bullet points in the "instructions" field:`,
    `  1. Proper form/technique cue specific to that exercise`,
    `  2. Common mistake to avoid or safety tip`,
    `  3. Performance tip or variation for different skill levels`,
    ``,
    `WARMUP & COOLDOWN INSTRUCTIONS:`,
    `- For each warmup and cooldown movement, provide exactly 3 bullet points in the "instructions" field:`,
    `  1. Proper form/technique for the movement`,
    `  2. Breathing pattern or tempo guidance`,
    `  3. Focus point or mindfulness cue for the movement`,
    ``,
    `OUTPUT FORMAT: Respond with valid JSON matching the provided schema exactly. ALL fields are required.`
  ];

  return lines.join('\n');
}

// Helper functions for workout programming
function getTargetMuscles(workoutType: string): string {
  const type = workoutType.toLowerCase();
  const muscleMap: { [key: string]: string } = {
    'chest': 'Pectorals, anterior deltoids, triceps',
    'back': 'Latissimus dorsi, rhomboids, middle traps, rear deltoids, biceps',
    'legs': 'Quadriceps, hamstrings, glutes, calves',
    'shoulders': 'Deltoids (anterior, medial, posterior), trapezius',
    'core': 'Rectus abdominis, obliques, transverse abdominis, erector spinae',
    'push': 'Chest, shoulders, triceps',
    'pull': 'Back, biceps, rear deltoids',
    'upper body': 'Chest, back, shoulders, arms',
    'lower body': 'Legs, glutes, calves',
    'full body': 'All major muscle groups with emphasis on compound movements',
    'hiit': 'Full body with cardiovascular emphasis',
    'cardio': 'Cardiovascular system with supporting musculature'
  };

  for (const [key, muscles] of Object.entries(muscleMap)) {
    if (type.includes(key)) return muscles;
  }
  return 'Primary muscle groups based on exercise selection';
}

function getEnergySystemFocus(workoutType: string): string {
  const type = workoutType.toLowerCase();
  if (type.includes('hiit') || type.includes('cardio')) {
    return 'Anaerobic and aerobic energy systems';
  } else if (type.includes('strength') || type.includes('power')) {
    return 'Phosphocreatine system (high intensity, short duration)';
  }
  return 'Mixed energy systems with emphasis on strength and hypertrophy adaptations';
}

function getRestSeconds(restRange: string): string {
  // Convert rest time ranges to specific seconds for the middle of the range
  const ranges: { [key: string]: number } = {
    '90-120 seconds': 105,
    '60-90 seconds': 75,
    '30-60 seconds': 45,
    '120-180 seconds': 150,
    '15-30 seconds': 22,
    '10-15 seconds': 12,
    '180-300 seconds': 240,
    '60-120 seconds': 90,
    '30-45 seconds': 37,
    '180-240 seconds': 210,
    '15-45 seconds': 30,
    '240-360 seconds': 300
  };
  return `${ranges[restRange] || 60} seconds`;
}