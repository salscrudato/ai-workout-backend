
/**
 * Recovery Manager (Disabled Minimal Stub)
 *
 * Recovery-based adjustments are disabled to keep the runtime lean and avoid
 * unnecessary computation. This stub keeps method signatures stable so the
 * feature can be re-enabled later without refactors.
 */

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
  impact: number; // -1 to 1
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

const recoveryEnabled = process.env['RECOVERY_MODE'] === 'on';

export class RecoveryManager {
  private recoveryProfiles: Map<string, RecoveryProfile> = new Map();

  /**
   * Assess user's current recovery state (disabled: returns baseline).
   */
  async assessRecoveryState(userId: string, _wearableData?: WearableData): Promise<RecoveryProfile> {
    const profile: RecoveryProfile = {
      userId,
      currentRecoveryState: {
        status: 'fully_recovered',
        confidence: 0.7,
        timeToFullRecovery: 0,
        lastAssessment: new Date(),
        factors: []
      },
      fatigueLevel: 20,
      recoveryCapacity: 70,
      optimalRestPeriod: 24,
      recoveryTrends: [],
      fatigueIndicators: [],
      recoveryRecommendations: []
    };
    this.recoveryProfiles.set(userId, profile);

    if (!recoveryEnabled) return profile;
    // Minimal, local-only tweak when enabled (no external reads)
    return { ...profile, currentRecoveryState: { ...profile.currentRecoveryState } };
  }

  /**
   * Get workout adjustments (disabled: returns empty array).
   */
  async getWorkoutAdjustments(userId: string, _baseWorkout: any): Promise<WorkoutAdjustment[]> {
    await this.assessRecoveryState(userId);
    if (!recoveryEnabled) return [];
    // Minimal placeholder when enabled
    return [];
  }

  /**
   * Apply recovery-based adjustments to workout (disabled: returns input).
   */
  async applyRecoveryAdjustments(userId: string, baseWorkout: any): Promise<any> {
    const adjustments = await this.getWorkoutAdjustments(userId, baseWorkout);
    if (!recoveryEnabled || adjustments.length === 0) return baseWorkout;
    // Minimal merge path if re-enabled later
    return { ...baseWorkout, recoveryAdjustments: { adjustments } };
  }

  /**
   * Learn from workout completion (disabled: no-op).
   */
  async updateRecoveryFromWorkout(_userId: string, _workoutData: any, _feedback: any): Promise<void> {
    // no-op while disabled
  }
}

export const recoveryManager = new RecoveryManager();
