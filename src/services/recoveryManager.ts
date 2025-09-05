/**
 * Intelligent Recovery & Fatigue Management Service
 * Advanced recovery tracking with automatic workout adjustments
 */

import { WorkoutPlanModel } from '../models/WorkoutPlan';
import { WorkoutSessionModel } from '../models/WorkoutSession';
import { ProfileModel } from '../models/Profile';

export interface RecoveryProfile {
  userId: string;
  currentRecoveryState: RecoveryState;
  fatigueLevel: number; // 0-100 scale
  recoveryCapacity: number; // 0-100 scale
  optimalRestPeriod: number; // hours
  recoveryTrends: RecoveryTrend[];
  fatigueIndicators: FatigueIndicator[];
  recoveryRecommendations: RecoveryRecommendation[];
}

export interface RecoveryState {
  status: 'fully_recovered' | 'recovering' | 'fatigued' | 'overtrained';
  confidence: number; // 0-1
  timeToFullRecovery: number; // hours
  lastAssessment: Date;
  factors: RecoveryFactor[];
}

export interface RecoveryTrend {
  date: Date;
  recoveryScore: number; // 0-100
  fatigueLevel: number;
  workoutIntensity: number;
  sleepQuality?: number;
  stressLevel?: number;
}

export interface FatigueIndicator {
  type: 'physical' | 'mental' | 'performance' | 'subjective';
  indicator: string;
  severity: number; // 0-1
  confidence: number; // 0-1
  source: 'workout_data' | 'user_feedback' | 'wearable' | 'ai_analysis';
}

export interface RecoveryFactor {
  factor: string;
  impact: number; // -1 to 1 (negative = hinders recovery, positive = helps)
  confidence: number; // 0-1
  recommendation?: string;
}

export interface RecoveryRecommendation {
  category: 'workout_adjustment' | 'rest_period' | 'active_recovery' | 'lifestyle' | 'nutrition';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
  expectedBenefit: string;
  timeframe: string;
}

export interface WorkoutAdjustment {
  parameter: 'intensity' | 'volume' | 'complexity' | 'duration' | 'rest_periods';
  adjustment: number; // multiplier (0.5 = 50% reduction, 1.5 = 50% increase)
  reasoning: string;
  expectedImpact: string;
}

export interface WearableData {
  heartRateVariability?: number;
  restingHeartRate?: number;
  sleepDuration?: number;
  sleepQuality?: number;
  stressLevel?: number;
  recoveryScore?: number;
  timestamp: Date;
}

export class RecoveryManager {
  private recoveryProfiles: Map<string, RecoveryProfile> = new Map();

  /**
   * Assess user's current recovery state
   */
  async assessRecoveryState(userId: string, wearableData?: WearableData): Promise<RecoveryProfile> {
    const profile = await this.getOrCreateRecoveryProfile(userId);
    
    // Update recovery state based on multiple data sources
    await this.updateRecoveryState(profile, wearableData);
    
    // Generate recommendations
    profile.recoveryRecommendations = this.generateRecoveryRecommendations(profile);
    
    // Save updated profile
    this.recoveryProfiles.set(userId, profile);
    
    return profile;
  }

  /**
   * Get workout adjustments based on recovery state
   */
  async getWorkoutAdjustments(userId: string, baseWorkout: any): Promise<WorkoutAdjustment[]> {
    const recoveryProfile = await this.assessRecoveryState(userId);
    const adjustments: WorkoutAdjustment[] = [];

    switch (recoveryProfile.currentRecoveryState.status) {
      case 'overtrained':
        adjustments.push(
          {
            parameter: 'intensity',
            adjustment: 0.4,
            reasoning: 'Overtraining detected - significant intensity reduction needed',
            expectedImpact: 'Prevent further fatigue accumulation and promote recovery'
          },
          {
            parameter: 'volume',
            adjustment: 0.5,
            reasoning: 'Reduce training volume to allow recovery',
            expectedImpact: 'Reduced stress on recovery systems'
          }
        );
        break;

      case 'fatigued':
        adjustments.push(
          {
            parameter: 'intensity',
            adjustment: 0.7,
            reasoning: 'Elevated fatigue - moderate intensity reduction',
            expectedImpact: 'Maintain training stimulus while allowing recovery'
          },
          {
            parameter: 'rest_periods',
            adjustment: 1.5,
            reasoning: 'Increase rest periods for better recovery between sets',
            expectedImpact: 'Improved performance within workout'
          }
        );
        break;

      case 'recovering':
        adjustments.push(
          {
            parameter: 'intensity',
            adjustment: 0.85,
            reasoning: 'Still recovering - slight intensity reduction',
            expectedImpact: 'Gradual return to full training capacity'
          }
        );
        break;

      case 'fully_recovered':
        if (recoveryProfile.recoveryCapacity > 80) {
          adjustments.push(
            {
              parameter: 'intensity',
              adjustment: 1.1,
              reasoning: 'Excellent recovery - can handle increased intensity',
              expectedImpact: 'Maximize training adaptations'
            }
          );
        }
        break;
    }

    return adjustments;
  }

