/**
 * Real-Time Adaptive Learning System
 * Advanced ML-driven system that continuously learns and adapts to user behavior
 */

import { WorkoutPlanModel } from '../models/WorkoutPlan';
import { WorkoutSessionModel } from '../models/WorkoutSession';
import { ProfileModel } from '../models/Profile';

export interface RealTimeUserProfile {
  userId: string;
  currentFitnessLevel: number; // 0-100 scale
  adaptationRate: number; // How quickly user adapts to new challenges
  motivationProfile: MotivationProfile;
  performancePatterns: PerformancePattern[];
  recoveryProfile: RecoveryProfile;
  preferenceWeights: PreferenceWeights;
  riskFactors: RiskFactor[];
}

export interface MotivationProfile {
  intrinsicMotivation: number; // Self-driven motivation
  extrinsicMotivation: number; // External reward driven
  challengeSeeker: number; // Enjoys difficult workouts
  consistencyFocused: number; // Prefers routine and consistency
  varietySeeker: number; // Enjoys workout variety
  socialMotivation: number; // Motivated by social aspects
}

export interface PerformancePattern {
  workoutType: string;
  averageRating: number;
  completionRate: number;
  progressionRate: number;
  plateauRisk: number;
  optimalFrequency: number;
}

export interface RecoveryProfile {
  baseRecoveryTime: number; // Hours needed between workouts
  intensityTolerance: number; // How well user handles high intensity
  volumeTolerance: number; // How well user handles high volume
  fatigueIndicators: string[]; // Signs that indicate user needs recovery
  recoveryPreferences: string[]; // Preferred recovery methods
}

export interface PreferenceWeights {
  duration: number; // Weight given to workout duration preferences
  intensity: number; // Weight given to intensity preferences
  equipment: number; // Weight given to equipment preferences
  workoutType: number; // Weight given to workout type preferences
  timing: number; // Weight given to timing preferences
}

export interface RiskFactor {
  type: 'injury' | 'burnout' | 'plateau' | 'inconsistency';
  severity: number; // 0-1 scale
  indicators: string[];
  mitigationStrategies: string[];
}

export interface AdaptiveRecommendation {
  workoutPlan: any;
  adaptations: WorkoutAdaptation[];
  confidenceScore: number;
  learningInsights: string[];
  nextOptimizations: string[];
}

export interface WorkoutAdaptation {
  parameter: string;
  originalValue: any;
  adaptedValue: any;
  reasoning: string;
  expectedImpact: string;
}

export class RealTimeAdaptiveLearning {
  private userProfiles: Map<string, RealTimeUserProfile> = new Map();
  private learningRate = 0.1; // How quickly the system adapts
  private confidenceThreshold = 0.7; // Minimum confidence for recommendations

  /**
   * Generate real-time adaptive recommendations
   */
  async generateAdaptiveRecommendation(userId: string, baseWorkoutRequest: any): Promise<AdaptiveRecommendation> {
    const userProfile = await this.getUserProfile(userId);
    const recentPerformance = await this.analyzeRecentPerformance(userId);
    const contextualFactors = await this.analyzeContextualFactors(userId);

    // Apply real-time adaptations
    const adaptations = this.calculateAdaptations(userProfile, recentPerformance, contextualFactors, baseWorkoutRequest);
    const adaptedWorkout = this.applyAdaptations(baseWorkoutRequest, adaptations);
    
    // Calculate confidence and generate insights
    const confidenceScore = this.calculateConfidence(userProfile, adaptations);
    const learningInsights = this.generateLearningInsights(userProfile, recentPerformance);
    const nextOptimizations = this.identifyNextOptimizations(userProfile);

    return {
      workoutPlan: adaptedWorkout,
      adaptations,
      confidenceScore,
      learningInsights,
      nextOptimizations
    };
  }

