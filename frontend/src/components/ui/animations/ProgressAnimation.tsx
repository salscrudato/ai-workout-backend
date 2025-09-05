import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export interface ProgressAnimationProps {
  progress: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  variant?: 'linear' | 'circular' | 'semicircular';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

/**
 * Progress Animation Component
 * 
 * Provides animated progress indicators with:
 * - Linear and circular variants
 * - Smooth progress transitions
 * - Multiple color themes
 * - Size variations
 * - Label support
 */
const ProgressAnimation: React.FC<ProgressAnimationProps> = ({
  progress,
  size = 'md',
  variant = 'linear',
  color = 'primary',
  showLabel = false,
  label,
  animated = true,
  className,
}) => {
  const sizeClasses = {
    sm: variant === 'linear' ? 'h-1' : 'w-12 h-12',
    md: variant === 'linear' ? 'h-2' : 'w-16 h-16',
    lg: variant === 'linear' ? 'h-3' : 'w-20 h-20',
  };

  const colorClasses = {
    primary: 'from-primary-500 to-blue-600',
    secondary: 'from-secondary-400 to-secondary-600',
    success: 'from-green-500 to-emerald-600',
    warning: 'from-yellow-500 to-orange-600',
    error: 'from-red-500 to-rose-600',
  };

  const renderLinearProgress = () => (
    <div className={clsx('w-full bg-secondary-200 rounded-full overflow-hidden', sizeClasses[size], className)}>
      <motion.div
        className={clsx('h-full bg-gradient-to-r rounded-full', colorClasses[color])}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        transition={{
          duration: animated ? 0.8 : 0,
          ease: 'easeOut',
        }}
      />
      {showLabel && (
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-secondary-600">{label}</span>
          <span className="text-sm font-medium text-secondary-900">{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  );

  const renderCircularProgress = () => {
    const radius = size === 'sm' ? 20 : size === 'md' ? 28 : 36;
    const strokeWidth = size === 'sm' ? 3 : size === 'md' ? 4 : 5;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className={clsx('relative', sizeClasses[size], className)}>
        <svg
          className="transform -rotate-90 w-full h-full"
          width={radius * 2}
          height={radius * 2}
        >
          {/* Background circle */}
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="text-secondary-200"
          />
          {/* Progress circle */}
          <motion.circle
            stroke="url(#gradient)"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: animated ? strokeDashoffset : circumference - (progress / 100) * circumference }}
            transition={{
              duration: animated ? 1 : 0,
              ease: 'easeOut',
            }}
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" className={`stop-color-${color}-500`} />
              <stop offset="100%" className={`stop-color-${color}-600`} />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center label */}
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-secondary-900">
                {Math.round(progress)}%
              </div>
              {label && (
                <div className="text-xs text-secondary-600">{label}</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSemicircularProgress = () => {
    const radius = size === 'sm' ? 20 : size === 'md' ? 28 : 36;
    const strokeWidth = size === 'sm' ? 3 : size === 'md' ? 4 : 5;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * Math.PI; // Half circle
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className={clsx('relative', className)} style={{ width: radius * 2, height: radius }}>
        <svg
          className="transform rotate-180 w-full h-full"
          width={radius * 2}
          height={radius}
          viewBox={`0 0 ${radius * 2} ${radius}`}
        >
          {/* Background arc */}
          <path
            d={`M ${strokeWidth} ${radius - strokeWidth} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${radius * 2 - strokeWidth} ${radius - strokeWidth}`}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-secondary-200"
          />
          {/* Progress arc */}
          <motion.path
            d={`M ${strokeWidth} ${radius - strokeWidth} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${radius * 2 - strokeWidth} ${radius - strokeWidth}`}
            stroke="url(#gradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            fill="none"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: animated ? strokeDashoffset : circumference - (progress / 100) * circumference }}
            transition={{
              duration: animated ? 1 : 0,
              ease: 'easeOut',
            }}
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" className={`stop-color-${color}-500`} />
              <stop offset="100%" className={`stop-color-${color}-600`} />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center label */}
        {showLabel && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
            <div className="text-center">
              <div className="text-lg font-bold text-secondary-900">
                {Math.round(progress)}%
              </div>
              {label && (
                <div className="text-xs text-secondary-600">{label}</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  switch (variant) {
    case 'circular':
      return renderCircularProgress();
    case 'semicircular':
      return renderSemicircularProgress();
    case 'linear':
    default:
      return renderLinearProgress();
  }
};

export default ProgressAnimation;
