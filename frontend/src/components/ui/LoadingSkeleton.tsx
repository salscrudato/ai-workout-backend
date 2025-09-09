import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export interface LoadingSkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'list' | 'workout' | 'dashboard' | 'profile';
  width?: string | number;
  height?: string | number;
  lines?: number;
  className?: string;
  animate?: boolean;
  shimmer?: boolean;
  pulse?: boolean;
  wave?: boolean;
  gradient?: boolean;
}

/**
 * Enhanced Loading Skeleton Component with Advanced Animations
 *
 * Features:
 * - Multiple skeleton variants including workout-specific layouts
 * - Advanced animation options (shimmer, pulse, wave)
 * - Blue gradient theme with sophisticated effects
 * - Responsive design with mobile optimization
 * - Customizable dimensions and timing
 * - Accessibility support with reduced motion
 */
const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'rectangular',
  width,
  height,
  lines = 3,
  className,
  animate = true,
  shimmer = true,
  pulse = false,
  wave = false,
  gradient = true,
}) => {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    'matchMedia' in window &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Enhanced base styles with multiple animation options
  const baseStyles = clsx(
    gradient
      ? 'bg-gradient-to-r from-secondary-200 via-primary-100 to-secondary-200'
      : 'bg-secondary-200',
    'bg-[length:200%_100%]',
    'relative overflow-hidden',
    'motion-reduce:animate-none',
    className
  );

  // Animation styles
  const animationStyles = clsx(
    animate && !prefersReducedMotion && pulse && 'animate-pulse',
    animate && !prefersReducedMotion && wave && 'animate-bounce-gentle',
    prefersReducedMotion && 'motion-reduce:animate-none'
  );

  // Shimmer overlay component
  const ShimmerOverlay = () => (
    animate && shimmer && !prefersReducedMotion ? (
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent motion-reduce:animate-none"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 0.5,
          ease: 'easeInOut'
        }}
        aria-hidden="true"
      />
    ) : null
  );

  // Workout-specific skeleton
  if (variant === 'workout') {
    return (
      <motion.div
        className={clsx('glass rounded-xl p-6 space-y-6', className)}
        initial={{ opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? undefined : { duration: 0.3 }}
        aria-hidden="true"
      >
        {/* Workout header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={clsx(baseStyles, animationStyles, 'w-12 h-12 rounded-full')}>
              <ShimmerOverlay />
            </div>
            <div className="space-y-2">
              <div className={clsx(baseStyles, animationStyles, 'h-5 rounded w-32')}>
                <ShimmerOverlay />
              </div>
              <div className={clsx(baseStyles, animationStyles, 'h-3 rounded w-20')}>
                <ShimmerOverlay />
              </div>
            </div>
          </div>
          <div className={clsx(baseStyles, animationStyles, 'h-8 rounded w-16')}>
            <ShimmerOverlay />
          </div>
        </div>

        {/* Exercise list */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={clsx(baseStyles, animationStyles, 'w-8 h-8 rounded')}>
                  <ShimmerOverlay />
                </div>
                <div className="space-y-2">
                  <div className={clsx(baseStyles, animationStyles, 'h-4 rounded w-24')}>
                    <ShimmerOverlay />
                  </div>
                  <div className={clsx(baseStyles, animationStyles, 'h-3 rounded w-16')}>
                    <ShimmerOverlay />
                  </div>
                </div>
              </div>
              <div className={clsx(baseStyles, animationStyles, 'h-6 rounded w-12')}>
                <ShimmerOverlay />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  // Dashboard skeleton
  if (variant === 'dashboard') {
    return (
      <div className="space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <motion.div
              key={index}
              className="glass rounded-xl p-6 space-y-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
              transition={prefersReducedMotion ? undefined : { delay: index * 0.1, duration: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <div className={clsx(baseStyles, animationStyles, 'w-8 h-8 rounded')}>
                  <ShimmerOverlay />
                </div>
                <div className={clsx(baseStyles, animationStyles, 'h-4 rounded w-12')}>
                  <ShimmerOverlay />
                </div>
              </div>
              <div className={clsx(baseStyles, animationStyles, 'h-8 rounded w-16')}>
                <ShimmerOverlay />
              </div>
              <div className={clsx(baseStyles, animationStyles, 'h-3 rounded w-20')}>
                <ShimmerOverlay />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chart placeholder */}
        <motion.div
          className="glass rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? undefined : { delay: 0.4, duration: 0.3 }}
          aria-hidden="true"
        >
          <div className={clsx(baseStyles, animationStyles, 'h-64 rounded')}>
            <ShimmerOverlay />
          </div>
        </motion.div>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <motion.div
            key={index}
            className={clsx(
              baseStyles,
              animationStyles,
              'h-4 rounded',
              index === lines - 1 ? 'w-3/4' : 'w-full'
            )}
            style={{ width: index === lines - 1 ? '75%' : width }}
            initial={{ opacity: 0, x: -20 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
            transition={prefersReducedMotion ? undefined : { delay: index * 0.1, duration: 0.3 }}
          >
            <ShimmerOverlay />
          </motion.div>
        ))}
      </div>
    );
  }

  if (variant === 'circular') {
    return (
      <motion.div
        className={clsx(
          baseStyles,
          animationStyles,
          'rounded-full aspect-square'
        )}
        style={{ width: width || 40, height: height || 40 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
        transition={prefersReducedMotion ? undefined : { duration: 0.3 }}
        aria-hidden="true"
      >
        <ShimmerOverlay />
      </motion.div>
    );
  }

  if (variant === 'card') {
    return (
      <motion.div
        className={clsx('glass rounded-xl p-4 space-y-4', className)}
        initial={{ opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? undefined : { duration: 0.3 }}
        aria-hidden="true"
      >
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className={clsx(baseStyles, animationStyles, 'w-10 h-10 rounded-full')}>
            <ShimmerOverlay />
          </div>
          <div className="flex-1 space-y-2">
            <div className={clsx(baseStyles, animationStyles, 'h-4 rounded w-3/4')}>
              <ShimmerOverlay />
            </div>
            <div className={clsx(baseStyles, animationStyles, 'h-3 rounded w-1/2')}>
              <ShimmerOverlay />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className={clsx(baseStyles, animationStyles, 'h-4 rounded')}>
            <ShimmerOverlay />
          </div>
          <div className={clsx(baseStyles, animationStyles, 'h-4 rounded w-5/6')}>
            <ShimmerOverlay />
          </div>
          <div className={clsx(baseStyles, animationStyles, 'h-4 rounded w-4/6')}>
            <ShimmerOverlay />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center">
          <div className={clsx(baseStyles, animationStyles, 'h-8 rounded w-20')}>
            <ShimmerOverlay />
          </div>
          <div className={clsx(baseStyles, animationStyles, 'h-8 rounded w-16')}>
            <ShimmerOverlay />
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <motion.div
            key={index}
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
            transition={prefersReducedMotion ? undefined : { delay: index * 0.1, duration: 0.3 }}
          >
            <div className={clsx(baseStyles, animationStyles, 'w-8 h-8 rounded-full')}>
              <ShimmerOverlay />
            </div>
            <div className="flex-1 space-y-2">
              <div className={clsx(baseStyles, animationStyles, 'h-4 rounded w-3/4')}>
                <ShimmerOverlay />
              </div>
              <div className={clsx(baseStyles, animationStyles, 'h-3 rounded w-1/2')}>
                <ShimmerOverlay />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  // Rectangular variant (default)
  return (
    <motion.div
      className={clsx(baseStyles, animationStyles, 'rounded')}
      style={{
        width: width || '100%',
        height: height || 20
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
      transition={prefersReducedMotion ? undefined : { duration: 0.3 }}
      aria-hidden="true"
    >
      <ShimmerOverlay />
    </motion.div>
  );
};

export default LoadingSkeleton;
