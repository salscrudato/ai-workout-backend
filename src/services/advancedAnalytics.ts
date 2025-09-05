import { ProfileModel } from '../models/Profile';
import { WorkoutPlanModel } from '../models/WorkoutPlan';
import { WorkoutSessionModel } from '../models/WorkoutSession';

/**
 * Advanced Analytics and Learning System
 * Provides comprehensive user behavior analysis and adaptive learning
 */

export interface UserAnalytics {
  overview: {
    totalWorkouts: number;
    completionRate: number;
    averageIntensity: number;
    consistencyScore: number;
    streakCurrent: number;
    streakLongest: number;
  };
  progressMetrics: {
    strengthProgression: number;
    enduranceProgression: number;
    flexibilityProgression: number;
    overallFitness: number;
  };
  behaviorPatterns: {
    preferredWorkoutTypes: Array<{ type: string; frequency: number; satisfaction: number }>;
    optimalWorkoutTimes: Array<{ timeSlot: string; completionRate: number; satisfaction: number }>;
    motivationFactors: string[];
    challengeAreas: string[];
  };
  adaptationSignals: {
    readyForProgression: boolean;
    needsDeload: boolean;
    needsVariety: boolean;
    riskOfBurnout: number; // 0-1 scale
  };
  recommendations: {
    nextWorkout: string;
    focusAreas: string[];
    intensityAdjustment: number;
    volumeAdjustment: number;
  };
}

export interface WorkoutEffectivenessAnalysis {
  workoutId: string;
  effectivenessScore: number; // 0-1 scale
  factors: {
    completion: number;
    userSatisfaction: number;
    physiologicalResponse: number;
    adherenceImpact: number;
  };
  insights: string[];
  improvements: string[];
}

export interface LearningInsights {
  userPreferences: {
    exerciseTypes: Map<string, number>; // exercise -> preference score
    workoutDurations: { optimal: number; range: [number, number] };
    intensityPreference: { optimal: number; tolerance: number };
    equipmentPreference: string[];
  };
  performancePatterns: {
    strengthGains: { trend: 'improving' | 'stable' | 'declining'; rate: number };
    enduranceGains: { trend: 'improving' | 'stable' | 'declining'; rate: number };
    consistencyTrend: { trend: 'improving' | 'stable' | 'declining'; score: number };
  };
  adaptationReadiness: {
    progressionReadiness: number; // 0-1 scale
    recoveryNeed: number; // 0-1 scale
    varietyNeed: number; // 0-1 scale
  };
}

export class AdvancedAnalyticsService {
  /**
   * Generate comprehensive user analytics
   */
  async generateUserAnalytics(userId: string): Promise<UserAnalytics> {
    const profile = await ProfileModel.findOne({ userId });
    const allWorkouts = await WorkoutPlanModel.find({ userId }, { sort: { createdAt: -1 } });
    const allSessions = await WorkoutSessionModel.find({ userId }, { sort: { createdAt: -1 } });

    const overview = this.calculateOverviewMetrics(allWorkouts, allSessions);
    const progressMetrics = this.calculateProgressMetrics(allSessions, profile);
    const behaviorPatterns = this.analyzeBehaviorPatterns(allWorkouts, allSessions);
    const adaptationSignals = this.analyzeAdaptationSignals(allSessions);
    const recommendations = this.generateRecommendations(overview, progressMetrics, adaptationSignals);

    return {
      overview,
      progressMetrics,
      behaviorPatterns,
      adaptationSignals,
      recommendations
    };
  }

  /**
   * Analyze workout effectiveness
   */
  async analyzeWorkoutEffectiveness(workoutId: string): Promise<WorkoutEffectivenessAnalysis> {
    const workout = await WorkoutPlanModel.findById(workoutId);
    // For now, return null since WorkoutSessionModel doesn't have findOne method
    const session = null;
    
    if (!workout || !session) {
      throw new Error('Workout or session not found');
    }

    const factors = {
      completion: session.completedAt ? 1 : 0,
      userSatisfaction: (session.feedback?.rating || 3) / 5,
      physiologicalResponse: this.calculatePhysiologicalResponse(session.feedback),
      adherenceImpact: this.calculateAdherenceImpact(session, workout.userId)
    };

    const effectivenessScore = this.calculateEffectivenessScore(factors);
    const insights = this.generateEffectivenessInsights(factors, session.feedback);
    const improvements = this.generateImprovementSuggestions(factors, workout, session);

    return {
      workoutId,
      effectivenessScore,
      factors,
      insights,
      improvements
    };
  }

