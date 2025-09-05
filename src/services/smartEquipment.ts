/**
 * Smart Equipment Integration & Recommendations Service
 * Provides intelligent equipment substitutions and progressive recommendations
 */

import { EquipmentModel } from '../models/Equipment';
import { ProfileModel } from '../models/Profile';
import { WorkoutPlanModel } from '../models/WorkoutPlan';

export interface EquipmentSubstitution {
  originalEquipment: string;
  substitutes: EquipmentAlternative[];
  difficulty: 'easier' | 'same' | 'harder';
  effectiveness: number; // 0-1 scale
}

export interface EquipmentAlternative {
  equipment: string;
  exerciseModification: string;
  effectivenessRating: number; // 0-1 scale
  difficultyAdjustment: number; // -1 to 1 scale
  instructions: string[];
  pros: string[];
  cons: string[];
}

export interface EquipmentProgression {
  currentLevel: string;
  nextLevel: string;
  progressionPath: ProgressionStep[];
  timeframe: string;
  benefits: string[];
}

export interface ProgressionStep {
  equipment: string;
  milestone: string;
  requirements: string[];
  estimatedTime: string;
}

export interface SmartEquipmentRecommendation {
  userId: string;
  currentEquipment: string[];
  recommendedAdditions: EquipmentRecommendation[];
  substitutions: EquipmentSubstitution[];
  progressionPlan: EquipmentProgression[];
  budgetConsiderations: BudgetRecommendation[];
}

export interface EquipmentRecommendation {
  equipment: string;
  priority: 'high' | 'medium' | 'low';
  reasoning: string[];
  estimatedCost: string;
  versatilityScore: number;
  spaceRequirement: 'minimal' | 'moderate' | 'large';
  workoutImpact: string[];
}

export interface BudgetRecommendation {
  tier: 'budget' | 'mid_range' | 'premium';
  totalCost: string;
  equipment: string[];
  benefits: string[];
  timeline: string;
}

export class SmartEquipmentService {
  private equipmentDatabase: Map<string, any> = new Map();
  private substitutionRules: Map<string, EquipmentAlternative[]> = new Map();

  constructor() {
    this.initializeEquipmentDatabase();
    this.initializeSubstitutionRules();
  }

  /**
   * Generate smart equipment recommendations for user
   */
  async generateEquipmentRecommendations(userId: string): Promise<SmartEquipmentRecommendation> {
    const [profile, workoutHistory] = await Promise.all([
      ProfileModel.findOne({ userId }),
      WorkoutPlanModel.find({ userId }, { limit: 20 })
    ]);

    const currentEquipment = profile?.equipmentAvailable || ['bodyweight'];
    const workoutPatterns = this.analyzeWorkoutPatterns(workoutHistory);
    
    return {
      userId,
      currentEquipment,
      recommendedAdditions: await this.generateAdditionRecommendations(currentEquipment, workoutPatterns, profile),
      substitutions: this.generateSubstitutions(currentEquipment),
      progressionPlan: this.generateProgressionPlan(currentEquipment, profile),
      budgetConsiderations: this.generateBudgetRecommendations(currentEquipment, profile)
    };
  }

  /**
   * Get equipment substitutions for a specific exercise
   */
  async getEquipmentSubstitutions(exercise: string, availableEquipment: string[]): Promise<EquipmentSubstitution[]> {
    const requiredEquipment = this.extractRequiredEquipment(exercise);
    const substitutions: EquipmentSubstitution[] = [];

    for (const equipment of requiredEquipment) {
      if (!availableEquipment.includes(equipment)) {
        const alternatives = this.findAlternatives(equipment, availableEquipment);
        if (alternatives.length > 0) {
          substitutions.push({
            originalEquipment: equipment,
            substitutes: alternatives,
            difficulty: this.calculateDifficultyChange(equipment, alternatives),
            effectiveness: this.calculateEffectiveness(alternatives)
          });
        }
      }
    }

    return substitutions;
  }

