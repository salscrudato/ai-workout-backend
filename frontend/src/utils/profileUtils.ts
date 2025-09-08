/**
 * Profile utility functions for data normalization and validation
 */

import type { Profile } from '../types/api';

/**
 * Normalizes a profile object to ensure all array properties are properly initialized
 * This prevents runtime errors when accessing profile properties that might be undefined
 * 
 * @param profile - The profile object to normalize (can be null/undefined)
 * @returns A normalized profile object with guaranteed array properties, or null if input is null/undefined
 */
export function normalizeProfile(profile: Profile | null | undefined): Profile | null {
  if (!profile) {
    return null;
  }

  return {
    ...profile,
    goals: Array.isArray(profile.goals) ? profile.goals : [],
    equipmentAvailable: Array.isArray(profile.equipmentAvailable) ? profile.equipmentAvailable : [],
    constraints: Array.isArray(profile.constraints) ? profile.constraints : [],
  };
}

/**
 * Safely extracts an array from a profile property
 * This is a defensive utility to prevent Array.from() errors
 * 
 * @param value - The value to convert to an array
 * @returns A safe array, never undefined
 */
export function safeArrayFrom<T>(value: T[] | readonly T[] | undefined | null): T[] {
  if (Array.isArray(value)) {
    return Array.from(value);
  }
  return [];
}

/**
 * Checks if a profile has the minimum required data for workout generation
 * 
 * @param profile - The profile to validate
 * @returns True if the profile has sufficient data for workout generation
 */
export function isProfileComplete(profile: Profile | null | undefined): boolean {
  if (!profile) {
    return false;
  }

  return !!(
    profile.experience &&
    profile.goals &&
    profile.goals.length > 0 &&
    profile.health_ack &&
    profile.data_consent
  );
}

/**
 * Gets a user-friendly description of what's missing from an incomplete profile
 * 
 * @param profile - The profile to check
 * @returns Array of missing requirements
 */
export function getMissingProfileRequirements(profile: Profile | null | undefined): string[] {
  const missing: string[] = [];

  if (!profile) {
    return ['Complete profile setup'];
  }

  if (!profile.experience) {
    missing.push('Experience level');
  }

  if (!profile.goals || profile.goals.length === 0) {
    missing.push('Fitness goals');
  }

  if (!profile.health_ack) {
    missing.push('Health acknowledgment');
  }

  if (!profile.data_consent) {
    missing.push('Data consent');
  }

  return missing;
}
