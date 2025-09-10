import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

/**
 * Enhanced Loading States Component Library
 * 
 * Provides sophisticated loading animations that maintain user engagement
 * while content is being loaded or processed.
 */

// Skeleton Loader with shimmer effect
export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'shimmer';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  className,
  variant = 'rectangular',
  animation = 'shimmer',
}) => {
  const baseClasses = 'bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-bounce',
    shimmer: 'animate-shimmer',
  };

  return (
    <div
      className={clsx(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={{ width, height }}
    />
  );
};

// Pulsing Dots Loader
export interface PulsingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const PulsingDots: React.FC<PulsingDotsProps> = ({
  size = 'md',
  color = 'bg-primary-500',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const dotClass = clsx('rounded-full', sizeClasses[size], color);

  return (
    <div className={clsx('flex items-center space-x-1', className)}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={dotClass}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: index * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Spinning Loader
export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  thickness?: number;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'border-primary-500',
  thickness = 2,
  className,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <motion.div
      className={clsx(
        'rounded-full border-transparent',
        sizeClasses[size],
        color,
        className
      )}
      style={{ borderWidth: thickness, borderTopColor: 'currentColor' }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
};

// Progress Bar with animation
export interface ProgressBarProps {
  progress: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  animated?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  color = 'bg-gradient-to-r from-primary-500 to-primary-600',
  backgroundColor = 'bg-neutral-200',
  showPercentage = false,
  animated = true,
  className,
}) => {
  return (
    <div className={clsx('w-full', className)}>
      <div
        className={clsx('rounded-full overflow-hidden', backgroundColor)}
        style={{ height }}
      >
        <motion.div
          className={clsx('h-full rounded-full', color, {
            'relative overflow-hidden': animated,
          })}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {animated && (
            <motion.div
              className="absolute inset-0 bg-white/20"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          )}
        </motion.div>
      </div>
      {showPercentage && (
        <div className="mt-2 text-sm text-neutral-600 text-center">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
};

// Card Skeleton for complex layouts
export interface CardSkeletonProps {
  showAvatar?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showActions?: boolean;
  className?: string;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  showAvatar = true,
  showTitle = true,
  showDescription = true,
  showActions = true,
  className,
}) => {
  return (
    <div className={clsx('glass-premium rounded-2xl p-6 space-y-4', className)}>
      {showAvatar && (
        <div className="flex items-center space-x-4">
          <Skeleton variant="circular" width={48} height={48} />
          <div className="space-y-2 flex-1">
            <Skeleton width="60%" height={16} />
            <Skeleton width="40%" height={14} />
          </div>
        </div>
      )}
      
      {showTitle && (
        <div className="space-y-2">
          <Skeleton width="80%" height={20} />
          <Skeleton width="60%" height={20} />
        </div>
      )}
      
      {showDescription && (
        <div className="space-y-2">
          <Skeleton width="100%" height={14} />
          <Skeleton width="90%" height={14} />
          <Skeleton width="75%" height={14} />
        </div>
      )}
      
      {showActions && (
        <div className="flex space-x-3 pt-4">
          <Skeleton width={80} height={36} className="rounded-lg" />
          <Skeleton width={80} height={36} className="rounded-lg" />
        </div>
      )}
    </div>
  );
};

// Loading Overlay
export interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  spinner?: React.ReactNode;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Loading...',
  spinner,
  className,
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      className={clsx(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-black/50 backdrop-blur-sm',
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="glass-premium rounded-2xl p-8 text-center max-w-sm mx-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="mb-4 flex justify-center">
          {spinner || <Spinner size="lg" />}
        </div>
        <p className="text-neutral-700 font-medium">{message}</p>
      </motion.div>
    </motion.div>
  );
};

// Workout-specific loading states
export const WorkoutGenerationLoader: React.FC<{ progress?: number }> = ({ progress = 0 }) => {
  return (
    <div className="text-center space-y-6">
      <motion.div
        className="w-20 h-20 mx-auto gradient-aurora rounded-full flex items-center justify-center"
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
          scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
        </svg>
      </motion.div>
      
      <div className="space-y-3">
        <h3 className="text-lg font-semibold gradient-text-primary">
          Generating Your Workout
        </h3>
        <p className="text-neutral-600 text-sm">
          Our AI is creating a personalized plan just for you
        </p>
        
        {progress > 0 && (
          <ProgressBar
            progress={progress}
            showPercentage
            animated
            className="max-w-xs mx-auto"
          />
        )}
      </div>
    </div>
  );
};