  /**
   * Apply recovery-based adjustments to workout
   */
  async applyRecoveryAdjustments(userId: string, baseWorkout: any): Promise<any> {
    const adjustments = await this.getWorkoutAdjustments(userId, baseWorkout);
    let adjustedWorkout = { ...baseWorkout };

    adjustments.forEach(adjustment => {
      switch (adjustment.parameter) {
        case 'intensity':
          adjustedWorkout = this.adjustIntensity(adjustedWorkout, adjustment.adjustment);
          break;
        case 'volume':
          adjustedWorkout = this.adjustVolume(adjustedWorkout, adjustment.adjustment);
          break;
        case 'duration':
          adjustedWorkout = this.adjustDuration(adjustedWorkout, adjustment.adjustment);
          break;
        case 'rest_periods':
          adjustedWorkout = this.adjustRestPeriods(adjustedWorkout, adjustment.adjustment);
          break;
        case 'complexity':
          adjustedWorkout = this.adjustComplexity(adjustedWorkout, adjustment.adjustment);
          break;
      }
    });

    // Add recovery metadata
    adjustedWorkout.recoveryAdjustments = {
      recoveryState: this.recoveryProfiles.get(userId)?.currentRecoveryState.status,
      adjustments: adjustments,
      fatigueLevel: this.recoveryProfiles.get(userId)?.fatigueLevel
    };

    return adjustedWorkout;
  }

  /**
   * Learn from workout completion and update recovery model
   */
  async updateRecoveryFromWorkout(userId: string, workoutData: any, feedback: any): Promise<void> {
    const profile = await this.getOrCreateRecoveryProfile(userId);
    
    // Analyze workout impact on recovery
    const workoutImpact = this.calculateWorkoutImpact(workoutData, feedback);
    
    // Update fatigue level
    profile.fatigueLevel = Math.min(100, profile.fatigueLevel + workoutImpact.fatigueIncrease);
    
    // Update recovery trends
    profile.recoveryTrends.push({
      date: new Date(),
      recoveryScore: 100 - profile.fatigueLevel,
      fatigueLevel: profile.fatigueLevel,
      workoutIntensity: workoutImpact.intensity,
      sleepQuality: feedback.sleepQuality,
      stressLevel: feedback.stressLevel
    });

    // Keep only recent trends (last 30 days)
    profile.recoveryTrends = profile.recoveryTrends
      .filter(trend => Date.now() - trend.date.getTime() < 30 * 24 * 60 * 60 * 1000)
      .slice(-30);

    // Update fatigue indicators
    this.updateFatigueIndicators(profile, workoutData, feedback);
    
    this.recoveryProfiles.set(userId, profile);
  }

  /**
   * Get or create recovery profile for user
   */
  private async getOrCreateRecoveryProfile(userId: string): Promise<RecoveryProfile> {
    if (this.recoveryProfiles.has(userId)) {
      return this.recoveryProfiles.get(userId)!;
    }

    const profile = await this.createInitialRecoveryProfile(userId);
    this.recoveryProfiles.set(userId, profile);
    return profile;
  }

  /**
   * Create initial recovery profile from historical data
   */
  private async createInitialRecoveryProfile(userId: string): Promise<RecoveryProfile> {
    const [userProfile, recentSessions] = await Promise.all([
      ProfileModel.findOne({ userId }),
      WorkoutSessionModel.find({ userId }, { limit: 10 })
    ]);

    const baseRecoveryCapacity = this.estimateBaseRecoveryCapacity(userProfile, recentSessions);
    const initialFatigueLevel = this.estimateInitialFatigue(recentSessions);

    return {
      userId,
      currentRecoveryState: {
        status: 'fully_recovered',
        confidence: 0.7,
        timeToFullRecovery: 0,
        lastAssessment: new Date(),
        factors: []
      },
      fatigueLevel: initialFatigueLevel,
      recoveryCapacity: baseRecoveryCapacity,
      optimalRestPeriod: 24, // hours
      recoveryTrends: [],
      fatigueIndicators: [],
      recoveryRecommendations: []
    };
  }

