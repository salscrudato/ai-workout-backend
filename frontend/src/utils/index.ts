/**
 * Consolidated Utilities Index
 * 
 * Central export point for all utility functions and classes.
 * Organized by category for better discoverability and maintainability.
 */

// =============================================================================
// PERFORMANCE UTILITIES
// =============================================================================
export {
  // Core utilities
  debounce,
  throttle,
  rafThrottle,
  
  // Performance monitoring
  performanceMonitor,
  usePerformanceMonitor,
  usePerformanceTracking,
  measureAsync,
  measureSync,
  
  // Optimization utilities
  createIntersectionObserver,
  preloadImage,
  preloadImages,
  optimizeScroll,
  preventLayoutShift,
  enableGPUAcceleration,
  shouldComponentUpdate,
  
  // Device detection
  prefersReducedMotion,
  prefersHighContrast,
  getDevicePixelRatio,
  isTouchDevice,
  getMemoryUsage,
  getNetworkInfo,
  
  // Types
  type PerformanceMetrics,
  type WebVitals,
} from './performanceUtils';

// =============================================================================
// BROWSER COMPATIBILITY
// =============================================================================
export {
  initializeBrowserCompatibility,
  featureDetection,
  browserDetection,
  polyfills,
  fallbacks,
} from './browserCompatibility';

// =============================================================================
// CACHING UTILITIES
// =============================================================================
export {
  apiCache,
  userCache,
  workoutCache,
  imageCache,
  generateCacheKey,
  invalidateCache,
} from './cache';

// =============================================================================
// ASSET LOADING
// =============================================================================
export {
  assetLoader,
  useAssetPreloader,
} from './assetLoader';

// =============================================================================
// ACCESSIBILITY UTILITIES
// =============================================================================
export {
  announceToScreenReader,
  trapFocus,
  restoreFocus,
  getAccessibleName,
  isElementVisible,
  getFocusableElements,
  createAriaLiveRegion,
  updateAriaLiveRegion,
  removeAriaLiveRegion,
  handleKeyboardNavigation,
  createSkipLink,
  enhanceFormAccessibility,
  checkColorContrast,
  validateAccessibility,
} from './accessibility';

// =============================================================================
// USER INTERACTION
// =============================================================================
export {
  hasUserInteraction,
  onUserInteraction,
  enableVibration,
  enableAudio,
  enableNotifications,
  trackInteraction,
  getInteractionMetrics,
} from './userInteraction';

// =============================================================================
// PROFILE UTILITIES
// =============================================================================
export {
  validateProfile,
  calculateProfileCompleteness,
  getProfileRecommendations,
  formatProfileData,
  sanitizeProfileInput,
} from './profileUtils';

// =============================================================================
// LOGGING
// =============================================================================
export {
  logger,
  createLogger,
  LogLevel,
  type LogEntry,
  type LoggerConfig,
} from './logger';

// =============================================================================
// COMMON UTILITY FUNCTIONS
// =============================================================================

/**
 * Format file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format duration in human readable format
 */
export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
};

/**
 * Generate a random ID
 */
export const generateId = (prefix = 'id'): string => {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Deep clone an object
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export const isEmpty = (value: any): boolean => {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Capitalize first letter of a string
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert camelCase to kebab-case
 */
export const camelToKebab = (str: string): string => {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
};

/**
 * Convert kebab-case to camelCase
 */
export const kebabToCamel = (str: string): string => {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

/**
 * Clamp a number between min and max values
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Linear interpolation between two values
 */
export const lerp = (start: number, end: number, factor: number): string => {
  return (start + (end - start) * factor).toString();
};

/**
 * Map a value from one range to another
 */
export const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

/**
 * Check if code is running in development mode
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Check if code is running in production mode
 */
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Check if code is running in browser
 */
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

/**
 * Check if code is running on server
 */
export const isServer = (): boolean => {
  return typeof window === 'undefined';
};

// =============================================================================
// CONSTANTS
// =============================================================================

export const BREAKPOINTS = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  toast: 1070,
} as const;

export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  WORKOUT_HISTORY: 'workout_history',
  EQUIPMENT_LIST: 'equipment_list',
  APP_SETTINGS: 'app_settings',
} as const;
