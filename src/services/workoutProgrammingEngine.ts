import { ProfileModel } from '../models/Profile';
import { WorkoutPlanModel } from '../models/WorkoutPlan';
import { WorkoutSessionModel } from '../models/WorkoutSession';

/**
 * Intelligent Workout Programming Engine
 * Implements advanced periodization, adaptive loading, and biomechanical optimization
 */

export interface PeriodizationPhase {
  name: string;
  duration: number; // weeks
  focus: 'anatomical_adaptation' | 'hypertrophy' | 'strength' | 'power' | 'peaking' | 'recovery';
  intensityRange: [number, number]; // RPE scale 1-10
  volumeMultiplier: number; // relative to baseline
  characteristics: string[];
}

export interface AdaptiveLoadingRecommendation {
  currentPhase: PeriodizationPhase;
  loadAdjustment: number; // -2 to +2 scale
  volumeAdjustment: number; // -2 to +2 scale
  intensityAdjustment: number; // -2 to +2 scale
  reasoning: string[];
  recoverySignals: string[];
  progressionReadiness: boolean;
}

export interface BiomechanicalConsiderations {
  movementPatterns: {
    squat: 'beginner' | 'intermediate' | 'advanced';
    hinge: 'beginner' | 'intermediate' | 'advanced';
    push: 'beginner' | 'intermediate' | 'advanced';
    pull: 'beginner' | 'intermediate' | 'advanced';
    carry: 'beginner' | 'intermediate' | 'advanced';
  };
  compensationPatterns: string[];
  recommendedProgression: string[];
  cautionAreas: string[];
}

export interface WorkoutProgrammingOptions {
  experience: 'beginner' | 'intermediate' | 'advanced';
  primaryGoal: string;
  workoutType: string;
  timeAvailable: number;
  equipmentLevel: 'minimal' | 'moderate' | 'full';
  injuryHistory?: string[];
  currentPhase?: string;
}

export class WorkoutProgrammingEngine {
  private periodizationTemplates: Map<string, PeriodizationPhase[]> = new Map();

  constructor() {
    this.initializePeriodizationTemplates();
  }

  /**
   * Generate adaptive loading recommendations based on user data
   */
  async generateAdaptiveLoading(userId: string, options: WorkoutProgrammingOptions): Promise<AdaptiveLoadingRecommendation> {
    const userContext = await this.buildUserContext(userId);
    const currentPhase = this.determineCurrentPhase(userContext, options);
    const recoveryStatus = this.assessRecoveryStatus(userContext);
    const progressionReadiness = this.assessProgressionReadiness(userContext);

    // Calculate load adjustments
    const loadAdjustment = this.calculateLoadAdjustment(recoveryStatus, progressionReadiness, currentPhase);
    const volumeAdjustment = this.calculateVolumeAdjustment(userContext, currentPhase);
    const intensityAdjustment = this.calculateIntensityAdjustment(userContext, currentPhase);

    // Generate reasoning
    const reasoning = this.generateLoadingReasoning(loadAdjustment, volumeAdjustment, intensityAdjustment, userContext);
    const recoverySignals = this.identifyRecoverySignals(userContext);

    return {
      currentPhase,
      loadAdjustment,
      volumeAdjustment,
      intensityAdjustment,
      reasoning,
      recoverySignals,
      progressionReadiness
    };
  }

  /**
   * Assess biomechanical considerations for exercise selection
   */
  async assessBiomechanicalConsiderations(userId: string, options: WorkoutProgrammingOptions): Promise<BiomechanicalConsiderations> {
    const profile = await ProfileModel.findOne({ userId });
    const workoutHistory = await this.getWorkoutHistory(userId);

    // Assess movement pattern competency
    const movementPatterns = this.assessMovementPatterns(profile, workoutHistory, options.experience);
    
    // Identify compensation patterns
    const compensationPatterns = this.identifyCompensationPatterns(profile, options.injuryHistory);
    
    // Generate progression recommendations
    const recommendedProgression = this.generateProgressionRecommendations(movementPatterns, options);
    
    // Identify caution areas
    const cautionAreas = this.identifyCautionAreas(profile, options.injuryHistory, compensationPatterns);

    return {
      movementPatterns,
      compensationPatterns,
      recommendedProgression,
      cautionAreas
    };
  }

