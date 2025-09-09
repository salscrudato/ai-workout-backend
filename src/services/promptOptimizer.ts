import { WorkoutPlanModel } from '../models/WorkoutPlan';
import { WorkoutSessionModel } from '../models/WorkoutSession';

const optimizerEnabled = process.env['PROMPT_OPTIMIZER'] === 'on';
type CacheEntry = { ts: number; value: OptimizedPromptElements };
const cache = new Map<string, CacheEntry>();
const TTL_MS = 15 * 60 * 1000; // 15 minutes

interface PromptOptimizationContext {
  userId: string;
  workoutType: string;
  experience: string;
  recentSuccessRate: number;
  averageRating: number;
  commonFeedback: string[];
}

interface OptimizedPromptElements {
  focusAreas: string[];
  intensityModifiers: string[];
  exerciseSelectionBias: string[];
  programmingAdjustments: string[];
}

export class PromptOptimizer {
  /**
   * Analyze user's workout history to optimize prompt elements
   */
  async optimizePromptForUser(userId: string, workoutType: string): Promise<OptimizedPromptElements> {
    const cacheKey = `${userId}::${workoutType}`;

    // If disabled, return a no‑op set of hints without doing any DB reads
    if (!optimizerEnabled) {
      return { focusAreas: [], intensityModifiers: [], exerciseSelectionBias: [], programmingAdjustments: [] };
    }

    // Cached result?
    const now = Date.now();
    const hit = cache.get(cacheKey);
    if (hit && now - hit.ts < TTL_MS) {
      return hit.value;
    }

    const context = await this.analyzeUserContext(userId, workoutType);
    const value: OptimizedPromptElements = {
      focusAreas: this.getFocusAreas(context),
      intensityModifiers: this.getIntensityModifiers(context),
      exerciseSelectionBias: this.getExerciseSelectionBias(context),
      programmingAdjustments: this.getProgrammingAdjustments(context)
    };
    cache.set(cacheKey, { ts: now, value });
    return value;
  }

  private async analyzeUserContext(userId: string, workoutType: string): Promise<PromptOptimizationContext> {
    if (!optimizerEnabled) {
      return {
        userId,
        workoutType,
        experience: 'beginner',
        recentSuccessRate: 0,
        averageRating: 3,
        commonFeedback: []
      };
    }
    // Get recent workouts and sessions
    const recentWorkouts = await WorkoutPlanModel.find({ userId }, { limit: 10 });

    const completedSessions = await WorkoutSessionModel.find({ userId }, { limit: 20 });

    // Calculate success metrics
    const successRate = completedSessions.length > 0 ? 
      completedSessions.filter(s => s.completedAt).length / completedSessions.length : 0;

    const averageRating = completedSessions.length > 0 ?
      completedSessions
        .filter(s => s.feedback?.rating)
        .reduce((sum, s) => sum + s.feedback.rating, 0) / 
        completedSessions.filter(s => s.feedback?.rating).length : 3;

    // Extract common feedback themes
    const feedbackComments = completedSessions
      .filter(s => s.feedback?.comment)
      .map(s => s.feedback.comment);

    const commonFeedback = this.extractFeedbackThemes(feedbackComments);

    return {
      userId,
      workoutType,
      experience: recentWorkouts[0]?.preWorkout?.experience || 'beginner',
      recentSuccessRate: successRate,
      averageRating,
      commonFeedback
    };
  }

  private getFocusAreas(context: PromptOptimizationContext): string[] {
    const focusAreas: string[] = [];

    // Low success rate - focus on adherence
    if (context.recentSuccessRate < 0.6) {
      focusAreas.push('ADHERENCE PRIORITY: Design shorter, more achievable workouts to build consistency');
      focusAreas.push('MOTIVATION FOCUS: Include variety and engaging exercises to maintain interest');
    }

    // Low ratings - focus on enjoyment
    if (context.averageRating < 3.5) {
      focusAreas.push('ENJOYMENT OPTIMIZATION: Prioritize exercise variety and user preferences');
      focusAreas.push('DIFFICULTY CALIBRATION: Ensure appropriate challenge level without overwhelming');
    }

    // High success rate - can push harder
    if (context.recentSuccessRate > 0.8 && context.averageRating > 4) {
      focusAreas.push('PROGRESSION OPPORTUNITY: User is ready for increased challenge and complexity');
      focusAreas.push('ADVANCED TECHNIQUES: Consider incorporating periodization and intensity techniques');
    }

    return focusAreas;
  }

