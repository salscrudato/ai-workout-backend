/**
 * Intelligent Workout Progression Engine
 * Advanced AI-driven progression system with periodization and autoregulation
 */

import { WorkoutPlanModel } from '../models/WorkoutPlan';
import { WorkoutSessionModel } from '../models/WorkoutSession';
import { ProfileModel } from '../models/Profile';
import { biometricIntegrationService } from './biometricIntegration';

export interface ProgressionContext {
  userId: string;
  currentPhase: 'accumulation' | 'intensification' | 'realization' | 'deload';
  weekInPhase: number;
  totalWeeksInPhase: number;
  performanceMetrics: PerformanceMetrics;
  recoveryStatus: RecoveryStatus;
  adaptationRate: number;
  trainingAge: number; // months of consistent training
}

export interface PerformanceMetrics {
  strengthProgression: number; // % improvement over last 4 weeks
  volumeCapacity: number; // current volume tolerance
  intensityTolerance: number; // RPE tolerance
  movementQuality: number; // 1-10 scale
  consistencyScore: number; // workout completion rate
}

export interface RecoveryStatus {
  readinessScore: number; // 0-100 composite score
  fatigueLevel: number; // 0-100
  sleepQuality: number; // 0-100
  stressLevel: number; // 0-100
  motivationLevel: number; // 0-100
}

export interface ProgressionRecommendation {
  volumeAdjustment: number; // multiplier (0.7-1.3)
  intensityAdjustment: number; // multiplier (0.8-1.2)
  complexityAdjustment: 'decrease' | 'maintain' | 'increase';
  focusShift: string[];
  deloadRecommended: boolean;
  phaseTransition: boolean;
  reasoning: string[];
}

export class IntelligentProgressionEngine {
  /**
   * Generate intelligent progression recommendations
   */
  async generateProgressionRecommendation(userId: string): Promise<ProgressionRecommendation> {
    const context = await this.buildProgressionContext(userId);
    
    // Analyze multiple factors for progression decision
    const volumeAdjustment = this.calculateVolumeAdjustment(context);
    const intensityAdjustment = this.calculateIntensityAdjustment(context);
    const complexityAdjustment = this.determineComplexityAdjustment(context);
    const focusShift = this.determineFocusShift(context);
    const deloadRecommended = this.shouldRecommendDeload(context);
    const phaseTransition = this.shouldTransitionPhase(context);
    
    return {
      volumeAdjustment,
      intensityAdjustment,
      complexityAdjustment,
      focusShift,
      deloadRecommended,
      phaseTransition,
      reasoning: ['Mock reasoning for intelligent progression'] // this.generateReasoning(context, {
        // volumeAdjustment,
        // intensityAdjustment,
        // complexityAdjustment,
        // focusShift,
        // deloadRecommended,
        // phaseTransition
      // })
    };
  }

  /**
   * Apply periodization principles to workout structure
   */
  async applyPeriodization(userId: string, baseWorkout: any): Promise<any> {
    const context = await this.buildProgressionContext(userId);
    const recommendation = await this.generateProgressionRecommendation(userId);
    
    // Clone workout to avoid mutation
    const periodizedWorkout = JSON.parse(JSON.stringify(baseWorkout));
    
    // Apply phase-specific modifications
    // this.applyPhaseModifications(periodizedWorkout, context);

    // Apply progression recommendations
    // this.applyProgressionModifications(periodizedWorkout, recommendation);

    // Apply autoregulation based on readiness
    // this.applyAutoregulation(periodizedWorkout, context.recoveryStatus);
    
    return periodizedWorkout;
  }

  /**
   * Implement velocity-based training principles
   */
  generateVelocityBasedGuidance(exercise: any, targetAdaptation: string): any {
    const velocityZones = {
      'max_strength': { minVelocity: 0.15, maxVelocity: 0.35, rpeRange: [8, 10] },
      'strength_speed': { minVelocity: 0.35, maxVelocity: 0.55, rpeRange: [6, 8] },
      'speed_strength': { minVelocity: 0.55, maxVelocity: 0.75, rpeRange: [5, 7] },
      'max_power': { minVelocity: 0.75, maxVelocity: 1.0, rpeRange: [4, 6] }
    };

    const zone = velocityZones[targetAdaptation as keyof typeof velocityZones] || velocityZones.strength_speed;
    
    return {
      ...exercise,
      velocityGuidance: {
        targetZone: targetAdaptation,
        minVelocity: zone.minVelocity,
        maxVelocity: zone.maxVelocity,
        rpeRange: zone.rpeRange,
        autoregulationCue: `Maintain bar speed between ${zone.minVelocity}-${zone.maxVelocity} m/s. Stop set if velocity drops below ${zone.minVelocity} m/s.`
      }
    };
  }

