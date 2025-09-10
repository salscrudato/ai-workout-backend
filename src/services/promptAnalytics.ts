import { WorkoutPlanModel } from '../models/WorkoutPlan';
import { WorkoutSessionModel } from '../models/WorkoutSession';

interface PromptPerformanceMetrics {
  promptVersion: string;
  totalGenerations: number;
  completionRate: number;
  averageRating: number;
  averageGenerationTime: number;
  commonIssues: string[];
  successFactors: string[];
}

interface PromptOptimizationSuggestion {
  category: 'structure' | 'content' | 'parameters' | 'personalization';
  priority: 'high' | 'medium' | 'low';
  suggestion: string;
  expectedImpact: string;
  implementationComplexity: 'low' | 'medium' | 'high';
}

export class PromptAnalytics {
  /**
   * Analyze prompt performance across different versions
   */
  async analyzePromptPerformance(_promptVersion?: string): Promise<PromptPerformanceMetrics[]> {
    const workoutPlans = await WorkoutPlanModel.find({}, { limit: 100 });
    
    // Group by prompt version
    const versionGroups = workoutPlans.reduce((acc, plan) => {
      const version = plan.promptVersion || 'unknown';
      if (!acc[version]) acc[version] = [];
      acc[version].push(plan);
      return acc;
    }, {} as Record<string, any[]>);

    const metrics: PromptPerformanceMetrics[] = [];

    for (const [version, plans] of Object.entries(versionGroups)) {
      // Get sessions for each plan individually (Firestore limitation)
      const allSessions: any[] = [];
      for (const plan of plans) {
        if (plan.id) {
          const sessions = await WorkoutSessionModel.find({ planId: plan.id });
          allSessions.push(...sessions);
        }
      }
      const sessions = allSessions;

      const completedSessions = sessions.filter(s => s.completedAt);
      const ratedSessions = sessions.filter(s => s.feedback?.rating);

      metrics.push({
        promptVersion: version,
        totalGenerations: plans.length,
        completionRate: sessions.length > 0 ? completedSessions.length / sessions.length : 0,
        averageRating: ratedSessions.length > 0 ? 
          ratedSessions.reduce((sum, s) => sum + s.feedback.rating, 0) / ratedSessions.length : 0,
        averageGenerationTime: this.calculateAverageGenerationTime(plans),
        commonIssues: this.extractCommonIssues(sessions),
        successFactors: this.extractSuccessFactors(completedSessions)
      });
    }

    return metrics.sort((a, b) => b.totalGenerations - a.totalGenerations);
  }

  /**
   * Generate optimization suggestions based on performance data
   */
  async generateOptimizationSuggestions(promptVersion?: string): Promise<PromptOptimizationSuggestion[]> {
    const metrics = await this.analyzePromptPerformance(promptVersion);
    const suggestions: PromptOptimizationSuggestion[] = [];

    for (const metric of metrics) {
      // Low completion rate suggestions
      if (metric.completionRate < 0.6) {
        suggestions.push({
          category: 'content',
          priority: 'high',
          suggestion: 'Reduce workout complexity and duration for better adherence',
          expectedImpact: `Could improve completion rate from ${Math.round(metric.completionRate * 100)}% to 70-80%`,
          implementationComplexity: 'medium'
        });

        suggestions.push({
          category: 'personalization',
          priority: 'high',
          suggestion: 'Add more energy-level based modifications to prevent overwhelming users',
          expectedImpact: 'Better match workout intensity to user capacity',
          implementationComplexity: 'low'
        });
      }

      // Low rating suggestions
      if (metric.averageRating < 3.5) {
        suggestions.push({
          category: 'content',
          priority: 'high',
          suggestion: 'Increase exercise variety and include more engaging movement patterns',
          expectedImpact: `Could improve rating from ${metric.averageRating.toFixed(1)} to 4.0+`,
          implementationComplexity: 'medium'
        });

        suggestions.push({
          category: 'structure',
          priority: 'medium',
          suggestion: 'Add more motivational language and clear progression cues',
          expectedImpact: 'Improve user engagement and satisfaction',
          implementationComplexity: 'low'
        });
      }

      // High generation time suggestions
      if (metric.averageGenerationTime > 10000) { // 10 seconds
        suggestions.push({
          category: 'parameters',
          priority: 'medium',
          suggestion: 'Optimize prompt length and reduce redundant instructions',
          expectedImpact: 'Reduce generation time by 20-30%',
          implementationComplexity: 'medium'
        });

        suggestions.push({
          category: 'structure',
          priority: 'low',
          suggestion: 'Use more structured prompt templates with clear sections',
          expectedImpact: 'Improve AI parsing efficiency',
          implementationComplexity: 'high'
        });
      }

      // Common issues analysis
      if (metric.commonIssues.includes('too difficult')) {
        suggestions.push({
          category: 'personalization',
          priority: 'high',
          suggestion: 'Implement more conservative intensity scaling for beginners',
          expectedImpact: 'Reduce difficulty-related dropouts',
          implementationComplexity: 'low'
        });
      }

      if (metric.commonIssues.includes('repetitive')) {
        suggestions.push({
          category: 'content',
          priority: 'medium',
          suggestion: 'Add exercise variation algorithms to prevent repetition',
          expectedImpact: 'Increase workout variety and user engagement',
          implementationComplexity: 'high'
        });
      }
    }

    // Remove duplicates and sort by priority
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
      index === self.findIndex(s => s.suggestion === suggestion.suggestion)
    );