  private getIntensityModifiers(context: PromptOptimizationContext): string[] {
    const modifiers: string[] = [];

    if (context.commonFeedback.includes('too easy')) {
      modifiers.push('INTENSITY INCREASE: User feedback indicates workouts are too easy - increase challenge');
    }

    if (context.commonFeedback.includes('too hard') || context.commonFeedback.includes('difficult')) {
      modifiers.push('INTENSITY REDUCTION: User feedback indicates workouts are too challenging - moderate intensity');
    }

    if (context.recentSuccessRate < 0.5) {
      modifiers.push('CONSERVATIVE APPROACH: Low completion rate suggests need for more manageable intensity');
    }

    return modifiers;
  }

  private getExerciseSelectionBias(context: PromptOptimizationContext): string[] {
    const biases: string[] = [];

    // Analyze feedback for exercise preferences
    if (context.commonFeedback.includes('compound')) {
      biases.push('COMPOUND PREFERENCE: User shows preference for compound movements');
    }

    if (context.commonFeedback.includes('cardio') || context.commonFeedback.includes('conditioning')) {
      biases.push('CARDIO INTEGRATION: User responds well to cardiovascular components');
    }

    if (context.commonFeedback.includes('core') || context.commonFeedback.includes('abs')) {
      biases.push('CORE EMPHASIS: User values core strengthening exercises');
    }

    return biases;
  }

  private getProgrammingAdjustments(context: PromptOptimizationContext): string[] {
    const adjustments: string[] = [];

    // Beginner with high success rate - ready to progress
    if (context.experience === 'beginner' && context.recentSuccessRate > 0.75) {
      adjustments.push('PROGRESSION READINESS: Beginner showing consistency - introduce intermediate concepts');
    }

    // Advanced with low ratings - may need variety
    if (context.experience === 'advanced' && context.averageRating < 3.5) {
      adjustments.push('VARIETY INJECTION: Advanced user may need more exercise variety and novel stimuli');
    }

    return adjustments;
  }

  private extractFeedbackThemes(comments: string[]): string[] {
    const themes: string[] = [];
    if (!Array.isArray(comments) || comments.length === 0) return themes;
    const commonWords = ['easy', 'hard', 'difficult', 'fun', 'boring', 'challenging', 'compound', 'cardio', 'core', 'time'];
    
    for (const word of commonWords) {
      const count = comments.filter(comment => 
        comment.toLowerCase().includes(word)
      ).length;
      
      if (count >= 2) { // Appears in at least 2 comments
        themes.push(word);
      }
    }

    return themes;
  }

  /**
   * Generate optimization insights for prompt enhancement
   */
  generateOptimizationInsights(elements: OptimizedPromptElements): string {
    const insights: string[] = [];

    if (elements.focusAreas.length > 0) {
      insights.push('OPTIMIZATION INSIGHTS:');
      insights.push(...elements.focusAreas);
    }

    if (elements.intensityModifiers.length > 0) {
      insights.push('INTENSITY ADJUSTMENTS:');
      insights.push(...elements.intensityModifiers);
    }

    if (elements.exerciseSelectionBias.length > 0) {
      insights.push('EXERCISE SELECTION GUIDANCE:');
      insights.push(...elements.exerciseSelectionBias);
    }

    if (elements.programmingAdjustments.length > 0) {
      insights.push('PROGRAMMING MODIFICATIONS:');
      insights.push(...elements.programmingAdjustments);
    }

    return insights.length > 0 ? insights.join('\n') : '';
  }
}

export const promptOptimizer = new PromptOptimizer();