  /**
   * Build comprehensive progression context
   */
  private async buildProgressionContext(userId: string): Promise<ProgressionContext> {
    const [profile, recentWorkouts, recentSessions, biometricData] = await Promise.all([
      ProfileModel.findOne({ userId }),
      WorkoutPlanModel.find({ userId }, { limit: 12 }),
      WorkoutSessionModel.find({ userId }, { limit: 20 }),
      biometricIntegrationService.syncBiometricData(userId)
    ]);

    // Mock data for now - implement these methods later
    const performanceMetrics = {
      strengthProgression: 0.8,
      volumeCapacity: 0.7,
      intensityTolerance: 0.6,
      movementQuality: 0.8,
      consistencyScore: 0.9
    };
    const recoveryStatus = {
      readinessScore: 0.8,
      fatigueLevel: 0.2,
      sleepQuality: 0.8,
      stressLevel: 0.3,
      motivationLevel: 0.9
    };
    const currentPhase = 'accumulation';
    const trainingAge = 12; // months

    return {
      userId,
      currentPhase,
      weekInPhase: 2, // this.calculateWeekInPhase(recentWorkouts, currentPhase),
      totalWeeksInPhase: 8, // this.getPhaseLength(currentPhase, profile?.experience || 'beginner'),
      performanceMetrics,
      recoveryStatus,
      adaptationRate: 0.75, // this.calculateAdaptationRate(performanceMetrics, trainingAge),
      trainingAge
    };
  }

  private calculateVolumeAdjustment(context: ProgressionContext): number {
    let adjustment = 1.0;
    
    // Performance-based adjustments
    if (context.performanceMetrics.strengthProgression > 10) {
      adjustment += 0.1; // Progressing well, can handle more volume
    } else if (context.performanceMetrics.strengthProgression < 2) {
      adjustment -= 0.1; // Stagnating, reduce volume
    }
    
    // Recovery-based adjustments
    if (context.recoveryStatus.readinessScore < 60) {
      adjustment -= 0.2; // Poor recovery, reduce volume
    } else if (context.recoveryStatus.readinessScore > 85) {
      adjustment += 0.1; // Great recovery, can handle more
    }
    
    // Phase-based adjustments
    switch (context.currentPhase) {
      case 'accumulation':
        adjustment += 0.1; // Volume phase
        break;
      case 'intensification':
        adjustment -= 0.2; // Reduce volume, increase intensity
        break;
      case 'realization':
        adjustment -= 0.3; // Peak phase, minimal volume
        break;
      case 'deload':
        adjustment = 0.6; // Significant volume reduction
        break;
    }
    
    return Math.max(0.7, Math.min(1.3, adjustment));
  }

  private calculateIntensityAdjustment(context: ProgressionContext): number {
    let adjustment = 1.0;
    
    // Performance-based adjustments
    if (context.performanceMetrics.intensityTolerance > 8) {
      adjustment += 0.1; // Can handle higher intensity
    } else if (context.performanceMetrics.intensityTolerance < 6) {
      adjustment -= 0.1; // Struggling with current intensity
    }
    
    // Recovery-based adjustments
    if (context.recoveryStatus.readinessScore < 60) {
      adjustment -= 0.15; // Poor recovery, reduce intensity
    }
    
    // Phase-based adjustments
    switch (context.currentPhase) {
      case 'accumulation':
        adjustment -= 0.1; // Lower intensity, higher volume
        break;
      case 'intensification':
        adjustment += 0.15; // Intensity phase
        break;
      case 'realization':
        adjustment += 0.2; // Peak intensity
        break;
      case 'deload':
        adjustment = 0.7; // Significant intensity reduction
        break;
    }
    
    return Math.max(0.8, Math.min(1.2, adjustment));
  }

  private determineComplexityAdjustment(context: ProgressionContext): 'decrease' | 'maintain' | 'increase' {
    if (context.recoveryStatus.readinessScore < 50 || context.performanceMetrics.movementQuality < 6) {
      return 'decrease';
    }
    
    if (context.performanceMetrics.movementQuality > 8 && context.recoveryStatus.readinessScore > 80) {
      return 'increase';
    }
    
    return 'maintain';
  }

  private determineFocusShift(context: ProgressionContext): string[] {
    const focus = [];
    
    // Phase-based focus
    switch (context.currentPhase) {
      case 'accumulation':
        focus.push('volume', 'work_capacity', 'movement_quality');
        break;
      case 'intensification':
        focus.push('strength', 'power', 'technique_refinement');
        break;
      case 'realization':
        focus.push('peak_performance', 'competition_prep', 'nervous_system_optimization');
        break;
      case 'deload':
        focus.push('recovery', 'mobility', 'movement_preparation');
        break;
    }
    
    // Performance-based adjustments
    if (context.performanceMetrics.movementQuality < 7) {
      focus.push('corrective_exercise', 'movement_patterns');
    }
    
    if (context.recoveryStatus.stressLevel > 70) {
      focus.push('stress_management', 'parasympathetic_activation');
    }
    
    return focus;
  }

  private shouldRecommendDeload(context: ProgressionContext): boolean {
    // Multiple criteria for deload recommendation
    const criteria = [
      context.recoveryStatus.readinessScore < 50,
      context.performanceMetrics.strengthProgression < 0, // Regression
      context.performanceMetrics.consistencyScore < 60,
      context.weekInPhase >= context.totalWeeksInPhase,
      context.recoveryStatus.fatigueLevel > 80
    ];
    
    // Recommend deload if 2 or more criteria are met
    return criteria.filter(Boolean).length >= 2;
  }

  private shouldTransitionPhase(context: ProgressionContext): boolean {
    return context.weekInPhase >= context.totalWeeksInPhase || 
           (context.currentPhase === 'deload' && context.recoveryStatus.readinessScore > 80);
  }
}

export const intelligentProgressionEngine = new IntelligentProgressionEngine();