  /**
   * Generate periodized training plan
   */
  generatePeriodizedPlan(options: WorkoutProgrammingOptions, duration: number = 12): PeriodizationPhase[] {
    const template = this.selectPeriodizationTemplate(options.primaryGoal, options.experience);
    return this.adaptTemplateToUser(template, options, duration);
  }

  /**
   * Calculate optimal sets and reps based on programming principles
   */
  calculateOptimalSetsReps(exerciseType: string, phase: PeriodizationPhase, experience: string): {
    sets: number;
    reps: string;
    intensity: string;
    rest: number;
  } {
    const basePrograms = {
      beginner: {
        compound: { sets: 3, reps: '8-12', intensity: 'moderate', rest: 90 },
        isolation: { sets: 2, reps: '10-15', intensity: 'moderate', rest: 60 },
        cardio: { sets: 1, reps: '20-30 min', intensity: 'moderate', rest: 0 }
      },
      intermediate: {
        compound: { sets: 4, reps: '6-10', intensity: 'moderate-high', rest: 120 },
        isolation: { sets: 3, reps: '8-12', intensity: 'moderate-high', rest: 75 },
        cardio: { sets: 1, reps: '25-40 min', intensity: 'moderate-high', rest: 0 }
      },
      advanced: {
        compound: { sets: 5, reps: '3-8', intensity: 'high', rest: 180 },
        isolation: { sets: 4, reps: '6-12', intensity: 'high', rest: 90 },
        cardio: { sets: 1, reps: '30-60 min', intensity: 'varied', rest: 0 }
      }
    };

    const baseProgram = basePrograms[experience as keyof typeof basePrograms];
    const exerciseProgram = baseProgram[exerciseType as keyof typeof baseProgram] || baseProgram.compound;

    // Adjust based on periodization phase
    return this.adjustForPhase(exerciseProgram, phase);
  }

  // Private helper methods
  private initializePeriodizationTemplates(): void {
    // Strength-focused periodization
    this.periodizationTemplates.set('strength', [
      {
        name: 'Anatomical Adaptation',
        duration: 4,
        focus: 'anatomical_adaptation',
        intensityRange: [6, 7],
        volumeMultiplier: 1.0,
        characteristics: ['Movement quality', 'Work capacity', 'Tissue adaptation']
      },
      {
        name: 'Hypertrophy',
        duration: 4,
        focus: 'hypertrophy',
        intensityRange: [7, 8],
        volumeMultiplier: 1.2,
        characteristics: ['Muscle growth', 'Volume accumulation', 'Metabolic stress']
      },
      {
        name: 'Strength',
        duration: 3,
        focus: 'strength',
        intensityRange: [8, 9],
        volumeMultiplier: 0.8,
        characteristics: ['Neural adaptation', 'Heavy loads', 'Skill refinement']
      },
      {
        name: 'Recovery',
        duration: 1,
        focus: 'recovery',
        intensityRange: [5, 6],
        volumeMultiplier: 0.5,
        characteristics: ['Active recovery', 'Mobility', 'Restoration']
      }
    ]);

    // General fitness periodization
    this.periodizationTemplates.set('general_fitness', [
      {
        name: 'Foundation',
        duration: 3,
        focus: 'anatomical_adaptation',
        intensityRange: [6, 7],
        volumeMultiplier: 1.0,
        characteristics: ['Movement patterns', 'Consistency', 'Habit formation']
      },
      {
        name: 'Development',
        duration: 4,
        focus: 'hypertrophy',
        intensityRange: [7, 8],
        volumeMultiplier: 1.1,
        characteristics: ['Progressive overload', 'Variety', 'Adaptation']
      },
      {
        name: 'Intensification',
        duration: 3,
        focus: 'strength',
        intensityRange: [7, 9],
        volumeMultiplier: 0.9,
        characteristics: ['Challenge', 'Performance', 'Confidence']
      },
      {
        name: 'Maintenance',
        duration: 2,
        focus: 'recovery',
        intensityRange: [6, 7],
        volumeMultiplier: 0.8,
        characteristics: ['Sustainability', 'Enjoyment', 'Balance']
      }
    ]);
  }

