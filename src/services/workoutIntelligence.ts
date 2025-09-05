import { WorkoutPlanModel } from '../models/WorkoutPlan';
import { ProfileModel } from '../models/Profile';

/**
 * Advanced Workout Intelligence Service
 * Provides sophisticated AI-driven workout programming and personalization
 */

export interface WorkoutIntelligenceData {
  adaptiveLoading: AdaptiveLoadingRecommendation;
  recoveryStatus: RecoveryAssessment;
  progressionRecommendation: ProgressionStrategy;
  motivationalContext: MotivationalFactors;
  biomechanicalConsiderations: BiomechanicalGuidance;
}

export interface AdaptiveLoadingRecommendation {
  recommendedIntensity: number; // 1-10 scale
  volumeAdjustment: number; // percentage adjustment from baseline
  complexityLevel: 'basic' | 'intermediate' | 'advanced';
  focusAreas: string[];
  deloadRecommended: boolean;
}

export interface RecoveryAssessment {
  recoveryScore: number; // 1-10 scale
  sleepQuality: 'poor' | 'fair' | 'good' | 'excellent' | 'unknown';
  stressLevel: 'low' | 'moderate' | 'high' | 'unknown';
  readinessToTrain: number; // 1-10 scale
  recommendedModifications: string[];
}

export interface ProgressionStrategy {
  currentPhase: 'foundation' | 'development' | 'intensification' | 'realization' | 'recovery';
  nextMilestone: string;
  progressionRate: 'conservative' | 'moderate' | 'aggressive';
  keyFocusAreas: string[];
  timeToNextProgression: number; // weeks
}

export interface MotivationalFactors {
  adherenceScore: number; // 1-10 scale
  preferredWorkoutTypes: string[];
  motivationalTriggers: string[];
  challengeLevel: 'comfort' | 'moderate' | 'challenging' | 'extreme';
  rewardSuggestions: string[];
}

export interface BiomechanicalGuidance {
  movementPatternFocus: string[];
  correctionPriorities: string[];
  mobilityNeeds: string[];
  stabilityNeeds: string[];
  injuryRiskFactors: string[];
}

/**
 * Analyze user data and generate comprehensive workout intelligence
 */
export async function generateWorkoutIntelligence(userId: string): Promise<WorkoutIntelligenceData> {
  const [profile, recentWorkouts] = await Promise.all([
    ProfileModel.findOne({ userId }),
    getRecentWorkoutAnalysis(userId)
  ]);

  if (!profile) {
    throw new Error('Profile not found');
  }

  const adaptiveLoading = await generateAdaptiveLoadingRecommendation(userId, profile, recentWorkouts);
  const recoveryStatus = await assessRecoveryStatus(userId, recentWorkouts);
  const progressionRecommendation = await generateProgressionStrategy(userId, profile, recentWorkouts);
  const motivationalContext = await analyzeMotivationalFactors(userId, profile, recentWorkouts);
  const biomechanicalConsiderations = await generateBiomechanicalGuidance(profile);

  return {
    adaptiveLoading,
    recoveryStatus,
    progressionRecommendation,
    motivationalContext,
    biomechanicalConsiderations
  };
}

/**
 * Generate adaptive loading recommendations based on user performance and recovery
 */
