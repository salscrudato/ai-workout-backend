/**
 * Real-Time Coaching (Disabled Minimal Stub)
 *
 * Real-time biometric analysis and live coaching are disabled to keep the
 * service lean, reduce cold-start time, and avoid unnecessary compute.
 * This stub preserves types and method signatures for future enablement.
 */

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
  formQuality: number; // 1-10
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

const coachingEnabled = process.env['REALTIME_COACHING'] === 'on';

export class RealTimeCoachingService {
  /**
   * Analyze metrics and return coaching outputs. Disabled returns empty,
   * enabled returns minimal heuristics without external reads.
   */
  async analyzeRealTimePerformance(metrics: RealTimeMetrics): Promise<{
    insights: CoachingInsight[];
    predictions: PerformancePrediction;
    adjustments: WorkoutAdjustment[];
  }> {
    if (!coachingEnabled) {
      return {
        insights: [],
        predictions: {
          remainingReps: 0,
          estimatedRPE: Math.min(10, Math.max(1, metrics.perceivedExertion)),
          recommendedRest: 60,
          formDegradationRisk: 0,
          injuryRisk: 0,
          optimalStopPoint: metrics.repNumber
        },
        adjustments: []
      };
    }

    // Minimal, self-contained heuristics (no DB or external calls)
    const insights: CoachingInsight[] = [];
    if (metrics.formQuality <= 5) {
      insights.push({
        type: 'technique', priority: 'critical', actionable: true, timing: 'immediate',
        message: 'Form breakdown detected — reduce load or stop this set.'
      });
    }
    if (metrics.perceivedExertion >= 9 && metrics.setNumber < 3) {
      insights.push({
        type: 'intensity', priority: 'high', actionable: true, timing: 'between_sets',
        message: 'RPE very high early — consider reducing load next set.'
      });
    }

    const remainingReps = Math.max(0, 10 - metrics.repNumber);
    const predictedRPE = Math.min(10, metrics.perceivedExertion + (remainingReps * 0.3));
    const recommendedRest = Math.round(90 * (predictedRPE / 8));
    const formRisk = Math.min(100, (10 - metrics.formQuality) * 10 + metrics.fatigueLevel * 5);
    const injuryRisk = Math.min(100, formRisk * 0.3 + (metrics.perceivedExertion >= 9 ? 20 : 0));
    const optimalStopPoint = injuryRisk > 70 || formRisk > 80 ? metrics.repNumber : metrics.repNumber + 1;

    const predictions: PerformancePrediction = {
      remainingReps,
      estimatedRPE: predictedRPE,
      recommendedRest: Math.max(45, recommendedRest),
      formDegradationRisk: formRisk,
      injuryRisk,
      optimalStopPoint
    };

    const adjustments: WorkoutAdjustment[] = [];
    if (metrics.perceivedExertion <= 5 && metrics.setNumber >= 2) {
      adjustments.push({
        type: 'weight', adjustment: 'Increase ~5%', reasoning: 'Low RPE at later sets', confidence: 70
      });
    }

    return { insights, predictions, adjustments };
  }
}

export const realTimeCoachingService = new RealTimeCoachingService();
