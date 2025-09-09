import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { loadingVariants, easingFunctions } from './AnimationUtils';

/**
 * Optimized Loading Components
 * 
 * High-performance loading states and indicators:
 * - GPU-accelerated animations
 * - Minimal DOM manipulation
 * - Efficient re-rendering patterns
 * - Accessible loading states
 * - Customizable appearance
 */

// Optimized spinner with GPU acceleration
export interface OptimizedSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  thickness?: 'thin' | 'medium' | 'thick';
  className?: string;
}

export const OptimizedSpinner = memo<OptimizedSpinnerProps>(({
  size = 'md',
  color = 'primary',
  thickness = 'medium',
  className,
}) => {
  const sizeStyles = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorStyles = {
    primary: 'border-blue-600',
    secondary: 'border-gray-600',
    white: 'border-white',
    gray: 'border-gray-400',
  };

  const thicknessStyles = {
    thin: 'border',
    medium: 'border-2',
    thick: 'border-4',
  };

  return (
    <motion.div
      className={clsx(
        'inline-block rounded-full border-transparent',
        sizeStyles[size],
        thicknessStyles[thickness],
        className
      )}
      style={{
        borderTopColor: 'currentColor',
        borderRightColor: 'currentColor',
        willChange: 'transform',
      }}
      variants={loadingVariants.spinner}
      animate="animate"
      role="status"
      aria-label="Loading"
    />
  );
});

OptimizedSpinner.displayName = 'OptimizedSpinner';

// Optimized dots loading indicator
export interface OptimizedDotsProps {
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const OptimizedDots = memo<OptimizedDotsProps>(({
  count = 3,
  size = 'md',
  color = 'currentColor',
  className,
}) => {
  const sizeStyles = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const dots = useMemo(() => 
    Array.from({ length: count }, (_, i) => i),
    [count]
  );

  return (
    <motion.div
      className={clsx('flex items-center space-x-1', className)}
      variants={loadingVariants.dots.container}
      animate="animate"
      role="status"
      aria-label="Loading"
    >
      {dots.map((index) => (
        <motion.div
          key={index}
          className={clsx('rounded-full', sizeStyles[size])}
          style={{ backgroundColor: color }}
          variants={loadingVariants.dots.dot}
        />
      ))}
    </motion.div>
  );
});

OptimizedDots.displayName = 'OptimizedDots';

// Optimized pulse loading indicator
export interface OptimizedPulseProps {
  children: React.ReactNode;
  className?: string;
}

export const OptimizedPulse = memo<OptimizedPulseProps>(({
  children,
  className,
}) => {
  return (
    <motion.div
      className={className}
      variants={loadingVariants.pulse}
      animate="animate"
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </motion.div>
  );
});

OptimizedPulse.displayName = 'OptimizedPulse';

// Advanced skeleton loader with shimmer effect
export interface OptimizedSkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
  lines?: number; // For text variant
}

export const OptimizedSkeleton = memo<OptimizedSkeletonProps>(({
  width = '100%',
  height,
  variant = 'text',
  animation = 'wave',
  className,
  lines = 1,
}) => {
  const variantStyles = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full',
  };

  const defaultHeight = {
    text: '1rem',
    rectangular: '8rem',
    circular: '3rem',
  };

  const skeletonHeight = height || defaultHeight[variant];

  const waveAnimation = useMemo(() => ({
    backgroundPosition: ['-200px 0', '200px 0'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear' as const,
    },
  }), []);

  const pulseAnimation = useMemo(() => ({
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: easingFunctions.easeInOutQuart,
    },
  }), []);

  if (variant === 'text' && lines > 1) {
    return (
      <div className={clsx('space-y-2', className)}>
        {Array.from({ length: lines }, (_, index) => (
          <motion.div
            key={index}
            className={clsx(
              'bg-gray-200',
              variantStyles[variant]
            )}
            style={{
              width: index === lines - 1 ? '75%' : width,
              height: skeletonHeight,
              backgroundImage: animation === 'wave' 
                ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
                : undefined,
              backgroundSize: animation === 'wave' ? '200px 100%' : undefined,
              backgroundRepeat: 'no-repeat',
            }}
            animate={animation === 'wave' ? waveAnimation : animation === 'pulse' ? pulseAnimation : undefined}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={clsx(
        'bg-gray-200',
        variantStyles[variant],
        className
      )}
      style={{
        width,
        height: skeletonHeight,
        backgroundImage: animation === 'wave' 
          ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
          : undefined,
        backgroundSize: animation === 'wave' ? '200px 100%' : undefined,
        backgroundRepeat: 'no-repeat',
      }}
      animate={animation === 'wave' ? waveAnimation : animation === 'pulse' ? pulseAnimation : undefined}
    />
  );
});

OptimizedSkeleton.displayName = 'OptimizedSkeleton';

// Optimized progress bar with smooth animations
export interface OptimizedProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  showValue?: boolean;
  animated?: boolean;
  className?: string;
  barClassName?: string;
}

export const OptimizedProgressBar = memo<OptimizedProgressBarProps>(({
  value,
  max = 100,
  size = 'md',
  color = 'primary',
  showValue = false,
  animated = true,
  className,
  barClassName,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colorStyles = {
    primary: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    secondary: 'bg-gradient-to-r from-gray-400 to-gray-600',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    error: 'bg-gradient-to-r from-red-500 to-pink-500',
  };

  return (
    <div className={clsx('relative w-full bg-gray-200 rounded-full overflow-hidden', sizeStyles[size], className)}>
      <motion.div
        className={clsx(
          'h-full rounded-full',
          colorStyles[color],
          barClassName
        )}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{
          duration: animated ? 0.8 : 0,
          ease: easingFunctions.easeOutQuart,
        }}
        style={{ willChange: 'width' }}
      />
      
      {showValue && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {Math.round(percentage)}%
        </motion.div>
      )}
    </div>
  );
});

OptimizedProgressBar.displayName = 'OptimizedProgressBar';

// Optimized loading overlay
export interface OptimizedLoadingOverlayProps {
  isVisible: boolean;
  children?: React.ReactNode;
  spinner?: React.ReactNode;
  message?: string;
  className?: string;
  backdropClassName?: string;
}

export const OptimizedLoadingOverlay = memo<OptimizedLoadingOverlayProps>(({
  isVisible,
  children,
  spinner = <OptimizedSpinner size="lg" color="white" />,
  message,
  className,
  backdropClassName,
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      className={clsx(
        'fixed inset-0 z-50 flex items-center justify-center',
        backdropClassName
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <motion.div
        className={clsx(
          'flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-2xl',
          className
        )}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{
          duration: 0.3,
          ease: easingFunctions.easeOutBack,
        }}
      >
        {children || (
          <>
            {spinner}
            {message && (
              <motion.p
                className="mt-4 text-sm text-gray-600 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {message}
              </motion.p>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
});

OptimizedLoadingOverlay.displayName = 'OptimizedLoadingOverlay';
