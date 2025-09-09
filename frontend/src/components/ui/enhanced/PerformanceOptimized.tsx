import React, { memo, useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView, useMotionValue, useTransform, AnimatePresence, useScroll } from 'framer-motion';
import { clsx } from 'clsx';

/**
 * Performance-Optimized Animation Components
 * 
 * This module provides high-performance animation components optimized for 60fps:
 * - Memoized components to prevent unnecessary re-renders
 * - GPU-accelerated animations using transform properties
 * - Intersection Observer for performance-aware animations
 * - Optimized loading states and micro-interactions
 * - Reduced layout thrashing and paint operations
 */

// Optimized fade-in animation with intersection observer
export interface OptimizedFadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  once?: boolean;
}

export const OptimizedFadeIn = memo<OptimizedFadeInProps>(({
  children,
  delay = 0,
  duration = 0.6,
  threshold = 0.1,
  className,
  once = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: '-10%' });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: {
          duration,
          delay,
          ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smooth animation
        },
      });
    }
  }, [isInView, controls, duration, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      className={className}
    >
      {children}
    </motion.div>
  );
});

OptimizedFadeIn.displayName = 'OptimizedFadeIn';

// High-performance loading spinner with GPU acceleration
export interface OptimizedSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const OptimizedSpinner = memo<OptimizedSpinnerProps>(({
  size = 'md',
  color = 'currentColor',
  className,
}) => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <motion.div
      className={clsx(
        'inline-block border-2 border-transparent rounded-full',
        sizeStyles[size],
        className
      )}
      style={{
        borderTopColor: color,
        borderRightColor: color,
      }}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
});

OptimizedSpinner.displayName = 'OptimizedSpinner';

// Optimized skeleton loader with shimmer effect
export interface OptimizedSkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: boolean;
}

export const OptimizedSkeleton = memo<OptimizedSkeletonProps>(({
  width = '100%',
  height = '1rem',
  className,
  variant = 'text',
  animation = true,
}) => {
  const shimmerX = useMotionValue(0);
  const shimmerOpacity = useTransform(shimmerX, [-100, 0, 100], [0, 1, 0]);

  useEffect(() => {
    if (!animation) return;

    const interval = setInterval(() => {
      shimmerX.set(-100);
      setTimeout(() => shimmerX.set(100), 50);
    }, 2000);

    return () => clearInterval(interval);
  }, [animation, shimmerX]);

  const variantStyles = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full',
  };

  return (
    <div
      className={clsx(
        'relative overflow-hidden bg-gray-200',
        variantStyles[variant],
        className
      )}
      style={{ width, height }}
    >
      {animation && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          style={{
            x: shimmerX,
            opacity: shimmerOpacity,
          }}
        />
      )}
    </div>
  );
});

OptimizedSkeleton.displayName = 'OptimizedSkeleton';

// Performance-optimized stagger animation container
export interface OptimizedStaggerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
  threshold?: number;
}

export const OptimizedStagger = memo<OptimizedStaggerProps>(({
  children,
  staggerDelay = 0.1,
  className,
  threshold = 0.1,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  }), [staggerDelay]);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      },
    },
  }), []);

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
});

OptimizedStagger.displayName = 'OptimizedStagger';

// Optimized hover scale effect with GPU acceleration
export interface OptimizedHoverScaleProps {
  children: React.ReactNode;
  scale?: number;
  duration?: number;
  className?: string;
}

export const OptimizedHoverScale = memo<OptimizedHoverScaleProps>(({
  children,
  scale = 1.05,
  duration = 0.2,
  className,
}) => {
  return (
    <motion.div
      className={className}
      whileHover={{
        scale,
        transition: { duration, ease: 'easeOut' },
      }}
      whileTap={{ scale: scale * 0.95 }}
      style={{ willChange: 'transform' }} // Optimize for GPU acceleration
    >
      {children}
    </motion.div>
  );
});

OptimizedHoverScale.displayName = 'OptimizedHoverScale';

// Performance-optimized progress bar
export interface OptimizedProgressProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  animated?: boolean;
  showValue?: boolean;
}

export const OptimizedProgress = memo<OptimizedProgressProps>(({
  value,
  max = 100,
  className,
  barClassName,
  animated = true,
  showValue = false,
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const progressX = useMotionValue(0);

  useEffect(() => {
    if (animated) {
      progressX.set(percentage);
    }
  }, [percentage, animated, progressX]);

  return (
    <div className={clsx('relative w-full bg-gray-200 rounded-full overflow-hidden', className)}>
      <motion.div
        className={clsx(
          'h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full',
          barClassName
        )}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{
          duration: animated ? 0.8 : 0,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        style={{ willChange: 'width' }}
      />
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
});

OptimizedProgress.displayName = 'OptimizedProgress';

// Optimized slide-in animation for modals and drawers
export interface OptimizedSlideInProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  isVisible: boolean;
  className?: string;
}

export const OptimizedSlideIn = memo<OptimizedSlideInProps>(({
  children,
  direction = 'up',
  isVisible,
  className,
}) => {
  const variants = useMemo(() => {
    const directions = {
      up: { y: '100%' },
      down: { y: '-100%' },
      left: { x: '100%' },
      right: { x: '-100%' },
    };

    return {
      hidden: directions[direction],
      visible: { x: 0, y: 0 },
    };
  }, [direction]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={className}
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 300,
          }}
          style={{ willChange: 'transform' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
});

OptimizedSlideIn.displayName = 'OptimizedSlideIn';

// Optimized parallax scroll effect
export interface OptimizedParallaxProps {
  children: React.ReactNode;
  offset?: number;
  className?: string;
}

export const OptimizedParallax = memo<OptimizedParallaxProps>(({
  children,
  offset = 50,
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, offset]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ y, willChange: 'transform' }}
    >
      {children}
    </motion.div>
  );
});

OptimizedParallax.displayName = 'OptimizedParallax';
