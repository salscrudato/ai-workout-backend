import pino from 'pino';
import { WorkoutPlanModel } from '../models/WorkoutPlan';
import { WorkoutSessionModel } from '../models/WorkoutSession';
import { ProfileModel } from '../models/Profile';

// Create logger wrapper that accepts any parameters
const baseLogger = pino({
  name: 'unified-prompt-service',
  level: process.env['NODE_ENV'] === 'development' ? 'debug' : 'info'
});

const logger = {
  info: (msg: string, obj?: any) => baseLogger.info(obj || {}, msg),
  error: (msg: string, obj?: any) => baseLogger.error(obj || {}, msg),
  warn: (msg: string, obj?: any) => baseLogger.warn(obj || {}, msg),
  debug: (msg: string, obj?: any) => baseLogger.debug(obj || {}, msg),
};

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface PromptContext {
  userId: string;
  experience: string;
  workoutType: string;
  timeAvailable: number;
  goals: string[];
  equipment: string[];
  constraints?: string;
  userHistory?: any[];
  preferences?: any;
}

interface OptimizedPromptElements {
  focusAreas: string[];
  intensityModifiers: string[];
  exerciseSelectionBias: string[];
  programmingAdjustments: string[];
}

interface PromptOptimizationContext {
  userId: string;
  workoutType: string;
  experience: string;
  recentSuccessRate: number;
  averageRating: number;
  commonFeedback: string[];
}

// Removed unused interfaces for codebase simplification

/**
 * Configuration for prompt service features
 */
interface PromptServiceConfig {
  enableOptimization: boolean;
  enableAnalytics: boolean;
  enableVersioning: boolean;
  cacheEnabled: boolean;
  cacheTTL: number;
}

/**
 * Unified Prompt Service
 * Consolidates prompt building, optimization, analytics, and versioning
 */
export class UnifiedPromptService {
  private config: PromptServiceConfig;
  private cache = new Map<string, { ts: number; value: any }>();
  private readonly TTL_MS = 15 * 60 * 1000; // 15 minutes

  constructor(config: Partial<PromptServiceConfig> = {}) {
    this.config = {
      enableOptimization: config.enableOptimization ?? (process.env['PROMPT_OPTIMIZER'] === 'on'),
      enableAnalytics: config.enableAnalytics ?? (process.env['ANALYTICS_MODE'] === 'on'),
      enableVersioning: config.enableVersioning ?? false, // Disabled by default
      cacheEnabled: config.cacheEnabled ?? true,
      cacheTTL: config.cacheTTL ?? this.TTL_MS
    };

    logger.info('Unified prompt service initialized', {
      optimization: this.config.enableOptimization,
      analytics: this.config.enableAnalytics,
      versioning: this.config.enableVersioning,
      cache: this.config.cacheEnabled
    });
  }

  // =============================================================================
  // CORE PROMPT BUILDING (Always Available)
  // =============================================================================

  /**
   * Build personalized workout prompt based on user data and history
   */
  async buildWorkoutPrompt(userId: string, preWorkout: any): Promise<{ prompt: string; variant: any }> {
    const startTime = Date.now();
    
    try {
      // Get user profile and history for personalization
      const [profile, recentWorkouts] = await Promise.all([
        ProfileModel.findByUserId(userId).catch(() => null),
        WorkoutPlanModel.findById('dummy').then(() => []).catch(() => [])
      ]);

      const context: PromptContext = {
        userId,
        experience: preWorkout.experience || 'beginner',
        workoutType: preWorkout.workout_type || 'strength',
        timeAvailable: preWorkout.time_available_min || 30,
        goals: Array.isArray(preWorkout.goals) ? preWorkout.goals : ['general_fitness'],
        equipment: Array.isArray(preWorkout.equipment_override) ? preWorkout.equipment_override : ['bodyweight'],
        constraints: preWorkout.new_injuries || preWorkout.injury_notes,
        userHistory: recentWorkouts,
        preferences: profile
      };

      // Apply optimization if enabled
      let optimizedElements: OptimizedPromptElements | null = null;
      if (this.config.enableOptimization) {
        optimizedElements = await this.optimizePromptForUser(userId, context.workoutType);
      }

      const prompt = this.buildPersonalizedPrompt(context, optimizedElements);
      
      logger.debug('Prompt built successfully', {
        userId,
        promptLength: prompt.length,
        buildTime: Date.now() - startTime,
        optimized: !!optimizedElements
      });

      return { prompt, variant: null };
    } catch (error) {
      logger.error('Failed to build workout prompt', { userId, error: (error as Error).message });
      
      // Fallback to basic prompt
      return this.buildBasicPrompt(preWorkout);
    }
  }

