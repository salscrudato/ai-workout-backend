import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export interface ModernLoadingSkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'workout' | 'dashboard' | 'profile';
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
 * Modern Loading Skeleton Component with Advanced Animations
 *
 * Features:
 * - Multiple skeleton variants including workout-specific layouts
 * - Advanced animation options (shimmer, pulse, wave)
 * - Blue gradient theme with sophisticated effects
 * - Responsive design with mobile optimization
 * - Customizable dimensions and timing
 * - Accessibility support with reduced motion
 */
const ModernLoadingSkeleton: React.FC<ModernLoadingSkeletonProps> = ({
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
      ? 'bg-gradient-to-r from-neutral-200 via-primary-100 to-neutral-200'
      : 'bg-neutral-200',
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

  // Shimmer effect overlay
  const shimmerOverlay = shimmer && animate && !prefersReducedMotion && (
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
      animate={{
        x: ['-100%', '100%'],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );

  // Text variant with multiple lines
  if (variant === 'text') {
    return (
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <motion.div
            key={index}
            className={clsx(
              baseStyles,
              animationStyles,
              'h-4 rounded-lg',
              index === lines - 1 ? 'w-3/4' : 'w-full'
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            {shimmerOverlay}
          </motion.div>
        ))}
      </div>
    );
  }

  // Circular variant (for avatars, icons)
  if (variant === 'circular') {
    return (
      <motion.div
        className={clsx(baseStyles, animationStyles, 'rounded-full')}
        style={{
          width: width || '48px',
          height: height || '48px',
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {shimmerOverlay}
      </motion.div>
    );
  }

  // Card variant for workout cards
  if (variant === 'card' || variant === 'workout') {
    return (
      <motion.div
        className={clsx(
          'glass rounded-2xl p-6 space-y-4',
          'border border-white/20 shadow-soft'
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={clsx(baseStyles, animationStyles, 'w-10 h-10 rounded-xl')}>
              {shimmerOverlay}
            </div>
            <div className="space-y-2">
              <div className={clsx(baseStyles, animationStyles, 'h-4 w-24 rounded-lg')}>
                {shimmerOverlay}
              </div>
              <div className={clsx(baseStyles, animationStyles, 'h-3 w-16 rounded-lg')}>
                {shimmerOverlay}
              </div>
            </div>
          </div>
          <div className={clsx(baseStyles, animationStyles, 'w-8 h-8 rounded-full')}>
            {shimmerOverlay}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <div className={clsx(baseStyles, animationStyles, 'h-4 w-full rounded-lg')}>
            {shimmerOverlay}
          </div>
          <div className={clsx(baseStyles, animationStyles, 'h-4 w-4/5 rounded-lg')}>
            {shimmerOverlay}
          </div>
          <div className={clsx(baseStyles, animationStyles, 'h-4 w-3/5 rounded-lg')}>
            {shimmerOverlay}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex space-x-2">
            <div className={clsx(baseStyles, animationStyles, 'h-6 w-16 rounded-full')}>
              {shimmerOverlay}
            </div>
            <div className={clsx(baseStyles, animationStyles, 'h-6 w-20 rounded-full')}>
              {shimmerOverlay}
            </div>
          </div>
          <div className={clsx(baseStyles, animationStyles, 'h-8 w-24 rounded-xl')}>
            {shimmerOverlay}
          </div>
        </div>
      </motion.div>
    );
  }

  // Dashboard variant
  if (variant === 'dashboard') {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className={clsx(baseStyles, animationStyles, 'h-12 w-80 mx-auto rounded-2xl')}>
            {shimmerOverlay}
          </div>
          <div className={clsx(baseStyles, animationStyles, 'h-6 w-64 mx-auto rounded-xl')}>
            {shimmerOverlay}
          </div>
        </div>

        {/* Hero Card */}
        <div className={clsx(baseStyles, animationStyles, 'h-32 w-full rounded-3xl')}>
          {shimmerOverlay}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className={clsx(baseStyles, animationStyles, 'h-24 rounded-2xl')}
            >
              {shimmerOverlay}
            </div>
          ))}
        </div>

        {/* Content Cards */}
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className={clsx(baseStyles, animationStyles, 'h-48 rounded-2xl')}
            >
              {shimmerOverlay}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Profile variant
  if (variant === 'profile') {
    return (
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-center space-x-4">
          <div className={clsx(baseStyles, animationStyles, 'w-20 h-20 rounded-full')}>
            {shimmerOverlay}
          </div>
          <div className="space-y-2 flex-1">
            <div className={clsx(baseStyles, animationStyles, 'h-6 w-48 rounded-xl')}>
              {shimmerOverlay}
            </div>
            <div className={clsx(baseStyles, animationStyles, 'h-4 w-32 rounded-lg')}>
              {shimmerOverlay}
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className={clsx(baseStyles, animationStyles, 'h-4 w-24 rounded-lg')}>
                {shimmerOverlay}
              </div>
              <div className={clsx(baseStyles, animationStyles, 'h-11 w-full rounded-xl')}>
                {shimmerOverlay}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Rectangular variant (default)
  return (
    <motion.div
      className={clsx(baseStyles, animationStyles, 'rounded-xl')}
      style={{
        width: width || '100%',
        height: height || '20px',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {shimmerOverlay}
    </motion.div>
  );
};

ModernLoadingSkeleton.displayName = 'ModernLoadingSkeleton';

export default ModernLoadingSkeleton;
