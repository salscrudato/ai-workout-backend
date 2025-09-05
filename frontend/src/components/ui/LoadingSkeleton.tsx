import React from 'react';
import { clsx } from 'clsx';

export interface LoadingSkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'list';
  width?: string | number;
  height?: string | number;
  lines?: number;
  className?: string;
  animate?: boolean;
}

/**
 * Loading Skeleton Component with Blue Gradient Theme
 * 
 * Features:
 * - Multiple skeleton variants
 * - Blue gradient shimmer animation
 * - Responsive design
 * - Customizable dimensions
 * - Mobile-optimized
 */
const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'rectangular',
  width,
  height,
  lines = 3,
  className,
  animate = true,
}) => {
  const baseStyles = clsx(
    'bg-gradient-to-r from-secondary-200 via-primary-100 to-secondary-200',
    'bg-[length:200%_100%]',
    animate && 'animate-pulse',
    className
  );

  const shimmerStyles = animate ? 'animate-gradient-shift' : '';

  if (variant === 'text') {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={clsx(
              baseStyles,
              shimmerStyles,
              'h-4 rounded',
              index === lines - 1 ? 'w-3/4' : 'w-full'
            )}
            style={{ width: index === lines - 1 ? '75%' : width }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'circular') {
    return (
      <div
        className={clsx(
          baseStyles,
          shimmerStyles,
          'rounded-full aspect-square'
        )}
        style={{ width: width || 40, height: height || 40 }}
      />
    );
  }

  if (variant === 'card') {
    return (
      <div className={clsx('glass rounded-xl p-4 space-y-4', className)}>
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className={clsx(baseStyles, shimmerStyles, 'w-10 h-10 rounded-full')} />
          <div className="flex-1 space-y-2">
            <div className={clsx(baseStyles, shimmerStyles, 'h-4 rounded w-3/4')} />
            <div className={clsx(baseStyles, shimmerStyles, 'h-3 rounded w-1/2')} />
          </div>
        </div>
        
        {/* Content */}
        <div className="space-y-2">
          <div className={clsx(baseStyles, shimmerStyles, 'h-4 rounded')} />
          <div className={clsx(baseStyles, shimmerStyles, 'h-4 rounded w-5/6')} />
          <div className={clsx(baseStyles, shimmerStyles, 'h-4 rounded w-4/6')} />
        </div>
        
        {/* Footer */}
        <div className="flex justify-between items-center">
          <div className={clsx(baseStyles, shimmerStyles, 'h-8 rounded w-20')} />
          <div className={clsx(baseStyles, shimmerStyles, 'h-8 rounded w-16')} />
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className={clsx(baseStyles, shimmerStyles, 'w-8 h-8 rounded-full')} />
            <div className="flex-1 space-y-2">
              <div className={clsx(baseStyles, shimmerStyles, 'h-4 rounded w-3/4')} />
              <div className={clsx(baseStyles, shimmerStyles, 'h-3 rounded w-1/2')} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Rectangular variant (default)
  return (
    <div
      className={clsx(baseStyles, shimmerStyles, 'rounded')}
      style={{ 
        width: width || '100%', 
        height: height || 20 
      }}
    />
  );
};

export default LoadingSkeleton;