async function generateAdaptiveLoadingRecommendation(
  userId: string, 
  profile: any, 
  recentWorkouts: any[]
): Promise<AdaptiveLoadingRecommendation> {
  const completionRate = recentWorkouts.length > 0 ? 
    recentWorkouts.filter(w => w.completed).length / recentWorkouts.length : 0.5;
  
  const avgEnergyLevel = recentWorkouts.length > 0 ?
    recentWorkouts.reduce((sum, w) => sum + (w.energyLevel || 3), 0) / recentWorkouts.length : 3;

  const experience = profile.experience || 'beginner';
  const daysSinceLastWorkout = recentWorkouts.length > 0 ?
    Math.floor((Date.now() - new Date(recentWorkouts[0].date).getTime()) / (1000 * 60 * 60 * 24)) : 7;

  // Calculate recommended intensity (1-10 scale)
  let recommendedIntensity = 5; // baseline
  
  if (experience === 'advanced') recommendedIntensity += 2;
  else if (experience === 'intermediate') recommendedIntensity += 1;
  
  if (completionRate > 0.8) recommendedIntensity += 1;
  else if (completionRate < 0.5) recommendedIntensity -= 1;
  
  if (avgEnergyLevel > 4) recommendedIntensity += 1;
  else if (avgEnergyLevel < 2.5) recommendedIntensity -= 2;
  
  if (daysSinceLastWorkout > 7) recommendedIntensity -= 1;
  else if (daysSinceLastWorkout < 2) recommendedIntensity -= 0.5;

  recommendedIntensity = Math.max(1, Math.min(10, recommendedIntensity));

  // Calculate volume adjustment
  let volumeAdjustment = 100; // baseline percentage
  
  if (completionRate < 0.6) volumeAdjustment -= 20;
  else if (completionRate > 0.9) volumeAdjustment += 15;
  
  if (avgEnergyLevel < 2.5) volumeAdjustment -= 25;
  else if (avgEnergyLevel > 4.5) volumeAdjustment += 20;

  // Determine complexity level
  const complexityLevel = experience === 'beginner' ? 'basic' :
                         experience === 'intermediate' ? 'intermediate' : 'advanced';

  // Focus areas based on goals and performance
  const focusAreas = [];
  const goals = profile.goals || [];
  
  if (goals.includes('strength')) focusAreas.push('Progressive overload');
  if (goals.includes('muscle_gain')) focusAreas.push('Hypertrophy protocols');
  if (goals.includes('weight_loss')) focusAreas.push('Metabolic conditioning');
  if (goals.includes('endurance')) focusAreas.push('Cardiovascular efficiency');
  if (completionRate < 0.7) focusAreas.push('Adherence and habit formation');
  if (avgEnergyLevel < 3) focusAreas.push('Recovery and regeneration');

  // Deload recommendation
  const deloadRecommended = (
    completionRate < 0.4 || 
    avgEnergyLevel < 2 || 
    daysSinceLastWorkout > 14 ||
    recentWorkouts.filter(w => w.completed).length > 6 // high volume recently
  );

  return {
    recommendedIntensity,
    volumeAdjustment,
    complexityLevel,
    focusAreas,
    deloadRecommended
  };
}

/**
 * Assess recovery status based on workout patterns and user feedback
 */
async function assessRecoveryStatus(userId: string, recentWorkouts: any[]): Promise<RecoveryAssessment> {
  const workoutFrequency = recentWorkouts.length;
  const completionRate = recentWorkouts.length > 0 ? 
    recentWorkouts.filter(w => w.completed).length / recentWorkouts.length : 0.5;
  
  const avgEnergyLevel = recentWorkouts.length > 0 ?
    recentWorkouts.reduce((sum, w) => sum + (w.energyLevel || 3), 0) / recentWorkouts.length : 3;

  // Calculate recovery score (1-10)
  let recoveryScore = 5; // baseline
  
  if (avgEnergyLevel > 4) recoveryScore += 2;
  else if (avgEnergyLevel < 2.5) recoveryScore -= 3;
  
  if (completionRate > 0.8) recoveryScore += 1;
  else if (completionRate < 0.5) recoveryScore -= 2;
  
  if (workoutFrequency > 5) recoveryScore -= 1; // high frequency might indicate overreaching
  else if (workoutFrequency < 2) recoveryScore += 1; // adequate rest

  recoveryScore = Math.max(1, Math.min(10, recoveryScore));

  // Readiness to train
  const readinessToTrain = Math.max(1, Math.min(10, recoveryScore + (avgEnergyLevel - 3)));

  // Recommended modifications
  const recommendedModifications = [];
  
  if (recoveryScore < 4) {
    recommendedModifications.push('Reduce workout intensity by 20-30%');
    recommendedModifications.push('Focus on mobility and light movement');
    recommendedModifications.push('Prioritize sleep and stress management');
  } else if (recoveryScore < 6) {
    recommendedModifications.push('Maintain current intensity');
    recommendedModifications.push('Include extra warm-up time');
    recommendedModifications.push('Monitor fatigue levels closely');
  } else if (recoveryScore > 8) {
    recommendedModifications.push('Consider intensity or volume increases');
    recommendedModifications.push('Add complexity or new movement patterns');
  }

  return {
    recoveryScore,
    sleepQuality: 'unknown', // Would be enhanced with user input
    stressLevel: 'unknown',  // Would be enhanced with user input
    readinessToTrain,
    recommendedModifications
  };
}