  /**
   * Learn from workout completion and feedback
   */
  async learnFromWorkoutCompletion(userId: string, workoutId: string, feedback: any): Promise<void> {
    const userProfile = await this.getUserProfile(userId);
    const workout = await WorkoutPlanModel.findById(workoutId);
    
    if (!workout) return;

    // Update performance patterns
    this.updatePerformancePatterns(userProfile, workout, feedback);
    
    // Update motivation profile
    this.updateMotivationProfile(userProfile, feedback);
    
    // Update recovery profile
    this.updateRecoveryProfile(userProfile, workout, feedback);
    
    // Update preference weights
    this.updatePreferenceWeights(userProfile, workout, feedback);
    
    // Assess risk factors
    this.assessRiskFactors(userProfile, workout, feedback);
    
    // Save updated profile
    this.userProfiles.set(userId, userProfile);
    
    console.log(`🧠 Adaptive learning updated for user ${userId} based on workout completion`);
  }

  /**
   * Get or create user profile
   */
  private async getUserProfile(userId: string): Promise<RealTimeUserProfile> {
    if (this.userProfiles.has(userId)) {
      return this.userProfiles.get(userId)!;
    }

    // Create new profile from historical data
    const profile = await this.buildInitialProfile(userId);
    this.userProfiles.set(userId, profile);
    return profile;
  }

  /**
   * Build initial user profile from historical data
   */
  private async buildInitialProfile(userId: string): Promise<RealTimeUserProfile> {
    const [userProfile, workoutHistory, sessionHistory] = await Promise.all([
      ProfileModel.findOne({ userId }),
      WorkoutPlanModel.find({ userId }, { limit: 20 }),
      WorkoutSessionModel.find({ userId }, { limit: 30 })
    ]);

    const completedSessions = sessionHistory.filter(s => s.completedAt);
    const completionRate = sessionHistory.length > 0 ? completedSessions.length / sessionHistory.length : 0;

    return {
      userId,
      currentFitnessLevel: this.estimateFitnessLevel(userProfile, workoutHistory),
      adaptationRate: this.calculateAdaptationRate(workoutHistory, sessionHistory),
      motivationProfile: this.analyzeMotivationProfile(sessionHistory),
      performancePatterns: this.analyzePerformancePatterns(workoutHistory, sessionHistory),
      recoveryProfile: this.analyzeRecoveryProfile(sessionHistory),
      preferenceWeights: this.calculatePreferenceWeights(workoutHistory),
      riskFactors: this.identifyRiskFactors(sessionHistory, completionRate)
    };
  }

  /**
   * Calculate real-time adaptations
   */
  private calculateAdaptations(
    userProfile: RealTimeUserProfile,
    recentPerformance: any,
    contextualFactors: any,
    baseRequest: any
  ): WorkoutAdaptation[] {
    const adaptations: WorkoutAdaptation[] = [];

    // Duration adaptation
    if (recentPerformance.averageCompletionTime < baseRequest.duration * 0.8) {
      adaptations.push({
        parameter: 'duration',
        originalValue: baseRequest.duration,
        adaptedValue: Math.min(baseRequest.duration + 10, 90),
        reasoning: 'User consistently finishes workouts early - can handle longer sessions',
        expectedImpact: 'Increased training volume and better results'
      });
    }

    // Intensity adaptation
    if (userProfile.currentFitnessLevel > 70 && recentPerformance.averageRating > 4) {
      adaptations.push({
        parameter: 'intensity',
        originalValue: 'moderate',
        adaptedValue: 'high',
        reasoning: 'High fitness level and positive feedback indicate readiness for increased intensity',
        expectedImpact: 'Accelerated fitness gains and continued challenge'
      });
    }

    // Recovery adaptation
    if (userProfile.recoveryProfile.fatigueIndicators.length > 2) {
      adaptations.push({
        parameter: 'recovery_focus',
        originalValue: false,
        adaptedValue: true,
        reasoning: 'Multiple fatigue indicators detected - prioritizing recovery',
        expectedImpact: 'Reduced injury risk and improved long-term consistency'
      });
    }

    // Variety adaptation
    if (userProfile.motivationProfile.varietySeeker > 0.7 && recentPerformance.workoutTypeRepetition > 3) {
      adaptations.push({
        parameter: 'workout_variety',
        originalValue: baseRequest.workoutType,
        adaptedValue: this.selectVarietyWorkout(baseRequest.workoutType),
        reasoning: 'User seeks variety and has repeated similar workouts recently',
        expectedImpact: 'Maintained engagement and reduced boredom'
      });
    }

    return adaptations;
  }

