// Animation system exports
export { default as AnimatedContainer } from './AnimatedContainer';
export { default as PageTransition } from './PageTransition';
export { default as MicroInteraction } from './MicroInteraction';
export { default as LoadingAnimation } from './LoadingAnimation';
export { default as GestureHandler } from './GestureHandler';
export { default as ParallaxContainer } from './ParallaxContainer';
export { default as CountUpAnimation } from './CountUpAnimation';
export { default as ProgressAnimation } from './ProgressAnimation';

// Animation variants and utilities
export * from './variants';
export * from './utils';
export * from './hooks';

// Enhanced feedback animations
export const successBounce = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 0.6,
      times: [0, 0.3, 1],
      ease: 'easeOut'
    }
  }
};

export const errorShake = {
  initial: { x: 0 },
  animate: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
      times: [0, 0.25, 0.5, 0.75, 1],
      ease: 'easeInOut'
    }
  }
};

export const progressPulse = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export const gentleBounce = {
  initial: { y: 0 },
  animate: {
    y: [-2, 0],
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
};

// Form feedback animations
export const formSuccessAnimation = {
  initial: { scale: 0.8, opacity: 0, y: 20 },
  animate: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25
    }
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2
    }
  }
};

export const formErrorAnimation = {
  initial: { scale: 0.9, opacity: 0, x: -20 },
  animate: {
    scale: 1,
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25
    }
  },
  exit: {
    scale: 0.9,
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.2
    }
  }
};
