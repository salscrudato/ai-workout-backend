import { Variants } from 'framer-motion';

/**
 * Premium animation variants for sophisticated motion design
 * Following Material Design, Apple Human Interface Guidelines, and modern web standards
 * Enhanced with custom easing curves and micro-interactions
 */

// Premium easing curves for sophisticated animations
export const easingCurves = {
  // Apple-inspired easing
  appleEase: [0.25, 0.1, 0.25, 1],
  appleSpring: [0.68, -0.55, 0.265, 1.55],

  // Google Material easing
  materialStandard: [0.4, 0.0, 0.2, 1],
  materialDecelerate: [0.0, 0.0, 0.2, 1],
  materialAccelerate: [0.4, 0.0, 1, 1],

  // Custom premium curves
  premiumSmooth: [0.25, 0.46, 0.45, 0.94],
  premiumBounce: [0.68, -0.55, 0.265, 1.55],
  premiumElastic: [0.175, 0.885, 0.32, 1.275],

  // Micro-interaction curves
  microFast: [0.25, 1, 0.5, 1],
  microGentle: [0.16, 1, 0.3, 1],
  microSpring: [0.34, 1.56, 0.64, 1],
} as const;

// Enhanced page transition variants with sophisticated effects
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
    filter: 'blur(4px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smooth feel
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    filter: 'blur(4px)',
    transition: {
      duration: 0.3,
      ease: [0.55, 0.06, 0.68, 0.19],
    },
  },
};

// Advanced page transition variants for different directions
export const pageSlideVariants: Variants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 100 : -100,
    scale: 0.95,
  }),
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction < 0 ? 100 : -100,
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: [0.55, 0.06, 0.68, 0.19],
    },
  }),
};

// Sophisticated fade and scale transition
export const pageFadeScaleVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 1.1,
    filter: 'blur(8px)',
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1], // Smooth spring-like easing
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    filter: 'blur(8px)',
    transition: {
      duration: 0.4,
      ease: [0.7, 0, 0.84, 0],
    },
  },
};

// Enhanced card hover animations with sophisticated effects
export const cardVariants: Variants = {
  initial: {
    scale: 1,
    y: 0,
    rotateX: 0,
    rotateY: 0,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  hover: {
    scale: 1.03,
    y: -6,
    rotateX: 2,
    rotateY: 2,
    boxShadow: '0 25px 50px -12px rgba(14, 165, 233, 0.25), 0 0 40px rgba(14, 165, 233, 0.1)',
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  tap: {
    scale: 0.97,
    y: -2,
    transition: {
      duration: 0.1,
    },
  },
};

// Premium card variant with glass morphism effect
export const premiumCardVariants: Variants = {
  initial: {
    scale: 1,
    y: 0,
    backdropFilter: 'blur(20px)',
    background: 'rgba(255, 255, 255, 0.8)',
  },
  hover: {
    scale: 1.02,
    y: -8,
    backdropFilter: 'blur(24px)',
    background: 'rgba(255, 255, 255, 0.9)',
    boxShadow: '0 32px 64px -12px rgba(14, 165, 233, 0.3)',
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
};

// Button interaction variants
export const buttonVariants: Variants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
  loading: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Stagger animation for lists
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// Floating action button variants
export const fabVariants: Variants = {
  initial: {
    scale: 0,
    rotate: -180,
  },
  animate: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
      delay: 0.5,
    },
  },
  hover: {
    scale: 1.1,
    rotate: 5,
    transition: {
      duration: 0.2,
    },
  },
  tap: {
    scale: 0.9,
    rotate: -5,
  },
};

// Modal/Dialog variants
export const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    y: 50,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.2,
    },
  },
};

// Backdrop variants
export const backdropVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

// Slide in variants (for mobile navigation)
export const slideVariants: Variants = {
  initial: {
    x: '-100%',
  },
  animate: {
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    x: '-100%',
    transition: {
      duration: 0.2,
    },
  },
};

