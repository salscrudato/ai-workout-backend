import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export type LoadingVariant = 'spinner' | 'skeleton' | 'dots' | 'pulse';
export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

export interface LoadingProps {
  variant?: LoadingVariant;
  size?: LoadingSize;
  className?: string;
  text?: string;
  progress?: number; // 0-100
  fullScreen?: boolean;
}

export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'workout' | 'dashboard';
  width?: string | number;
  height?: string | number;
  lines?: number;
  className?: string;
  animate?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

/**
 * Unified Loading Component
 * Consolidates LoadingSpinner, LoadingSkeleton, ModernLoadingSkeleton, etc.
 */
export const Loading: React.FC<LoadingProps> = memo(({
  variant = 'spinner',
  size = 'md',
  className,
  text,
  progress,
  fullScreen = false,
}) => {
  const containerClasses = clsx(
    'flex flex-col items-center justify-center',
    fullScreen && 'min-h-screen',
    className
  );

  const renderSpinner = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={clsx(sizeClasses[size], 'text-primary-600')}
    >
      <Loader2 className="w-full h-full" />
    </motion.div>
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
          }}
          className={clsx(
            'rounded-full bg-primary-600',
            size === 'sm' && 'w-2 h-2',
            size === 'md' && 'w-3 h-3',
            size === 'lg' && 'w-4 h-4',
            size === 'xl' && 'w-5 h-5'
          )}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
      className={clsx(
        'rounded-lg bg-primary-200',
        size === 'sm' && 'w-16 h-4',
        size === 'md' && 'w-24 h-6',
        size === 'lg' && 'w-32 h-8',
        size === 'xl' && 'w-40 h-10'
      )}
    />
  );

  const renderContent = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'skeleton':
        return <Skeleton />;
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={containerClasses}>
      {renderContent()}
      {text && (
        <p className={clsx('mt-3 text-neutral-600', textSizeClasses[size])}>
          {text}
        </p>
      )}
      {progress !== undefined && (
        <div className="mt-3 w-full max-w-xs">
          <div className="flex justify-between text-sm text-neutral-600 mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <motion.div
              className="bg-primary-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}
    </div>
  );
});

Loading.displayName = 'Loading';

/**
 * Skeleton Component for content placeholders
 */
export const Skeleton: React.FC<SkeletonProps> = memo(({
  variant = 'rectangular',
  width = '100%',
  height = '1rem',
  lines = 1,
  className,
  animate = true,
}) => {
  const baseClasses = 'bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 rounded';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded',
    card: 'rounded-lg',
    workout: 'rounded-xl',
    dashboard: 'rounded-2xl',
  };

  const animationClasses = animate
    ? 'animate-pulse bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 bg-[length:200%_100%] animate-[shimmer_2s_infinite]'
    : '';

  if (variant === 'card') {
    return (
      <div className={clsx('space-y-3', className)}>
        <div className={clsx(baseClasses, animationClasses, 'h-48 w-full rounded-lg')} />
        <div className="space-y-2">
          <div className={clsx(baseClasses, animationClasses, 'h-4 w-3/4')} />
          <div className={clsx(baseClasses, animationClasses, 'h-4 w-1/2')} />
        </div>
      </div>
    );
  }

  if (variant === 'workout') {
    return (
      <div className={clsx('space-y-4', className)}>
        <div className={clsx(baseClasses, animationClasses, 'h-6 w-1/3 rounded')} />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex space-x-3">
              <div className={clsx(baseClasses, animationClasses, 'h-12 w-12 rounded-full')} />
              <div className="flex-1 space-y-2">
                <div className={clsx(baseClasses, animationClasses, 'h-4 w-3/4')} />
                <div className={clsx(baseClasses, animationClasses, 'h-3 w-1/2')} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'dashboard') {
    return (
      <div className={clsx('space-y-6', className)}>
        <div className={clsx(baseClasses, animationClasses, 'h-8 w-1/2 rounded')} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={clsx(baseClasses, animationClasses, 'h-32 rounded-lg')} />
          ))}
        </div>
        <div className={clsx(baseClasses, animationClasses, 'h-64 rounded-lg')} />
      </div>
    );
  }

  if (lines > 1) {
    return (
      <div className={clsx('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              baseClasses,
              animationClasses,
              variantClasses[variant]
            )}
            style={{
              width: i === lines - 1 ? '75%' : width,
              height,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        baseClasses,
        animationClasses,
        variantClasses[variant],
        className
      )}
      style={{ width, height }}
    />
  );
});

Skeleton.displayName = 'Skeleton';

export default Loading;
