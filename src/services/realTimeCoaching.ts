/**
 * Real-Time Performance Analytics & AI Coaching Service
 * Provides live coaching feedback and performance optimization during workouts
 */

import { WorkoutSessionModel } from '../models/WorkoutSession';
import { ProfileModel } from '../models/Profile';
import { biometricIntegrationService } from './biometricIntegration';

export interface RealTimeMetrics {
  userId: string;
  sessionId: string;
  timestamp: Date;
  currentExercise: string;
  setNumber: number;
  repNumber: number;
  heartRate?: number;
  perceivedExertion: number; // 1-10 RPE
  movementVelocity?: number; // m/s
  powerOutput?: number; // watts
  formQuality: number; // 1-10 AI-assessed
  fatigueLevel: number; // 1-10
}

export interface CoachingInsight {
  type: 'technique' | 'intensity' | 'pacing' | 'recovery' | 'motivation' | 'safety';
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  actionable: boolean;
  timing: 'immediate' | 'between_sets' | 'between_exercises' | 'post_workout';
  visualCue?: string;
  audioCue?: string;
}

export interface PerformancePrediction {
  remainingReps: number;
  estimatedRPE: number;
  recommendedRest: number; // seconds
  formDegradationRisk: number; // 0-100%
  injuryRisk: number; // 0-100%
  optimalStopPoint: number; // rep number to stop at
}

export interface WorkoutAdjustment {
  type: 'weight' | 'reps' | 'sets' | 'rest' | 'exercise_swap' | 'technique_focus';
  adjustment: string;
  reasoning: string;
  confidence: number; // 0-100%
}

export class RealTimeCoachingService {
  /**
   * Analyze real-time performance and generate coaching insights
   */
  async analyzeRealTimePerformance(metrics: RealTimeMetrics): Promise<{
    insights: CoachingInsight[];
    predictions: PerformancePrediction;
    adjustments: WorkoutAdjustment[];
  }> {
    const [insights, predictions, adjustments] = await Promise.all([
      this.generateCoachingInsights(metrics),
      this.generatePerformancePredictions(metrics),
      this.generateWorkoutAdjustments(metrics)
    ]);

    return { insights, predictions, adjustments };
  }