// Progress bar variants
export const progressVariants: Variants = {
  initial: {
    scaleX: 0,
    originX: 0,
  },
  animate: (progress: number) => ({
    scaleX: progress / 100,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

// Notification variants
export const notificationVariants: Variants = {
  initial: {
    opacity: 0,
    y: -50,
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
    y: -50,
    scale: 0.9,
    transition: {
      duration: 0.2,
    },
  },
};

// Workout card specific variants
export const workoutCardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 30,
    rotateX: -15,
  },
  animate: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  hover: {
    y: -8,
    rotateX: 5,
    boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.25)',
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

// Loading spinner variants
export const spinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Enhanced pulse animation for loading states
export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Advanced morphing animation for dynamic elements
export const morphVariants: Variants = {
  initial: {
    borderRadius: '12px',
    scale: 1,
  },
  animate: {
    borderRadius: ['12px', '24px', '12px'],
    scale: [1, 1.02, 1],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Sophisticated text reveal animation
export const textRevealVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    filter: 'blur(4px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// Floating animation for hero elements
export const floatVariants: Variants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Gradient shift animation for backgrounds
export const gradientShiftVariants: Variants = {
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Sophisticated button press animation
export const advancedButtonVariants: Variants = {
  initial: {
    scale: 1,
    boxShadow: '0 4px 14px 0 rgba(14, 165, 233, 0.15)',
  },
  hover: {
    scale: 1.05,
    boxShadow: '0 8px 25px 0 rgba(14, 165, 233, 0.25)',
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  tap: {
    scale: 0.95,
    boxShadow: '0 2px 8px 0 rgba(14, 165, 233, 0.1)',
    transition: {
      duration: 0.1,
    },
  },
  success: {
    scale: [1, 1.1, 1],
    boxShadow: '0 8px 25px 0 rgba(34, 197, 94, 0.3)',
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

// Parallax scroll animation
export const parallaxVariants: Variants = {
  animate: (scrollY: number) => ({
    y: scrollY * 0.5,
    transition: {
      duration: 0,
    },
  }),
};

// Staggered list animation with enhanced timing
export const enhancedStaggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const enhancedStaggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.95,
    filter: 'blur(4px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: easingCurves.premiumSmooth,
    },
  },
};

// Sophisticated micro-interaction variants for premium user experience
export const microInteractionVariants = {
  // Premium button interactions with sophisticated feedback
  premiumButton: {
    initial: { scale: 1, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' },
    hover: {
      scale: 1.02,
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
      transition: { duration: 0.2, ease: easingCurves.microGentle }
    },
    tap: {
      scale: 0.98,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      transition: { duration: 0.1, ease: easingCurves.microFast }
    },
  },

  // Luxury card interactions with 3D transforms
  luxuryCard: {
    initial: {
      scale: 1,
      rotateX: 0,
      rotateY: 0,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
    },
    hover: {
      scale: 1.03,
      rotateX: 2,
      rotateY: 2,
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
      transition: { duration: 0.3, ease: easingCurves.premiumElastic }
    },
    tap: {
      scale: 0.97,
      transition: { duration: 0.1, ease: easingCurves.microFast }
    },
  },

  // Sophisticated floating elements for hero sections
  floatingElement: {
    initial: { y: 0, rotate: 0 },
    animate: {
      y: [-2, 2, -2],
      rotate: [-0.5, 0.5, -0.5],
      transition: {
        duration: 4,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'reverse' as const,
      }
    },
  },

  // Premium loading states with bounce
  premiumLoader: {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: [0.8, 1.1, 1],
      opacity: [0, 1, 1],
      transition: {
        duration: 0.6,
        ease: easingCurves.premiumBounce,
        times: [0, 0.6, 1],
      }
    },
  },

  // Delightful success feedback
  successFeedback: {
    initial: { scale: 1, rotate: 0 },
    animate: {
      scale: [1, 1.2, 1],
      rotate: [0, 5, 0],
      transition: {
        duration: 0.5,
        ease: easingCurves.appleSpring,
        times: [0, 0.6, 1],
      }
    },
  },
} as const;
