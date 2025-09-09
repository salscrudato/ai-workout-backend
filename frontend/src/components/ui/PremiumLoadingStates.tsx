import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Loader2, Sparkles, Zap, Heart, Target } from 'lucide-react';

/**
 * Premium Loading States Component
 * 
 * Features:
 * - Sophisticated skeleton screens
 * - Contextual loading animations
 * - Progress indicators with smooth transitions
 * - Delightful micro-animations
 * - Accessibility-compliant loading states
 */

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  animate = true,
}) => {
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded',
    rounded: 'rounded-lg',
  };

  return (
    <motion.div
      className={clsx(
        'bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200',
        'dark:from-neutral-700 dark:via-neutral-600 dark:to-neutral-700',
        variantClasses[variant],
        animate && 'animate-pulse',
        className
      )}
      style={{ width, height }}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
};

interface WorkoutCardSkeletonProps {
  className?: string;
}

export const WorkoutCardSkeleton: React.FC<WorkoutCardSkeletonProps> = ({ className }) => (
  <div className={clsx('glass rounded-2xl p-6 space-y-4', className)}>
    <div className="flex items-center space-x-3">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="60%" height={20} />
        <Skeleton variant="text" width="40%" height={16} />
      </div>
    </div>
    <div className="space-y-3">
      <Skeleton variant="rectangular" height={12} />
      <Skeleton variant="rectangular" height={12} width="80%" />
      <Skeleton variant="rectangular" height={12} width="90%" />
    </div>
    <div className="flex space-x-2">
      <Skeleton variant="rounded" width={60} height={24} />
      <Skeleton variant="rounded" width={80} height={24} />
      <Skeleton variant="rounded" width={70} height={24} />
    </div>
  </div>
);

interface PremiumSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'pulse' | 'gradient' | 'workout';
  className?: string;
  text?: string;
}

export const PremiumSpinner: React.FC<PremiumSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  className,
  text,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-primary-500 rounded-full"
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <motion.div
            className={clsx('bg-primary-500 rounded-full', sizeClasses[size])}
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        );

      case 'gradient':
        return (
          <motion.div
            className={clsx(
              'rounded-full gradient-primary',
              sizeClasses[size]
            )}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{
              background: 'conic-gradient(from 0deg, transparent, #5b6cff, transparent)',
            }}
          />
        );

      case 'workout':
        return (
          <div className="relative">
            <motion.div
              className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Zap className="w-6 h-6 text-white" />
            </motion.div>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary-300"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        );

      default:
        return (
          <motion.div
            className={clsx(
              'border-2 border-primary-200 border-t-primary-500 rounded-full',
              sizeClasses[size]
            )}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        );
    }
  };

  return (
    <div className={clsx('flex flex-col items-center space-y-3', className)}>
      {renderSpinner()}
      {text && (
        <motion.p
          className="text-sm text-neutral-600 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

interface ProgressBarProps {
  progress: number; // 0-100
  variant?: 'default' | 'gradient' | 'animated';
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  className?: string;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  variant = 'default',
  size = 'md',
  showPercentage = false,
  className,
  label,
}) => {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const variantClasses = {
    default: 'bg-primary-500',
    gradient: 'gradient-primary',
    animated: 'gradient-animated',
  };

  return (
    <div className={clsx('space-y-2', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-sm font-medium text-neutral-700">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-medium text-neutral-600">{Math.round(progress)}%</span>
          )}
        </div>
      )}
      <div className={clsx('w-full bg-neutral-200 rounded-full overflow-hidden', sizeClasses[size])}>
        <motion.div
          className={clsx('h-full rounded-full', variantClasses[variant])}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

interface LoadingOverlayProps {
  isVisible: boolean;
  variant?: 'default' | 'workout' | 'minimal';
  message?: string;
  progress?: number;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  variant = 'default',
  message = 'Loading...',
  progress,
  className,
}) => {
  const renderContent = () => {
    switch (variant) {
      case 'workout':
        return (
          <div className="text-center space-y-6">
            <motion.div
              className="relative mx-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-primary-300"
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold gradient-text-blue">
                Generating Your Workout
              </h3>
              <p className="text-neutral-600">AI is crafting the perfect routine for you...</p>
            </div>
            {progress !== undefined && (
              <ProgressBar progress={progress} variant="gradient" showPercentage />
            )}
          </div>
        );

      case 'minimal':
        return (
          <div className="text-center">
            <PremiumSpinner size="lg" variant="pulse" />
            <p className="mt-4 text-neutral-600">{message}</p>
          </div>
        );

      default:
        return (
          <div className="text-center space-y-4">
            <PremiumSpinner size="xl" variant="gradient" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-neutral-800">{message}</h3>
              {progress !== undefined && (
                <ProgressBar progress={progress} variant="animated" />
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={clsx(
            'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50',
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="glass-ultra rounded-3xl p-8 max-w-sm w-full mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {renderContent()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Export all components
export default {
  Skeleton,
  WorkoutCardSkeleton,
  PremiumSpinner,
  ProgressBar,
  LoadingOverlay,
};
