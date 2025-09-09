/**
 * Advanced Periodization Engine
 * Implements sophisticated training periodization with automatic phase cycling
 */
/**
 * Periodization Engine (Disabled Minimal Stub)
 *
 * Periodized multi-week planning is disabled to keep the runtime lean and
 * latency/cost low for single-session generation. This stub preserves the
 * public API so it can be re-enabled later without broad changes.
 */

export interface PeriodizationPhase {
  name: string;
  type: 'accumulation' | 'intensification' | 'realization' | 'recovery';
  duration: number; // weeks
  volumeMultiplier: number;
  intensityMultiplier: number;
  complexityLevel: number;
  focusAreas: string[];
  characteristics: string[];
}

export interface WorkoutModification {
  aspect: 'volume' | 'intensity' | 'complexity' | 'recovery' | 'focus';
  modification: string;
  value: number;
  reasoning: string;
}

export interface PhaseTransition {
  fromPhase: string;
  toPhase: string;
  transitionDate: Date;
  preparationSteps: string[];
  expectedChanges: string[];
}

export interface ProgressIndicator {
  metric: string;
  currentValue: number;
  targetValue: number;
  progress: number; // 0-1
  status: 'on_track' | 'ahead' | 'behind' | 'stalled';
}

export interface PeriodizationRecommendation {
  currentPhase: PeriodizationPhase;
  workoutModifications: WorkoutModification[];
  phaseTransition: PhaseTransition | null;
  progressIndicators: ProgressIndicator[];
  nextPhasePreview: PeriodizationPhase | null;
}

const periodizationEnabled = process.env['PERIODIZATION_MODE'] === 'on';

export class PeriodizationEngine {
  /**
   * Return a simple, static recommendation without DB calls.
   */
  async getPeriodizationRecommendation(_userId: string): Promise<PeriodizationRecommendation> {
    const basePhase: PeriodizationPhase = {
      name: 'Baseline',
      type: 'accumulation',
      duration: 4,
      volumeMultiplier: 1.0,
      intensityMultiplier: 1.0,
      complexityLevel: 0.7,
      focusAreas: ['movement_quality', 'consistency'],
      characteristics: ['Moderate volume', 'Moderate intensity']
    };

    if (!periodizationEnabled) {
      return {
        currentPhase: basePhase,
        workoutModifications: [],
        phaseTransition: null,
        progressIndicators: [],
        nextPhasePreview: null
      };
    }

    // Minimal heuristics when enabled (still no external reads):
    return {
      currentPhase: basePhase,
      workoutModifications: [
        { aspect: 'volume', modification: 'maintain', value: 1.0, reasoning: 'Baseline mode' },
        { aspect: 'intensity', modification: 'maintain', value: 1.0, reasoning: 'Baseline mode' }
      ],
      phaseTransition: null,
      progressIndicators: [
        { metric: 'consistency', currentValue: 0.7, targetValue: 0.8, progress: 0.7, status: 'on_track' }
      ],
      nextPhasePreview: null
    };
  }

  /**
   * No-op application — returns the base workout unchanged unless feature flag is on,
   * in which case only minimal metadata is attached. No heavy computation.
   */
  async applyPeriodization(userId: string, baseWorkout: any): Promise<any> {
    if (!periodizationEnabled) return baseWorkout;
    const rec = await this.getPeriodizationRecommendation(userId);
    return {
      ...baseWorkout,
      periodization: {
        phase: rec.currentPhase.name,
        phaseType: rec.currentPhase.type,
        modifications: rec.workoutModifications
      }
    };
  }
}

export const periodizationEngine = new PeriodizationEngine();
