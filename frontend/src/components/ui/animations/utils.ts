/**
 * Animation utilities and helper functions
 */

// Easing functions
export const easing = {
  // Material Design easing curves
  standard: [0.4, 0.0, 0.2, 1],
  decelerate: [0.0, 0.0, 0.2, 1],
  accelerate: [0.4, 0.0, 1, 1],
  sharp: [0.4, 0.0, 0.6, 1],
  
  // Custom easing curves
  bounce: [0.68, -0.55, 0.265, 1.55],
  elastic: [0.175, 0.885, 0.32, 1.275],
  smooth: [0.25, 0.46, 0.45, 0.94],
  
  // Apple-style easing
  appleEase: [0.25, 0.1, 0.25, 1],
  appleSpring: [0.5, 0, 0.75, 0],
} as const;

// Duration constants
export const duration = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 750,
  slowest: 1000,
} as const;

// Spring configurations
export const spring = {
  gentle: { type: 'spring', stiffness: 120, damping: 14 },
  wobbly: { type: 'spring', stiffness: 180, damping: 12 },
  stiff: { type: 'spring', stiffness: 210, damping: 20 },
  slow: { type: 'spring', stiffness: 280, damping: 60 },
  molasses: { type: 'spring', stiffness: 280, damping: 120 },
} as const;

// Utility function to create stagger delays
export const createStaggerDelay = (index: number, baseDelay = 0.1) => {
  return index * baseDelay;
};

// Utility function to create random delays for organic feel
export const createRandomDelay = (min = 0, max = 0.5) => {
  return Math.random() * (max - min) + min;
};

// Utility function to interpolate between values
export const interpolate = (
  value: number,
  inputRange: [number, number],
  outputRange: [number, number],
  clamp = true
) => {
  const [inputMin, inputMax] = inputRange;
  const [outputMin, outputMax] = outputRange;
  
  let result = outputMin + ((value - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin);
  
  if (clamp) {
    result = Math.min(Math.max(result, Math.min(outputMin, outputMax)), Math.max(outputMin, outputMax));
  }
  
  return result;
};

// Utility function to create responsive animation values
export const createResponsiveValue = <T>(
  mobile: T,
  tablet: T,
  desktop: T
): T => {
  if (typeof window === 'undefined') return mobile;
  
  const width = window.innerWidth;
  if (width < 768) return mobile;
  if (width < 1024) return tablet;
  return desktop;
};

// Utility function to check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Utility function to create accessible animations
export const createAccessibleAnimation = <T extends Record<string, any>>(
  animation: T,
  reducedMotionFallback?: Partial<T>
): T => {
  if (prefersReducedMotion()) {
    return {
      ...animation,
      ...reducedMotionFallback,
      transition: {
        ...animation.transition,
        duration: 0.01, // Nearly instant for reduced motion
      },
    };
  }
  return animation;
};

// Utility function to calculate optimal animation duration based on distance
export const calculateDuration = (
  distance: number,
  velocity = 1000 // pixels per second
): number => {
  const baseDuration = distance / velocity;
  return Math.max(0.15, Math.min(baseDuration, 0.8)); // Clamp between 150ms and 800ms
};

// Utility function to create path animations for SVG
export const createPathAnimation = (pathLength: number) => ({
  initial: {
    pathLength: 0,
    opacity: 0,
  },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 2, ease: 'easeInOut' },
      opacity: { duration: 0.3 },
    },
  },
});

// Utility function to create morphing animations
export const createMorphAnimation = (
  fromPath: string,
  toPath: string,
  duration = 0.5
) => ({
  initial: { d: fromPath },
  animate: { d: toPath },
  transition: { duration, ease: easing.smooth },
});

// Utility function to create loading skeleton animations
export const createSkeletonAnimation = () => ({
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'linear',
  },
});

// Utility function to create floating animations
export const createFloatingAnimation = (
  amplitude = 10,
  duration = 3
) => ({
  animate: {
    y: [-amplitude, amplitude, -amplitude],
  },
  transition: {
    duration,
    repeat: Infinity,
    ease: 'easeInOut',
  },
});

// Utility function to create pulsing animations
export const createPulseAnimation = (
  scale = 1.05,
  duration = 2
) => ({
  animate: {
    scale: [1, scale, 1],
    opacity: [0.7, 1, 0.7],
  },
  transition: {
    duration,
    repeat: Infinity,
    ease: 'easeInOut',
  },
});

// Utility function to create typing cursor animation
export const createCursorAnimation = () => ({
  animate: {
    opacity: [1, 0, 1],
  },
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: 'linear',
  },
});

// Utility function to create page transition variants
export const createPageTransition = (direction: 'left' | 'right' | 'up' | 'down' = 'right') => {
  const directions = {
    left: { x: -100 },
    right: { x: 100 },
    up: { y: -100 },
    down: { y: 100 },
  };

  return {
    initial: {
      opacity: 0,
      ...directions[direction],
    },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.4,
        ease: easing.smooth,
      },
    },
    exit: {
      opacity: 0,
      ...directions[direction === 'left' ? 'right' : direction === 'right' ? 'left' : direction === 'up' ? 'down' : 'up'],
      transition: {
        duration: 0.3,
        ease: easing.sharp,
      },
    },
  };
};

// Utility function to create notification animations
export const createNotificationAnimation = (position: 'top' | 'bottom' = 'top') => ({
  initial: {
    opacity: 0,
    y: position === 'top' ? -50 : 50,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    y: position === 'top' ? -50 : 50,
    scale: 0.9,
    transition: {
      duration: 0.2,
    },
  },
});

// Performance optimization utilities
export const optimizeForPerformance = {
  // Use transform instead of changing layout properties
  useTransform: true,
  // Enable hardware acceleration
  style: {
    transformStyle: 'preserve-3d' as const,
    backfaceVisibility: 'hidden' as const,
  },
  // Reduce motion for better performance on low-end devices
  reduceMotionOnLowEnd: () => {
    if (typeof navigator !== 'undefined') {
      const connection = (navigator as any).connection;
      return connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
    }
    return false;
  },
};
