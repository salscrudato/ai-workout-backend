import { ProfileModel } from '../models/Profile';
import { WorkoutPlanModel } from '../models/WorkoutPlan';
import { WorkoutSessionModel } from '../models/WorkoutSession';
import { promptOptimizer } from './promptOptimizer';
import { promptVersioning } from './promptVersioning';

// Enhanced AI Prompt Engineering System
interface WorkoutHistoryAnalysis {
  recentPerformance: {
    completionRate: number;
    averageIntensity: number;
    preferredExercises: string[];
    struggledExercises: string[];
  };
  progressionPatterns: {
    strengthGains: boolean;
    enduranceImprovement: boolean;
    consistencyTrend: 'improving' | 'stable' | 'declining';
  };
  adaptationSignals: {
    needsProgression: boolean;
    needsDeload: boolean;
    needsVariety: boolean;
  };
}

interface ExpertPersonaContext {
  specialization: 'strength' | 'endurance' | 'mobility' | 'general';
  coachingStyle: 'supportive' | 'challenging' | 'technical';
  focusAreas: string[];
}

// Advanced helper functions for enhanced AI prompting
function getExperienceDescription(experience: string): string {
  const descriptions = {
    beginner: 'New to structured exercise, focus on movement quality and habit formation',
    intermediate: 'Comfortable with basic movements, ready for progressive challenges',
    advanced: 'Experienced with complex movements, seeking optimization and periodization'
  };
  return descriptions[experience as keyof typeof descriptions] || descriptions.beginner;
}

function getEnergyDescription(energyLevel: number): string {
  const descriptions = {
    1: 'Very low energy - gentle, restorative movements',
    2: 'Low energy - light to moderate intensity',
    3: 'Moderate energy - balanced workout intensity',
    4: 'High energy - challenging, vigorous workout',
    5: 'Peak energy - maximum intensity and complexity'
  };
  return descriptions[energyLevel as keyof typeof descriptions] || descriptions[3];
}

function getHeightWeight(profile: any): string {
  const height = profile.height_ft && profile.height_in ?
    `${profile.height_ft}ft ${profile.height_in}in` : 'unspecified height';
  const weight = profile.weight_lb ? `${profile.weight_lb} lb` : 'unspecified weight';
  return `${height}, ${weight}`;
}

function getMovementPatterns(workoutType: string): string {
  const type = workoutType.toLowerCase();
  const patterns: { [key: string]: string } = {
    'chest': 'Horizontal push, vertical push, stabilization',
    'back': 'Horizontal pull, vertical pull, scapular retraction',
    'legs': 'Squat, hinge, lunge, single-leg, calf raise',
    'shoulders': 'Overhead press, lateral raise, rear delt, stabilization',
    'core': 'Anti-extension, anti-rotation, anti-lateral flexion, hip flexion',
    'push': 'Horizontal push, vertical push, tricep extension',
    'pull': 'Horizontal pull, vertical pull, bicep flexion',
    'upper body': 'Push, pull, carry, stabilization',
    'lower body': 'Squat, hinge, lunge, single-leg, plyometric',
    'full body': 'Compound multi-joint movements, functional patterns',
    'hiit': 'Explosive, multi-planar, metabolic movements',
    'cardio': 'Rhythmic, sustained, large muscle group movements'
  };

  for (const [key, pattern] of Object.entries(patterns)) {
    if (type.includes(key)) return pattern;
  }
  return 'Functional movement patterns based on workout focus';
}

function getPeriodizationStrategy(experience: string, userHistory: any): string {
  const { totalWorkouts, completionRate, daysSinceLastWorkout } = userHistory;

  if (experience === 'beginner' || totalWorkouts < 10) {
    return 'Linear progression - gradually increase volume and intensity each session';
  } else if (experience === 'intermediate') {
    if (completionRate > 80) {
      return 'Block periodization - alternate between volume and intensity phases';
    } else {
      return 'Flexible progression - adjust based on performance and recovery';
    }
  } else { // advanced
    if (daysSinceLastWorkout > 3) {
      return 'Reactivation phase - rebuild work capacity before progressive loading';
    } else {
      return 'Conjugate method - simultaneous development of multiple qualities';
    }
  }
}

function getFatigueManagementStrategy(experience: string, energyLevel: number): string {
  const baseStrategy = {
    beginner: 'Conservative approach - stop 2-3 reps short of failure, prioritize recovery',
    intermediate: 'Moderate approach - work to RPE 7-8, monitor form degradation',
    advanced: 'Aggressive approach - work to RPE 8-9, use autoregulation principles'
  };

  let strategy = baseStrategy[experience as keyof typeof baseStrategy] || baseStrategy.beginner;

  // Energy-based modifications
  if (energyLevel <= 2) {
    strategy += '. LOW ENERGY PROTOCOL: Reduce volume by 20-30%, focus on movement quality';
  } else if (energyLevel >= 4) {
    strategy += '. HIGH ENERGY OPPORTUNITY: Consider intensity techniques or volume increases';
  }

  return strategy;
}

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