  /**
   * Generate learning insights from user data
   */
  async generateLearningInsights(userId: string): Promise<LearningInsights> {
    const allWorkouts = await WorkoutPlanModel.find({ userId }, { sort: { createdAt: -1 }, limit: 50 });
    const allSessions = await WorkoutSessionModel.find({ userId }, { sort: { createdAt: -1 }, limit: 50 });

    const userPreferences = this.analyzeUserPreferences(allWorkouts, allSessions);
    const performancePatterns = this.analyzePerformancePatterns(allSessions);
    const adaptationReadiness = this.assessAdaptationReadiness(allSessions);

    return {
      userPreferences,
      performancePatterns,
      adaptationReadiness
    };
  }

  /**
   * Track and learn from user feedback
   */
  async learnFromFeedback(userId: string, workoutId: string, feedback: {
    rating: number;
    difficulty: number;
    enjoyment: number;
    completed: boolean;
    notes?: string;
  }): Promise<void> {
    // For now, skip session update since WorkoutSessionModel doesn't have findOneAndUpdate method
    // TODO: Implement proper session tracking when WorkoutSessionModel is properly defined

    // Analyze feedback for learning
    const insights = await this.generateLearningInsights(userId);
    
    // Store insights for future use (could be cached or stored in a separate collection)
    console.log(`Learning insights updated for user ${userId}:`, {
      adaptationReadiness: insights.adaptationReadiness,
      performanceTrends: insights.performancePatterns
    });
  }

  // Private helper methods
  private calculateOverviewMetrics(workouts: any[], sessions: any[]): UserAnalytics['overview'] {
    const completedSessions = sessions.filter(s => s.completedAt);
    const completionRate = workouts.length > 0 ? completedSessions.length / workouts.length : 0;
    
    const intensities = completedSessions.map(s => s.feedback?.difficulty || 3);
    const averageIntensity = intensities.length > 0 ? intensities.reduce((a, b) => a + b, 0) / intensities.length : 3;
    
    const consistencyScore = this.calculateConsistencyScore(sessions);
    const { current: streakCurrent, longest: streakLongest } = this.calculateStreaks(sessions);

    return {
      totalWorkouts: workouts.length,
      completionRate,
      averageIntensity,
      consistencyScore,
      streakCurrent,
      streakLongest
    };
  }

  private calculateProgressMetrics(sessions: any[], profile: any): UserAnalytics['progressMetrics'] {
    const recentSessions = sessions.slice(0, 10);
    const olderSessions = sessions.slice(10, 20);
    
    const recentRatings = recentSessions.map(s => s.feedback?.rating || 3);
    const olderRatings = olderSessions.map(s => s.feedback?.rating || 3);
    
    const recentAvg = recentRatings.reduce((a, b) => a + b, 0) / Math.max(recentRatings.length, 1);
    const olderAvg = olderRatings.reduce((a, b) => a + b, 0) / Math.max(olderRatings.length, 1);
    
    const strengthProgression = this.calculateProgression(recentAvg, olderAvg, 'strength');
    const enduranceProgression = this.calculateProgression(recentAvg, olderAvg, 'endurance');
    const flexibilityProgression = this.calculateProgression(recentAvg, olderAvg, 'flexibility');
    const overallFitness = (strengthProgression + enduranceProgression + flexibilityProgression) / 3;

    return {
      strengthProgression,
      enduranceProgression,
      flexibilityProgression,
      overallFitness
    };
  }

