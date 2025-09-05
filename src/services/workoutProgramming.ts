/**
 * Advanced workout programming service for optimizing sets, reps, and intensity
 */

export interface SetProgramming {
  sets: number;
  repsRange: [number, number];
  restSeconds: number;
  intensityProgression: string[];
  rpeProgression: number[];
  tempoPattern: string;
}

export interface WorkoutProgrammingOptions {
  experience: 'beginner' | 'intermediate' | 'advanced';
  primaryGoal: string;
  workoutType: string;
  timeAvailable: number;
  equipmentLevel: 'minimal' | 'moderate' | 'full';
}

/**
 * Generate optimal sets and reps programming based on exercise type and user goals
 */
export function generateSetsProgramming(
  exerciseType: 'compound' | 'isolation' | 'cardio' | 'core' | 'mobility',
  options: WorkoutProgrammingOptions
): SetProgramming {
  const { experience, primaryGoal, workoutType } = options;
  
  // Base programming templates
  const programmingTemplates = {
    strength: {
      compound: {
        beginner: { sets: 3, repsRange: [5, 8], rest: 180, rpe: [6, 7, 8] },
        intermediate: { sets: 4, repsRange: [3, 6], rest: 240, rpe: [6, 7, 8, 8] },
        advanced: { sets: 5, repsRange: [1, 5], rest: 300, rpe: [6, 7, 8, 9, 9] }
      },
      isolation: {
        beginner: { sets: 2, repsRange: [8, 12], rest: 90, rpe: [6, 7] },
        intermediate: { sets: 3, repsRange: [6, 10], rest: 120, rpe: [6, 7, 8] },
        advanced: { sets: 3, repsRange: [5, 8], rest: 120, rpe: [7, 8, 8] }
      }
    },
    hypertrophy: {
      compound: {
        beginner: { sets: 3, repsRange: [8, 12], rest: 120, rpe: [6, 7, 8] },
        intermediate: { sets: 4, repsRange: [6, 12], rest: 120, rpe: [6, 7, 8, 8] },
        advanced: { sets: 4, repsRange: [6, 15], rest: 90, rpe: [7, 8, 8, 9] }
      },
      isolation: {
        beginner: { sets: 3, repsRange: [10, 15], rest: 60, rpe: [6, 7, 7] },
        intermediate: { sets: 3, repsRange: [8, 15], rest: 75, rpe: [6, 7, 8] },
        advanced: { sets: 4, repsRange: [8, 20], rest: 60, rpe: [7, 8, 8, 9] }
      }
    },
    endurance: {
      compound: {
        beginner: { sets: 2, repsRange: [12, 20], rest: 60, rpe: [5, 6] },
        intermediate: { sets: 3, repsRange: [15, 25], rest: 45, rpe: [6, 7, 7] },
        advanced: { sets: 3, repsRange: [20, 30], rest: 30, rpe: [7, 8, 8] }
      },
      isolation: {
        beginner: { sets: 2, repsRange: [15, 25], rest: 45, rpe: [5, 6] },
        intermediate: { sets: 3, repsRange: [20, 30], rest: 30, rpe: [6, 7, 7] },
        advanced: { sets: 3, repsRange: [25, 40], rest: 30, rpe: [7, 8, 8] }
      }
    }
  };

  // Determine primary training focus
  let focus = 'hypertrophy'; // default
  if (primaryGoal.toLowerCase().includes('strength') || primaryGoal.toLowerCase().includes('power')) {
    focus = 'strength';
  } else if (primaryGoal.toLowerCase().includes('endurance') || primaryGoal.toLowerCase().includes('cardio')) {
    focus = 'endurance';
  }

  // Get base template
  const template = programmingTemplates[focus as keyof typeof programmingTemplates]?.[exerciseType]?.[experience];
  
  if (!template) {
    // Fallback for unsupported combinations
    return {
      sets: 3,
      repsRange: [8, 12],
      restSeconds: 90,
      intensityProgression: ['moderate', 'moderate', 'high'],
      rpeProgression: [6, 7, 8],
      tempoPattern: '2-1-2-1'
    };
  }

  // Generate intensity progression
  const intensityProgression = template.rpe.map((rpe, index) => {
    if (rpe <= 6) return 'light';
    if (rpe <= 7) return 'moderate';
    if (rpe <= 8) return 'high';
    return 'very high';
  });

  return {
    sets: template.sets,
    repsRange: template.repsRange,
    restSeconds: template.rest,
    intensityProgression,
    rpeProgression: template.rpe,
    tempoPattern: getTempoPattern(focus, exerciseType)
  };
}

/**
 * Generate tempo patterns based on training focus
 */
function getTempoPattern(focus: string, exerciseType: string): string {
  if (focus === 'strength') {
    return exerciseType === 'compound' ? '3-1-1-1' : '2-1-1-1'; // Slower eccentric for strength
  } else if (focus === 'hypertrophy') {
    return '3-1-2-1'; // Controlled tempo for muscle growth
  } else if (focus === 'endurance') {
    return '2-0-2-0'; // Faster tempo for endurance
  }
  return '2-1-2-1'; // Standard tempo
}

/**
 * Generate progressive rep schemes across sets
 */