  /**
   * Build a personalized prompt with user context
   */
  private buildPersonalizedPrompt(context: PromptContext, optimizedElements?: OptimizedPromptElements | null): string {
    const {
      experience,
      workoutType,
      timeAvailable,
      goals,
      equipment,
      constraints,
      userHistory
    } = context;

    // Build equipment list
    const equipmentList = equipment.length > 0 ? equipment.join(', ') : 'bodyweight only';
    
    // Build goals list
    const goalsList = goals.length > 0 ? goals.join(', ') : 'general fitness';
    
    // Add history context if available
    let historyContext = '';
    if (userHistory && userHistory.length > 0) {
      historyContext = `\nRecent workout history: User has completed ${userHistory.length} workouts recently. Focus on progression and variety.`;
    }

    // Add constraints if any
    let constraintsContext = '';
    if (constraints) {
      constraintsContext = `\nImportant constraints/injuries: ${constraints}. Please modify exercises accordingly for safety.`;
    }

    // Get experience-specific set/rep guidelines
    const setRepGuidelines = this.getSetRepGuidelines(experience);

    // Get workout-type-specific instructions
    const workoutTypeInstructions = this.getWorkoutTypeInstructions(workoutType);

    // Add optimization insights if available
    let optimizationContext = '';
    if (optimizedElements) {
      optimizationContext = this.generateOptimizationInsights(optimizedElements);
    }

    return `Create a ${timeAvailable}-minute ${workoutType} workout for a ${experience} level user.

Context:
- Experience: ${experience}
- Goals: ${goalsList}
- Equipment available: ${equipmentList}
- Duration: ${timeAvailable} minutes${constraintsContext}${historyContext}

CRITICAL REQUIREMENTS FOR SETS:
1. Each main exercise MUST have 2-5 sets in the "sets" array
2. NEVER create single-set workouts for main exercises - this is a critical error
3. ${setRepGuidelines}
4. Include proper rest periods between sets (30-90 seconds)
5. Respect the provided duration budget

${workoutTypeInstructions}

${optimizationContext}

Focus on creating a safe, effective, and engaging workout that matches the user's experience level and goals.`;
  }

  /**
   * Build a basic fallback prompt when personalization fails
   */
  private buildBasicPrompt(preWorkout: any): { prompt: string; variant: any } {
    const goals = Array.isArray(preWorkout.goals) && preWorkout.goals.length
      ? preWorkout.goals.join(', ')
      : 'general_fitness';
    const equipment = Array.isArray(preWorkout.equipment_override) && preWorkout.equipment_override.length
      ? preWorkout.equipment_override.join(', ')
      : 'bodyweight only';
    const constraints = preWorkout.new_injuries ? String(preWorkout.new_injuries) : '';
    const experience = preWorkout.experience || 'beginner';
    const timeAvailable = preWorkout.time_available_min || 30;

    const setRepGuidelines = this.getSetRepGuidelines(experience);

    const prompt = `Create a ${timeAvailable}-minute workout for a ${experience} level user.

Context:
- Experience: ${experience}
- Workout type: ${preWorkout.workout_type || 'strength'}
- Duration: ${timeAvailable} minutes
- Goals: ${goals}
- Equipment available: ${equipment}${constraints ? `\n- Constraints/Injuries: ${constraints}` : ''}

CRITICAL REQUIREMENTS:
1. Each exercise MUST have multiple sets (minimum 2-4 sets per exercise)
2. NEVER create single-set workouts - this is a critical error
3. ${setRepGuidelines}
4. Include proper rest periods between sets (30-90 seconds)
5. Respect the provided duration budget
6. Choose safe, common movements available with the listed equipment
7. Use progressive overload appropriate for ${experience}
8. Include warm-up and cool-down phases

Focus on creating a safe, effective workout that matches the user's experience level.`;

    return { prompt, variant: null };
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  private getSetRepGuidelines(experience: string): string {
    switch (experience.toLowerCase()) {
      case 'beginner':
        return 'For beginners: 2-3 sets of 8-12 reps with lighter weights, focus on form';
      case 'intermediate':
        return 'For intermediate: 3-4 sets of 6-12 reps with moderate to heavy weights';
      case 'advanced':
        return 'For advanced: 3-5 sets of 4-12 reps with heavy weights, advanced techniques allowed';
      default:
        return 'Use 2-4 sets of 8-12 reps with appropriate weight progression';
    }
  }

  private getWorkoutTypeInstructions(workoutType: string): string {
    switch (workoutType.toLowerCase()) {
      case 'strength':
        return 'STRENGTH FOCUS: Emphasize compound movements, progressive overload, and adequate rest between sets.';
      case 'cardio':
        return 'CARDIO FOCUS: Include high-intensity intervals, circuit training, and minimal rest between exercises.';
      case 'flexibility':
        return 'FLEXIBILITY FOCUS: Include dynamic warm-up, static stretches, and mobility work.';
      case 'hiit':
        return 'HIIT FOCUS: Alternate between high-intensity work periods and short rest periods.';
      default:
        return 'BALANCED APPROACH: Combine strength, cardio, and flexibility elements appropriately.';
    }
  }

  private generateOptimizationInsights(elements: OptimizedPromptElements): string {
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

    return insights.length > 0 ? `\n${insights.join('\n')}\n` : '';
  }

  // =============================================================================
  // PROMPT OPTIMIZATION (Optional Feature)
  // =============================================================================

  /**
   * Analyze user's workout history to optimize prompt elements
   */
  private async optimizePromptForUser(userId: string, workoutType: string): Promise<OptimizedPromptElements> {
    const cacheKey = `${userId}::${workoutType}`;

    // If disabled, return empty optimization
    if (!this.config.enableOptimization) {
      return { focusAreas: [], intensityModifiers: [], exerciseSelectionBias: [], programmingAdjustments: [] };
    }

    // Check cache
    if (this.config.cacheEnabled) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.ts < this.config.cacheTTL) {
        return cached.value;
      }
    }