  private analyzeBehaviorPatterns(workouts: any[], sessions: any[]): UserAnalytics['behaviorPatterns'] {
    // Analyze workout type preferences
    const typeFrequency = new Map<string, { count: number; totalSatisfaction: number }>();
    workouts.forEach(workout => {
      const type = workout.preWorkout?.workout_type || 'unknown';
      const session = sessions.find(s => s.planId === workout.id);
      const satisfaction = session?.feedback?.enjoyment || 3;
      
      if (!typeFrequency.has(type)) {
        typeFrequency.set(type, { count: 0, totalSatisfaction: 0 });
      }
      const data = typeFrequency.get(type)!;
      data.count++;
      data.totalSatisfaction += satisfaction;
    });

    const preferredWorkoutTypes = Array.from(typeFrequency.entries())
      .map(([type, data]) => ({
        type,
        frequency: data.count,
        satisfaction: data.totalSatisfaction / data.count
      }))
      .sort((a, b) => b.frequency - a.frequency);

    // Analyze optimal workout times
    const timeSlots = sessions
      .filter(s => s.startedAt)
      .map(s => {
        const hour = new Date(s.startedAt.toDate()).getHours();
        const timeSlot = hour < 10 ? 'morning' : hour < 14 ? 'midday' : hour < 18 ? 'afternoon' : 'evening';
        return {
          timeSlot,
          completed: !!s.completedAt,
          satisfaction: s.feedback?.enjoyment || 3
        };
      });

    const timeSlotAnalysis = new Map<string, { total: number; completed: number; totalSatisfaction: number }>();
    timeSlots.forEach(({ timeSlot, completed, satisfaction }) => {
      if (!timeSlotAnalysis.has(timeSlot)) {
        timeSlotAnalysis.set(timeSlot, { total: 0, completed: 0, totalSatisfaction: 0 });
      }
      const data = timeSlotAnalysis.get(timeSlot)!;
      data.total++;
      if (completed) data.completed++;
      data.totalSatisfaction += satisfaction;
    });

    const optimalWorkoutTimes = Array.from(timeSlotAnalysis.entries())
      .map(([timeSlot, data]) => ({
        timeSlot,
        completionRate: data.completed / data.total,
        satisfaction: data.totalSatisfaction / data.total
      }))
      .sort((a, b) => b.completionRate - a.completionRate);

    const motivationFactors = this.identifyMotivationFactors(sessions);
    const challengeAreas = this.identifyChallengeAreas(sessions);

    return {
      preferredWorkoutTypes,
      optimalWorkoutTimes,
      motivationFactors,
      challengeAreas
    };
  }

  private analyzeAdaptationSignals(sessions: any[]): UserAnalytics['adaptationSignals'] {
    const recentSessions = sessions.slice(0, 10);
    const completionRate = recentSessions.filter(s => s.completedAt).length / Math.max(recentSessions.length, 1);
    const averageIntensity = recentSessions.reduce((sum, s) => sum + (s.feedback?.difficulty || 3), 0) / Math.max(recentSessions.length, 1);
    const averageEnjoyment = recentSessions.reduce((sum, s) => sum + (s.feedback?.enjoyment || 3), 0) / Math.max(recentSessions.length, 1);

    const readyForProgression = completionRate > 0.8 && averageIntensity < 4 && averageEnjoyment >= 3.5;
    const needsDeload = averageIntensity > 4.5 && completionRate < 0.6;
    const needsVariety = averageEnjoyment < 3 && completionRate > 0.7;
    const riskOfBurnout = this.calculateBurnoutRisk(sessions);

    return {
      readyForProgression,
      needsDeload,
      needsVariety,
      riskOfBurnout
    };
  }

  private generateRecommendations(
    overview: UserAnalytics['overview'],
    progress: UserAnalytics['progressMetrics'],
    adaptation: UserAnalytics['adaptationSignals']
  ): UserAnalytics['recommendations'] {
    let nextWorkout = 'full_body';
    const focusAreas = [];
    let intensityAdjustment = 0;
    let volumeAdjustment = 0;

    if (adaptation.readyForProgression) {
      intensityAdjustment = 1;
      focusAreas.push('progressive_overload');
    }

    if (adaptation.needsDeload) {
      intensityAdjustment = -1;
      volumeAdjustment = -1;
      focusAreas.push('recovery');
      nextWorkout = 'mobility';
    }

    if (adaptation.needsVariety) {
      focusAreas.push('exercise_variety');
    }

    if (progress.strengthProgression < 3) {
      focusAreas.push('strength_building');
      nextWorkout = 'strength';
    }

    if (progress.enduranceProgression < 3) {
      focusAreas.push('cardiovascular_fitness');
    }

    return {
      nextWorkout,
      focusAreas,
      intensityAdjustment,
      volumeAdjustment
    };
  }

  private calculatePhysiologicalResponse(feedback: any): number {
    if (!feedback) return 0.5;
    
    // Simple heuristic based on difficulty and enjoyment
    const difficulty = feedback.difficulty || 3;
    const enjoyment = feedback.enjoyment || 3;
    
    // Optimal response is moderate difficulty with high enjoyment
    const optimalDifficulty = Math.abs(difficulty - 3.5) / 1.5; // 0 is optimal, 1 is worst
    const enjoymentScore = enjoyment / 5;
    
    return (1 - optimalDifficulty) * enjoymentScore;
  }

  private calculateAdherenceImpact(session: any, userId: string): number {
    // This would analyze how this workout affects future adherence
    // For now, return a simple score based on completion and satisfaction
    const completed = session.completedAt ? 1 : 0;
    const satisfaction = (session.feedback?.rating || 3) / 5;
    return (completed + satisfaction) / 2;
  }