  private async buildUserContext(userId: string): Promise<any> {
    const recentWorkouts = await WorkoutPlanModel.find({ userId }, { sort: { createdAt: -1 }, limit: 10 });
    const recentSessions = await WorkoutSessionModel.find({ userId }, { sort: { createdAt: -1 }, limit: 10 });
    
    return {
      workouts: recentWorkouts,
      sessions: recentSessions,
      completionRate: this.calculateCompletionRate(recentWorkouts, recentSessions),
      averageIntensity: this.calculateAverageIntensity(recentSessions),
      consistencyScore: this.calculateConsistencyScore(recentSessions)
    };
  }

  private determineCurrentPhase(userContext: any, options: WorkoutProgrammingOptions): PeriodizationPhase {
    const template = this.selectPeriodizationTemplate(options.primaryGoal, options.experience);
    
    // Simple phase determination based on workout count
    const totalWorkouts = userContext.workouts.length;
    const phaseIndex = Math.floor(totalWorkouts / 12) % template.length;
    
    return template[phaseIndex];
  }

  private assessRecoveryStatus(userContext: any): number {
    // Simple recovery assessment (1-5 scale)
    let recoveryScore = 3; // baseline
    
    if (userContext.averageIntensity > 4) recoveryScore -= 1;
    if (userContext.completionRate < 0.7) recoveryScore -= 1;
    if (userContext.consistencyScore > 0.8) recoveryScore += 1;
    
    return Math.max(1, Math.min(5, recoveryScore));
  }

  private assessProgressionReadiness(userContext: any): boolean {
    return userContext.completionRate > 0.8 && userContext.averageIntensity < 4.5;
  }

  private calculateLoadAdjustment(recoveryStatus: number, progressionReadiness: boolean, phase: PeriodizationPhase): number {
    let adjustment = 0;
    
    if (recoveryStatus <= 2) adjustment -= 1;
    if (recoveryStatus >= 4) adjustment += 0.5;
    if (progressionReadiness && phase.focus !== 'recovery') adjustment += 0.5;
    
    return Math.max(-2, Math.min(2, adjustment));
  }

  private calculateVolumeAdjustment(userContext: any, phase: PeriodizationPhase): number {
    let adjustment = 0;
    
    if (userContext.completionRate < 0.6) adjustment -= 1;
    if (userContext.completionRate > 0.9 && phase.focus === 'hypertrophy') adjustment += 0.5;
    
    return Math.max(-2, Math.min(2, adjustment));
  }

  private calculateIntensityAdjustment(userContext: any, phase: PeriodizationPhase): number {
    let adjustment = 0;
    
    if (userContext.averageIntensity > 4.5) adjustment -= 1;
    if (userContext.averageIntensity < 3 && phase.focus === 'strength') adjustment += 1;
    
    return Math.max(-2, Math.min(2, adjustment));
  }

  private generateLoadingReasoning(load: number, volume: number, intensity: number, context: any): string[] {
    const reasons = [];
    
    if (load > 0) reasons.push('Progression indicated by consistent performance');
    if (load < 0) reasons.push('Deload recommended due to fatigue indicators');
    if (volume > 0) reasons.push('Volume increase supported by high completion rate');
    if (volume < 0) reasons.push('Volume reduction needed for better adherence');
    if (intensity > 0) reasons.push('Intensity increase warranted by adaptation');
    if (intensity < 0) reasons.push('Intensity reduction for recovery focus');
    
    return reasons.length > 0 ? reasons : ['Maintaining current programming approach'];
  }

  private identifyRecoverySignals(context: any): string[] {
    const signals = [];
    
    if (context.completionRate < 0.7) signals.push('Declining completion rate');
    if (context.averageIntensity > 4.5) signals.push('High perceived exertion');
    if (context.consistencyScore < 0.6) signals.push('Irregular training pattern');
    
    return signals;
  }

  private async getWorkoutHistory(userId: string): Promise<any[]> {
    return await WorkoutPlanModel.find({ userId }, { sort: { createdAt: -1 }, limit: 20 });
  }

