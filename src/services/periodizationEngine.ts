/**
 * Advanced Periodization Engine
 * Implements sophisticated training periodization with automatic phase cycling
 */

import { WorkoutPlanModel } from '../models/WorkoutPlan';
import { WorkoutSessionModel } from '../models/WorkoutSession';
import { ProfileModel } from '../models/Profile';

export interface PeriodizationPhase {
  name: string;
  type: 'accumulation' | 'intensification' | 'realization' | 'recovery';
  duration: number; // weeks
  volumeMultiplier: number;
  intensityMultiplier: number;
  complexityLevel: number;
  focusAreas: string[];
  characteristics: string[];
}

export interface TrainingCycle {
  userId: string;
  currentPhase: PeriodizationPhase;
  phaseProgress: number; // 0-1 (percentage through current phase)
  cycleNumber: number;
  startDate: Date;
  phases: PeriodizationPhase[];
  adaptations: PhaseAdaptation[];
}

export interface PhaseAdaptation {
  parameter: string;
  baseValue: number;
  adaptedValue: number;
  reasoning: string;
}

export interface PeriodizationRecommendation {
  currentPhase: PeriodizationPhase;
  workoutModifications: WorkoutModification[];
  phaseTransition: PhaseTransition | null;
  progressIndicators: ProgressIndicator[];
  nextPhasePreview: PeriodizationPhase | null;
}

export interface WorkoutModification {
  aspect: 'volume' | 'intensity' | 'complexity' | 'recovery' | 'focus';
  modification: string;
  value: number;
  reasoning: string;
}

export interface PhaseTransition {
  fromPhase: string;
  toPhase: string;
  transitionDate: Date;
  preparationSteps: string[];
  expectedChanges: string[];
}

export interface ProgressIndicator {
  metric: string;
  currentValue: number;
  targetValue: number;
  progress: number; // 0-1
  status: 'on_track' | 'ahead' | 'behind' | 'stalled';
}

export class PeriodizationEngine {
  private userCycles: Map<string, TrainingCycle> = new Map();

  /**
   * Get periodization recommendations for user
   */
  async getPeriodizationRecommendation(userId: string): Promise<PeriodizationRecommendation> {
    const cycle = await this.getUserTrainingCycle(userId);
    const progressIndicators = await this.assessPhaseProgress(userId, cycle);
    const phaseTransition = this.checkPhaseTransition(cycle, progressIndicators);
    
    // Update cycle if transition is needed
    if (phaseTransition) {
      await this.transitionToNextPhase(userId, cycle);
    }

    const workoutModifications = this.generateWorkoutModifications(cycle);
    const nextPhasePreview = this.getNextPhase(cycle);

    return {
      currentPhase: cycle.currentPhase,
      workoutModifications,
      phaseTransition,
      progressIndicators,
      nextPhasePreview
    };
  }

  /**
   * Apply periodization to workout plan
   */
  async applyPeriodization(userId: string, baseWorkout: any): Promise<any> {
    const recommendation = await this.getPeriodizationRecommendation(userId);
    let periodizedWorkout = { ...baseWorkout };

    // Apply phase-specific modifications
    recommendation.workoutModifications.forEach(mod => {
      switch (mod.aspect) {
        case 'volume':
          periodizedWorkout = this.adjustVolume(periodizedWorkout, mod.value);
          break;
        case 'intensity':
          periodizedWorkout = this.adjustIntensity(periodizedWorkout, mod.value);
          break;
        case 'complexity':
          periodizedWorkout = this.adjustComplexity(periodizedWorkout, mod.value);
          break;
        case 'recovery':
          periodizedWorkout = this.adjustRecovery(periodizedWorkout, mod.value);
          break;
        case 'focus':
          periodizedWorkout = this.adjustFocus(periodizedWorkout, recommendation.currentPhase.focusAreas);
          break;
      }
    });

    // Add periodization metadata
    periodizedWorkout.periodization = {
      phase: recommendation.currentPhase.name,
      phaseType: recommendation.currentPhase.type,
      phaseProgress: this.userCycles.get(userId)?.phaseProgress || 0,
      modifications: recommendation.workoutModifications,
      nextPhase: recommendation.nextPhasePreview?.name
    };

    return periodizedWorkout;
  }

  /**
   * Get or create user training cycle
   */
  private async getUserTrainingCycle(userId: string): Promise<TrainingCycle> {
    if (this.userCycles.has(userId)) {
      return this.userCycles.get(userId)!;
    }

    const cycle = await this.createInitialTrainingCycle(userId);
    this.userCycles.set(userId, cycle);
    return cycle;
  }

