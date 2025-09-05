/**
 * Frictionless UX Service
 * Provides intelligent defaults and one-tap workout generation
 */

import { ProfileModel } from '../models/Profile';
import { WorkoutPlanModel } from '../models/WorkoutPlan';
import { WorkoutSessionModel } from '../models/WorkoutSession';
import { workoutIntelligenceAdvanced } from './workoutIntelligenceAdvanced';

export interface SmartDefaults {
  workoutType: string;
  duration: number;
  equipmentAvailable: string[];
  constraints: string[];
  confidence: number; // 0-1 score of how confident we are in these defaults
  intensity: number; // 1-5 scale
  timeOfDay: string;
  reasoning: string;
}

export interface QuickWorkoutOptions {
  quickStart: SmartDefaults;
  alternatives: SmartDefaults[];
  reasoning: string;
}

export interface ConversationalContext {
  intent: 'workout_generation' | 'quick_start' | 'schedule_planning' | 'progress_check';
  extractedParams: {
    workoutType?: string;
    duration?: number;
    intensity?: string;
    equipment?: string[];
    goals?: string[];
  };
  suggestedResponses: string[];
  nextAction: string;
}

export interface PredictiveSchedule {
  date: Date;
  workoutType: string;
  duration: number;
  confidence: number;
  reasoning: string;
}

export class FrictionlessUXService {
  /**
   * Generate smart defaults based on user history and context
   */
  async generateSmartDefaults(userId: string, currentContext?: any): Promise<SmartDefaults> {
    const profile = await ProfileModel.findOne({ userId });
    const recentWorkouts = await WorkoutPlanModel.find({ userId }, { sort: { createdAt: -1 }, limit: 10 });
    const recentSessions = await WorkoutSessionModel.find({ userId }, { sort: { createdAt: -1 }, limit: 10 });

    // Analyze patterns
    const workoutTypePattern = this.analyzeWorkoutTypePreference(recentWorkouts);
    const durationPattern = this.analyzeDurationPreference(recentWorkouts, recentSessions);
    const intensityPattern = this.analyzeIntensityPreference(recentSessions);
    const equipmentPattern = this.analyzeEquipmentPreference(recentWorkouts);
    const timingPattern = this.analyzeTimingPreference(recentSessions);

    // Calculate confidence based on data availability
    const confidence = this.calculateConfidence(recentWorkouts.length, recentSessions.length);

    // Generate reasoning
    const reasoning = this.generateReasoningText(workoutTypePattern, durationPattern, intensityPattern);

    return {
      workoutType: workoutTypePattern.preferred,
      duration: durationPattern.preferred,
      equipmentAvailable: equipmentPattern.preferred,
      constraints: profile?.constraints || [],
      confidence,
      intensity: intensityPattern.preferred,
      timeOfDay: timingPattern.preferred,
      reasoning
    };
  }

  /**
   * Process natural language input and extract workout parameters
   */
  processConversationalInput(input: string, userContext?: any): ConversationalContext {
    const lowerInput = input.toLowerCase();

    // Determine intent
    const intent = this.determineIntent(lowerInput);

    // Extract parameters
    const extractedParams = this.extractWorkoutParameters(lowerInput);

    // Generate contextual suggestions
    const suggestedResponses = this.generateContextualSuggestions(intent, extractedParams);

    // Determine next action
    const nextAction = this.determineNextAction(intent, extractedParams);

    return {
      intent,
      extractedParams,
      suggestedResponses,
      nextAction
    };
  }

  /**
   * Generate predictive workout schedule
   */
  async generatePredictiveSchedule(userId: string, daysAhead: number = 7): Promise<PredictiveSchedule[]> {
    const profile = await ProfileModel.findOne({ userId });
    const recentSessions = await WorkoutSessionModel.find({ userId }, { sort: { createdAt: -1 }, limit: 20 });

    const schedule: PredictiveSchedule[] = [];
    const today = new Date();

    // Analyze user's workout frequency and patterns
    const workoutFrequency = this.analyzeWorkoutFrequency(recentSessions);
    const preferredDays = this.analyzePreferredDays(recentSessions);
    const workoutTypeRotation = this.analyzeWorkoutTypeRotation(recentSessions);

    for (let i = 1; i <= daysAhead; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayOfWeek = date.getDay();
      const shouldWorkout = this.shouldScheduleWorkout(dayOfWeek, i, workoutFrequency, preferredDays);

      if (shouldWorkout.should) {
        const workoutType = this.predictWorkoutType(i, workoutTypeRotation);
        const duration = this.predictDuration(workoutType.type, profile);

        schedule.push({
          date,
          workoutType: workoutType.type,
          duration,
          confidence: shouldWorkout.confidence * workoutType.confidence,
          reasoning: `${shouldWorkout.reasoning} ${workoutType.reasoning}`
        });
      }
    }

    return schedule;
  }

