/**
 * User Interaction Utilities
 * 
 * Tracks user interaction state for features that require user activation
 * (like vibration API, audio playback, etc.)
 */

let hasUserInteracted = false;
let interactionListeners: (() => void)[] = [];

/**
 * Check if user has interacted with the page
 */
export const hasUserInteraction = (): boolean => {
  return hasUserInteracted;
};

/**
 * Mark that user has interacted with the page
 */
const markUserInteraction = (): void => {
  if (!hasUserInteracted) {
    hasUserInteracted = true;
    // Notify all listeners
    interactionListeners.forEach(listener => listener());
    // Clean up listeners after first interaction
    interactionListeners = [];
  }
};

/**
 * Add a listener for the first user interaction
 */
export const onFirstUserInteraction = (callback: () => void): (() => void) => {
  if (hasUserInteracted) {
    // If user has already interacted, call immediately
    callback();
    return () => {}; // Return empty cleanup function
  }
  
  interactionListeners.push(callback);
  
  // Return cleanup function
  return () => {
    const index = interactionListeners.indexOf(callback);
    if (index > -1) {
      interactionListeners.splice(index, 1);
    }
  };
};

/**
 * Safe vibration function that only works after user interaction
 */
export const safeVibrate = (pattern: number | number[]): boolean => {
  if (!hasUserInteracted || !('vibrate' in navigator)) {
    return false;
  }
  
  try {
    return navigator.vibrate(pattern);
  } catch (error) {
    console.debug('Vibration failed:', error);
    return false;
  }
};

/**
 * Initialize user interaction tracking
 */
export const initializeUserInteractionTracking = (): (() => void) => {
  const events = ['click', 'touchstart', 'keydown', 'mousedown'];
  
  const handleInteraction = () => {
    markUserInteraction();
    // Remove listeners after first interaction
    events.forEach(event => {
      document.removeEventListener(event, handleInteraction, { capture: true });
    });
  };
  
  // Add listeners for various interaction events
  events.forEach(event => {
    document.addEventListener(event, handleInteraction, { capture: true, once: true });
  });
  
  // Return cleanup function
  return () => {
    events.forEach(event => {
      document.removeEventListener(event, handleInteraction, { capture: true });
    });
  };
};

// Auto-initialize when module is loaded
if (typeof window !== 'undefined') {
  initializeUserInteractionTracking();
}