  /**
   * Create initial training cycle based on user profile and history
   */
  private async createInitialTrainingCycle(userId: string): Promise<TrainingCycle> {
    const [profile, workoutHistory] = await Promise.all([
      ProfileModel.findOne({ userId }),
      WorkoutPlanModel.find({ userId }, { limit: 10 })
    ]);

    const experience = profile?.experience || 'beginner';
    const phases = this.generatePhaseSequence(experience, profile?.goals || []);
    const currentPhase = this.selectInitialPhase(workoutHistory, phases);

    return {
      userId,
      currentPhase,
      phaseProgress: 0,
      cycleNumber: 1,
      startDate: new Date(),
      phases,
      adaptations: []
    };
  }

  /**
   * Generate phase sequence based on user characteristics
   */
  private generatePhaseSequence(experience: string, goals: string[]): PeriodizationPhase[] {
    const basePhases = this.getBasePhases(experience);
    
    // Customize phases based on goals
    return basePhases.map(phase => this.customizePhaseForGoals(phase, goals));
  }

  /**
   * Get base periodization phases for experience level
   */
  private getBasePhases(experience: string): PeriodizationPhase[] {
    switch (experience) {
      case 'beginner':
        return [
          {
            name: 'Foundation Building',
            type: 'accumulation',
            duration: 4,
            volumeMultiplier: 0.8,
            intensityMultiplier: 0.7,
            complexityLevel: 0.6,
            focusAreas: ['movement_quality', 'consistency', 'habit_formation'],
            characteristics: ['High volume', 'Low intensity', 'Skill development']
          },
          {
            name: 'Strength Development',
            type: 'intensification',
            duration: 3,
            volumeMultiplier: 0.9,
            intensityMultiplier: 0.85,
            complexityLevel: 0.7,
            focusAreas: ['strength_building', 'progressive_overload'],
            characteristics: ['Moderate volume', 'Higher intensity', 'Strength focus']
          },
          {
            name: 'Active Recovery',
            type: 'recovery',
            duration: 1,
            volumeMultiplier: 0.6,
            intensityMultiplier: 0.6,
            complexityLevel: 0.5,
            focusAreas: ['recovery', 'mobility', 'maintenance'],
            characteristics: ['Low volume', 'Low intensity', 'Recovery focus']
          }
        ];

      case 'intermediate':
        return [
          {
            name: 'Volume Accumulation',
            type: 'accumulation',
            duration: 3,
            volumeMultiplier: 1.1,
            intensityMultiplier: 0.8,
            complexityLevel: 0.8,
            focusAreas: ['work_capacity', 'muscle_endurance', 'volume_tolerance'],
            characteristics: ['High volume', 'Moderate intensity', 'Capacity building']
          },
          {
            name: 'Intensity Focus',
            type: 'intensification',
            duration: 3,
            volumeMultiplier: 0.9,
            intensityMultiplier: 1.0,
            complexityLevel: 0.9,
            focusAreas: ['strength', 'power', 'peak_performance'],
            characteristics: ['Moderate volume', 'High intensity', 'Peak development']
          },
          {
            name: 'Performance Peak',
            type: 'realization',
            duration: 2,
            volumeMultiplier: 0.8,
            intensityMultiplier: 1.1,
            complexityLevel: 1.0,
            focusAreas: ['peak_performance', 'skill_refinement', 'competition_prep'],
            characteristics: ['Lower volume', 'Peak intensity', 'Performance focus']
          },
          {
            name: 'Recovery & Regeneration',
            type: 'recovery',
            duration: 1,
            volumeMultiplier: 0.6,
            intensityMultiplier: 0.6,
            complexityLevel: 0.6,
            focusAreas: ['recovery', 'regeneration', 'preparation'],
            characteristics: ['Low volume', 'Low intensity', 'Recovery focus']
          }
        ];

      case 'advanced':
        return [
          {
            name: 'High Volume Accumulation',
            type: 'accumulation',
            duration: 4,
            volumeMultiplier: 1.2,
            intensityMultiplier: 0.85,
            complexityLevel: 0.9,
            focusAreas: ['work_capacity', 'structural_adaptation', 'volume_progression'],
            characteristics: ['Very high volume', 'Controlled intensity', 'Adaptation focus']
          },
          {
            name: 'Strength Intensification',
            type: 'intensification',
            duration: 3,
            volumeMultiplier: 1.0,
            intensityMultiplier: 1.1,
            complexityLevel: 1.0,
            focusAreas: ['maximal_strength', 'neural_adaptation', 'intensity_progression'],
            characteristics: ['High volume', 'Very high intensity', 'Strength focus']
          },
          {
            name: 'Peak Performance',
            type: 'realization',
            duration: 2,
            volumeMultiplier: 0.8,
            intensityMultiplier: 1.2,
            complexityLevel: 1.0,
            focusAreas: ['peak_performance', 'competition_readiness', 'skill_mastery'],
            characteristics: ['Moderate volume', 'Peak intensity', 'Performance optimization']
          },
          {
            name: 'Active Recovery',
            type: 'recovery',
            duration: 1,
            volumeMultiplier: 0.5,
            intensityMultiplier: 0.5,
            complexityLevel: 0.7,
            focusAreas: ['recovery', 'maintenance', 'preparation'],
            characteristics: ['Low volume', 'Low intensity', 'Recovery and preparation']
          }
        ];

      default:
        return this.getBasePhases('beginner');
    }
  }

