import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useAnimation, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * Advanced Animation Utilities
 * 
 * This module provides advanced animation utilities and performance optimizations:
 * - Custom easing functions for smooth animations
 * - Performance monitoring and frame rate optimization
 * - Advanced spring physics configurations
 * - GPU-accelerated transform utilities
 * - Animation orchestration helpers
 */

// Custom easing functions optimized for UI animations
export const easingFunctions = {
  // Smooth entrance animations
  easeOutQuart: [0.25, 1, 0.5, 1] as [number, number, number, number],
  easeOutExpo: [0.19, 1, 0.22, 1] as [number, number, number, number],
  easeOutBack: [0.34, 1.56, 0.64, 1] as [number, number, number, number],

  // Smooth exit animations
  easeInQuart: [0.5, 0, 0.75, 0] as [number, number, number, number],
  easeInExpo: [0.95, 0.05, 0.795, 0.035] as [number, number, number, number],

  // Bouncy animations
  easeOutBounce: [0.68, -0.55, 0.265, 1.55] as [number, number, number, number],

  // Smooth bidirectional
  easeInOutQuart: [0.76, 0, 0.24, 1] as [number, number, number, number],
  easeInOutExpo: [0.87, 0, 0.13, 1] as [number, number, number, number],
} as const;

// Spring configurations for different animation types
export const springConfigs = {
  // Gentle spring for UI elements
  gentle: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
    mass: 1,
  },
  
  // Bouncy spring for playful interactions
  bouncy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 20,
    mass: 0.8,
  },
  
  // Stiff spring for quick responses
  stiff: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 35,
    mass: 0.6,
  },
  
  // Wobbly spring for attention-grabbing effects
  wobbly: {
    type: 'spring' as const,
    stiffness: 180,
    damping: 12,
    mass: 1,
  },
  
  // Slow spring for smooth, deliberate animations
  slow: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 40,
    mass: 1.2,
  },
} as const;

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fps = useRef(60);

  const measureFPS = useCallback(() => {
    const now = performance.now();
    frameCount.current++;
    
    if (now - lastTime.current >= 1000) {
      fps.current = Math.round((frameCount.current * 1000) / (now - lastTime.current));
      frameCount.current = 0;
      lastTime.current = now;
    }
    
    requestAnimationFrame(measureFPS);
  }, []);

  useEffect(() => {
    const rafId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(rafId);
  }, [measureFPS]);

  return {
    fps: fps.current,
    isOptimal: fps.current >= 55, // Consider 55+ FPS as optimal
  };
};

// Advanced spring hook with performance optimization
export const useOptimizedSpring = (
  target: number,
  config: typeof springConfigs[keyof typeof springConfigs] = springConfigs.gentle
) => {
  const motionValue = useMotionValue(target);
  const spring = useSpring(motionValue, config);

  useEffect(() => {
    motionValue.set(target);
  }, [target, motionValue]);

  return spring;
};

// GPU-accelerated transform utilities
export const createGPUOptimizedVariants = (
  initialTransform: Record<string, any>,
  animateTransform: Record<string, any>,
  exitTransform?: Record<string, any>
) => ({
  initial: {
    ...initialTransform,
    willChange: 'transform, opacity',
  },
  animate: {
    ...animateTransform,
    willChange: 'transform, opacity',
    transition: {
      duration: 0.3,
      ease: easingFunctions.easeOutQuart,
    },
  },
  exit: exitTransform ? {
    ...exitTransform,
    willChange: 'auto',
    transition: {
      duration: 0.2,
      ease: easingFunctions.easeInQuart,
    },
  } : undefined,
});

// Optimized stagger animation variants
export const createStaggerVariants = (
  staggerDelay: number = 0.1,
  childDuration: number = 0.5
) => ({
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: staggerDelay * 0.5,
        staggerDirection: -1,
        duration: 0.2,
      },
    },
  },
  item: {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: childDuration,
        ease: easingFunctions.easeOutBack,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: childDuration * 0.6,
        ease: easingFunctions.easeInQuart,
      },
    },
  },
});

// Advanced parallax scroll hook
export const useParallaxScroll = (offset: number = 0.5) => {
  const ref = useRef<HTMLElement>(null);
  const scrollY = useMotionValue(0);
  const y = useTransform(scrollY, [0, 1], [0, offset]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateScrollY = () => {
      const rect = element.getBoundingClientRect();
      const scrollProgress = Math.max(0, Math.min(1, 
        (window.innerHeight - rect.top) / (window.innerHeight + rect.height)
      ));
      scrollY.set(scrollProgress);
    };

    const handleScroll = () => {
      requestAnimationFrame(updateScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateScrollY(); // Initial calculation

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollY]);

  return { ref, y };
};

// Optimized intersection observer hook for animations
export const useOptimizedInView = (
  threshold: number = 0.1,
  rootMargin: string = '0px 0px -10% 0px'
) => {
  const ref = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = React.useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin]);

  return { ref, isInView };
};

// Animation orchestration utilities
export const createSequentialAnimation = (
  controls: ReturnType<typeof useAnimation>,
  animations: Array<{
    values: Record<string, any>;
    duration?: number;
    delay?: number;
    ease?: any;
  }>
) => {
  return async () => {
    for (const animation of animations) {
      await controls.start({
        ...animation.values,
        transition: {
          duration: animation.duration || 0.3,
          delay: animation.delay || 0,
          ease: animation.ease || easingFunctions.easeOutQuart,
        },
      });
    }
  };
};

// Micro-interaction variants for common UI elements
export const microInteractionVariants = {
  button: {
    idle: { scale: 1 },
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2, ease: easingFunctions.easeOutQuart }
    },
    tap: { 
      scale: 0.98,
      transition: { duration: 0.1, ease: easingFunctions.easeInQuart }
    },
  },
  
  card: {
    idle: { scale: 1, y: 0 },
    hover: { 
      scale: 1.02,
      y: -4,
      transition: { duration: 0.3, ease: easingFunctions.easeOutBack }
    },
  },
  
  icon: {
    idle: { rotate: 0, scale: 1 },
    hover: { 
      rotate: 5,
      scale: 1.1,
      transition: { duration: 0.2, ease: easingFunctions.easeOutBack }
    },
    tap: { 
      rotate: -5,
      scale: 0.9,
      transition: { duration: 0.1 }
    },
  },
  
  badge: {
    idle: { scale: 1 },
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: easingFunctions.easeInOutQuart,
      },
    },
  },
};

// Performance-optimized loading states
export const loadingVariants = {
  spinner: {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear' as const,
      },
    },
  },
  
  dots: {
    container: {
      animate: {
        transition: {
          staggerChildren: 0.2,
          repeat: Infinity,
          repeatType: 'reverse' as const,
        },
      },
    },
    dot: {
      animate: {
        y: [0, -10, 0],
        transition: {
          duration: 0.6,
          ease: easingFunctions.easeInOutQuart,
        },
      },
    },
  },
  
  pulse: {
    animate: {
      opacity: [0.5, 1, 0.5],
      scale: [1, 1.05, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: easingFunctions.easeInOutQuart,
      },
    },
  },
};

// Utility to create responsive animation values
export const createResponsiveAnimation = (
  mobile: Record<string, any>,
  desktop: Record<string, any>
) => {
  const isMobile = window.innerWidth < 768;
  return isMobile ? mobile : desktop;
};
