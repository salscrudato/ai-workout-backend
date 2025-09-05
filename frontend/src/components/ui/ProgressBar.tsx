import React from 'react';
import { clsx } from 'clsx';

export interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error' | 'primary';
  showLabel?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
  striped?: boolean;
}

/**
 * Modern ProgressBar component for workout progress, loading states, and metrics
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  className,
  animated = false,
  striped = false,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const variantStyles = {
    default: 'bg-secondary-500',
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
  };

  const stripedPattern = striped
    ? 'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:20px_100%]'
    : '';

  const animationClass = animated ? 'animate-pulse' : '';

  return (
    <div className={clsx('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-secondary-700">
            {label || 'Progress'}
          </span>
          <span className="text-sm text-secondary-500">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      
      <div
        className={clsx(
          'w-full bg-secondary-200 rounded-full overflow-hidden',
          sizeStyles[size]
        )}
      >
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500 ease-out',
            variantStyles[variant],
            stripedPattern,
            animationClass
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