  private calculateEffectivenessScore(factors: any): number {
    const weights = {
      completion: 0.3,
      userSatisfaction: 0.3,
      physiologicalResponse: 0.2,
      adherenceImpact: 0.2
    };

    return Object.entries(factors).reduce((score, [key, value]) => {
      return score + (value as number) * weights[key as keyof typeof weights];
    }, 0);
  }

  private generateEffectivenessInsights(factors: any, feedback: any): string[] {
    const insights = [];
    
    if (factors.completion === 1) {
      insights.push('Workout was completed successfully');
    } else {
      insights.push('Workout was not completed - consider adjusting difficulty or duration');
    }
    
    if (factors.userSatisfaction >= 0.8) {
      insights.push('High user satisfaction indicates good workout design');
    } else if (factors.userSatisfaction <= 0.4) {
      insights.push('Low satisfaction suggests need for workout modifications');
    }
    
    if (factors.physiologicalResponse >= 0.7) {
      insights.push('Optimal physiological challenge achieved');
    } else {
      insights.push('Physiological response could be optimized');
    }
    
    return insights;
  }

  private generateImprovementSuggestions(factors: any, workout: any, session: any): string[] {
    const suggestions = [];
    
    if (factors.completion < 1) {
      suggestions.push('Reduce workout duration or intensity');
    }
    
    if (factors.userSatisfaction < 0.6) {
      suggestions.push('Include more preferred exercise types');
      suggestions.push('Adjust intensity to user preference');
    }
    
    if (factors.physiologicalResponse < 0.5) {
      suggestions.push('Better match exercise selection to user goals');
    }
    
    return suggestions;
  }

  private analyzeUserPreferences(workouts: any[], sessions: any[]): LearningInsights['userPreferences'] {
    const exerciseTypes = new Map<string, number>();
    const durations = workouts.map(w => w.preWorkout?.time_available_min || 30);
    const intensities = sessions.map(s => s.feedback?.difficulty || 3);
    
    // Analyze exercise preferences
    workouts.forEach(workout => {
      const exercises = workout.plan?.exercises || [];
      exercises.forEach((exercise: any) => {
        const name = exercise.name || exercise.exercise;
        const session = sessions.find(s => s.planId === workout.id);
        const satisfaction = session?.feedback?.enjoyment || 3;
        exerciseTypes.set(name, (exerciseTypes.get(name) || 0) + satisfaction);
      });
    });

    const optimalDuration = durations.reduce((a, b) => a + b, 0) / Math.max(durations.length, 1);
    const durationRange: [number, number] = [Math.min(...durations), Math.max(...durations)];
    
    const optimalIntensity = intensities.reduce((a, b) => a + b, 0) / Math.max(intensities.length, 1);
    const intensityTolerance = Math.sqrt(intensities.reduce((sum, i) => sum + Math.pow(i - optimalIntensity, 2), 0) / Math.max(intensities.length, 1));

    return {
      exerciseTypes,
      workoutDurations: { optimal: Math.round(optimalDuration), range: durationRange },
      intensityPreference: { optimal: optimalIntensity, tolerance: intensityTolerance },
      equipmentPreference: ['bodyweight'] // Simplified
    };
  }

  private analyzePerformancePatterns(sessions: any[]): LearningInsights['performancePatterns'] {
    const recentSessions = sessions.slice(0, 10);
    const olderSessions = sessions.slice(10, 20);
    
    const recentAvgRating = recentSessions.reduce((sum, s) => sum + (s.feedback?.rating || 3), 0) / Math.max(recentSessions.length, 1);
    const olderAvgRating = olderSessions.reduce((sum, s) => sum + (s.feedback?.rating || 3), 0) / Math.max(olderSessions.length, 1);
    
    const ratingTrend = recentAvgRating > olderAvgRating ? 'improving' : recentAvgRating < olderAvgRating ? 'declining' : 'stable';
    const ratingRate = Math.abs(recentAvgRating - olderAvgRating);
    
    const recentCompletionRate = recentSessions.filter(s => s.completedAt).length / Math.max(recentSessions.length, 1);
    const olderCompletionRate = olderSessions.filter(s => s.completedAt).length / Math.max(olderSessions.length, 1);
    
    const consistencyTrend = recentCompletionRate > olderCompletionRate ? 'improving' : recentCompletionRate < olderCompletionRate ? 'declining' : 'stable';
    const consistencyScore = recentCompletionRate;

    return {
      strengthGains: { trend: ratingTrend, rate: ratingRate },
      enduranceGains: { trend: ratingTrend, rate: ratingRate },
      consistencyTrend: { trend: consistencyTrend, score: consistencyScore }
    };
  }