  /**
   * Update recovery state based on multiple data sources
   */
  private async updateRecoveryState(profile: RecoveryProfile, wearableData?: WearableData): Promise<void> {
    const factors: RecoveryFactor[] = [];

    // Analyze workout history impact
    const workoutImpact = this.analyzeWorkoutHistoryImpact(profile);
    factors.push(...workoutImpact);

    // Analyze wearable data if available
    if (wearableData) {
      const wearableImpact = this.analyzeWearableData(wearableData);
      factors.push(...wearableImpact);
    }

    // Analyze time since last workout
    const timeImpact = this.analyzeTimeSinceLastWorkout(profile);
    factors.push(timeImpact);

    // Calculate overall recovery state
    const recoveryScore = this.calculateRecoveryScore(factors, profile);
    profile.currentRecoveryState = this.determineRecoveryState(recoveryScore, factors);
    profile.currentRecoveryState.factors = factors;
  }

  /**
   * Generate recovery recommendations
   */
  private generateRecoveryRecommendations(profile: RecoveryProfile): RecoveryRecommendation[] {
    const recommendations: RecoveryRecommendation[] = [];

    switch (profile.currentRecoveryState.status) {
      case 'overtrained':
        recommendations.push(
          {
            category: 'rest_period',
            priority: 'high',
            title: 'Extended Rest Period',
            description: 'Take 2-3 days of complete rest or very light activity',
            actionItems: ['No intense workouts', 'Focus on sleep', 'Gentle stretching only'],
            expectedBenefit: 'Full recovery and prevention of injury',
            timeframe: '2-3 days'
          },
          {
            category: 'lifestyle',
            priority: 'high',
            title: 'Recovery Lifestyle Focus',
            description: 'Prioritize sleep, nutrition, and stress management',
            actionItems: ['8+ hours sleep', 'Reduce life stress', 'Increase protein intake'],
            expectedBenefit: 'Accelerated recovery and improved resilience',
            timeframe: '1-2 weeks'
          }
        );
        break;

      case 'fatigued':
        recommendations.push(
          {
            category: 'workout_adjustment',
            priority: 'high',
            title: 'Reduce Workout Intensity',
            description: 'Lower intensity workouts until recovery improves',
            actionItems: ['60-70% normal intensity', 'Longer rest periods', 'Focus on form'],
            expectedBenefit: 'Maintained fitness while recovering',
            timeframe: '3-5 days'
          },
          {
            category: 'active_recovery',
            priority: 'medium',
            title: 'Active Recovery Sessions',
            description: 'Include light movement and mobility work',
            actionItems: ['Gentle yoga', 'Walking', 'Light stretching'],
            expectedBenefit: 'Improved circulation and faster recovery',
            timeframe: 'Daily'
          }
        );
        break;

      case 'recovering':
        recommendations.push(
          {
            category: 'workout_adjustment',
            priority: 'medium',
            title: 'Gradual Intensity Return',
            description: 'Slowly return to normal workout intensity',
            actionItems: ['80-90% normal intensity', 'Monitor how you feel', 'Extra warm-up'],
            expectedBenefit: 'Safe return to full training',
            timeframe: '1-2 days'
          }
        );
        break;

      case 'fully_recovered':
        if (profile.recoveryCapacity > 80) {
          recommendations.push(
            {
              category: 'workout_adjustment',
              priority: 'low',
              title: 'Optimize Training Load',
              description: 'You can handle increased training stimulus',
              actionItems: ['Consider intensity increase', 'Add complexity', 'Progressive overload'],
              expectedBenefit: 'Maximized training adaptations',
              timeframe: 'Next workout'
            }
          );
        }
        break;
    }

    return recommendations;
  }

  // Helper methods for workout adjustments
  private adjustIntensity(workout: any, multiplier: number): any {
    return { ...workout, intensityMultiplier: multiplier };
  }

  private adjustVolume(workout: any, multiplier: number): any {
    return { ...workout, volumeMultiplier: multiplier };
  }

  private adjustDuration(workout: any, multiplier: number): any {
    return { ...workout, durationMultiplier: multiplier };
  }

  private adjustRestPeriods(workout: any, multiplier: number): any {
    return { ...workout, restMultiplier: multiplier };
  }

  private adjustComplexity(workout: any, multiplier: number): any {
    return { ...workout, complexityMultiplier: multiplier };
  }

