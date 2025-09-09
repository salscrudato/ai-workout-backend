/**
 * Prompt Versioning (Disabled Minimal Stub)
 *
 * A/B testing and prompt mutation are disabled for now to simplify runtime,
 * reduce cost, and ensure consistent outputs. This stub preserves the public
 * API so future re‑enablement won't require broad code changes.
 */

export interface PromptVariant {
  id: string;
  name: string;
  description: string;
  systemMessage?: string;
  promptModifications: {
    section: string;
    modification: string;
    type: 'add' | 'replace' | 'remove';
  }[];
  modelParameters?: {
    temperature?: number;
    topP?: number;
    maxTokens?: number;
  };
  isActive: boolean;
  trafficAllocation: number; // 0-100 percentage
  createdAt: Date;
}

interface ABTest {
  id: string;
  name: string;
  hypothesis: string;
  variants: PromptVariant[];
  startDate: Date;
  endDate?: Date;
  targetMetrics: string[];
  minimumSampleSize: number;
  isActive: boolean;
  results?: {
    variant: string;
    metrics: Record<string, number>;
    sampleSize: number;
    confidence: number;
  }[];
}

const BASELINE_VARIANT: PromptVariant = {
  id: 'baseline',
  name: 'Baseline',
  description: 'No modifications; single production prompt',
  promptModifications: [],
  modelParameters: {},
  isActive: true,
  trafficAllocation: 100,
  createdAt: new Date(0)
};

export class PromptVersioningService {
  /**
   * Always return the baseline variant. A/B is disabled.
   */
  getVariantForUser(_userId: string): PromptVariant {
    return BASELINE_VARIANT;
  }

  /**
   * No prompt changes applied in baseline mode.
   */
  applyVariantToPrompt(basePrompt: string, _variant: PromptVariant): string {
    return basePrompt;
  }

  /**
   * Return base model params unchanged in baseline mode.
   */
  getModelParameters(_variant: PromptVariant, baseParams: any) {
    return { ...baseParams };
  }

  /**
   * Creation APIs are disabled while A/B is off. Kept for forward compatibility.
   */
  createVariant(_variant: Omit<PromptVariant, 'id' | 'createdAt'>): PromptVariant {
    return BASELINE_VARIANT;
  }

  createABTest(_test: Omit<ABTest, 'id' | 'isActive'>): ABTest {
    return {
      id: 'ab-disabled',
      name: 'AB Testing Disabled',
      hypothesis: 'N/A',
      variants: [BASELINE_VARIANT],
      startDate: new Date(),
      targetMetrics: [],
      minimumSampleSize: 0,
      isActive: false
    };
  }

  recordTestResult(_testId: string, _variantId: string, _metrics: Record<string, number>) {
    // no-op
  }

  getTestResults(_testId: string): ABTest | null {
    return null;
  }

  getOptimizationVariants(): PromptVariant[] {
    return [];
  }
}

export const promptVersioning = new PromptVersioningService();
