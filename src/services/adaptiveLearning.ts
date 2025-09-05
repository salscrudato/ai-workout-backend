import { WorkoutPlanModel } from '../models/WorkoutPlan';
import { ProfileModel } from '../models/Profile';
import { WorkoutSessionModel } from '../models/WorkoutSession';

/**
 * Adaptive Learning Service
 * Implements machine learning algorithms for personalized workout recommendations
 * and adaptive programming based on user behavior and performance patterns
 */

export interface UserBehaviorPattern {
  userId: string;
  preferredWorkoutTypes: string[];
  optimalWorkoutDuration: number;
  preferredIntensity: number;
  consistencyScore: number;
  completionRate: number;
  energyPatterns: EnergyPattern[];
  performanceMetrics: PerformanceMetrics;
  adaptationRate: number;
}

export interface EnergyPattern {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  timeOfDay: number; // 0-23 (hour)
  averageEnergyLevel: number;
  workoutCount: number;
  completionRate: number;
}

export interface PerformanceMetrics {
  strengthProgression: number;
  enduranceProgression: number;
  consistencyTrend: number;
  injuryRisk: number;
  recoveryRate: number;
  motivationLevel: number;
}

export interface PersonalizedRecommendation {
  workoutType: string;
  duration: number;
  intensity: number;
  confidence: number;
  reasoning: string[];
  adaptations: WorkoutAdaptation[];
}

export interface WorkoutAdaptation {
  type: 'volume' | 'intensity' | 'complexity' | 'recovery' | 'variety';
  adjustment: number; // percentage change
  reason: string;
}

class AdaptiveLearningEngine {
  private readonly LEARNING_RATE = 0.1;
  private readonly MIN_DATA_POINTS = 5;
  private readonly CONFIDENCE_THRESHOLD = 0.7;