    try {
      const context = await this.analyzeUserContext(userId, workoutType);
      const value: OptimizedPromptElements = {
        focusAreas: this.getFocusAreas(context),
        intensityModifiers: this.getIntensityModifiers(context),
        exerciseSelectionBias: this.getExerciseSelectionBias(context),
        programmingAdjustments: this.getProgrammingAdjustments(context)
      };

      if (this.config.cacheEnabled) {
        this.cache.set(cacheKey, { ts: Date.now(), value });
      }

      return value;
    } catch (error) {
      logger.error('Failed to optimize prompt', { userId, workoutType, error: (error as Error).message });
      return { focusAreas: [], intensityModifiers: [], exerciseSelectionBias: [], programmingAdjustments: [] };
    }
  }

  private async analyzeUserContext(userId: string, workoutType: string): Promise<PromptOptimizationContext> {
    // Get recent workouts and sessions
    const [recentWorkouts, completedSessions] = await Promise.all([
      WorkoutPlanModel.find({ userId }, { limit: 10 }).catch(() => []),
      WorkoutSessionModel.find({ userId }, { limit: 20 }).catch(() => [])
    ]);

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

    // High success rate - focus on progression
    if (context.recentSuccessRate > 0.8) {
      focusAreas.push('PROGRESSION FOCUS: User is consistent, emphasize progressive overload and advancement');
    }

    return focusAreas;
  }

  private getIntensityModifiers(context: PromptOptimizationContext): string[] {
    const modifiers: string[] = [];

    if (context.recentSuccessRate < 0.5) {
      modifiers.push('REDUCE INTENSITY: Lower workout intensity to improve completion rates');
    } else if (context.recentSuccessRate > 0.8 && context.averageRating > 4) {
      modifiers.push('INCREASE CHALLENGE: User is ready for more challenging workouts');
    }

    return modifiers;
  }

  private getExerciseSelectionBias(context: PromptOptimizationContext): string[] {
    const bias: string[] = [];

    if (context.commonFeedback.includes('boring') || context.commonFeedback.includes('repetitive')) {
      bias.push('VARIETY EMPHASIS: Prioritize exercise variety and novel movement patterns');
    }

    if (context.commonFeedback.includes('difficult') || context.commonFeedback.includes('hard')) {
      bias.push('ACCESSIBILITY FOCUS: Choose more accessible exercise variations');
    }

    return bias;
  }

  private getProgrammingAdjustments(context: PromptOptimizationContext): string[] {
    const adjustments: string[] = [];

    if (context.recentSuccessRate < 0.6) {
      adjustments.push('SHORTER SESSIONS: Reduce workout duration to improve completion');
      adjustments.push('FEWER EXERCISES: Limit number of exercises to prevent overwhelm');
    }

    return adjustments;
  }

  private extractFeedbackThemes(comments: string[]): string[] {
    const themes: string[] = [];
    const commonWords = ['boring', 'repetitive', 'difficult', 'hard', 'easy', 'fun', 'challenging'];

    for (const word of commonWords) {
      if (comments.some(comment => comment.toLowerCase().includes(word))) {
        themes.push(word);
      }
    }

    return themes;
  }
}

// Export singleton instance
export const unifiedPromptService = new UnifiedPromptService();

// Backward compatibility exports
export const buildWorkoutPrompt = unifiedPromptService.buildWorkoutPrompt.bind(unifiedPromptService);
export const promptAnalytics = {
  analyzePromptPerformance: async () => [] // Simplified for now
};