  /**
   * Customize phase based on user goals
   */
  private customizePhaseForGoals(phase: PeriodizationPhase, goals: string[]): PeriodizationPhase {
    const customizedPhase = { ...phase };

    if (goals.includes('strength') || goals.includes('power')) {
      customizedPhase.intensityMultiplier *= 1.1;
      customizedPhase.focusAreas.push('strength_development');
    }

    if (goals.includes('muscle_gain') || goals.includes('hypertrophy')) {
      customizedPhase.volumeMultiplier *= 1.1;
      customizedPhase.focusAreas.push('hypertrophy_training');
    }

    if (goals.includes('endurance') || goals.includes('cardio')) {
      customizedPhase.volumeMultiplier *= 1.15;
      customizedPhase.focusAreas.push('endurance_development');
    }

    if (goals.includes('weight_loss') || goals.includes('fat_loss')) {
      customizedPhase.intensityMultiplier *= 1.05;
      customizedPhase.focusAreas.push('metabolic_conditioning');
    }

    return customizedPhase;
  }

  /**
   * Select initial phase based on workout history
   */
  private selectInitialPhase(workoutHistory: any[], phases: PeriodizationPhase[]): PeriodizationPhase {
    if (workoutHistory.length < 5) {
      // New user - start with accumulation
      return phases.find(p => p.type === 'accumulation') || phases[0];
    }

    // Analyze recent workout patterns to determine appropriate starting phase
    const recentIntensity = this.analyzeRecentIntensity(workoutHistory);
    const recentVolume = this.analyzeRecentVolume(workoutHistory);

    if (recentIntensity > 0.8 && recentVolume > 0.8) {
      // High intensity and volume - might need recovery
      return phases.find(p => p.type === 'recovery') || phases[0];
    } else if (recentIntensity < 0.6) {
      // Low intensity - can start with intensification
      return phases.find(p => p.type === 'intensification') || phases[0];
    }

    // Default to accumulation
    return phases.find(p => p.type === 'accumulation') || phases[0];
  }

  /**
   * Assess progress within current phase
   */
  private async assessPhaseProgress(userId: string, cycle: TrainingCycle): Promise<ProgressIndicator[]> {
    const recentSessions = await WorkoutSessionModel.find({ userId }, { limit: 10 });
    
    return [
      {
        metric: 'Completion Rate',
        currentValue: recentSessions.filter(s => s.completedAt).length / recentSessions.length,
        targetValue: 0.8,
        progress: 0.85,
        status: 'on_track'
      },
      {
        metric: 'Average Rating',
        currentValue: recentSessions.reduce((sum, s) => sum + (s.feedback?.rating || 3), 0) / recentSessions.length,
        targetValue: 4.0,
        progress: 0.9,
        status: 'ahead'
      }
    ];
  }