  /**
   * Generate progressive equipment recommendations
   */
  async generateProgressiveRecommendations(userId: string, currentGoals: string[]): Promise<EquipmentProgression[]> {
    const profile = await ProfileModel.findOne({ userId });
    const currentEquipment = profile?.equipmentAvailable || ['bodyweight'];
    
    return this.generateProgressionPlan(currentEquipment, profile);
  }

  /**
   * Initialize equipment database with comprehensive equipment data
   */
  private initializeEquipmentDatabase(): void {
    const equipmentData = [
      {
        name: 'dumbbells',
        category: 'free_weights',
        versatility: 0.9,
        spaceRequirement: 'moderate',
        cost: 'mid_range',
        targetMuscles: ['full_body'],
        exerciseTypes: ['strength', 'hypertrophy', 'endurance'],
        progressionPotential: 0.95
      },
      {
        name: 'resistance_bands',
        category: 'resistance',
        versatility: 0.8,
        spaceRequirement: 'minimal',
        cost: 'budget',
        targetMuscles: ['full_body'],
        exerciseTypes: ['strength', 'rehabilitation', 'mobility'],
        progressionPotential: 0.7
      },
      {
        name: 'kettlebell',
        category: 'free_weights',
        versatility: 0.85,
        spaceRequirement: 'minimal',
        cost: 'mid_range',
        targetMuscles: ['full_body'],
        exerciseTypes: ['strength', 'cardio', 'functional'],
        progressionPotential: 0.8
      },
      {
        name: 'pull_up_bar',
        category: 'bodyweight_assist',
        versatility: 0.6,
        spaceRequirement: 'minimal',
        cost: 'budget',
        targetMuscles: ['upper_body'],
        exerciseTypes: ['strength', 'bodyweight'],
        progressionPotential: 0.9
      },
      {
        name: 'barbell',
        category: 'free_weights',
        versatility: 0.95,
        spaceRequirement: 'large',
        cost: 'premium',
        targetMuscles: ['full_body'],
        exerciseTypes: ['strength', 'power', 'hypertrophy'],
        progressionPotential: 1.0
      }
    ];

    equipmentData.forEach(equipment => {
      this.equipmentDatabase.set(equipment.name, equipment);
    });
  }

  /**
   * Initialize substitution rules
   */
  private initializeSubstitutionRules(): void {
    const substitutions = [
      {
        original: 'dumbbells',
        alternatives: [
          {
            equipment: 'resistance_bands',
            exerciseModification: 'Use bands with appropriate resistance',
            effectivenessRating: 0.8,
            difficultyAdjustment: -0.1,
            instructions: ['Anchor bands securely', 'Adjust resistance by changing grip position'],
            pros: ['Portable', 'Variable resistance', 'Joint-friendly'],
            cons: ['Less precise loading', 'Requires anchor points']
          },
          {
            equipment: 'water_bottles',
            exerciseModification: 'Use filled water bottles as light weights',
            effectivenessRating: 0.4,
            difficultyAdjustment: -0.5,
            instructions: ['Fill bottles to desired weight', 'Ensure secure grip'],
            pros: ['Readily available', 'Adjustable weight'],
            cons: ['Limited weight range', 'Awkward grip']
          }
        ]
      },
      {
        original: 'barbell',
        alternatives: [
          {
            equipment: 'dumbbells',
            exerciseModification: 'Use two dumbbells instead of barbell',
            effectivenessRating: 0.85,
            difficultyAdjustment: 0.1,
            instructions: ['Use appropriate weight per dumbbell', 'Focus on stability'],
            pros: ['Unilateral training', 'Better range of motion'],
            cons: ['Requires more stability', 'Limited total weight']
          },
          {
            equipment: 'resistance_bands',
            exerciseModification: 'Use heavy resistance bands',
            effectivenessRating: 0.7,
            difficultyAdjustment: -0.2,
            instructions: ['Use multiple bands for heavy resistance', 'Secure anchoring essential'],
            pros: ['Variable resistance', 'Safer for beginners'],
            cons: ['Different resistance curve', 'Setup complexity']
          }
        ]
      }
    ];

    substitutions.forEach(sub => {
      this.substitutionRules.set(sub.original, sub.alternatives);
    });
  }

