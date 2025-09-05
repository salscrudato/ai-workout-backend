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

export class PromptVersioningService {
  private variants: Map<string, PromptVariant> = new Map();
  private activeTests: Map<string, ABTest> = new Map();

  constructor() {
    this.initializeDefaultVariants();
  }

  private initializeDefaultVariants() {
    // Current production variant
    const productionVariant: PromptVariant = {
      id: 'production-v1.0.1',
      name: 'Production Baseline',
      description: 'Current production prompt with comprehensive programming',
      promptModifications: [],
      isActive: true,
      trafficAllocation: 100,
      createdAt: new Date()
    };

    this.variants.set(productionVariant.id, productionVariant);
  }

  /**
   * Create a new prompt variant for testing
   */
  createVariant(variant: Omit<PromptVariant, 'id' | 'createdAt'>): PromptVariant {
    const id = `variant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newVariant: PromptVariant = {
      ...variant,
      id,
      createdAt: new Date()
    };

    this.variants.set(id, newVariant);
    return newVariant;
  }

  /**
   * Create an A/B test with multiple variants
   */
  createABTest(test: Omit<ABTest, 'id' | 'isActive'>): ABTest {
    const id = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newTest: ABTest = {
      ...test,
      id,
      isActive: true
    };

    // Validate traffic allocation
    const totalAllocation = test.variants.reduce((sum, v) => sum + v.trafficAllocation, 0);
    if (totalAllocation !== 100) {
      throw new Error('Variant traffic allocation must sum to 100%');
    }

    this.activeTests.set(id, newTest);
    return newTest;
  }

  /**
   * Get the appropriate variant for a user (with A/B testing logic)
   */
  getVariantForUser(userId: string): PromptVariant {
    // Check if user is in any active A/B tests
    for (const test of this.activeTests.values()) {
      if (!test.isActive) continue;

      // Simple hash-based assignment for consistent user experience
      const userHash = this.hashUserId(userId);
      const bucket = userHash % 100;

      let cumulativeAllocation = 0;
      for (const variant of test.variants) {
        cumulativeAllocation += variant.trafficAllocation;
        if (bucket < cumulativeAllocation) {
          return variant;
        }
      }
    }

    // Return default production variant
    return this.variants.get('production-v1.0.1')!;
  }

  /**
   * Apply variant modifications to a base prompt
   */
  applyVariantToPrompt(basePrompt: string, variant: PromptVariant): string {
    let modifiedPrompt = basePrompt;

    for (const modification of variant.promptModifications) {
      switch (modification.type) {
        case 'add':
          modifiedPrompt = this.addToPromptSection(modifiedPrompt, modification.section, modification.modification);
          break;
        case 'replace':
          modifiedPrompt = this.replacePromptSection(modifiedPrompt, modification.section, modification.modification);
          break;
        case 'remove':
          modifiedPrompt = this.removeFromPromptSection(modifiedPrompt, modification.section);
          break;
      }
    }

    return modifiedPrompt;
  }

  /**
   * Get model parameters for a variant
   */
  getModelParameters(variant: PromptVariant, baseParams: any) {
    return {
      ...baseParams,
      ...variant.modelParameters
    };
  }

  /**
   * Record test results for analysis
   */
  recordTestResult(testId: string, variantId: string, metrics: Record<string, number>) {
    const test = this.activeTests.get(testId);
    if (!test) return;

    if (!test.results) test.results = [];

    const existingResult = test.results.find(r => r.variant === variantId);
    if (existingResult) {
      // Update existing metrics
      Object.assign(existingResult.metrics, metrics);
      existingResult.sampleSize += 1;
    } else {
      test.results.push({
        variant: variantId,
        metrics,
        sampleSize: 1,
        confidence: 0 // Will be calculated later
      });
    }
  }

  /**
   * Get test results and statistical significance
   */
  getTestResults(testId: string): ABTest | null {
    const test = this.activeTests.get(testId);
    if (!test || !test.results) return null;

    // Calculate statistical significance (simplified)
    for (const result of test.results) {
      result.confidence = this.calculateConfidence(result.sampleSize, test.minimumSampleSize);
    }

    return test;
  }

  /**
   * Predefined optimization variants based on common improvements
   */
  getOptimizationVariants(): PromptVariant[] {
    return [
      {
        id: 'concise-v1',
        name: 'Concise Instructions',
        description: 'Shorter, more focused prompt with key instructions only',
        promptModifications: [
          {
            section: 'PROGRAMMING EXAMPLES',
            modification: '',
            type: 'remove'
          },
          {
            section: 'CRITICAL REQUIREMENTS',
            modification: 'ESSENTIAL REQUIREMENTS:\n1. Match workout type and equipment\n2. Follow safety constraints\n3. Use appropriate sets/reps for experience level',
            type: 'replace'
          }
        ],
        modelParameters: {
          temperature: 0.15,
          topP: 0.8
        },
        isActive: false,
        trafficAllocation: 0,
        createdAt: new Date()
      },
      {
        id: 'motivation-focused-v1',
        name: 'Motivation Enhanced',
        description: 'Emphasizes motivational language and user engagement',
        promptModifications: [
          {
            section: 'PERSONALIZED INSIGHTS',
            modification: 'MOTIVATIONAL COACHING:\nYou are not just creating a workout - you are crafting an experience that will energize, challenge, and inspire. Every exercise should feel purposeful and achievable.',
            type: 'add'
          }
        ],
        modelParameters: {
          temperature: 0.3
        },
        isActive: false,
        trafficAllocation: 0,
        createdAt: new Date()
      },
      {
        id: 'beginner-optimized-v1',
        name: 'Beginner Optimized',
        description: 'Specialized for beginner users with extra safety focus',
        promptModifications: [
          {
            section: 'SAFETY FIRST',
            modification: 'BEGINNER SAFETY PROTOCOL:\n- Every exercise must include form cues and common mistakes\n- Default to bodyweight or light resistance\n- Include rest periods between exercises\n- Emphasize "stop if you feel pain"',
            type: 'add'
          }
        ],
        isActive: false,
        trafficAllocation: 0,
        createdAt: new Date()
      }
    ];
  }

  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private addToPromptSection(prompt: string, section: string, addition: string): string {
    const sectionIndex = prompt.indexOf(section);
    if (sectionIndex === -1) return prompt + '\n\n' + addition;

    const insertIndex = sectionIndex + section.length;
    return prompt.slice(0, insertIndex) + '\n' + addition + prompt.slice(insertIndex);
  }

  private replacePromptSection(prompt: string, section: string, replacement: string): string {
    // This is a simplified implementation - in practice, you'd want more sophisticated section parsing
    return prompt.replace(new RegExp(section + '.*?(?=\\n\\n|$)', 's'), replacement);
  }

  private removeFromPromptSection(prompt: string, section: string): string {
    return prompt.replace(new RegExp(section + '.*?(?=\\n\\n|$)', 's'), '');
  }

  private calculateConfidence(sampleSize: number, minimumSize: number): number {
    // Simplified confidence calculation
    return Math.min(sampleSize / minimumSize, 1) * 100;
  }
}

export const promptVersioning = new PromptVersioningService();