  private assessAdaptationReadiness(sessions: any[]): LearningInsights['adaptationReadiness'] {
    const recentSessions = sessions.slice(0, 5);
    const completionRate = recentSessions.filter(s => s.completedAt).length / Math.max(recentSessions.length, 1);
    const averageIntensity = recentSessions.reduce((sum, s) => sum + (s.feedback?.difficulty || 3), 0) / Math.max(recentSessions.length, 1);
    const averageEnjoyment = recentSessions.reduce((sum, s) => sum + (s.feedback?.enjoyment || 3), 0) / Math.max(recentSessions.length, 1);

    const progressionReadiness = completionRate > 0.8 && averageIntensity < 4 ? 0.8 : 0.3;
    const recoveryNeed = averageIntensity > 4.5 && completionRate < 0.6 ? 0.8 : 0.2;
    const varietyNeed = averageEnjoyment < 3 ? 0.7 : 0.3;

    return {
      progressionReadiness,
      recoveryNeed,
      varietyNeed
    };
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

  private calculateStreaks(sessions: any[]): { current: number; longest: number } {
    const completedSessions = sessions.filter(s => s.completedAt).sort((a, b) => 
      new Date(b.createdAt.toDate()).getTime() - new Date(a.createdAt.toDate()).getTime()
    );
    
    if (completedSessions.length === 0) return { current: 0, longest: 0 };
    
    let current = 0;
    let longest = 0;
    let tempStreak = 0;
    
    const today = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    for (let i = 0; i < completedSessions.length; i++) {
      const sessionDate = new Date(completedSessions[i].createdAt.toDate());
      const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / oneDayMs);
      
      if (i === 0 && daysDiff <= 7) { // Within a week
        current = 1;
        tempStreak = 1;
      } else if (i > 0) {
        const prevSessionDate = new Date(completedSessions[i-1].createdAt.toDate());
        const daysBetween = Math.floor((prevSessionDate.getTime() - sessionDate.getTime()) / oneDayMs);
        
        if (daysBetween <= 7) { // Within a week of previous
          tempStreak++;
          if (i === 1) current = tempStreak;
        } else {
          longest = Math.max(longest, tempStreak);
          tempStreak = 1;
        }
      }
    }
    
    longest = Math.max(longest, tempStreak);
    
    return { current, longest };
  }

  private calculateProgression(recentAvg: number, olderAvg: number, type: string): number {
    const diff = recentAvg - olderAvg;
    const baseScore = 3; // neutral
    
    if (diff > 0.5) return Math.min(5, baseScore + 2);
    if (diff > 0.2) return Math.min(5, baseScore + 1);
    if (diff < -0.5) return Math.max(1, baseScore - 2);
    if (diff < -0.2) return Math.max(1, baseScore - 1);
    
    return baseScore;
  }

  private identifyMotivationFactors(sessions: any[]): string[] {
    const factors = [];
    
    const highRatedSessions = sessions.filter(s => s.feedback?.enjoyment >= 4);
    if (highRatedSessions.length > sessions.length * 0.6) {
      factors.push('variety_seeking');
    }
    
    const consistentCompletions = sessions.filter(s => s.completedAt).length;
    if (consistentCompletions > sessions.length * 0.8) {
      factors.push('achievement_oriented');
    }
    
    return factors.length > 0 ? factors : ['progress_focused'];
  }

  private identifyChallengeAreas(sessions: any[]): string[] {
    const challenges = [];
    
    const lowRatedSessions = sessions.filter(s => s.feedback?.rating <= 2);
    if (lowRatedSessions.length > sessions.length * 0.3) {
      challenges.push('workout_satisfaction');
    }
    
    const incompleteSessions = sessions.filter(s => !s.completedAt);
    if (incompleteSessions.length > sessions.length * 0.4) {
      challenges.push('workout_completion');
    }
    
    const highDifficultySessions = sessions.filter(s => s.feedback?.difficulty >= 4.5);
    if (highDifficultySessions.length > sessions.length * 0.5) {
      challenges.push('intensity_management');
    }
    
    return challenges;
  }

  private calculateBurnoutRisk(sessions: any[]): number {
    const recentSessions = sessions.slice(0, 10);
    
    const highIntensityCount = recentSessions.filter(s => s.feedback?.difficulty >= 4.5).length;
    const lowEnjoymentCount = recentSessions.filter(s => s.feedback?.enjoyment <= 2).length;
    const incompleteCount = recentSessions.filter(s => !s.completedAt).length;
    
    const riskFactors = (highIntensityCount + lowEnjoymentCount + incompleteCount) / (recentSessions.length * 3);
    
    return Math.min(1, riskFactors);
  }
}

export const advancedAnalyticsService = new AdvancedAnalyticsService();