  private assessMovementPatterns(profile: any, history: any[], experience: string): BiomechanicalConsiderations['movementPatterns'] {
    // Simplified assessment based on experience and injury history
    const baseLevel = experience as 'beginner' | 'intermediate' | 'advanced';
    
    return {
      squat: baseLevel,
      hinge: baseLevel,
      push: baseLevel,
      pull: baseLevel,
      carry: baseLevel
    };
  }

  private identifyCompensationPatterns(profile: any, injuryHistory?: string[]): string[] {
    const patterns = [];
    
    if (injuryHistory?.includes('lower_back')) patterns.push('Hip flexor tightness');
    if (injuryHistory?.includes('shoulder')) patterns.push('Forward head posture');
    if (injuryHistory?.includes('knee')) patterns.push('Ankle mobility restriction');
    
    return patterns;
  }

  private generateProgressionRecommendations(patterns: any, options: WorkoutProgrammingOptions): string[] {
    const recommendations = [];
    
    if (options.experience === 'beginner') {
      recommendations.push('Focus on bodyweight movement mastery');
      recommendations.push('Emphasize eccentric control');
    } else if (options.experience === 'intermediate') {
      recommendations.push('Introduce unilateral variations');
      recommendations.push('Add complexity gradually');
    } else {
      recommendations.push('Implement advanced movement patterns');
      recommendations.push('Focus on power development');
    }
    
    return recommendations;
  }

  private identifyCautionAreas(profile: any, injuryHistory?: string[], compensations?: string[]): string[] {
    const cautions = [];
    
    if (injuryHistory?.length) {
      cautions.push('Monitor previous injury sites');
    }
    
    if (compensations?.length) {
      cautions.push('Address movement compensations');
    }
    
    return cautions;
  }

  private selectPeriodizationTemplate(goal: string, experience: string): PeriodizationPhase[] {
    if (goal.includes('strength') || goal.includes('muscle')) {
      return this.periodizationTemplates.get('strength')!;
    }
    
    return this.periodizationTemplates.get('general_fitness')!;
  }

  private adaptTemplateToUser(template: PeriodizationPhase[], options: WorkoutProgrammingOptions, duration: number): PeriodizationPhase[] {
    // Simple adaptation - scale durations to fit total duration
    const totalTemplateDuration = template.reduce((sum, phase) => sum + phase.duration, 0);
    const scaleFactor = duration / totalTemplateDuration;
    
    return template.map(phase => ({
      ...phase,
      duration: Math.max(1, Math.round(phase.duration * scaleFactor))
    }));
  }

  private adjustForPhase(baseProgram: any, phase: PeriodizationPhase): any {
    const adjusted = { ...baseProgram };
    
    switch (phase.focus) {
      case 'hypertrophy':
        adjusted.sets += 1;
        adjusted.reps = adjusted.reps.replace(/\d+-\d+/, '8-15');
        break;
      case 'strength':
        adjusted.reps = adjusted.reps.replace(/\d+-\d+/, '3-6');
        adjusted.rest += 30;
        break;
      case 'recovery':
        adjusted.sets = Math.max(1, adjusted.sets - 1);
        adjusted.intensity = 'light';
        break;
    }
    
    return adjusted;
  }

  private calculateCompletionRate(workouts: any[], sessions: any[]): number {
    if (workouts.length === 0) return 0;
    const completed = sessions.filter(s => s.completedAt).length;
    return completed / workouts.length;
  }

  private calculateAverageIntensity(sessions: any[]): number {
    if (sessions.length === 0) return 3;
    const intensities = sessions.map(s => s.feedback?.difficulty || 3);
    return intensities.reduce((a, b) => a + b, 0) / intensities.length;
  }

  private calculateConsistencyScore(sessions: any[]): number {
    if (sessions.length < 2) return 0;
    
    const dates = sessions.map(s => new Date(s.createdAt.toDate()));
    const intervals = dates.slice(1).map((date, i) => 
      Math.abs(date.getTime() - dates[i].getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
    
    return Math.max(0, 1 - (variance / (avgInterval * avgInterval)));
  }
}

export const workoutProgrammingEngine = new WorkoutProgrammingEngine();