/**
 * Get recent workout analysis data
 */
async function getRecentWorkoutAnalysis(userId: string, limit: number = 10) {
  try {
    const workouts = await WorkoutPlanModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return workouts.map(workout => ({
      date: workout.createdAt,
      completed: !!workout.completedAt,
      workoutType: workout.preWorkout?.workoutType || 'unknown',
      duration: workout.preWorkout?.duration || 30,
      energyLevel: workout.preWorkout?.energy_level || 3,
      exercises: workout.plan?.exercises || []
    }));
  } catch (error) {
    console.error('Error fetching recent workout analysis:', error);
    return [];
  }
}

/**
 * Generate progression strategy based on user history and goals
 */
async function generateProgressionStrategy(
  userId: string, 
  profile: any, 
  recentWorkouts: any[]
): Promise<ProgressionStrategy> {
  const totalWorkouts = recentWorkouts.length;
  const completionRate = totalWorkouts > 0 ? 
    recentWorkouts.filter(w => w.completed).length / totalWorkouts : 0;
  
  const experience = profile.experience || 'beginner';
  const goals = profile.goals || [];

  // Determine current phase
  let currentPhase: ProgressionStrategy['currentPhase'] = 'foundation';
  
  if (totalWorkouts < 5 || completionRate < 0.6) {
    currentPhase = 'foundation';
  } else if (totalWorkouts < 15 || experience === 'beginner') {
    currentPhase = 'development';
  } else if (experience === 'intermediate' && completionRate > 0.7) {
    currentPhase = 'intensification';
  } else if (experience === 'advanced') {
    currentPhase = 'realization';
  }

  // Determine progression rate
  const progressionRate: ProgressionStrategy['progressionRate'] = 
    completionRate > 0.8 ? 'moderate' :
    completionRate > 0.6 ? 'conservative' : 'conservative';

  // Key focus areas
  const keyFocusAreas = [];
  if (currentPhase === 'foundation') {
    keyFocusAreas.push('Movement quality', 'Habit formation', 'Basic strength');
  } else if (currentPhase === 'development') {
    keyFocusAreas.push('Progressive overload', 'Exercise variety', 'Work capacity');
  } else if (currentPhase === 'intensification') {
    keyFocusAreas.push('Peak performance', 'Advanced techniques', 'Specialization');
  }

  return {
    currentPhase,
    nextMilestone: getNextMilestone(currentPhase, goals),
    progressionRate,
    keyFocusAreas,
    timeToNextProgression: getTimeToNextProgression(currentPhase, progressionRate)
  };
}

function getNextMilestone(phase: string, goals: string[]): string {
  const milestones = {
    foundation: 'Complete 10 workouts with 80% consistency',
    development: 'Master compound movement patterns',
    intensification: 'Achieve specific strength/performance goals',
    realization: 'Peak performance demonstration',
    recovery: 'Return to baseline fitness levels'
  };
  return milestones[phase as keyof typeof milestones] || 'Continue consistent training';
}

function getTimeToNextProgression(phase: string, rate: string): number {
  const timeframes = {
    foundation: { conservative: 6, moderate: 4, aggressive: 3 },
    development: { conservative: 8, moderate: 6, aggressive: 4 },
    intensification: { conservative: 12, moderate: 8, aggressive: 6 },
    realization: { conservative: 16, moderate: 12, aggressive: 8 },
    recovery: { conservative: 4, moderate: 3, aggressive: 2 }
  };
  
  return timeframes[phase as keyof typeof timeframes]?.[rate as keyof typeof timeframes.foundation] || 6;
}