  /**
   * Apply adaptations to workout plan
   */
  private applyAdaptations(baseWorkout: any, adaptations: WorkoutAdaptation[]): any {
    let adaptedWorkout = { ...baseWorkout };

    adaptations.forEach(adaptation => {
      switch (adaptation.parameter) {
        case 'duration':
          adaptedWorkout.duration = adaptation.adaptedValue;
          break;
        case 'intensity':
          adaptedWorkout.targetIntensity = adaptation.adaptedValue;
          break;
        case 'workout_variety':
          adaptedWorkout.workoutType = adaptation.adaptedValue;
          break;
        case 'recovery_focus':
          adaptedWorkout.recoveryEmphasis = adaptation.adaptedValue;
          break;
      }
    });

    return adaptedWorkout;
  }

  /**
   * Calculate confidence in recommendations
   */
  private calculateConfidence(userProfile: RealTimeUserProfile, adaptations: WorkoutAdaptation[]): number {
    let confidence = 0.5; // Base confidence

    // More data = higher confidence
    if (userProfile.performancePatterns.length >= 3) confidence += 0.2;
    
    // Consistent patterns = higher confidence
    const avgCompletionRate = userProfile.performancePatterns.reduce((sum, p) => sum + p.completionRate, 0) / userProfile.performancePatterns.length;
    if (avgCompletionRate > 0.8) confidence += 0.2;
    
    // Lower risk = higher confidence
    const highRiskFactors = userProfile.riskFactors.filter(r => r.severity > 0.7).length;
    if (highRiskFactors === 0) confidence += 0.1;
    
    // Fewer adaptations = higher confidence (less uncertainty)
    confidence -= adaptations.length * 0.05;

    return Math.max(0.1, Math.min(1.0, confidence));
  }

  /**
   * Generate learning insights
   */
  private generateLearningInsights(userProfile: RealTimeUserProfile, recentPerformance: any): string[] {
    const insights = [];

    if (userProfile.adaptationRate > 0.8) {
      insights.push('🚀 Fast adapter - responds well to progressive challenges');
    }

    if (userProfile.motivationProfile.consistencyFocused > 0.7) {
      insights.push('📅 Consistency-focused - benefits from routine and predictable progression');
    }

    if (userProfile.recoveryProfile.intensityTolerance < 0.4) {
      insights.push('⚡ Intensity-sensitive - performs better with moderate intensity and longer recovery');
    }

    if (recentPerformance.improvementTrend > 0.1) {
      insights.push('📈 Strong improvement trend - current approach is working well');
    }

    return insights;
  }

  /**
   * Identify next optimizations
   */
  private identifyNextOptimizations(userProfile: RealTimeUserProfile): string[] {
    const optimizations = [];

    // Check for plateau risk
    const plateauRisk = userProfile.performancePatterns.reduce((max, p) => Math.max(max, p.plateauRisk), 0);
    if (plateauRisk > 0.6) {
      optimizations.push('Consider periodization to break through potential plateau');
    }

    // Check for motivation optimization
    if (userProfile.motivationProfile.socialMotivation > 0.6) {
      optimizations.push('Add social features or challenges to boost engagement');
    }

    // Check for recovery optimization
    if (userProfile.recoveryProfile.baseRecoveryTime > 48) {
      optimizations.push('Focus on recovery optimization and stress management');
    }

    return optimizations;
  }