  /**
   * Generate AI-powered coaching insights
   */
  private async generateCoachingInsights(metrics: RealTimeMetrics): Promise<CoachingInsight[]> {
    const insights: CoachingInsight[] = [];
    const profile = await ProfileModel.findOne({ userId: metrics.userId });
    
    // Heart rate analysis
    if (metrics.heartRate) {
      const hrInsight = this.analyzeHeartRate(metrics, profile);
      if (hrInsight) insights.push(hrInsight);
    }

    // RPE analysis
    const rpeInsight = this.analyzeRPE(metrics);
    if (rpeInsight) insights.push(rpeInsight);

    // Form quality analysis
    const formInsight = this.analyzeFormQuality(metrics);
    if (formInsight) insights.push(formInsight);

    // Fatigue analysis
    const fatigueInsight = this.analyzeFatigue(metrics);
    if (fatigueInsight) insights.push(fatigueInsight);

    // Velocity analysis (if available)
    if (metrics.movementVelocity) {
      const velocityInsight = this.analyzeVelocity(metrics);
      if (velocityInsight) insights.push(velocityInsight);
    }

    return insights.sort((a, b) => this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority));
  }

  /**
   * Generate performance predictions using ML models
   */
  private async generatePerformancePredictions(metrics: RealTimeMetrics): Promise<PerformancePrediction> {
    // Get historical performance data for this user and exercise
    const historicalData = await this.getHistoricalPerformance(metrics.userId, metrics.currentExercise);
    
    // Predict remaining capacity based on current metrics
    const remainingReps = this.predictRemainingReps(metrics, historicalData);
    const estimatedRPE = this.predictFinalRPE(metrics, remainingReps);
    const recommendedRest = this.calculateOptimalRest(metrics, estimatedRPE);
    const formDegradationRisk = this.assessFormDegradationRisk(metrics, remainingReps);
    const injuryRisk = this.assessInjuryRisk(metrics, formDegradationRisk);
    const optimalStopPoint = this.calculateOptimalStopPoint(metrics, formDegradationRisk, injuryRisk);

    return {
      remainingReps,
      estimatedRPE,
      recommendedRest,
      formDegradationRisk,
      injuryRisk,
      optimalStopPoint
    };
  }

  /**
   * Generate real-time workout adjustments
   */
  private async generateWorkoutAdjustments(metrics: RealTimeMetrics): Promise<WorkoutAdjustment[]> {
    const adjustments: WorkoutAdjustment[] = [];
    
    // Weight adjustments based on velocity/RPE
    if (metrics.perceivedExertion < 6 && metrics.setNumber === 1) {
      adjustments.push({
        type: 'weight',
        adjustment: 'Increase weight by 5-10% for next set',
        reasoning: 'Current load appears too light based on RPE feedback',
        confidence: 75
      });
    }

    // Rep adjustments based on form quality
    if (metrics.formQuality < 6 && metrics.repNumber > 5) {
      adjustments.push({
        type: 'reps',
        adjustment: 'Stop current set, form quality declining',
        reasoning: 'Form degradation detected - prioritize quality over quantity',
        confidence: 90
      });
    }

    // Rest adjustments based on heart rate recovery
    if (metrics.heartRate && metrics.heartRate > this.getTargetRecoveryHR(metrics.userId)) {
      adjustments.push({
        type: 'rest',
        adjustment: 'Extend rest period by 30-60 seconds',
        reasoning: 'Heart rate not sufficiently recovered for optimal performance',
        confidence: 80
      });
    }

    return adjustments;
  }

  /**
   * Analyze heart rate patterns
   */
  private analyzeHeartRate(metrics: RealTimeMetrics, profile: any): CoachingInsight | null {
    if (!metrics.heartRate || !profile?.age) return null;

    const maxHR = 220 - (profile.age || 30);
    const hrPercentage = (metrics.heartRate / maxHR) * 100;

    if (hrPercentage > 90) {
      return {
        type: 'intensity',
        priority: 'high',
        message: 'Heart rate very high - consider reducing intensity or extending rest',
        actionable: true,
        timing: 'immediate',
        audioCue: 'Heart rate elevated - slow down'
      };
    }

    if (hrPercentage < 50 && metrics.perceivedExertion > 7) {
      return {
        type: 'intensity',
        priority: 'medium',
        message: 'Heart rate low but RPE high - focus on movement quality',
        actionable: true,
        timing: 'between_sets'
      };
    }

    return null;
  }

  /**
   * Analyze RPE patterns
   */
  private analyzeRPE(metrics: RealTimeMetrics): CoachingInsight | null {
    if (metrics.perceivedExertion >= 9 && metrics.setNumber < 3) {
      return {
        type: 'intensity',
        priority: 'high',
        message: 'RPE very high early in exercise - consider reducing load',
        actionable: true,
        timing: 'between_sets'
      };
    }

    if (metrics.perceivedExertion <= 5 && metrics.setNumber >= 2) {
      return {
        type: 'intensity',
        priority: 'medium',
        message: 'RPE low - consider increasing intensity for next set',
        actionable: true,
        timing: 'between_sets'
      };
    }

    return null;
  }

  /**
   * Analyze form quality
   */
  private analyzeFormQuality(metrics: RealTimeMetrics): CoachingInsight | null {
    if (metrics.formQuality <= 5) {
      return {
        type: 'technique',
        priority: 'critical',
        message: 'Form breakdown detected - focus on technique or reduce load',
        actionable: true,
        timing: 'immediate',
        visualCue: 'Form check reminder'
      };
    }

    if (metrics.formQuality <= 7 && metrics.repNumber > 8) {
      return {
        type: 'technique',
        priority: 'medium',
        message: 'Form starting to decline - consider stopping set soon',
        actionable: true,
        timing: 'immediate'
      };
    }

    return null;
  }

  /**
   * Analyze fatigue levels
   */
  private analyzeFatigue(metrics: RealTimeMetrics): CoachingInsight | null {
    if (metrics.fatigueLevel >= 8) {
      return {
        type: 'recovery',
        priority: 'high',
        message: 'High fatigue detected - prioritize recovery between sets',
        actionable: true,
        timing: 'between_sets'
      };
    }

    return null;
  }

  /**
   * Analyze movement velocity (if available)
   */
  private analyzeVelocity(metrics: RealTimeMetrics): CoachingInsight | null {
    if (!metrics.movementVelocity) return null;

    // Velocity-based training thresholds
    if (metrics.movementVelocity < 0.2) {
      return {
        type: 'intensity',
        priority: 'high',
        message: 'Movement velocity very low - consider stopping set',
        actionable: true,
        timing: 'immediate'
      };
    }

    return null;
  }

  private predictRemainingReps(metrics: RealTimeMetrics, historicalData: any[]): number {
    // Simple prediction based on current RPE and historical patterns
    const rpeToRepsRemaining = {
      6: 6, 7: 4, 8: 2, 9: 1, 10: 0
    };
    
    return rpeToRepsRemaining[Math.round(metrics.perceivedExertion) as keyof typeof rpeToRepsRemaining] || 0;
  }

  private predictFinalRPE(metrics: RealTimeMetrics, remainingReps: number): number {
    // Predict final RPE based on current RPE and remaining reps
    return Math.min(10, metrics.perceivedExertion + (remainingReps * 0.3));
  }

  private calculateOptimalRest(metrics: RealTimeMetrics, estimatedRPE: number): number {
    // Base rest time on estimated final RPE
    const baseRest = 90; // seconds
    const rpeMultiplier = estimatedRPE / 8; // normalize around RPE 8
    
    return Math.round(baseRest * rpeMultiplier);
  }

  private assessFormDegradationRisk(metrics: RealTimeMetrics, remainingReps: number): number {
    let risk = 0;
    
    // Current form quality
    risk += (10 - metrics.formQuality) * 10;
    
    // Fatigue level
    risk += metrics.fatigueLevel * 5;
    
    // Remaining reps (more reps = higher risk)
    risk += remainingReps * 3;
    
    return Math.min(100, risk);
  }

  private assessInjuryRisk(metrics: RealTimeMetrics, formDegradationRisk: number): number {
    let risk = formDegradationRisk * 0.3; // Base on form risk
    
    // High RPE increases injury risk
    if (metrics.perceivedExertion >= 9) risk += 20;
    
    // High fatigue increases injury risk
    if (metrics.fatigueLevel >= 8) risk += 15;
    
    return Math.min(100, risk);
  }

  private calculateOptimalStopPoint(metrics: RealTimeMetrics, formRisk: number, injuryRisk: number): number {
    if (injuryRisk > 70 || formRisk > 80) {
      return metrics.repNumber; // Stop now
    }
    
    if (injuryRisk > 50 || formRisk > 60) {
      return metrics.repNumber + 1; // One more rep max
    }
    
    return metrics.repNumber + 2; // Can continue for 2 more reps
  }

  private getPriorityScore(priority: string): number {
    const scores = { critical: 4, high: 3, medium: 2, low: 1 };
    return scores[priority as keyof typeof scores] || 0;
  }

  private getTargetRecoveryHR(userId: string): number {
    // This would be calculated based on user's resting HR and training zones
    return 120; // Placeholder
  }

  private async getHistoricalPerformance(userId: string, exercise: string): Promise<any[]> {
    // Fetch historical performance data for this exercise
    return [];
  }
}

export const realTimeCoachingService = new RealTimeCoachingService();