/**
 * Analyze motivational factors and preferences
 */
async function analyzeMotivationalFactors(
  userId: string, 
  profile: any, 
  recentWorkouts: any[]
): Promise<MotivationalFactors> {
  const completionRate = recentWorkouts.length > 0 ? 
    recentWorkouts.filter(w => w.completed).length / recentWorkouts.length : 0.5;

  // Calculate adherence score
  const adherenceScore = Math.round(completionRate * 10);

  // Analyze preferred workout types
  const workoutTypeCounts = recentWorkouts.reduce((acc, workout) => {
    const type = workout.workoutType || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const preferredWorkoutTypes = Object.entries(workoutTypeCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([type]) => type);

  // Generate motivational triggers
  const motivationalTriggers = [];
  if (adherenceScore > 7) {
    motivationalTriggers.push('Achievement recognition', 'Progress tracking', 'New challenges');
  } else {
    motivationalTriggers.push('Small wins', 'Habit building', 'Social support');
  }

  // Determine challenge level preference
  const avgEnergyLevel = recentWorkouts.length > 0 ?
    recentWorkouts.reduce((sum, w) => sum + (w.energyLevel || 3), 0) / recentWorkouts.length : 3;
  
  const challengeLevel: MotivationalFactors['challengeLevel'] = 
    avgEnergyLevel > 4 ? 'challenging' :
    avgEnergyLevel > 3 ? 'moderate' : 'comfort';

  return {
    adherenceScore,
    preferredWorkoutTypes,
    motivationalTriggers,
    challengeLevel,
    rewardSuggestions: generateRewardSuggestions(adherenceScore, profile.goals || [])
  };
}

function generateRewardSuggestions(adherenceScore: number, goals: string[]): string[] {
  const rewards = [];
  
  if (adherenceScore > 8) {
    rewards.push('New workout equipment', 'Fitness assessment', 'Advanced program unlock');
  } else if (adherenceScore > 6) {
    rewards.push('Workout playlist update', 'Progress photo session', 'Healthy meal prep');
  } else {
    rewards.push('Rest day activity', 'Motivational content', 'Simple celebration');
  }

  return rewards;
}

/**
 * Generate biomechanical guidance based on profile and constraints
 */
async function generateBiomechanicalGuidance(profile: any): Promise<BiomechanicalGuidance> {
  const constraints = profile.constraints || [];
  const injuries = profile.injury_notes || '';
  const age = profile.age || 30;
  const experience = profile.experience || 'beginner';

  const movementPatternFocus = [];
  const correctionPriorities = [];
  const mobilityNeeds = [];
  const stabilityNeeds = [];
  const injuryRiskFactors = [];

  // Age-based considerations
  if (age > 50) {
    mobilityNeeds.push('Hip mobility', 'Thoracic spine mobility');
    stabilityNeeds.push('Core stability', 'Balance training');
    correctionPriorities.push('Posture correction');
  }

  // Experience-based guidance
  if (experience === 'beginner') {
    movementPatternFocus.push('Basic movement patterns', 'Postural awareness');
    correctionPriorities.push('Movement quality over quantity');
  } else if (experience === 'advanced') {
    movementPatternFocus.push('Complex movement integration', 'Sport-specific patterns');
  }

  // Constraint-based modifications
  if (constraints.includes('lower_back_pain') || injuries.toLowerCase().includes('back')) {
    correctionPriorities.push('Neutral spine maintenance');
    mobilityNeeds.push('Hip flexor mobility');
    stabilityNeeds.push('Deep core activation');
    injuryRiskFactors.push('Excessive spinal flexion');
  }

  if (constraints.includes('knee_pain') || injuries.toLowerCase().includes('knee')) {
    correctionPriorities.push('Proper knee tracking');
    mobilityNeeds.push('Ankle mobility', 'Hip mobility');
    stabilityNeeds.push('Glute activation');
    injuryRiskFactors.push('Knee valgus collapse');
  }

  return {
    movementPatternFocus,
    correctionPriorities,
    mobilityNeeds,
    stabilityNeeds,
    injuryRiskFactors
  };
}