  // Analysis helper methods
  private estimateBaseRecoveryCapacity(profile: any, sessions: any[]): number {
    // Base capacity on age, experience, and historical performance
    let capacity = 70; // Base capacity

    if (profile?.age) {
      if (profile.age < 25) capacity += 15;
      else if (profile.age < 35) capacity += 10;
      else if (profile.age < 45) capacity += 5;
      else if (profile.age > 55) capacity -= 10;
    }

    if (profile?.experience === 'advanced') capacity += 10;
    else if (profile?.experience === 'beginner') capacity -= 5;

    return Math.min(100, Math.max(30, capacity));
  }

  private estimateInitialFatigue(sessions: any[]): number {
    // Estimate based on recent workout frequency and intensity
    const recentSessions = sessions.filter(s => 
      s.completedAt && Date.now() - s.completedAt.toDate().getTime() < 7 * 24 * 60 * 60 * 1000
    );

    return Math.min(50, recentSessions.length * 8); // 8 fatigue points per recent workout
  }

  private calculateWorkoutImpact(workoutData: any, feedback: any): any {
    const baseImpact = 15; // Base fatigue increase per workout
    let intensityMultiplier = 1;

    if (feedback.rating < 3) intensityMultiplier = 1.5; // Poor rating = higher fatigue
    else if (feedback.rating > 4) intensityMultiplier = 0.8; // Good rating = lower fatigue

    return {
      fatigueIncrease: baseImpact * intensityMultiplier,
      intensity: feedback.difficulty || 3
    };
  }

  private updateFatigueIndicators(profile: RecoveryProfile, workoutData: any, feedback: any): void {
    profile.fatigueIndicators = [];

    if (feedback.rating < 3) {
      profile.fatigueIndicators.push({
        type: 'subjective',
        indicator: 'Low workout satisfaction',
        severity: 0.7,
        confidence: 0.8,
        source: 'user_feedback'
      });
    }

    if (profile.fatigueLevel > 70) {
      profile.fatigueIndicators.push({
        type: 'performance',
        indicator: 'High accumulated fatigue',
        severity: 0.8,
        confidence: 0.9,
        source: 'ai_analysis'
      });
    }
  }

  private analyzeWorkoutHistoryImpact(profile: RecoveryProfile): RecoveryFactor[] {
    const factors: RecoveryFactor[] = [];

    if (profile.fatigueLevel > 60) {
      factors.push({
        factor: 'High fatigue accumulation',
        impact: -0.6,
        confidence: 0.8,
        recommendation: 'Reduce workout intensity'
      });
    }

    return factors;
  }

  private analyzeWearableData(data: WearableData): RecoveryFactor[] {
    const factors: RecoveryFactor[] = [];

    if (data.heartRateVariability && data.heartRateVariability < 30) {
      factors.push({
        factor: 'Low heart rate variability',
        impact: -0.4,
        confidence: 0.9
      });
    }

    if (data.sleepDuration && data.sleepDuration < 7) {
      factors.push({
        factor: 'Insufficient sleep',
        impact: -0.5,
        confidence: 0.9
      });
    }

    return factors;
  }

  private analyzeTimeSinceLastWorkout(profile: RecoveryProfile): RecoveryFactor {
    const hoursSinceLastWorkout = 24; // Placeholder - would calculate from actual data
    
    if (hoursSinceLastWorkout > 48) {
      return {
        factor: 'Extended rest period',
        impact: 0.3,
        confidence: 0.7
      };
    } else if (hoursSinceLastWorkout < 12) {
      return {
        factor: 'Insufficient rest time',
        impact: -0.4,
        confidence: 0.8
      };
    }

    return {
      factor: 'Normal rest period',
      impact: 0.1,
      confidence: 0.6
    };
  }

  private calculateRecoveryScore(factors: RecoveryFactor[], profile: RecoveryProfile): number {
    const baseScore = 100 - profile.fatigueLevel;
    const factorImpact = factors.reduce((sum, factor) => sum + (factor.impact * 20), 0);
    
    return Math.max(0, Math.min(100, baseScore + factorImpact));
  }

  private determineRecoveryState(score: number, factors: RecoveryFactor[]): RecoveryState {
    let status: RecoveryState['status'];
    let timeToFullRecovery = 0;

    if (score >= 80) {
      status = 'fully_recovered';
    } else if (score >= 60) {
      status = 'recovering';
      timeToFullRecovery = 12;
    } else if (score >= 30) {
      status = 'fatigued';
      timeToFullRecovery = 24;
    } else {
      status = 'overtrained';
      timeToFullRecovery = 72;
    }

    return {
      status,
      confidence: 0.8,
      timeToFullRecovery,
      lastAssessment: new Date(),
      factors
    };
  }
}

export const recoveryManager = new RecoveryManager();