  /**
   * Generate one-tap workout options
   */
  async generateQuickStartOptions(userId: string): Promise<Array<{
    name: string;
    description: string;
    workoutType: string;
    duration: number;
    intensity: string;
    equipment: string[];
    reasoning: string;
  }>> {
    const smartDefaults = await this.generateSmartDefaults(userId);
    const intelligence = await workoutIntelligenceAdvanced.generateIntelligentRecommendation(userId);

    return [
      {
        name: "Perfect Match",
        description: "Your ideal workout based on recent patterns",
        workoutType: smartDefaults.workoutType,
        duration: smartDefaults.duration,
        intensity: this.mapIntensityToString(smartDefaults.intensity),
        equipment: smartDefaults.equipmentAvailable,
        reasoning: smartDefaults.reasoning
      },
      {
        name: "Quick Boost",
        description: "Short, energizing session",
        workoutType: intelligence.workoutType,
        duration: Math.min(20, smartDefaults.duration),
        intensity: "moderate",
        equipment: smartDefaults.equipmentAvailable.filter(e => e !== 'full_gym'),
        reasoning: "Optimized for time-constrained days"
      },
      {
        name: "Challenge Mode",
        description: "Push your limits today",
        workoutType: smartDefaults.workoutType,
        duration: smartDefaults.duration + 10,
        intensity: "high",
        equipment: smartDefaults.equipmentAvailable,
        reasoning: "Based on your progression readiness"
      }
    ];
  }

