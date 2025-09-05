import React from 'react';
import { clsx } from 'clsx';

export interface SkeletonLoaderProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  animation?: 'pulse' | 'wave' | 'none';
  lines?: number;
}

/**
 * Modern SkeletonLoader component for loading states
 * 
 * Features:
 * - Multiple variants (text, rectangular, circular, rounded)
 * - Customizable animations (pulse, wave, none)
 * - Multi-line text skeletons
 * - Responsive sizing
 */
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className,
  width,
  height,
  variant = 'rectangular',
  animation = 'pulse',
  lines = 1,
}) => {
  const baseStyles = 'bg-secondary-200 relative overflow-hidden';
  
  const variantStyles = {
    text: 'h-4 rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    rounded: 'rounded-xl',
  };

  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'shimmer',
    none: '',
  };

  const skeletonStyles = clsx(
    baseStyles,
    variantStyles[variant],
    animationStyles[animation],
    className
  );

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  // For multi-line text skeletons
  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={clsx(
              skeletonStyles,
              index === lines - 1 && 'w-3/4' // Last line is shorter
            )}
            style={{
              ...style,
              width: index === lines - 1 ? '75%' : style.width,
            }}
          />
        ))}
      </div>
    );
  }

  return <div className={skeletonStyles} style={style} />;
};

export default SkeletonLoader;