// Advanced workout history analysis with AI-optimized insights
async function getAdvancedWorkoutHistory(userId: string, workoutType: string): Promise<WorkoutHistoryAnalysis> {
  try {
    const allWorkouts = await WorkoutPlanModel.find({ userId }, { sort: { createdAt: -1 }, limit: 20 }) as any[];
    const allSessions = await WorkoutSessionModel.find({ userId }, { sort: { createdAt: -1 }, limit: 20 }) as any[];

    // Create workout-session mapping
    const sessionMap = new Map();
    allSessions.forEach(session => {
      sessionMap.set(session.planId, session);
    });

    const recentWorkouts = allWorkouts.slice(0, 10).map((workout: any) => {
      const session = sessionMap.get(workout.id);
      return {
        date: workout.createdAt,
        exercises: workout.plan?.exercises || [],
        duration: workout.preWorkout?.time_available_min || 30,
        completed: !!session?.completedAt,
        workoutType: workout.preWorkout?.workout_type || workoutType,
        energyLevel: workout.preWorkout?.energy_level || 3,
        feedback: session?.feedback || {},
        difficulty: session?.feedback?.difficulty || 3,
        enjoyment: session?.feedback?.enjoyment || 3,
        rating: session?.feedback?.rating || 3
      };
    });

    // Analyze recent performance
    const completedWorkouts = recentWorkouts.filter(w => w.completed);
    const completionRate = recentWorkouts.length > 0 ? completedWorkouts.length / recentWorkouts.length : 0;
    const averageIntensity = completedWorkouts.reduce((sum, w) => sum + (w.difficulty || 3), 0) / Math.max(completedWorkouts.length, 1);

    // Extract exercise patterns
    const exerciseFrequency = new Map<string, { count: number; avgRating: number; struggles: number }>();
    completedWorkouts.forEach(workout => {
      workout.exercises.forEach((exercise: any) => {
        const name = exercise.name || exercise.exercise;
        if (!exerciseFrequency.has(name)) {
          exerciseFrequency.set(name, { count: 0, avgRating: 0, struggles: 0 });
        }
        const data = exerciseFrequency.get(name)!;
        data.count++;
        data.avgRating += workout.rating || 3;
        if (workout.difficulty > 4) data.struggles++;
      });
    });

    const preferredExercises = Array.from(exerciseFrequency.entries())
      .filter(([_, data]) => data.count >= 2 && data.avgRating / data.count >= 3.5)
      .map(([name]) => name)
      .slice(0, 5);

    const struggledExercises = Array.from(exerciseFrequency.entries())
      .filter(([_, data]) => data.struggles / data.count > 0.6)
      .map(([name]) => name)
      .slice(0, 3);

    // Analyze progression patterns
    const recentRatings = completedWorkouts.slice(0, 5).map(w => w.rating || 3);
    const olderRatings = completedWorkouts.slice(5, 10).map(w => w.rating || 3);
    const recentAvg = recentRatings.reduce((a, b) => a + b, 0) / Math.max(recentRatings.length, 1);
    const olderAvg = olderRatings.reduce((a, b) => a + b, 0) / Math.max(olderRatings.length, 1);

    const strengthGains = recentAvg > olderAvg && averageIntensity > 3;
    const enduranceImprovement = completionRate > 0.8 && recentAvg >= 3.5;

    // Determine consistency trend
    const recentCompletions = recentWorkouts.slice(0, 5).filter(w => w.completed).length;
    const olderCompletions = recentWorkouts.slice(5, 10).filter(w => w.completed).length;
    let consistencyTrend: 'improving' | 'stable' | 'declining' = 'stable';
    if (recentCompletions > olderCompletions) consistencyTrend = 'improving';
    else if (recentCompletions < olderCompletions) consistencyTrend = 'declining';

    // Adaptation signals
    const needsProgression = strengthGains && completionRate > 0.8 && averageIntensity < 4;
    const needsDeload = averageIntensity > 4.5 && completionRate < 0.6;
    const needsVariety = struggledExercises.length > 2 || (recentWorkouts.length > 5 &&
      new Set(recentWorkouts.map(w => w.workoutType)).size === 1);

    return {
      recentPerformance: {
        completionRate,
        averageIntensity,
        preferredExercises,
        struggledExercises
      },
      progressionPatterns: {
        strengthGains,
        enduranceImprovement,
        consistencyTrend
      },
      adaptationSignals: {
        needsProgression,
        needsDeload,
        needsVariety
      }
    };
  } catch (error) {
    console.error('Error analyzing workout history:', error);
    return {
      recentPerformance: { completionRate: 0, averageIntensity: 3, preferredExercises: [], struggledExercises: [] },
      progressionPatterns: { strengthGains: false, enduranceImprovement: false, consistencyTrend: 'stable' },
      adaptationSignals: { needsProgression: false, needsDeload: false, needsVariety: false }
    };
  }
}

