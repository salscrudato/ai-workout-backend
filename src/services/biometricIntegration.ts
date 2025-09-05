/**
 * Real-Time Biometric Integration Service
 * Integrates with wearables and health platforms for dynamic workout optimization
 */

import { ProfileModel } from '../models/Profile';
import { WorkoutPlanModel } from '../models/WorkoutPlan';

export interface BiometricData {
  userId: string;
  timestamp: Date;
  heartRateVariability: number; // HRV score (0-100)
  restingHeartRate: number;
  sleepQuality: number; // 0-100 score
  sleepDuration: number; // hours
  stressLevel: number; // 0-100
  recoveryScore: number; // 0-100 composite score
  activeMinutes: number; // last 24h
  steps: number; // last 24h
  caloriesBurned: number; // last 24h
}

export interface RecoveryRecommendation {
  workoutIntensityModifier: number; // 0.5-1.5 multiplier
  recommendedDuration: number; // minutes
  focusAreas: string[];
  avoidAreas: string[];
  recoveryActions: string[];
  confidenceScore: number;
}

export interface WearableIntegration {
  platform: 'apple_health' | 'fitbit' | 'garmin' | 'google_fit' | 'whoop' | 'oura';
  accessToken: string;
  refreshToken?: string;
  lastSync: Date;
  isActive: boolean;
}

export class BiometricIntegrationService {
  /**
   * Sync biometric data from connected wearables
   */
  async syncBiometricData(userId: string): Promise<BiometricData | null> {
    const integrations = await this.getUserIntegrations(userId);
    
    if (integrations.length === 0) {
      return null;
    }

    // Prioritize data sources (Oura/Whoop > Apple Health > Fitbit > Garmin)
    const prioritizedIntegrations = integrations.sort((a, b) => {
      const priority = { 'oura': 5, 'whoop': 5, 'apple_health': 4, 'fitbit': 3, 'garmin': 2, 'google_fit': 1 };
      return (priority[b.platform] || 0) - (priority[a.platform] || 0);
    });

    for (const integration of prioritizedIntegrations) {
      try {
        const data = await this.fetchBiometricData(integration);
        if (data) {
          await this.storeBiometricData(userId, data);
          return data;
        }
      } catch (error) {
        console.error(`Failed to sync from ${integration.platform}:`, error);
        continue;
      }
    }

    return null;
  }

  /**
   * Generate recovery-based workout recommendations
   */
  async generateRecoveryRecommendation(userId: string): Promise<RecoveryRecommendation> {
    const biometricData = await this.getLatestBiometricData(userId);
    
    if (!biometricData) {
      return this.getDefaultRecommendation();
    }

    const recoveryScore = this.calculateCompositeRecoveryScore(biometricData);
    const intensityModifier = this.calculateIntensityModifier(recoveryScore);
    
    return {
      workoutIntensityModifier: intensityModifier,
      recommendedDuration: this.calculateOptimalDuration(biometricData, intensityModifier),
      focusAreas: this.determineFocusAreas(biometricData, recoveryScore),
      avoidAreas: this.determineAvoidAreas(biometricData, recoveryScore),
      recoveryActions: this.generateRecoveryActions(biometricData, recoveryScore),
      confidenceScore: this.calculateConfidence(biometricData)
    };
  }

  /**
   * Real-time workout intensity adjustment during exercise
   */
  async adjustWorkoutIntensity(userId: string, currentHeartRate: number, targetZone: string): Promise<{
    adjustment: 'increase' | 'maintain' | 'decrease';
    recommendation: string;
    newTargetReps?: number;
    newRestTime?: number;
  }> {
    const profile = await ProfileModel.findOne({ userId });
    const biometricData = await this.getLatestBiometricData(userId);
    
    if (!biometricData || !profile) {
      return { adjustment: 'maintain', recommendation: 'Continue at current intensity' };
    }

    const maxHR = this.estimateMaxHeartRate(profile.age || 30);
    const currentZone = this.determineHeartRateZone(currentHeartRate, maxHR);
    const targetZoneNum = this.getTargetZoneNumber(targetZone);

    if (currentZone > targetZoneNum + 1) {
      return {
        adjustment: 'decrease',
        recommendation: 'Heart rate too high - reduce intensity or extend rest',
        newRestTime: 120,
        newTargetReps: Math.floor((profile.experience === 'beginner' ? 8 : 10) * 0.8)
      };
    } else if (currentZone < targetZoneNum - 1) {
      return {
        adjustment: 'increase',
        recommendation: 'Heart rate low - increase intensity or reduce rest',
        newRestTime: 60,
        newTargetReps: Math.floor((profile.experience === 'beginner' ? 8 : 10) * 1.2)
      };
    }

    return { adjustment: 'maintain', recommendation: 'Perfect intensity - maintain current effort' };
  }