  /**
   * Generate equipment addition recommendations
   */
  private async generateAdditionRecommendations(
    currentEquipment: string[], 
    workoutPatterns: any, 
    profile: any
  ): Promise<EquipmentRecommendation[]> {
    const recommendations: EquipmentRecommendation[] = [];
    const experience = profile?.experience || 'beginner';
    const goals = profile?.goals || ['general_fitness'];

    // Analyze gaps in current equipment
    const equipmentGaps = this.analyzeEquipmentGaps(currentEquipment, workoutPatterns);

    // Generate recommendations based on gaps and goals
    if (!currentEquipment.includes('dumbbells') && equipmentGaps.includes('variable_resistance')) {
      recommendations.push({
        equipment: 'dumbbells',
        priority: 'high',
        reasoning: [
          'Provides variable resistance for progressive overload',
          'Enables unilateral training for muscle balance',
          'Highly versatile for full-body workouts'
        ],
        estimatedCost: '$50-200',
        versatilityScore: 0.9,
        spaceRequirement: 'moderate',
        workoutImpact: ['Strength training', 'Muscle building', 'Progressive overload']
      });
    }

    if (!currentEquipment.includes('resistance_bands') && experience === 'beginner') {
      recommendations.push({
        equipment: 'resistance_bands',
        priority: 'medium',
        reasoning: [
          'Joint-friendly resistance for beginners',
          'Portable and space-efficient',
          'Great for rehabilitation and mobility'
        ],
        estimatedCost: '$15-50',
        versatilityScore: 0.8,
        spaceRequirement: 'minimal',
        workoutImpact: ['Strength training', 'Rehabilitation', 'Travel workouts']
      });
    }

    if (goals.includes('strength') && !currentEquipment.includes('pull_up_bar')) {
      recommendations.push({
        equipment: 'pull_up_bar',
        priority: 'high',
        reasoning: [
          'Essential for upper body pulling movements',
          'Bodyweight progression potential',
          'Targets often-neglected muscle groups'
        ],
        estimatedCost: '$25-100',
        versatilityScore: 0.6,
        spaceRequirement: 'minimal',
        workoutImpact: ['Upper body strength', 'Back development', 'Functional movement']
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Generate equipment substitutions
   */
  private generateSubstitutions(currentEquipment: string[]): EquipmentSubstitution[] {
    const substitutions: EquipmentSubstitution[] = [];

    // Generate substitutions for common equipment not owned
    const commonEquipment = ['dumbbells', 'barbell', 'kettlebell', 'resistance_bands'];
    
    commonEquipment.forEach(equipment => {
      if (!currentEquipment.includes(equipment)) {
        const alternatives = this.findAlternatives(equipment, currentEquipment);
        if (alternatives.length > 0) {
          substitutions.push({
            originalEquipment: equipment,
            substitutes: alternatives,
            difficulty: this.calculateDifficultyChange(equipment, alternatives),
            effectiveness: this.calculateEffectiveness(alternatives)
          });
        }
      }
    });

    return substitutions;
  }

  /**
   * Generate equipment progression plan
   */
  private generateProgressionPlan(currentEquipment: string[], profile: any): EquipmentProgression[] {
    const progressions: EquipmentProgression[] = [];
    const experience = profile?.experience || 'beginner';

    if (currentEquipment.includes('bodyweight') && !currentEquipment.includes('resistance_bands')) {
      progressions.push({
        currentLevel: 'Bodyweight Only',
        nextLevel: 'Bodyweight + Resistance',
        progressionPath: [
          {
            equipment: 'resistance_bands',
            milestone: 'Add variable resistance',
            requirements: ['Consistent bodyweight training', 'Good form mastery'],
            estimatedTime: '2-4 weeks'
          }
        ],
        timeframe: '1-2 months',
        benefits: ['Variable resistance', 'Joint-friendly progression', 'Portability']
      });
    }

    if (currentEquipment.includes('resistance_bands') && !currentEquipment.includes('dumbbells')) {
      progressions.push({
        currentLevel: 'Resistance Bands',
        nextLevel: 'Free Weights',
        progressionPath: [
          {
            equipment: 'dumbbells',
            milestone: 'Transition to free weights',
            requirements: ['Band training proficiency', 'Strength foundation'],
            estimatedTime: '4-8 weeks'
          }
        ],
        timeframe: '2-3 months',
        benefits: ['Precise loading', 'Greater progression potential', 'Compound movements']
      });
    }

    return progressions;
  }

  /**
   * Generate budget recommendations
   */
  private generateBudgetRecommendations(currentEquipment: string[], profile: any): BudgetRecommendation[] {
    return [
      {
        tier: 'budget',
        totalCost: '$50-100',
        equipment: ['resistance_bands', 'yoga_mat', 'water_bottles'],
        benefits: ['Full-body workouts', 'Minimal space', 'Portable'],
        timeline: 'Immediate'
      },
      {
        tier: 'mid_range',
        totalCost: '$150-300',
        equipment: ['dumbbells', 'kettlebell', 'pull_up_bar', 'yoga_mat'],
        benefits: ['Progressive overload', 'Versatile training', 'Long-term progression'],
        timeline: '1-3 months'
      },
      {
        tier: 'premium',
        totalCost: '$500-1000',
        equipment: ['barbell', 'weight_plates', 'squat_rack', 'bench'],
        benefits: ['Maximum progression', 'Compound movements', 'Gym-quality training'],
        timeline: '6-12 months'
      }
    ];
  }

  // Helper methods
  private analyzeWorkoutPatterns(workoutHistory: any[]): any {
    return {
      frequentExerciseTypes: ['strength', 'cardio'],
      equipmentUsage: { bodyweight: 0.8, dumbbells: 0.3 },
      progressionNeeds: ['variable_resistance', 'upper_body_pulling']
    };
  }

  private analyzeEquipmentGaps(currentEquipment: string[], patterns: any): string[] {
    const gaps = [];
    
    if (!currentEquipment.some(eq => ['dumbbells', 'barbell', 'kettlebell'].includes(eq))) {
      gaps.push('variable_resistance');
    }
    
    if (!currentEquipment.includes('pull_up_bar')) {
      gaps.push('upper_body_pulling');
    }
    
    return gaps;
  }

  private extractRequiredEquipment(exercise: string): string[] {
    // Simplified implementation - would analyze exercise requirements
    return ['dumbbells'];
  }

  private findAlternatives(equipment: string, availableEquipment: string[]): EquipmentAlternative[] {
    const alternatives = this.substitutionRules.get(equipment) || [];
    return alternatives.filter(alt => 
      availableEquipment.includes(alt.equipment) || alt.equipment === 'bodyweight'
    );
  }

  private calculateDifficultyChange(original: string, alternatives: EquipmentAlternative[]): 'easier' | 'same' | 'harder' {
    const avgDifficulty = alternatives.reduce((sum, alt) => sum + alt.difficultyAdjustment, 0) / alternatives.length;
    if (avgDifficulty < -0.2) return 'easier';
    if (avgDifficulty > 0.2) return 'harder';
    return 'same';
  }

  private calculateEffectiveness(alternatives: EquipmentAlternative[]): number {
    return alternatives.reduce((max, alt) => Math.max(max, alt.effectivenessRating), 0);
  }
}

export const smartEquipmentService = new SmartEquipmentService();