export function generateProgressiveReps(
  programming: SetProgramming,
  exerciseType: 'compound' | 'isolation' | 'cardio' | 'core' | 'mobility'
): number[] {
  const { sets, repsRange } = programming;
  const [minReps, maxReps] = repsRange;
  
  if (sets === 1) {
    return [Math.round((minReps + maxReps) / 2)];
  }

  // Different progression patterns
  if (exerciseType === 'compound') {
    // Reverse pyramid: higher reps first, then lower
    const reps = [];
    for (let i = 0; i < sets; i++) {
      const rep = maxReps - Math.floor((i * (maxReps - minReps)) / (sets - 1));
      reps.push(Math.max(minReps, rep));
    }
    return reps;
  } else {
    // Straight sets or slight increase
    const baseReps = Math.round((minReps + maxReps) / 2);
    return Array.from({ length: sets }, (_, i) => {
      if (i === 0) return Math.max(minReps, baseReps - 2); // Warm-up set
      return baseReps;
    });
  }
}

/**
 * Generate workout-specific volume recommendations
 */
export function calculateWorkoutVolume(
  exercises: any[],
  options: WorkoutProgrammingOptions
): {
  totalSets: number;
  totalReps: number;
  estimatedDuration: number;
  volumeRecommendations: string[];
} {
  let totalSets = 0;
  let totalReps = 0;
  let estimatedDuration = 0;
  const recommendations = [];

  exercises.forEach(exercise => {
    if (exercise.sets && Array.isArray(exercise.sets)) {
      totalSets += exercise.sets.length;
      totalReps += exercise.sets.reduce((sum: number, set: any) => sum + (set.reps || 0), 0);
      
      // Add rest time to duration estimate
      const avgRestTime = exercise.sets.reduce((sum: number, set: any) => sum + (set.rest_sec || 60), 0) / exercise.sets.length;
      estimatedDuration += (exercise.sets.length * 45) + (avgRestTime * (exercise.sets.length - 1)); // 45s per set + rest
    }
  });

  // Convert to minutes
  estimatedDuration = Math.round(estimatedDuration / 60);

  // Generate recommendations
  if (totalSets < 12) {
    recommendations.push('Consider adding 2-3 more exercises for optimal volume');
  } else if (totalSets > 25) {
    recommendations.push('High volume workout - ensure adequate recovery');
  }

  if (options.experience === 'beginner' && totalSets > 15) {
    recommendations.push('Reduce volume for better recovery as a beginner');
  }

  if (estimatedDuration > options.timeAvailable) {
    recommendations.push(`Workout may exceed available time (${options.timeAvailable}min). Consider reducing rest periods or exercises.`);
  }

  return {
    totalSets,
    totalReps,
    estimatedDuration,
    volumeRecommendations: recommendations
  };
}

/**
 * Apply periodization principles to workout programming
 */
export function applyPeriodization(
  baseWorkout: any,
  weekNumber: number,
  totalWeeks: number = 12
): any {
  const phase = Math.floor((weekNumber - 1) / 4) + 1; // 4-week phases
  
  // Periodization adjustments
  const adjustments = {
    1: { intensityMultiplier: 0.85, volumeMultiplier: 1.1 }, // Accumulation
    2: { intensityMultiplier: 0.9, volumeMultiplier: 1.0 },  // Intensification
    3: { intensityMultiplier: 0.95, volumeMultiplier: 0.9 }, // Realization
  };

  const adjustment = adjustments[phase as keyof typeof adjustments] || adjustments[2];

  // Apply adjustments to workout
  if (baseWorkout.exercises) {
    baseWorkout.exercises.forEach((exercise: any) => {
      if (exercise.sets) {
        exercise.sets.forEach((set: any) => {
          // Adjust RPE based on phase
          if (set.rpe) {
            set.rpe = Math.min(10, Math.round(set.rpe * adjustment.intensityMultiplier));
          }
          
          // Adjust reps based on volume multiplier
          if (set.reps) {
            set.reps = Math.round(set.reps * adjustment.volumeMultiplier);
          }
        });
      }
    });
  }

  return baseWorkout;
}

/**
 * Generate deload week modifications
 */
export function generateDeloadWeek(baseWorkout: any): any {
  const deloadWorkout = JSON.parse(JSON.stringify(baseWorkout)); // Deep copy
  
  if (deloadWorkout.exercises) {
    deloadWorkout.exercises.forEach((exercise: any) => {
      if (exercise.sets) {
        exercise.sets.forEach((set: any) => {
          // Reduce intensity and volume for deload
          if (set.rpe) {
            set.rpe = Math.max(4, set.rpe - 2);
          }
          if (set.reps) {
            set.reps = Math.max(5, Math.round(set.reps * 0.7));
          }
          if (set.weight_guidance) {
            set.weight_guidance = 'light';
          }
          set.notes = (set.notes || '') + ' (Deload week - focus on form)';
        });
      }
    });
  }

  // Update workout metadata
  if (deloadWorkout.meta) {
    deloadWorkout.meta.workout_name = (deloadWorkout.meta.workout_name || 'Workout') + ' - Deload';
    deloadWorkout.meta.difficulty_level = 'easy';
  }

  return deloadWorkout;
}