  /**
   * Fitbit integration
   */
  private async fetchFromFitbit(integration: WearableIntegration): Promise<BiometricData | null> {
    try {
      const response = await fetch('https://api.fitbit.com/1/user/-/activities/heart/date/today/1d.json', {
        headers: {
          'Authorization': `Bearer ${integration.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Fitbit API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform Fitbit data to our format
      return {
        userId: (integration as any).userId || 'mock-user-id', // Mock user ID for now
        timestamp: new Date(),
        heartRateVariability: (data as any).heartRateVariability || 50,
        restingHeartRate: (data as any).restingHeartRate || 70,
        sleepQuality: (data as any).sleepScore || 75,
        sleepDuration: (data as any).sleepDuration || 7.5,
        stressLevel: (data as any).stressLevel || 30,
        recoveryScore: this.calculateRecoveryScore(data),
        activeMinutes: (data as any).activeMinutes || 30,
        steps: (data as any).steps || 8000,
        caloriesBurned: (data as any).calories || 2000
      };
    } catch (error) {
      console.error('Fitbit integration error:', error);
      return null;
    }
  }

  /**
   * Calculate composite recovery score from multiple metrics
   */
  private calculateCompositeRecoveryScore(data: BiometricData): number {
    const weights = {
      hrv: 0.3,
      sleep: 0.25,
      stress: 0.2,
      rhr: 0.15,
      activity: 0.1
    };

    const normalizedHRV = Math.min(100, data.heartRateVariability);
    const normalizedSleep = (data.sleepQuality * 0.7) + (Math.min(100, data.sleepDuration / 8 * 100) * 0.3);
    const normalizedStress = 100 - data.stressLevel;
    const normalizedRHR = Math.max(0, 100 - ((data.restingHeartRate - 50) / 50 * 100));
    const normalizedActivity = Math.min(100, data.activeMinutes / 60 * 100);

    return (
      normalizedHRV * weights.hrv +
      normalizedSleep * weights.sleep +
      normalizedStress * weights.stress +
      normalizedRHR * weights.rhr +
      normalizedActivity * weights.activity
    );
  }

  private calculateIntensityModifier(recoveryScore: number): number {
    if (recoveryScore >= 80) return 1.2; // High recovery - increase intensity
    if (recoveryScore >= 60) return 1.0; // Good recovery - maintain
    if (recoveryScore >= 40) return 0.8; // Moderate recovery - reduce slightly
    return 0.6; // Poor recovery - significant reduction
  }

  private async getUserIntegrations(userId: string): Promise<WearableIntegration[]> {
    // This would fetch from a database table storing user integrations
    // Placeholder implementation
    return [];
  }

  private async fetchBiometricData(integration: WearableIntegration): Promise<BiometricData | null> {
    switch (integration.platform) {
      case 'apple_health':
        return this.fetchFromAppleHealth(integration);
      case 'fitbit':
        return this.fetchFromFitbit(integration);
      case 'garmin':
        return this.fetchFromGarmin(integration);
      case 'oura':
        return this.fetchFromOura(integration);
      case 'whoop':
        return this.fetchFromWhoop(integration);
      default:
        return null;
    }
  }

  private async fetchFromAppleHealth(integration: WearableIntegration): Promise<BiometricData | null> {
    // Implementation would use Apple HealthKit API
    return null;
  }

  private async fetchFromGarmin(integration: WearableIntegration): Promise<BiometricData | null> {
    // Garmin Connect IQ API integration
    return null;
  }

  private async fetchFromOura(integration: WearableIntegration): Promise<BiometricData | null> {
    // Oura Ring API integration - excellent for sleep and recovery
    return null;
  }

  private async fetchFromWhoop(integration: WearableIntegration): Promise<BiometricData | null> {
    // WHOOP API integration - excellent for recovery and strain
    return null;
  }

  private getDefaultRecommendation(): RecoveryRecommendation {
    return {
      workoutIntensityModifier: 1.0,
      recommendedDuration: 45,
      focusAreas: ['general_fitness'],
      avoidAreas: [],
      recoveryActions: ['Stay hydrated', 'Focus on form'],
      confidenceScore: 0.3
    };
  }

  private async getLatestBiometricData(userId: string): Promise<BiometricData | null> {
    // This would fetch the most recent biometric data from database
    return null;
  }

  private async storeBiometricData(userId: string, data: BiometricData): Promise<void> {
    // Store biometric data in database
  }

  private calculateOptimalDuration(data: BiometricData, intensityModifier: number): number {
    const baseDuration = 45;
    const sleepFactor = Math.min(1.2, data.sleepDuration / 8);
    const stressFactor = Math.max(0.7, (100 - data.stressLevel) / 100);

    return Math.round(baseDuration * intensityModifier * sleepFactor * stressFactor);
  }

  private determineFocusAreas(data: BiometricData, recoveryScore: number): string[] {
    const areas = [];

    if (recoveryScore >= 80) {
      areas.push('strength', 'power');
    } else if (recoveryScore >= 60) {
      areas.push('endurance', 'technique');
    } else {
      areas.push('mobility', 'recovery');
    }

    if (data.stressLevel > 70) {
      areas.push('mindfulness', 'breathing');
    }

    return areas;
  }

  private determineAvoidAreas(data: BiometricData, recoveryScore: number): string[] {
    const avoid = [];

    if (recoveryScore < 40) {
      avoid.push('high_intensity', 'plyometrics');
    }

    if (data.sleepDuration < 6) {
      avoid.push('complex_movements', 'max_effort');
    }

    if (data.stressLevel > 80) {
      avoid.push('competitive_elements', 'time_pressure');
    }

    return avoid;
  }

  private generateRecoveryActions(data: BiometricData, recoveryScore: number): string[] {
    const actions = [];

    if (data.sleepDuration < 7) {
      actions.push('Prioritize 7-9 hours of sleep tonight');
    }

    if (data.stressLevel > 60) {
      actions.push('Include 5-10 minutes of meditation or deep breathing');
    }

    if (data.heartRateVariability < 30) {
      actions.push('Focus on gentle movement and stress reduction');
    }

    if (recoveryScore < 50) {
      actions.push('Consider active recovery or rest day');
    }

    return actions;
  }

  private calculateConfidence(data: BiometricData): number {
    // Calculate confidence based on data completeness and recency
    let confidence = 0.5; // base confidence

    if (data.heartRateVariability > 0) confidence += 0.2;
    if (data.sleepQuality > 0) confidence += 0.2;
    if (data.stressLevel > 0) confidence += 0.1;

    return Math.min(1.0, confidence);
  }

  private estimateMaxHeartRate(age: number): number {
    return 220 - age;
  }

  private determineHeartRateZone(currentHR: number, maxHR: number): number {
    const percentage = (currentHR / maxHR) * 100;

    if (percentage < 60) return 1; // Recovery
    if (percentage < 70) return 2; // Aerobic base
    if (percentage < 80) return 3; // Aerobic
    if (percentage < 90) return 4; // Threshold
    return 5; // Neuromuscular power
  }

  private getTargetZoneNumber(targetZone: string): number {
    const zones = {
      'recovery': 1,
      'aerobic_base': 2,
      'aerobic': 3,
      'threshold': 4,
      'power': 5
    };
    return zones[targetZone as keyof typeof zones] || 3;
  }

  private calculateRecoveryScore(data: any): number {
    // Calculate a composite recovery score from available data
    return Math.min(100, Math.max(0,
      (data.sleepScore || 75) * 0.4 +
      (100 - (data.stressLevel || 30)) * 0.3 +
      (data.heartRateVariability || 50) * 0.3
    ));
  }
}

export const biometricIntegrationService = new BiometricIntegrationService();