// Enhanced legacy function for backward compatibility
async function getRecentWorkoutHistory(userId: string, workoutType: string) {
  const analysis = await getAdvancedWorkoutHistory(userId, workoutType);
  const allWorkouts = await WorkoutPlanModel.find({ userId }, { sort: { createdAt: -1 }, limit: 5 }) as any[];

  return allWorkouts.map((workout: any) => ({
    date: workout.createdAt,
    exercises: workout.plan?.exercises || [],
    duration: workout.preWorkout?.time_available_min || 30,
    completed: analysis.recentPerformance.completionRate > 0.5,
    workoutType: workout.preWorkout?.workout_type || workoutType,
    energyLevel: workout.preWorkout?.energy_level || 3
  }));
}

// Get comprehensive user workout history for personalization
async function getUserWorkoutHistory(userId: string) {
  try {
    const allWorkouts = await WorkoutPlanModel.find({ userId }) as any[];

    const completedWorkouts = allWorkouts.filter((w: any) => w.completedAt);
    const totalWorkouts = allWorkouts.length;
    const completionRate = totalWorkouts > 0 ? (completedWorkouts.length / totalWorkouts * 100).toFixed(0) : '0';

    const workoutTypes = allWorkouts.reduce((acc: any, workout: any) => {
      const type = workout.preWorkout?.workoutType || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const favoriteType = Object.entries(workoutTypes)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'none';

    const lastWorkout = allWorkouts[0];
    const daysSinceLastWorkout = lastWorkout ?
      Math.floor((Date.now() - new Date(lastWorkout.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 999;

    return {
      summary: `${totalWorkouts} total workouts, ${completionRate}% completion rate, favorite: ${favoriteType}`,
      lastWorkout: lastWorkout ?
        `${daysSinceLastWorkout} days ago (${lastWorkout.preWorkout?.workoutType || 'unknown'})` :
        'No previous workouts',
      completionRate: parseInt(completionRate),
      favoriteType,
      totalWorkouts,
      daysSinceLastWorkout
    };
  } catch (error) {
    console.error('Error fetching user workout history:', error);
    return {
      summary: 'No workout history available',
      lastWorkout: 'No previous workouts',
      completionRate: 0,
      favoriteType: 'none',
      totalWorkouts: 0,
      daysSinceLastWorkout: 999
    };
  }
}

// Advanced progressive overload guidance with periodization
function generateProgressiveOverloadGuidance(workoutHistory: any[], experience: string) {
  if (workoutHistory.length === 0) {
    return 'First workout of this type - establish movement patterns and baseline strength with conservative loads (RPE 6-7).';
  }

  const completedWorkouts = workoutHistory.filter(w => w.completed).length;
  const recentEnergyLevels = workoutHistory.slice(0, 3).map(w => w.energyLevel || 3);
  const avgRecentEnergy = recentEnergyLevels.reduce((a, b) => a + b, 0) / recentEnergyLevels.length;

  let guidance = `Workout history: ${completedWorkouts}/${workoutHistory.length} completed recently. `;

  // Periodization based on completion rate and experience
  if (completedWorkouts >= 4) {
    guidance += 'OVERLOAD PHASE - Apply progressive overload: ';
    switch (experience) {
      case 'beginner':
        guidance += 'Increase reps by 1-2, extend holds by 5-10 seconds, or improve form quality. Target RPE 7-8.';
        break;
      case 'intermediate':
        guidance += 'Increase load by 2.5-5%, reps by 2-3, or reduce rest by 15-30 seconds. Target RPE 7-9.';
        break;
      case 'advanced':
        guidance += 'Increase load by 5-10%, add complexity/tempo variations, or advanced exercise progressions. Target RPE 8-9.';
        break;
    }
  } else if (completedWorkouts >= 2) {
    guidance += 'ADAPTATION PHASE - Moderate progression: ';
    guidance += 'Maintain similar volume but improve movement quality and mind-muscle connection. Target RPE 6-8.';
  } else {
    guidance += 'FOUNDATION PHASE - Focus on consistency: ';
    guidance += 'Prioritize perfect form, full range of motion, and establishing workout habits. Target RPE 5-7.';
  }

  // Energy-based adjustments
  if (avgRecentEnergy < 2.5) {
    guidance += ' RECOVERY CONSIDERATION: Recent low energy levels - reduce intensity by 10-15% and focus on movement quality.';
  } else if (avgRecentEnergy > 4) {
    guidance += ' HIGH ENERGY OPPORTUNITY: Recent high energy - consider adding intensity or complexity variations.';
  }

  return guidance;
}

// Generate expert persona context based on user profile and goals
function getExpertPersonaContext(profile: any, workoutType: string, historyAnalysis: WorkoutHistoryAnalysis): ExpertPersonaContext {
  const goals = profile.goals || ['general_fitness'];
  const experience = profile.experience || 'beginner';

  // Determine specialization
  let specialization: 'strength' | 'endurance' | 'mobility' | 'general' = 'general';
  if (goals.includes('strength') || goals.includes('muscle_gain') || workoutType.includes('strength')) {
    specialization = 'strength';
  } else if (goals.includes('endurance') || goals.includes('cardio') || workoutType.includes('cardio')) {
    specialization = 'endurance';
  } else if (goals.includes('flexibility') || goals.includes('mobility') || workoutType.includes('yoga')) {
    specialization = 'mobility';
  }

  // Determine coaching style
  let coachingStyle: 'supportive' | 'challenging' | 'technical' = 'supportive';
  if (experience === 'advanced' && historyAnalysis.recentPerformance.completionRate > 0.8) {
    coachingStyle = 'challenging';
  } else if (experience === 'intermediate' || historyAnalysis.progressionPatterns.strengthGains) {
    coachingStyle = 'technical';
  }

  // Focus areas based on analysis
  const focusAreas = [];
  if (historyAnalysis.adaptationSignals.needsProgression) focusAreas.push('progressive_overload');
  if (historyAnalysis.adaptationSignals.needsDeload) focusAreas.push('recovery_focus');
  if (historyAnalysis.adaptationSignals.needsVariety) focusAreas.push('exercise_variety');
  if (historyAnalysis.recentPerformance.struggledExercises.length > 0) focusAreas.push('technique_refinement');

  return { specialization, coachingStyle, focusAreas };
}

// Generate AI-optimized personalized insights
async function getAdvancedPersonalizedInsights(userId: string, workoutType: string, historyAnalysis: WorkoutHistoryAnalysis) {
  try {
    const history = await getUserWorkoutHistory(userId);
    const insights = [];

    // Consistency and timing insights
    if (history.daysSinceLastWorkout > 7) {
      insights.push('RETURN PROTOCOL: Extended break detected - prioritize movement quality and gradual intensity progression.');
    } else if (history.daysSinceLastWorkout <= 1) {
      insights.push('RECOVERY OPTIMIZATION: Recent training session - assess fatigue levels and adjust load accordingly.');
    }

    // Performance-based insights
    if (historyAnalysis.adaptationSignals.needsProgression) {
      insights.push('PROGRESSION READY: Consistent performance indicates readiness for increased challenge.');
    } else if (historyAnalysis.adaptationSignals.needsDeload) {
      insights.push('DELOAD RECOMMENDED: High intensity with declining completion suggests need for recovery focus.');
    }

    // Exercise selection insights
    if (historyAnalysis.recentPerformance.preferredExercises.length > 0) {
      insights.push(`PREFERENCE INTEGRATION: Incorporate favored movements: ${historyAnalysis.recentPerformance.preferredExercises.slice(0, 3).join(', ')}.`);
    }

    if (historyAnalysis.recentPerformance.struggledExercises.length > 0) {
      insights.push(`TECHNIQUE FOCUS: Address challenging movements with modifications: ${historyAnalysis.recentPerformance.struggledExercises.slice(0, 2).join(', ')}.`);
    }

    // Variety and adaptation insights
    if (historyAnalysis.adaptationSignals.needsVariety) {
      insights.push('VARIETY INJECTION: Introduce novel movement patterns to prevent adaptation plateau.');
    }

    return insights;
  } catch (error) {
    console.error('Error generating personalized insights:', error);
    return ['STANDARD APPROACH: Focus on proper form and gradual progression.'];
  }
}

// Generate expert persona introduction based on context
function generateExpertPersonaIntro(expertPersona: ExpertPersonaContext, experience: string): string {
  const personas = {
    strength: {
      supportive: "I'm Dr. Marcus Thompson, a strength and conditioning specialist with 20+ years helping athletes and fitness enthusiasts build functional strength safely.",
      challenging: "I'm Coach Sarah Chen, former Olympic weightlifting coach. I believe in pushing limits while respecting biomechanics and recovery.",
      technical: "I'm Dr. Alex Rivera, exercise physiologist specializing in strength adaptations. Let's optimize your training with precision and science."
    },
    endurance: {
      supportive: "I'm Coach Emma Wilson, endurance specialist who's guided thousands from couch to marathon. Every journey starts with one step.",
      challenging: "I'm Coach Jake Martinez, former elite triathlete. I'll push you to discover your true cardiovascular potential.",
      technical: "I'm Dr. Lisa Park, sports scientist specializing in aerobic adaptations and metabolic efficiency."
    },
    mobility: {
      supportive: "I'm Maya Patel, movement therapist combining yoga, physical therapy, and functional movement to help you move better.",
      challenging: "I'm Coach David Kim, mobility specialist who believes flexibility is strength through range of motion.",
      technical: "I'm Dr. Rachel Green, biomechanics expert focusing on movement quality and injury prevention."
    },
    general: {
      supportive: "I'm Coach Jordan Lee, certified trainer passionate about making fitness accessible and enjoyable for everyone.",
      challenging: "I'm Coach Taylor Smith, functional fitness expert who believes in challenging your body in all planes of movement.",
      technical: "I'm Dr. Sam Johnson, exercise scientist focused on evidence-based training for optimal health and performance."
    }
  };

  return personas[expertPersona.specialization][expertPersona.coachingStyle];
}

// Generate adaptive programming context
function generateAdaptiveProgrammingContext(historyAnalysis: WorkoutHistoryAnalysis, experience: string): string {
  const signals = [];

  if (historyAnalysis.adaptationSignals.needsProgression) {
    signals.push("✓ PROGRESSION READY: Increase challenge through load, volume, or complexity");
  }

  if (historyAnalysis.adaptationSignals.needsDeload) {
    signals.push("⚠ DELOAD INDICATED: Reduce intensity, focus on movement quality and recovery");
  }

  if (historyAnalysis.adaptationSignals.needsVariety) {
    signals.push("🔄 VARIETY NEEDED: Introduce new movement patterns to prevent adaptation plateau");
  }

  if (historyAnalysis.progressionPatterns.strengthGains) {
    signals.push("💪 STRENGTH GAINS: Continue progressive overload with current approach");
  }

  if (historyAnalysis.progressionPatterns.enduranceImprovement) {
    signals.push("🏃 ENDURANCE PROGRESS: Cardiovascular adaptations occurring, maintain consistency");
  }

  if (signals.length === 0) {
    signals.push("📊 BASELINE ASSESSMENT: Establish movement patterns and training response");
  }

  return signals.join('\n- ');
}

// Legacy function for backward compatibility
async function getPersonalizedInsights(userId: string, workoutType: string) {
  const historyAnalysis = await getAdvancedWorkoutHistory(userId, workoutType);
  return getAdvancedPersonalizedInsights(userId, workoutType, historyAnalysis);
}

export async function buildWorkoutPrompt(userId: string, pre: any) {
  // Get the appropriate prompt variant for this user (A/B testing)
  const variant = promptVersioning.getVariantForUser(userId);
  let profile = await ProfileModel.findOne({ userId });

  // If no profile exists, create a default one or use defaults from the request
  if (!profile) {
    console.log('No profile found for user, using defaults from request');
    profile = {
      userId,
      experience: pre.experience || 'beginner',
      goals: pre.goals || ['general_fitness'],
      equipmentAvailable: pre.equipment_override || ['bodyweight'],
      constraints: pre.constraints || [],
      age: 30, // Default age
      sex: 'prefer_not_to_say' as const,
      health_ack: true,
      data_consent: true,
      createdAt: new Date() as any,
      updatedAt: new Date() as any
    };
  }

  const p: any = profile;
  const equipmentToday = (pre.equipment_override ?? p.equipmentAvailable ?? ['bodyweight']).join(', ');
  const goals = (pre.goals ?? p.goals ?? ['general_fitness']).join(', ');
  const experience = pre.experience ?? p.experience ?? 'beginner';
  const workoutTypeFormatted = pre.workout_type.replace(/_/g, ' ').replace(/\//g, ' and ');

  const restGuidelines = getRestTimeGuidelines(experience);
  const intensityGuidance = getIntensityGuidelines(experience, workoutTypeFormatted);
  const constraints = [...(p.constraints ?? []), p.injury_notes, pre.new_injuries].filter(Boolean).join('; ') || 'none';

  // Calculate time allocation with better distribution
  const totalTime = pre.time_available_min;
  const warmupTime = Math.max(5, Math.min(12, Math.floor(totalTime * 0.15)));
  const cooldownTime = Math.max(5, Math.min(10, Math.floor(totalTime * 0.12)));
  const mainWorkoutTime = totalTime - warmupTime - cooldownTime;

  // Get advanced AI-optimized user analysis
  const historyAnalysis = await getAdvancedWorkoutHistory(userId, workoutTypeFormatted);
  const expertPersona = getExpertPersonaContext(p, workoutTypeFormatted, historyAnalysis);
  const workoutHistory = await getRecentWorkoutHistory(userId, workoutTypeFormatted);
  const userHistory = await getUserWorkoutHistory(userId);
  const progressiveOverloadGuidance = generateProgressiveOverloadGuidance(workoutHistory, experience);
  const personalizedInsights = await getAdvancedPersonalizedInsights(userId, workoutTypeFormatted, historyAnalysis);
  const periodizationStrategy = getPeriodizationStrategy(experience, userHistory);
  const fatigueManagement = getFatigueManagementStrategy(experience, pre.energy_level);

  // Get AI-driven prompt optimizations based on user feedback and success patterns
  const promptOptimizations = await promptOptimizer.optimizePromptForUser(userId, workoutTypeFormatted);
  const optimizationInsights = promptOptimizer.generateOptimizationInsights(promptOptimizations);

  // Generate expert persona introduction
  const expertIntro = generateExpertPersonaIntro(expertPersona, experience);

  // Generate adaptive programming context
  const adaptiveProgramming = generateAdaptiveProgrammingContext(historyAnalysis, experience);

  const lines = [
    `${expertIntro}`,
    ``,
    `MISSION: Create a scientifically-optimized ${workoutTypeFormatted} workout that maximizes training adaptations while ensuring safety and adherence.`,
    ``,
    `CLIENT ANALYSIS & CONTEXT:`,
    `- Experience Level: ${experience} (${getExperienceDescription(experience)})`,
    `- Primary Goals: ${goals}`,
    `- Demographics: ${p.age || 'adult'} years old, ${p.sex || 'unspecified'}, ${getHeightWeight(p)}`,
    `- Current Energy: ${pre.energy_level}/5 (${getEnergyDescription(pre.energy_level)})`,
    `- Available Equipment: ${equipmentToday}`,
    `- Constraints/Injuries: ${constraints}`,
    ``,
    `PERFORMANCE ANALYSIS:`,
    `- Workout History: ${userHistory.summary}`,
    `- Last Workout: ${userHistory.lastWorkout}`,
    `- Completion Rate: ${Math.round(historyAnalysis.recentPerformance.completionRate * 100)}%`,
    `- Average Intensity: ${historyAnalysis.recentPerformance.averageIntensity.toFixed(1)}/5`,
    `- Consistency Trend: ${historyAnalysis.progressionPatterns.consistencyTrend}`,
    `- Preferred Exercises: ${historyAnalysis.recentPerformance.preferredExercises.join(', ') || 'none identified'}`,
    `- Challenge Areas: ${historyAnalysis.recentPerformance.struggledExercises.join(', ') || 'none identified'}`,
    ``,
    `ADAPTIVE PROGRAMMING SIGNALS:`,
    `${adaptiveProgramming}`,
    ``,
    `WORKOUT SPECIFICATIONS:`,
    `- Type: ${workoutTypeFormatted}`,
    `- Duration: ${totalTime} minutes (${warmupTime}min warmup + ${mainWorkoutTime}min main + ${cooldownTime}min cooldown)`,
    `- Target Systems: ${getTargetMuscles(workoutTypeFormatted)}`,
    `- Energy Systems: ${getEnergySystemFocus(workoutTypeFormatted)}`,
    `- Movement Patterns: ${getMovementPatterns(workoutTypeFormatted)}`,
    ``,
    `ADVANCED PROGRAMMING PRINCIPLES:`,
    `- Periodization: ${periodizationStrategy}`,
    `- Progressive Overload: ${progressiveOverloadGuidance}`,
    `- Movement Quality: Emphasize perfect form, full ROM, and mind-muscle connection`,
    `- Muscle Balance: Include antagonist work and corrective exercises`,
    `- Fatigue Management: ${fatigueManagement}`,
    `- ${intensityGuidance}`,
    ``,
    `PERSONALIZED INSIGHTS:`,
    `${personalizedInsights}`,
    ``,
    `AI-DRIVEN OPTIMIZATIONS (based on user feedback and success patterns):`,
    `${optimizationInsights}`,
    ``,
    `PROGRAMMING EXAMPLES FOR THIS WORKOUT TYPE:`,
    `${getWorkoutProgrammingExamples(workoutTypeFormatted, experience)}`,
    ``,
    `SETS & REPS PROGRAMMING (use sets and reps fields):`,
    `${getSetsRepsGuidelines(experience, goals, workoutTypeFormatted)}`,
    ``,
    `REST TIME GUIDELINES (use rest_sec field):`,
    `- Strength/Power exercises: ${restGuidelines.strength} (${getRestSeconds(restGuidelines.strength)})`,
    `- Hypertrophy exercises: ${restGuidelines.hypertrophy} (${getRestSeconds(restGuidelines.hypertrophy)})`,
    `- Endurance exercises: ${restGuidelines.endurance} (${getRestSeconds(restGuidelines.endurance)})`,
    `- Cardio/HIIT exercises: ${restGuidelines.cardio} (${getRestSeconds(restGuidelines.cardio)})`,
    `- Mobility/stretching: ${restGuidelines.mobility} (${getRestSeconds(restGuidelines.mobility)})`,
    ``,
    `EXERCISE PROGRAMMING REQUIREMENTS:`,
    `- SETS & REPS: Follow the guidelines above - NO single set exercises unless specified for warm-up/cool-down`,
    `- COMPOUND MOVEMENTS: Prioritize multi-joint exercises (squats, deadlifts, presses, rows)`,
    `- EXERCISE ORDER: Compound → isolation, large muscle → small muscle, complex → simple`,
    `- LOAD PROGRESSION: Specify appropriate intensity cues (RPE, tempo, or load descriptions)`,
    `- VOLUME DISTRIBUTION: Balance volume across muscle groups and movement patterns`,
    ``,
    `CRITICAL REQUIREMENTS:`,
    `1. WORKOUT TYPE ADHERENCE: This MUST be a ${workoutTypeFormatted} workout targeting the specified muscle groups`,
    `2. EQUIPMENT COMPLIANCE: Use ONLY the listed equipment: ${equipmentToday}`,
    `3. SAFETY FIRST: Avoid exercises contraindicated by constraints: ${constraints}`,
    `4. TIME MANAGEMENT: Total workout must fit within ${totalTime} minutes including transitions`,
    `5. REST PERIODS: Always specify appropriate rest_sec values based on exercise type and intensity`,
    `6. SETS & REPS: MUST follow the programming guidelines - multiple sets for main exercises`,
    `7. EXERCISE SELECTION: Choose exercises that match the user's experience level`,
    `8. PROGRESSION: Order exercises from most to least demanding (compound → isolation)`,
    ``,
    `CRITICAL SETS & REPS REQUIREMENTS:`,
    `- MAIN EXERCISES: MUST have MINIMUM 2 sets, MAXIMUM 5 sets in the sets array (NEVER JUST 1 SET)`,
    `- WARM-UP/COOL-DOWN: Can have 1 set each`,
    `- SETS ARRAY: Each main exercise MUST have multiple set objects with varying parameters`,
    `- PROGRESSIVE SETS: MANDATORY - Vary reps, intensity, or load across sets (e.g., 12,10,8 reps or increasing RPE 6,7,8)`,
    `- REPS/TIME: Use either reps>0 (time_sec=0) OR time_sec>0 (reps=0), never both`,
    `- REST PERIODS: Include specific rest_sec values for every set based on the guidelines above`,
    `- VALIDATION: JSON schema enforces minItems:2 for main exercise sets - single-set exercises will be REJECTED`,
    ``,
    `EXAMPLE SETS STRUCTURE:`,
    `"sets": [`,
    `  {"reps": 12, "time_sec": 0, "rest_sec": 90, "tempo": "2-1-2-1", "intensity": "moderate", "notes": "warm-up set", "weight_guidance": "light", "rpe": 6, "rest_type": "active"},`,
    `  {"reps": 10, "time_sec": 0, "rest_sec": 90, "tempo": "2-1-2-1", "intensity": "moderate", "notes": "working set", "weight_guidance": "moderate", "rpe": 7, "rest_type": "active"},`,
    `  {"reps": 8, "time_sec": 0, "rest_sec": 120, "tempo": "2-1-2-1", "intensity": "high", "notes": "final set", "weight_guidance": "heavy", "rpe": 8, "rest_type": "complete"}`,
    `]`,
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
    `FINAL VALIDATION CHECKLIST BEFORE GENERATING:`,
    `✓ Each main exercise has 2-5 sets (check sets array length)`,
    `✓ Sets have progressive programming (varying reps, intensity, or load)`,
    `✓ Rest periods are appropriate for exercise type and intensity`,
    `✓ All required JSON fields are present and valid`,
    `✓ Total workout time fits within ${totalTime} minutes`,
    `✓ Equipment used matches available equipment: ${equipmentToday}`,
    ``,
    `OUTPUT FORMAT: Respond with valid JSON matching the provided schema exactly. ALL fields are required.`
  ];

  const basePrompt = lines.join('\n');

  // Apply variant modifications if any
  const finalPrompt = promptVersioning.applyVariantToPrompt(basePrompt, variant);

  return {
    prompt: finalPrompt,
    variant: variant
  };
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

// Comprehensive sets and reps programming based on goals and experience
function getSetsRepsGuidelines(experience: string, goals: string, workoutType: string): string {
  const type = workoutType.toLowerCase();
  const goalsList = goals.toLowerCase();

  let guidelines = [];

  // Base guidelines by experience level
  const experienceGuidelines = {
    beginner: {
      compound: '2-3 sets × 8-12 reps',
      isolation: '2 sets × 10-15 reps',
      cardio: '1-2 sets × 20-45 seconds',
      core: '2 sets × 10-20 reps',
      mobility: '1-2 sets × 30-60 seconds hold'
    },
    intermediate: {
      compound: '3-4 sets × 6-12 reps',
      isolation: '3 sets × 8-15 reps',
      cardio: '2-3 sets × 30-60 seconds',
      core: '3 sets × 15-25 reps',
      mobility: '2-3 sets × 30-60 seconds hold'
    },
    advanced: {
      compound: '4-5 sets × 3-12 reps',
      isolation: '3-4 sets × 6-20 reps',
      cardio: '3-4 sets × 20-90 seconds',
      core: '3-4 sets × 20-30 reps',
      mobility: '2-3 sets × 45-90 seconds hold'
    }
  };

  const exp = experienceGuidelines[experience as keyof typeof experienceGuidelines] || experienceGuidelines.beginner;

  // Goal-specific modifications
  if (goalsList.includes('strength') || goalsList.includes('power')) {
    guidelines.push(`- STRENGTH/POWER FOCUS: Compound exercises ${exp.compound.replace('8-12', '3-6').replace('6-12', '3-6')}, emphasize heavy loads`);
    guidelines.push(`- Isolation exercises: ${exp.isolation.replace('10-15', '6-10').replace('8-15', '6-10')}`);
  } else if (goalsList.includes('muscle') || goalsList.includes('hypertrophy')) {
    guidelines.push(`- HYPERTROPHY FOCUS: Compound exercises ${exp.compound.replace('6-12', '8-12')}, moderate to heavy loads`);
    guidelines.push(`- Isolation exercises: ${exp.isolation.replace('6-20', '10-15')}, focus on time under tension`);
  } else if (goalsList.includes('endurance') || goalsList.includes('cardio')) {
    guidelines.push(`- ENDURANCE FOCUS: Compound exercises ${exp.compound.replace(/\d+-\d+/, '12-20')}, lighter loads, higher volume`);
    guidelines.push(`- Cardio intervals: ${exp.cardio}`);
  } else {
    // General fitness
    guidelines.push(`- GENERAL FITNESS: Compound exercises ${exp.compound}`);
    guidelines.push(`- Isolation exercises: ${exp.isolation}`);
  }

  // Workout type specific guidelines
  if (type.includes('hiit') || type.includes('circuit')) {
    guidelines.push(`- HIIT/CIRCUIT: ${exp.cardio}, minimal rest between exercises`);
  } else if (type.includes('strength')) {
    guidelines.push(`- STRENGTH TRAINING: Focus on compound movements with ${exp.compound.replace(/\d+-\d+/, '3-8')} reps`);
  } else if (type.includes('cardio')) {
    guidelines.push(`- CARDIO TRAINING: ${exp.cardio} work intervals`);
  }

  // Core and mobility
  guidelines.push(`- Core exercises: ${exp.core}`);
  guidelines.push(`- Mobility/stretching: ${exp.mobility}`);

  // Additional programming notes
  guidelines.push(`- PROGRESSION: Start with lower end of rep ranges, increase as form improves`);
  guidelines.push(`- LOAD SELECTION: Choose weight that allows 2-3 reps in reserve (RPE 7-8)`);
  guidelines.push(`- FORM PRIORITY: Reduce sets/reps if form breaks down`);

  return guidelines.join('\n');
}

// Generate workout-specific programming examples
function getWorkoutProgrammingExamples(workoutType: string, experience: string): string {
  const type = workoutType.toLowerCase();
  const examples = [];

  if (type.includes('strength') || type.includes('power')) {
    examples.push(`STRENGTH EXAMPLE:`);
    examples.push(`- Squat: 4 sets × 5 reps, 180-240 sec rest, RPE 8`);
    examples.push(`- Bench Press: 4 sets × 6 reps, 180-240 sec rest, RPE 7-8`);
    examples.push(`- Row: 3 sets × 8 reps, 120-180 sec rest, RPE 7`);
  } else if (type.includes('hiit') || type.includes('circuit')) {
    examples.push(`HIIT EXAMPLE:`);
    examples.push(`- Burpees: 3 sets × 30 seconds, 30 sec rest, RPE 8-9`);
    examples.push(`- Mountain Climbers: 3 sets × 45 seconds, 15 sec rest, RPE 8`);
    examples.push(`- Jump Squats: 3 sets × 20 reps, 45 sec rest, RPE 8`);
  } else if (type.includes('hypertrophy') || type.includes('muscle')) {
    examples.push(`HYPERTROPHY EXAMPLE:`);
    examples.push(`- Chest Press: 3 sets × 10-12 reps, 90-120 sec rest, RPE 7-8`);
    examples.push(`- Lateral Raise: 3 sets × 12-15 reps, 60-90 sec rest, RPE 7`);
    examples.push(`- Bicep Curl: 3 sets × 12-15 reps, 60-90 sec rest, RPE 7`);
  } else {
    examples.push(`GENERAL FITNESS EXAMPLE:`);
    examples.push(`- Push-ups: 3 sets × 8-12 reps, 60-90 sec rest, RPE 6-7`);
    examples.push(`- Squats: 3 sets × 12-15 reps, 60-90 sec rest, RPE 6-7`);
    examples.push(`- Plank: 3 sets × 30-45 seconds, 60 sec rest, RPE 6-7`);
  }

  return examples.join('\n');
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