  // Private helper methods
  private analyzeWorkoutTypePreference(workouts: any[]): { preferred: string; confidence: number } {
    if (workouts.length === 0) return { preferred: 'full_body', confidence: 0.3 };

    const typeFrequency = workouts.reduce((acc, workout) => {
      const type = workout.preWorkout?.workout_type || 'full_body';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostFrequent = Object.entries(typeFrequency)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0];

    const confidence = (mostFrequent[1] as number) / workouts.length;
    return { preferred: mostFrequent[0], confidence };
  }

  private analyzeDurationPreference(workouts: any[], sessions: any[]): { preferred: number; confidence: number } {
    if (workouts.length === 0) return { preferred: 30, confidence: 0.3 };

    const durations = workouts
      .map(w => w.preWorkout?.time_available_min || 30)
      .filter(d => d > 0);

    if (durations.length === 0) return { preferred: 30, confidence: 0.3 };

    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const confidence = Math.min(1, durations.length / 10);

    return { preferred: Math.round(avgDuration), confidence };
  }

  private analyzeIntensityPreference(sessions: any[]): { preferred: number; confidence: number } {
    if (sessions.length === 0) return { preferred: 3, confidence: 0.3 };

    const intensities = sessions
      .map(s => s.feedback?.difficulty || 3)
      .filter(i => i > 0);

    if (intensities.length === 0) return { preferred: 3, confidence: 0.3 };

    const avgIntensity = intensities.reduce((a, b) => a + b, 0) / intensities.length;
    const confidence = Math.min(1, intensities.length / 10);

    return { preferred: Math.round(avgIntensity), confidence };
  }

  private analyzeEquipmentPreference(workouts: any[]): { preferred: string[]; confidence: number } {
    if (workouts.length === 0) return { preferred: ['bodyweight'], confidence: 0.3 };

    const equipmentUsage = new Map<string, number>();

    workouts.forEach(workout => {
      const equipment = workout.preWorkout?.equipment_override || ['bodyweight'];
      equipment.forEach((eq: string) => {
        equipmentUsage.set(eq, (equipmentUsage.get(eq) || 0) + 1);
      });
    });

    const preferred = Array.from(equipmentUsage.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([eq]) => eq);

    const confidence = Math.min(1, workouts.length / 10);
    return { preferred, confidence };
  }

  private analyzeTimingPreference(sessions: any[]): { preferred: string; confidence: number } {
    if (sessions.length === 0) return { preferred: 'morning', confidence: 0.3 };

    const times = sessions
      .filter(s => s.startedAt)
      .map(s => new Date(s.startedAt.toDate()).getHours());

    if (times.length === 0) return { preferred: 'morning', confidence: 0.3 };

    const timeSlots = times.map(hour => {
      if (hour < 10) return 'morning';
      if (hour < 14) return 'midday';
      if (hour < 18) return 'afternoon';
      return 'evening';
    });

    const slotFrequency = timeSlots.reduce((acc, slot) => {
      acc[slot] = (acc[slot] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const preferred = Object.entries(slotFrequency)
      .sort(([,a], [,b]) => b - a)[0][0];

    const confidence = Math.min(1, times.length / 10);
    return { preferred, confidence };
  }

  private calculateConfidence(workoutCount: number, sessionCount: number): number {
    const dataPoints = workoutCount + sessionCount;
    return Math.min(1, dataPoints / 20);
  }

  private generateReasoningText(workoutType: any, duration: any, intensity: any): string {
    const reasons = [];

    if (workoutType.confidence > 0.6) {
      reasons.push(`You typically prefer ${workoutType.preferred.replace('_', ' ')} workouts`);
    }

    if (duration.confidence > 0.6) {
      reasons.push(`${duration.preferred} minutes matches your usual duration`);
    }

    if (intensity.confidence > 0.6) {
      reasons.push(`Intensity level ${intensity.preferred}/5 aligns with your preferences`);
    }

    return reasons.length > 0 ? reasons.join('. ') + '.' : 'Based on general fitness recommendations.';
  }

  private determineIntent(input: string): ConversationalContext['intent'] {
    if (input.includes('quick') || input.includes('fast') || input.includes('now')) {
      return 'quick_start';
    } else if (input.includes('schedule') || input.includes('plan') || input.includes('when')) {
      return 'schedule_planning';
    } else if (input.includes('progress') || input.includes('how am i') || input.includes('stats')) {
      return 'progress_check';
    } else {
      return 'workout_generation';
    }
  }

  private extractWorkoutParameters(input: string): ConversationalContext['extractedParams'] {
    const params: ConversationalContext['extractedParams'] = {};

    // Extract workout type
    if (input.includes('strength') || input.includes('weights')) params.workoutType = 'strength';
    else if (input.includes('cardio') || input.includes('running')) params.workoutType = 'cardio';
    else if (input.includes('yoga') || input.includes('stretch')) params.workoutType = 'yoga';
    else if (input.includes('hiit')) params.workoutType = 'hiit';

    // Extract duration
    const durationMatch = input.match(/(\d+)\s*(min|minute|hour)/);
    if (durationMatch) {
      const value = parseInt(durationMatch[1]);
      params.duration = durationMatch[2].startsWith('hour') ? value * 60 : value;
    }

    // Extract intensity
    if (input.includes('easy') || input.includes('light')) params.intensity = 'low';
    else if (input.includes('hard') || input.includes('intense')) params.intensity = 'high';
    else if (input.includes('moderate')) params.intensity = 'moderate';

    return params;
  }

  private generateContextualSuggestions(intent: ConversationalContext['intent'], params: any): string[] {
    switch (intent) {
      case 'quick_start':
        return ['Start my usual workout', 'Something different today', '15-minute energizer'];
      case 'schedule_planning':
        return ['This week', 'Next 3 days', 'Custom schedule'];
      case 'progress_check':
        return ['Show my stats', 'Recent improvements', 'Goal progress'];
      default:
        return ['Full body workout', 'Upper body focus', 'Cardio session'];
    }
  }

  private determineNextAction(intent: ConversationalContext['intent'], params: any): string {
    if (intent === 'quick_start') return 'generate_quick_options';
    if (intent === 'schedule_planning') return 'show_schedule';
    if (intent === 'progress_check') return 'show_analytics';
    return 'continue_conversation';
  }

  private analyzeWorkoutFrequency(sessions: any[]): number {
    if (sessions.length < 2) return 3; // Default to 3 times per week

    const dates = sessions.map(s => new Date(s.createdAt.toDate()));
    const daysBetween = dates.map((date, i) => {
      if (i === 0) return 0;
      return Math.floor((dates[i-1].getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    }).filter(days => days > 0);

    if (daysBetween.length === 0) return 3;

    const avgDaysBetween = daysBetween.reduce((a, b) => a + b, 0) / daysBetween.length;
    return Math.max(1, Math.round(7 / avgDaysBetween));
  }

  private analyzePreferredDays(sessions: any[]): number[] {
    const dayFrequency = sessions.reduce((acc, session) => {
      const day = new Date(session.createdAt.toDate()).getDay();
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return Object.entries(dayFrequency)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([day]) => parseInt(day));
  }

  private analyzeWorkoutTypeRotation(sessions: any[]): string[] {
    // This would analyze the pattern of workout types
    // For now, return a simple rotation
    return ['full_body', 'upper_body', 'lower_body', 'cardio'];
  }

  private shouldScheduleWorkout(dayOfWeek: number, dayIndex: number, frequency: number, preferredDays: number[]): { should: boolean; confidence: number; reasoning: string } {
    const isPreferredDay = preferredDays.includes(dayOfWeek);
    const shouldWorkout = isPreferredDay || (dayIndex % Math.ceil(7 / frequency) === 0);

    return {
      should: shouldWorkout,
      confidence: isPreferredDay ? 0.8 : 0.5,
      reasoning: isPreferredDay ? 'This is one of your preferred workout days.' : 'Scheduled to maintain your workout frequency.'
    };
  }

  private predictWorkoutType(dayIndex: number, rotation: string[]): { type: string; confidence: number; reasoning: string } {
    const type = rotation[dayIndex % rotation.length];
    return {
      type,
      confidence: 0.7,
      reasoning: `Following your typical workout rotation.`
    };
  }

  private predictDuration(workoutType: string, profile: any): number {
    const baseDurations = {
      'full_body': 45,
      'upper_body': 40,
      'lower_body': 40,
      'cardio': 35,
      'hiit': 25,
      'yoga': 30
    };

    return baseDurations[workoutType as keyof typeof baseDurations] || 30;
  }

  private mapIntensityToString(intensity: number): string {
    if (intensity <= 2) return 'low';
    if (intensity <= 3) return 'moderate';
    if (intensity <= 4) return 'high';
    return 'very_high';
  }

  /**
   * Generate one-tap workout options based on user history and context
   */
  async generateQuickWorkoutOptions(userId: string): Promise<QuickWorkoutOptions> {
    // TODO: Implement full functionality
    const quickStart: SmartDefaults = {
      workoutType: 'Full Body',
      duration: 30,
      intensity: 3,
      timeOfDay: 'morning',
      reasoning: 'Mock quick start workout',
      equipmentAvailable: ['bodyweight'],
      constraints: [],
      confidence: 0.8
    };

    const alternatives: any[] = [];
    const reasoning = 'Mock reasoning for quick workout options';

    return {
      quickStart,
      alternatives,
      reasoning
    };

    return {
      quickStart,
      alternatives,
      reasoning
    };
  }



  /**
   * Real-time workout adaptation based on user feedback and performance
   */
  async adaptWorkoutRealTime(userId: string, workoutId: string, currentMetrics: any): Promise<any> {
    // TODO: Implement full functionality
    return {
      workoutId,
      exerciseSwaps: [],
      restAdjustments: [],
      intensityChanges: [],
      timestamp: new Date(),
      reasoning: 'Mock adaptation based on current metrics'
    };
  }

  /**
   * Generate smart defaults based on user patterns and AI intelligence (private helper)
   */
  private async generateSmartDefaultsHelper(
    userId: string,
    profile: any,
    recentWorkouts: any,
    intelligence: any
  ): Promise<SmartDefaults> {
    const timeOfDay = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    
    // Time-based intelligent defaults with fallbacks
    let suggestedDuration = intelligence.duration || 30;
    let suggestedWorkoutType = intelligence.workoutType || 'full_body';

    // Morning workouts (6-10 AM) - energizing
    if (timeOfDay >= 6 && timeOfDay <= 10) {
      if (recentWorkouts.morningPreference > 0.7) {
        suggestedDuration = Math.min(suggestedDuration, 45); // Shorter for busy mornings
        if (!suggestedWorkoutType.includes('Cardio')) {
          suggestedWorkoutType = this.selectEnergyBoostingWorkout(recentWorkouts);
        }
      }
    }

    // Evening workouts (5-8 PM) - stress relief
    if (timeOfDay >= 17 && timeOfDay <= 20) {
      if (recentWorkouts.eveningPreference > 0.7) {
        // Prefer strength or full body for evening stress relief
        if (suggestedWorkoutType.includes('Cardio')) {
          suggestedWorkoutType = this.selectStressReliefWorkout(recentWorkouts);
        }
      }
    }

    // Weekend adjustments (Saturday/Sunday)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      if (recentWorkouts.weekendPattern === 'longer') {
        suggestedDuration = Math.min(suggestedDuration + 15, 90);
      }
    }

    // Weekday adjustments (Monday-Friday)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      if (recentWorkouts.weekdayPattern === 'efficient') {
        suggestedDuration = Math.min(suggestedDuration, 45);
        suggestedWorkoutType = this.selectEfficientWorkout(recentWorkouts);
      }
    }

    const confidence = this.calculateRecommendationConfidence(recentWorkouts, profile);

    return {
      workoutType: suggestedWorkoutType,
      duration: suggestedDuration,
      intensity: 3, // Default moderate intensity
      timeOfDay: 'morning', // Default time
      reasoning: 'Generated based on user patterns',
      equipmentAvailable: profile?.equipmentAvailable || ['bodyweight'],
      constraints: profile?.constraints || [],
      confidence
    };
  }

  /**
   * Generate alternative workout options
   */
  private async generateAlternatives(
    userId: string, 
    quickStart: SmartDefaults, 
    recentWorkouts: any
  ): Promise<SmartDefaults[]> {
    const alternatives = [];

    // Quick 15-minute option
    alternatives.push({
      ...quickStart,
      duration: 15,
      workoutType: this.selectQuickWorkout(recentWorkouts),
      confidence: quickStart.confidence * 0.8
    });

    // Different workout type option
    const alternativeType = this.selectAlternativeWorkoutType(quickStart.workoutType, recentWorkouts);
    alternatives.push({
      ...quickStart,
      workoutType: alternativeType,
      confidence: quickStart.confidence * 0.9
    });

    // Longer, comprehensive option
    if (quickStart.duration < 60) {
      alternatives.push({
        ...quickStart,
        duration: Math.min(quickStart.duration + 20, 75),
        workoutType: 'Full Body',
        confidence: quickStart.confidence * 0.7
      });
    }

    return alternatives;
  }

  /**
   * Generate reasoning for the recommendations
   */
  private generateReasoning(quickStart: SmartDefaults, intelligence: any): string {
    const reasons = [];
    const timeOfDay = new Date().getHours();
    const dayOfWeek = new Date().getDay();

    // Time-based reasoning
    if (timeOfDay >= 6 && timeOfDay <= 10) {
      reasons.push('🌅 Morning energy boost workout');
    } else if (timeOfDay >= 17 && timeOfDay <= 20) {
      reasons.push('🌆 Evening stress relief session');
    } else if (timeOfDay >= 12 && timeOfDay <= 14) {
      reasons.push('☀️ Midday energy recharge');
    }

    // Day-based reasoning
    if (dayOfWeek === 1) {
      reasons.push('💪 Monday motivation - start the week strong');
    } else if (dayOfWeek === 5) {
      reasons.push('🎉 Friday finisher - end the week on a high');
    } else if (dayOfWeek === 0 || dayOfWeek === 6) {
      reasons.push('🏖️ Weekend warrior - more time for comprehensive training');
    }

    // Intelligence-based reasoning
    if (intelligence.motivationalTheme) {
      reasons.push(`🎯 ${intelligence.motivationalTheme}`);
    }

    if (intelligence.focusAreas?.length > 0) {
      reasons.push(`🔥 Focus: ${intelligence.focusAreas.slice(0, 2).join(' & ')}`);
    }

    // Duration reasoning
    if (quickStart.duration <= 20) {
      reasons.push('⚡ Quick & efficient - perfect for busy schedules');
    } else if (quickStart.duration >= 60) {
      reasons.push('🏋️ Comprehensive session - maximize your gains');
    } else {
      reasons.push('⚖️ Balanced duration - optimal for consistency');
    }

    return reasons.join(' • ');
  }

  /**
   * Get recent workout patterns for intelligent defaults
   */
  private async getRecentWorkoutPatterns(userId: string): Promise<any> {
    const recentWorkouts = await WorkoutPlanModel.find({ userId }, { limit: 10 });
    const recentSessions = await WorkoutSessionModel.find({ userId }, { limit: 15 });

    // Analyze time patterns
    const workoutTimes = recentSessions
      .filter(s => s.completedAt)
      .map(s => new Date(s.completedAt.toDate()).getHours());

    const morningWorkouts = workoutTimes.filter(h => h >= 6 && h <= 10).length;
    const eveningWorkouts = workoutTimes.filter(h => h >= 17 && h <= 20).length;

    // Analyze day patterns
    const workoutDays = recentSessions
      .filter(s => s.completedAt)
      .map(s => new Date(s.completedAt.toDate()).getDay());

    const weekdayWorkouts = workoutDays.filter(d => d >= 1 && d <= 5).length;
    const weekendWorkouts = workoutDays.filter(d => d === 0 || d === 6).length;

    // Analyze workout type preferences
    const workoutTypes = recentWorkouts.map(w => w.preWorkout?.workoutType || 'unknown');
    const typeFrequency = workoutTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostFrequentType = Object.entries(typeFrequency)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'Full Body';

    // Analyze duration preferences
    const durations = recentWorkouts.map(w => w.preWorkout?.time_available_min || 30);
    const averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length || 30;

    return {
      morningPreference: morningWorkouts / Math.max(workoutTimes.length, 1),
      eveningPreference: eveningWorkouts / Math.max(workoutTimes.length, 1),
      weekdayPattern: weekdayWorkouts > weekendWorkouts ? 'efficient' : 'balanced',
      weekendPattern: weekendWorkouts > weekdayWorkouts ? 'longer' : 'consistent',
      preferredType: mostFrequentType,
      averageDuration,
      totalWorkouts: recentWorkouts.length,
      completionRate: recentSessions.filter(s => s.completedAt).length / Math.max(recentSessions.length, 1)
    };
  }

  /**
   * Calculate confidence score for recommendations (alternative implementation)
   */
  private calculateRecommendationConfidence(recentWorkouts: any, profile: any): number {
    let confidence = 0.5; // Base confidence

    // More data = higher confidence
    if (recentWorkouts.totalWorkouts >= 5) confidence += 0.2;
    if (recentWorkouts.totalWorkouts >= 10) confidence += 0.1;

    // High completion rate = higher confidence
    if (recentWorkouts.completionRate >= 0.8) confidence += 0.2;
    if (recentWorkouts.completionRate >= 0.9) confidence += 0.1;

    // Complete profile = higher confidence
    if (profile?.experience && profile?.goals?.length > 0) confidence += 0.1;
    if (profile?.equipmentAvailable?.length > 0) confidence += 0.05;

    return Math.min(confidence, 1.0);
  }

  // Helper methods for workout selection
  private selectEnergyBoostingWorkout(patterns: any): string {
    const energyWorkouts = ['HIIT', 'Cardio', 'Full Body', 'Upper Body'];
    return energyWorkouts.find(w => w === patterns.preferredType) || 'HIIT';
  }

  private selectStressReliefWorkout(patterns: any): string {
    const stressReliefWorkouts = ['Strength', 'Full Body', 'Upper Body', 'Lower Body'];
    return stressReliefWorkouts.find(w => w === patterns.preferredType) || 'Full Body';
  }

  private selectEfficientWorkout(patterns: any): string {
    const efficientWorkouts = ['Full Body', 'HIIT', 'Upper Body', 'Lower Body'];
    return efficientWorkouts.find(w => w === patterns.preferredType) || 'Full Body';
  }

  private selectQuickWorkout(patterns: any): string {
    return 'HIIT'; // HIIT is always good for quick workouts
  }

  private selectAlternativeWorkoutType(currentType: string, patterns: any): string {
    const alternatives: Record<string, string[]> = {
      'Full Body': ['Upper Body', 'Lower Body', 'HIIT'],
      'Upper Body': ['Lower Body', 'Full Body', 'Push'],
      'Lower Body': ['Upper Body', 'Full Body', 'Pull'],
      'HIIT': ['Full Body', 'Cardio', 'Core'],
      'Cardio': ['HIIT', 'Full Body', 'Core'],
      'Push': ['Pull', 'Upper Body', 'Chest'],
      'Pull': ['Push', 'Upper Body', 'Back'],
      'Chest': ['Back', 'Push', 'Upper Body'],
      'Back': ['Chest', 'Pull', 'Upper Body'],
      'Legs': ['Lower Body', 'Full Body', 'Core'],
      'Core': ['Full Body', 'HIIT', 'Lower Body']
    };

    const options = alternatives[currentType] || ['Full Body', 'Upper Body', 'Lower Body'];
    return options.find(option => option === patterns.preferredType) || options[0];
  }
}

export const frictionlessUXService = new FrictionlessUXService();