  /**
   * Check if phase transition is needed
   */
  private checkPhaseTransition(cycle: TrainingCycle, indicators: ProgressIndicator[]): PhaseTransition | null {
    const weeksSinceStart = Math.floor((Date.now() - cycle.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    if (weeksSinceStart >= cycle.currentPhase.duration) {
      const nextPhase = this.getNextPhase(cycle);
      if (nextPhase) {
        return {
          fromPhase: cycle.currentPhase.name,
          toPhase: nextPhase.name,
          transitionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
          preparationSteps: this.generateTransitionSteps(cycle.currentPhase, nextPhase),
          expectedChanges: this.generateExpectedChanges(cycle.currentPhase, nextPhase)
        };
      }
    }

    return null;
  }

  /**
   * Get next phase in sequence
   */
  private getNextPhase(cycle: TrainingCycle): PeriodizationPhase | null {
    const currentIndex = cycle.phases.findIndex(p => p.name === cycle.currentPhase.name);
    if (currentIndex >= 0 && currentIndex < cycle.phases.length - 1) {
      return cycle.phases[currentIndex + 1];
    }
    // Cycle back to first phase
    return cycle.phases[0];
  }

  /**
   * Transition to next phase
   */
  private async transitionToNextPhase(userId: string, cycle: TrainingCycle): Promise<void> {
    const nextPhase = this.getNextPhase(cycle);
    if (nextPhase) {
      cycle.currentPhase = nextPhase;
      cycle.phaseProgress = 0;
      cycle.startDate = new Date();
      
      if (nextPhase === cycle.phases[0]) {
        cycle.cycleNumber++;
      }
      
      this.userCycles.set(userId, cycle);
      console.log(`🔄 User ${userId} transitioned to phase: ${nextPhase.name}`);
    }
  }

  /**
   * Generate workout modifications for current phase
   */
  private generateWorkoutModifications(cycle: TrainingCycle): WorkoutModification[] {
    const phase = cycle.currentPhase;
    const modifications: WorkoutModification[] = [];

    modifications.push({
      aspect: 'volume',
      modification: phase.volumeMultiplier > 1 ? 'increase' : 'decrease',
      value: phase.volumeMultiplier,
      reasoning: `${phase.name} phase requires ${phase.volumeMultiplier > 1 ? 'higher' : 'lower'} training volume`
    });

    modifications.push({
      aspect: 'intensity',
      modification: phase.intensityMultiplier > 1 ? 'increase' : 'decrease',
      value: phase.intensityMultiplier,
      reasoning: `${phase.name} phase emphasizes ${phase.intensityMultiplier > 1 ? 'higher' : 'moderate'} intensity`
    });

    modifications.push({
      aspect: 'complexity',
      modification: phase.complexityLevel > 0.8 ? 'increase' : 'maintain',
      value: phase.complexityLevel,
      reasoning: `Phase complexity level: ${Math.round(phase.complexityLevel * 100)}%`
    });

    return modifications;
  }

  // Workout modification methods
  private adjustVolume(workout: any, multiplier: number): any {
    // Implementation for volume adjustment
    return { ...workout, volumeMultiplier: multiplier };
  }

  private adjustIntensity(workout: any, multiplier: number): any {
    // Implementation for intensity adjustment
    return { ...workout, intensityMultiplier: multiplier };
  }

  private adjustComplexity(workout: any, level: number): any {
    // Implementation for complexity adjustment
    return { ...workout, complexityLevel: level };
  }

  private adjustRecovery(workout: any, emphasis: number): any {
    // Implementation for recovery adjustment
    return { ...workout, recoveryEmphasis: emphasis };
  }

  private adjustFocus(workout: any, focusAreas: string[]): any {
    // Implementation for focus adjustment
    return { ...workout, focusAreas };
  }

  // Analysis helper methods
  private analyzeRecentIntensity(workoutHistory: any[]): number {
    // Placeholder implementation
    return 0.7;
  }

  private analyzeRecentVolume(workoutHistory: any[]): number {
    // Placeholder implementation
    return 0.8;
  }

  private generateTransitionSteps(fromPhase: PeriodizationPhase, toPhase: PeriodizationPhase): string[] {
    return [
      `Gradually transition from ${fromPhase.name} to ${toPhase.name}`,
      `Adjust training volume and intensity accordingly`,
      `Focus on new phase objectives: ${toPhase.focusAreas.join(', ')}`
    ];
  }

  private generateExpectedChanges(fromPhase: PeriodizationPhase, toPhase: PeriodizationPhase): string[] {
    return [
      `Volume change: ${fromPhase.volumeMultiplier} → ${toPhase.volumeMultiplier}`,
      `Intensity change: ${fromPhase.intensityMultiplier} → ${toPhase.intensityMultiplier}`,
      `Focus shift: ${fromPhase.focusAreas.join(', ')} → ${toPhase.focusAreas.join(', ')}`
    ];
  }
}

export const periodizationEngine = new PeriodizationEngine();