    return uniqueSuggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Generate A/B testing recommendations
   */
  async generateABTestRecommendations(): Promise<{
    testName: string;
    hypothesis: string;
    variants: { name: string; changes: string[] }[];
    metrics: string[];
    duration: string;
  }[]> {
    const suggestions = await this.generateOptimizationSuggestions();
    const highPrioritySuggestions = suggestions.filter(s => s.priority === 'high');

    return highPrioritySuggestions.slice(0, 3).map((suggestion, index) => ({
      testName: `Prompt Optimization Test ${index + 1}: ${suggestion.category}`,
      hypothesis: suggestion.suggestion,
      variants: [
        { name: 'Control', changes: ['Current prompt structure'] },
        { name: 'Treatment', changes: [suggestion.suggestion] }
      ],
      metrics: ['completion_rate', 'average_rating', 'generation_time'],
      duration: '2-4 weeks (minimum 100 workouts per variant)'
    }));
  }

  private calculateAverageGenerationTime(_plans: any[]): number {
    // This would need to be tracked during generation
    // For now, return a placeholder
    return 5000; // 5 seconds average
  }

  private extractCommonIssues(sessions: any[]): string[] {
    const issues: string[] = [];
    const feedbackComments = sessions
      .filter(s => s.feedback?.comment)
      .map(s => s.feedback.comment.toLowerCase());

    const issueKeywords = {
      'too difficult': ['hard', 'difficult', 'challenging', 'tough'],
      'too easy': ['easy', 'simple', 'boring'],
      'repetitive': ['same', 'repeat', 'boring', 'similar'],
      'too long': ['long', 'time', 'duration'],
      'confusing': ['confusing', 'unclear', 'complicated']
    };

    for (const [issue, keywords] of Object.entries(issueKeywords)) {
      const count = feedbackComments.filter(comment => 
        keywords.some(keyword => comment.includes(keyword))
      ).length;

      if (count >= 2) { // At least 2 mentions
        issues.push(issue);
      }
    }

    return issues;
  }

  private extractSuccessFactors(completedSessions: any[]): string[] {
    const factors: string[] = [];
    const feedbackComments = completedSessions
      .filter(s => s.feedback?.comment && s.feedback?.rating >= 4)
      .map(s => s.feedback.comment.toLowerCase());

    const successKeywords = {
      'good variety': ['variety', 'different', 'varied'],
      'appropriate difficulty': ['perfect', 'right level', 'appropriate'],
      'clear instructions': ['clear', 'easy to follow', 'understood'],
      'good pacing': ['pacing', 'flow', 'rhythm'],
      'motivating': ['motivating', 'inspiring', 'energizing']
    };

    for (const [factor, keywords] of Object.entries(successKeywords)) {
      const count = feedbackComments.filter(comment => 
        keywords.some(keyword => comment.includes(keyword))
      ).length;

      if (count >= 2) {
        factors.push(factor);
      }
    }

    return factors;
  }
}

export const promptAnalytics = new PromptAnalytics();