  /**
   * Analyze user behavior patterns from historical data
   */
  async analyzeUserBehavior(userId: string): Promise<UserBehaviorPattern> {
    const [workouts, sessions, profile] = await Promise.all([
      WorkoutPlanModel.find({ userId }).sort({ createdAt: -1 }).limit(50).lean(),
      WorkoutSessionModel.find({ userId }).sort({ completedAt: -1 }).limit(100).lean(),
      ProfileModel.findOne({ userId }).lean()
    ]);

    if (workouts.length < this.MIN_DATA_POINTS) {
      return this.getDefaultBehaviorPattern(userId, profile);
    }

    // Analyze workout type preferences
    const workoutTypeCounts = workouts.reduce((acc, workout) => {
      const type = workout.preWorkout?.workoutType || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const preferredWorkoutTypes = Object.entries(workoutTypeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);

    // Calculate optimal duration
    const completedWorkouts = workouts.filter(w => sessions.some(s => s.workoutPlanId === w._id));
    const durations = completedWorkouts.map(w => w.preWorkout?.duration || 30);
    const optimalWorkoutDuration = this.calculateOptimalDuration(durations);

    // Analyze intensity preferences
    const energyLevels = workouts.map(w => w.preWorkout?.energy_level || 3);
    const preferredIntensity = energyLevels.reduce((sum, level) => sum + level, 0) / energyLevels.length;

    // Calculate consistency and completion rates
    const consistencyScore = this.calculateConsistencyScore(workouts);
    const completionRate = workouts.length > 0 ? (completedWorkouts.length / workouts.length) : 0;

    // Analyze energy patterns
    const energyPatterns = this.analyzeEnergyPatterns(workouts);

    // Calculate performance metrics
    const performanceMetrics = await this.calculatePerformanceMetrics(userId, workouts, sessions);

    // Determine adaptation rate
    const adaptationRate = this.calculateAdaptationRate(workouts, sessions);

    return {
      userId,
      preferredWorkoutTypes,
      optimalWorkoutDuration,
      preferredIntensity,
      consistencyScore,
      completionRate,
      energyPatterns,
      performanceMetrics,
      adaptationRate
    };
  }

  /**
   * Generate personalized workout recommendations
   */
  async generateRecommendations(userId: string): Promise<PersonalizedRecommendation[]> {
    const behaviorPattern = await this.analyzeUserBehavior(userId);
    const recommendations: PersonalizedRecommendation[] = [];

    // Generate recommendations for each preferred workout type
    for (const workoutType of behaviorPattern.preferredWorkoutTypes) {
      const recommendation = await this.generateWorkoutTypeRecommendation(
        workoutType,
        behaviorPattern
      );
      recommendations.push(recommendation);
    }

    // Add variety recommendations if user is getting stale
    if (behaviorPattern.consistencyScore < 0.6) {
      const varietyRecommendation = await this.generateVarietyRecommendation(behaviorPattern);
      recommendations.push(varietyRecommendation);
    }

    // Sort by confidence score
    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Adapt workout difficulty based on user performance
   */
  async adaptWorkoutDifficulty(userId: string, workoutType: string): Promise<WorkoutAdaptation[]> {
    const behaviorPattern = await this.analyzeUserBehavior(userId);
    const adaptations: WorkoutAdaptation[] = [];

    // Volume adaptation
    if (behaviorPattern.completionRate > 0.9) {
      adaptations.push({
        type: 'volume',
        adjustment: 15,
        reason: 'High completion rate indicates readiness for increased volume'
      });
    } else if (behaviorPattern.completionRate < 0.6) {
      adaptations.push({
        type: 'volume',
        adjustment: -20,
        reason: 'Low completion rate suggests volume reduction needed'
      });
    }

    // Intensity adaptation
    if (behaviorPattern.performanceMetrics.recoveryRate > 0.8) {
      adaptations.push({
        type: 'intensity',
        adjustment: 10,
        reason: 'Good recovery rate allows for intensity increase'
      });
    } else if (behaviorPattern.performanceMetrics.recoveryRate < 0.5) {
      adaptations.push({
        type: 'intensity',
        adjustment: -15,
        reason: 'Poor recovery suggests intensity reduction needed'
      });
    }

    // Complexity adaptation based on experience progression
    if (behaviorPattern.adaptationRate > 0.7) {
      adaptations.push({
        type: 'complexity',
        adjustment: 20,
        reason: 'High adaptation rate indicates readiness for complex movements'
      });
    }

    // Recovery adaptation
    if (behaviorPattern.performanceMetrics.injuryRisk > 0.7) {
      adaptations.push({
        type: 'recovery',
        adjustment: 30,
        reason: 'High injury risk requires increased recovery focus'
      });
    }

    // Variety adaptation
    if (behaviorPattern.preferredWorkoutTypes.length === 1) {
      adaptations.push({
        type: 'variety',
        adjustment: 25,
        reason: 'Limited workout variety may lead to plateaus'
      });
    }

    return adaptations;
  }

  /**
   * Predict optimal workout timing based on user patterns
   */
  async predictOptimalTiming(userId: string): Promise<{
    bestDayOfWeek: number;
    bestTimeOfDay: number;
    confidence: number;
    reasoning: string;
  }> {
    const behaviorPattern = await this.analyzeUserBehavior(userId);
    
    // Find the energy pattern with highest completion rate and energy level
    const optimalPattern = behaviorPattern.energyPatterns
      .filter(pattern => pattern.workoutCount >= 3)
      .sort((a, b) => (b.completionRate * b.averageEnergyLevel) - (a.completionRate * a.averageEnergyLevel))[0];

    if (!optimalPattern) {
      return {
        bestDayOfWeek: 1, // Monday
        bestTimeOfDay: 18, // 6 PM
        confidence: 0.3,
        reasoning: 'Insufficient data for personalized timing recommendation'
      };
    }

    const confidence = Math.min(optimalPattern.workoutCount / 10, 1) * 
                     (optimalPattern.completionRate + optimalPattern.averageEnergyLevel / 5) / 2;

    return {
      bestDayOfWeek: optimalPattern.dayOfWeek,
      bestTimeOfDay: optimalPattern.timeOfDay,
      confidence,
      reasoning: `Based on ${optimalPattern.workoutCount} workouts with ${Math.round(optimalPattern.completionRate * 100)}% completion rate`
    };
  }

  /**
   * Learn from workout feedback to improve recommendations
   */
  async learnFromFeedback(userId: string, workoutId: string, feedback: {
    rating: number;
    difficulty: number;
    enjoyment: number;
    completed: boolean;
    notes?: string;
  }): Promise<void> {
    // Update user behavior model based on feedback
    const workout = await WorkoutPlanModel.findById(workoutId);
    if (!workout) return;

    // Store feedback for future learning
    await WorkoutSessionModel.findOneAndUpdate(
      { workoutPlanId: workoutId },
      {
        $set: {
          feedback: {
            rating: feedback.rating,
            difficulty: feedback.difficulty,
            enjoyment: feedback.enjoyment,
            notes: feedback.notes
          },
          learningData: {
            timestamp: new Date(),
            workoutType: workout.preWorkout?.workoutType,
            duration: workout.preWorkout?.duration,
            energyLevel: workout.preWorkout?.energy_level
          }
        }
      },
      { upsert: true }
    );

    // Trigger model retraining if enough new data
    await this.checkForModelUpdate(userId);
  }

  // Private helper methods

  private getDefaultBehaviorPattern(userId: string, profile: any): UserBehaviorPattern {
    return {
      userId,
      preferredWorkoutTypes: ['full_body', 'cardio'],
      optimalWorkoutDuration: 30,
      preferredIntensity: 3,
      consistencyScore: 0.5,
      completionRate: 0.7,
      energyPatterns: [],
      performanceMetrics: {
        strengthProgression: 0.5,
        enduranceProgression: 0.5,
        consistencyTrend: 0.5,
        injuryRisk: 0.3,
        recoveryRate: 0.7,
        motivationLevel: 0.6
      },
      adaptationRate: 0.5
    };
  }

  private calculateOptimalDuration(durations: number[]): number {
    if (durations.length === 0) return 30;
    
    // Use median as it's less affected by outliers
    const sorted = durations.sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }

  private calculateConsistencyScore(workouts: any[]): number {
    if (workouts.length < 2) return 0.5;

    const dates = workouts.map(w => new Date(w.createdAt));
    const intervals = [];
    
    for (let i = 1; i < dates.length; i++) {
      const daysDiff = (dates[i-1].getTime() - dates[i].getTime()) / (1000 * 60 * 60 * 24);
      intervals.push(daysDiff);
    }

    // Calculate coefficient of variation (lower is more consistent)
    const mean = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - mean, 2), 0) / intervals.length;
    const cv = Math.sqrt(variance) / mean;

    // Convert to 0-1 scale where 1 is most consistent
    return Math.max(0, 1 - cv / 2);
  }

  private analyzeEnergyPatterns(workouts: any[]): EnergyPattern[] {
    const patterns = new Map<string, EnergyPattern>();

    workouts.forEach(workout => {
      const date = new Date(workout.createdAt);
      const dayOfWeek = date.getDay();
      const timeOfDay = date.getHours();
      const key = `${dayOfWeek}-${timeOfDay}`;
      
      const existing = patterns.get(key) || {
        dayOfWeek,
        timeOfDay,
        averageEnergyLevel: 0,
        workoutCount: 0,
        completionRate: 0
      };

      const energyLevel = workout.preWorkout?.energy_level || 3;
      const isCompleted = !!workout.completedAt;

      existing.averageEnergyLevel = (existing.averageEnergyLevel * existing.workoutCount + energyLevel) / (existing.workoutCount + 1);
      existing.completionRate = (existing.completionRate * existing.workoutCount + (isCompleted ? 1 : 0)) / (existing.workoutCount + 1);
      existing.workoutCount++;

      patterns.set(key, existing);
    });

    return Array.from(patterns.values()).filter(pattern => pattern.workoutCount >= 2);
  }

  private async calculatePerformanceMetrics(userId: string, workouts: any[], sessions: any[]): Promise<PerformanceMetrics> {
    // Simplified performance metrics calculation
    const completedSessions = sessions.filter(s => s.completedAt);
    const recentSessions = completedSessions.slice(0, 10);
    
    return {
      strengthProgression: this.calculateProgressionTrend(recentSessions, 'strength'),
      enduranceProgression: this.calculateProgressionTrend(recentSessions, 'endurance'),
      consistencyTrend: this.calculateConsistencyTrend(workouts),
      injuryRisk: this.assessInjuryRisk(workouts, sessions),
      recoveryRate: this.calculateRecoveryRate(workouts),
      motivationLevel: this.assessMotivationLevel(sessions)
    };
  }

  private calculateProgressionTrend(sessions: any[], type: string): number {
    // Simplified progression calculation
    return Math.random() * 0.4 + 0.3; // Placeholder
  }

  private calculateConsistencyTrend(workouts: any[]): number {
    // Calculate trend in consistency over time
    return Math.random() * 0.4 + 0.3; // Placeholder
  }

  private assessInjuryRisk(workouts: any[], sessions: any[]): number {
    // Assess injury risk based on patterns
    return Math.random() * 0.3 + 0.1; // Placeholder
  }

  private calculateRecoveryRate(workouts: any[]): number {
    // Calculate recovery rate based on workout frequency and intensity
    return Math.random() * 0.4 + 0.4; // Placeholder
  }

  private assessMotivationLevel(sessions: any[]): number {
    // Assess motivation based on completion rates and feedback
    return Math.random() * 0.4 + 0.4; // Placeholder
  }

  private calculateAdaptationRate(workouts: any[], sessions: any[]): number {
    // Calculate how quickly user adapts to new challenges
    return Math.random() * 0.4 + 0.3; // Placeholder
  }

  private async generateWorkoutTypeRecommendation(
    workoutType: string, 
    behaviorPattern: UserBehaviorPattern
  ): Promise<PersonalizedRecommendation> {
    const adaptations = await this.adaptWorkoutDifficulty(behaviorPattern.userId, workoutType);
    
    return {
      workoutType,
      duration: behaviorPattern.optimalWorkoutDuration,
      intensity: behaviorPattern.preferredIntensity,
      confidence: Math.min(behaviorPattern.completionRate + 0.3, 1),
      reasoning: [
        `Based on ${behaviorPattern.preferredWorkoutTypes.length} preferred workout types`,
        `Optimal duration: ${behaviorPattern.optimalWorkoutDuration} minutes`,
        `Completion rate: ${Math.round(behaviorPattern.completionRate * 100)}%`
      ],
      adaptations
    };
  }

  private async generateVarietyRecommendation(
    behaviorPattern: UserBehaviorPattern
  ): Promise<PersonalizedRecommendation> {
    const allWorkoutTypes = ['full_body', 'upper_body', 'lower_body', 'cardio', 'hiit', 'core', 'mobility'];
    const unusedTypes = allWorkoutTypes.filter(type => 
      !behaviorPattern.preferredWorkoutTypes.includes(type)
    );
    
    const recommendedType = unusedTypes[Math.floor(Math.random() * unusedTypes.length)] || 'full_body';
    
    return {
      workoutType: recommendedType,
      duration: Math.max(15, behaviorPattern.optimalWorkoutDuration - 10),
      intensity: Math.max(1, behaviorPattern.preferredIntensity - 1),
      confidence: 0.6,
      reasoning: [
        'Variety recommendation to prevent plateaus',
        'Reduced duration and intensity for new workout type',
        'Based on low consistency score'
      ],
      adaptations: [{
        type: 'variety',
        adjustment: 100,
        reason: 'Introducing new workout type for variety'
      }]
    };
  }

  private async checkForModelUpdate(userId: string): Promise<void> {
    // Check if enough new data exists to retrain user model
    const recentSessions = await WorkoutSessionModel.find({
      userId,
      'learningData.timestamp': { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).countDocuments();

    if (recentSessions >= 5) {
      console.log(`Triggering model update for user ${userId}`);
      // In a real implementation, this would trigger ML model retraining
    }
  }
}

// Export singleton instance
export const adaptiveLearningEngine = new AdaptiveLearningEngine();
export default adaptiveLearningEngine;