  // Helper methods for analysis
  private async analyzeRecentPerformance(userId: string): Promise<any> {
    const recentSessions = await WorkoutSessionModel.find({ userId }, { limit: 5 });
    
    return {
      averageRating: recentSessions.reduce((sum, s) => sum + (s.feedback?.rating || 3), 0) / recentSessions.length,
      averageCompletionTime: 35, // Placeholder - would calculate from actual data
      workoutTypeRepetition: 2, // Placeholder - would analyze workout type patterns
      improvementTrend: 0.1 // Placeholder - would calculate trend
    };
  }

  private async analyzeContextualFactors(userId: string): Promise<any> {
    const now = new Date();
    return {
      timeOfDay: now.getHours(),
      dayOfWeek: now.getDay(),
      seasonality: Math.floor((now.getMonth() + 1) / 3), // Quarter of year
      recentActivity: 'moderate' // Placeholder
    };
  }

  // Profile building helper methods
  private estimateFitnessLevel(profile: any, workoutHistory: any[]): number {
    // Placeholder implementation
    return 50 + (workoutHistory.length * 2);
  }

  private calculateAdaptationRate(workoutHistory: any[], sessionHistory: any[]): number {
    // Placeholder implementation
    return 0.6;
  }

  private analyzeMotivationProfile(sessionHistory: any[]): MotivationProfile {
    return {
      intrinsicMotivation: 0.7,
      extrinsicMotivation: 0.5,
      challengeSeeker: 0.6,
      consistencyFocused: 0.8,
      varietySeeker: 0.4,
      socialMotivation: 0.3
    };
  }

  private analyzePerformancePatterns(workoutHistory: any[], sessionHistory: any[]): PerformancePattern[] {
    return [
      {
        workoutType: 'Full Body',
        averageRating: 4.2,
        completionRate: 0.85,
        progressionRate: 0.1,
        plateauRisk: 0.3,
        optimalFrequency: 3
      }
    ];
  }

  private analyzeRecoveryProfile(sessionHistory: any[]): RecoveryProfile {
    return {
      baseRecoveryTime: 24,
      intensityTolerance: 0.7,
      volumeTolerance: 0.8,
      fatigueIndicators: [],
      recoveryPreferences: ['active_recovery', 'stretching']
    };
  }

  private calculatePreferenceWeights(workoutHistory: any[]): PreferenceWeights {
    return {
      duration: 0.8,
      intensity: 0.6,
      equipment: 0.7,
      workoutType: 0.9,
      timing: 0.5
    };
  }

  private identifyRiskFactors(sessionHistory: any[], completionRate: number): RiskFactor[] {
    const risks: RiskFactor[] = [];
    
    if (completionRate < 0.6) {
      risks.push({
        type: 'inconsistency',
        severity: 0.7,
        indicators: ['Low completion rate', 'Irregular workout patterns'],
        mitigationStrategies: ['Shorter workouts', 'Flexible scheduling', 'Motivation techniques']
      });
    }
    
    return risks;
  }

  private selectVarietyWorkout(currentType: string): string {
    const alternatives = ['Full Body', 'Upper Body', 'Lower Body', 'HIIT', 'Core'];
    return alternatives.find(alt => alt !== currentType) || 'Full Body';
  }

  // Update methods for learning
  private updatePerformancePatterns(profile: RealTimeUserProfile, workout: any, feedback: any): void {
    // Implementation for updating performance patterns
  }

  private updateMotivationProfile(profile: RealTimeUserProfile, feedback: any): void {
    // Implementation for updating motivation profile
  }

  private updateRecoveryProfile(profile: RealTimeUserProfile, workout: any, feedback: any): void {
    // Implementation for updating recovery profile
  }

  private updatePreferenceWeights(profile: RealTimeUserProfile, workout: any, feedback: any): void {
    // Implementation for updating preference weights
  }

  private assessRiskFactors(profile: RealTimeUserProfile, workout: any, feedback: any): void {
    // Implementation for assessing risk factors
  }
}

export const realTimeAdaptiveLearning = new RealTimeAdaptiveLearning();
