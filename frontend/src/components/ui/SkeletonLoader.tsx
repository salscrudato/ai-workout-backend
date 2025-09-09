import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export interface SkeletonLoaderProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded' | 'card' | 'list' | 'profile' | 'dashboard';
  animation?: 'pulse' | 'wave' | 'shimmer' | 'gradient' | 'none';
  lines?: number;
  count?: number;
  delay?: number;
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
  animation = 'shimmer',
  lines = 1,
  count = 1,
  delay = 0,
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
    shimmer: 'relative overflow-hidden',
    gradient: 'animate-gradient-pulse',
    none: '',
  };

  const shimmerVariants = {
    initial: { x: '-100%' },
    animate: {
      x: '100%',
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut' as any,
        delay,
      },
    },
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

  const renderShimmerEffect = () => {
    if (animation === 'shimmer') {
      return (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
        />
      );
    }
    return null;
  };

  const renderBasicSkeleton = () => (
    <motion.div
      className={skeletonStyles}
      style={style}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
    >
      {renderShimmerEffect()}
    </motion.div>
  );

  const renderCardSkeleton = () => (
    <motion.div
      className={clsx('p-6 bg-white rounded-xl border border-secondary-200 space-y-4', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className="flex items-start space-x-4">
        <div className="relative overflow-hidden bg-secondary-200 rounded-full w-12 h-12">
          {renderShimmerEffect()}
        </div>
        <div className="flex-1 space-y-3">
          <div className="relative overflow-hidden bg-secondary-200 rounded h-4 w-3/4">
            {renderShimmerEffect()}
          </div>
          <div className="relative overflow-hidden bg-secondary-200 rounded h-3 w-1/2">
            {renderShimmerEffect()}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={clsx(
              'relative overflow-hidden bg-secondary-200 rounded h-3',
              index === lines - 1 ? 'w-2/3' : 'w-full'
            )}
          >
            {renderShimmerEffect()}
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderListSkeleton = () => (
    <div className={clsx('space-y-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-secondary-200"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: delay + index * 0.1, duration: 0.4 }}
        >
          <div className="relative overflow-hidden bg-secondary-200 rounded-full w-10 h-10">
            {renderShimmerEffect()}
          </div>
          <div className="flex-1 space-y-2">
            <div className="relative overflow-hidden bg-secondary-200 rounded h-4 w-3/4">
              {renderShimmerEffect()}
            </div>
            <div className="relative overflow-hidden bg-secondary-200 rounded h-3 w-1/2">
              {renderShimmerEffect()}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  // Enhanced variant rendering
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return renderCardSkeleton();
      case 'list':
        return renderListSkeleton();
      case 'text':
        if (lines > 1) {
          return (
            <div className="space-y-2">
              {Array.from({ length: lines }).map((_, index) => (
                <motion.div
                  key={index}
                  className={clsx(
                    skeletonStyles,
                    index === lines - 1 && 'w-3/4'
                  )}
                  style={{
                    ...style,
                    width: index === lines - 1 ? '75%' : style.width,
                  }}
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: index === lines - 1 ? '75%' : '100%' }}
                  transition={{ delay: delay + index * 0.1, duration: 0.4 }}
                >
                  {renderShimmerEffect()}
                </motion.div>
              ))}
            </div>
          );
        }
        return renderBasicSkeleton();
      default:
        return count > 1
          ? Array.from({ length: count }).map((_, index) => (
              <motion.div
                key={index}
                className={index > 0 ? 'mt-4' : ''}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + index * 0.1, duration: 0.3 }}
              >
                {renderBasicSkeleton()}
              </motion.div>
            ))
          : renderBasicSkeleton();
    }
  };

  return renderSkeleton();
};

export default SkeletonLoader;
