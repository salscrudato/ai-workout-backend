import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'pulse' | 'gradient' | 'premium' | 'progress' | 'wave' | 'aurora' | 'cosmic';
  className?: string;
  text?: string;
  color?: string;
  progress?: number; // 0-100 for progress variant
  estimatedTime?: string;
  status?: 'loading' | 'success' | 'error';
  showProgress?: boolean;
}

/**
 * Enhanced Loading Spinner Component with Progress Tracking
 * @param size - Size of the spinner (sm, md, lg, xl)
 * @param variant - Spinner variant including new progress and wave options
 * @param className - Additional CSS classes
 * @param text - Optional text to display below the spinner
 * @param progress - Progress value (0-100) for progress variant
 * @param estimatedTime - Estimated completion time
 * @param status - Loading status for different visual states
 * @param showProgress - Whether to show progress percentage
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(({
  size = 'md',
  variant = 'default',
  className = '',
  text,
  color,
  progress = 0,
  estimatedTime,
  status = 'loading',
  showProgress = false
}) => {
  // Optimized reduced motion detection with memoization
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }, []);

  // Memoize size classes to prevent recreation on every render
  const sizeClasses = useMemo(() => ({
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }), []);

  // Variant-specific rendering
  const renderSpinner = () => {
    const baseClasses = `${sizeClasses[size]} ${color || 'text-primary-600'}`;

    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`rounded-full bg-current ${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'}`}
                {...(prefersReducedMotion ? {} : {
                  animate: { scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] },
                  transition: { duration: 1, repeat: Infinity, delay: i * 0.2 }
                })}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <motion.div
            className={`rounded-full bg-current ${baseClasses} motion-reduce:animate-none`}
            {...(prefersReducedMotion ? {} : {
              animate: { scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] },
              transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
            })}
          />
        );

      case 'gradient':
        return (
          <motion.div
            className={`rounded-full gradient-blue ${baseClasses} motion-reduce:animate-none`}
            {...(prefersReducedMotion ? {} : {
              animate: { rotate: 360 },
              transition: { duration: 1, repeat: Infinity, ease: 'linear' }
            })}
            style={{
              background: 'conic-gradient(from 0deg, transparent, #0ea5e9, transparent)',
            }}
          />
        );

      case 'premium':
        return (
          <motion.div
            className="relative glass-premium rounded-full p-2 premium-shadow-lg"
            animate={prefersReducedMotion ? undefined : { rotate: 360 }}
            transition={prefersReducedMotion ? undefined : { duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <div className={`rounded-full border-4 border-transparent ${baseClasses}`}>
              <div className="absolute inset-0 rounded-full border-4 border-t-primary-500 border-r-transparent border-b-accent-500 border-l-transparent animate-spin motion-reduce:animate-none" />
              <div className="absolute inset-2 rounded-full border-2 border-t-transparent border-r-primary-300 border-b-transparent border-l-accent-300 animate-spin motion-reduce:animate-none" style={{ animationDirection: 'reverse' }} />
            </div>
          </motion.div>
        );

      case 'aurora':
        return (
          <motion.div
            className={`rounded-full gradient-aurora ${baseClasses} motion-reduce:animate-none`}
            animate={prefersReducedMotion ? undefined : { rotate: 360 }}
            transition={prefersReducedMotion ? undefined : { duration: 1.5, repeat: Infinity, ease: 'linear' }}
            style={{
              background: 'conic-gradient(from 0deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe, #667eea)',
            }}
          />
        );

      case 'cosmic':
        return (
          <motion.div className="relative">
            <motion.div
              className={`rounded-full gradient-cosmic ${baseClasses} motion-reduce:animate-none`}
              animate={prefersReducedMotion ? undefined : { rotate: 360 }}
              transition={prefersReducedMotion ? undefined : { duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className={`absolute inset-2 rounded-full bg-white/20 backdrop-blur-sm`}
              animate={prefersReducedMotion ? undefined : { scale: [1, 1.1, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={prefersReducedMotion ? undefined : { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        );

      case 'progress':
        const radius = size === 'sm' ? 16 : size === 'md' ? 20 : size === 'lg' ? 24 : 28;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (progress / 100) * circumference;

        return (
          <motion.div
            className="relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <svg className={baseClasses} viewBox="0 0 60 60">
              {/* Background circle */}
              <circle
                cx="30"
                cy="30"
                r={radius}
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                className="text-secondary-200"
              />
              {/* Progress circle */}
              <motion.circle
                cx="30"
                cy="30"
                r={radius}
                stroke="url(#progressGradient)"
                strokeWidth="3"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transform -rotate-90 origin-center motion-reduce:animate-none"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            {showProgress && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-primary-600">
                  {Math.round(progress)}%
                </span>
              </div>
            )}
          </motion.div>
        );

      case 'wave':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className={`rounded-full bg-current ${size === 'sm' ? 'w-1 h-4' : size === 'md' ? 'w-1.5 h-6' : 'w-2 h-8'} motion-reduce:animate-none`}
                animate={prefersReducedMotion ? undefined : {
                  scaleY: [1, 2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={prefersReducedMotion ? undefined : {
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        );

      default:
        return (
          <motion.div
            animate={prefersReducedMotion ? undefined : { rotate: 360 }}
            transition={prefersReducedMotion ? undefined : { duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className={`animate-spin drop-shadow-lg ${baseClasses} motion-reduce:animate-none`} />
          </motion.div>
        );
    }
  };

  // Memoize combined className to prevent string concatenation on every render
  const containerClassName = useMemo(() =>
    `flex flex-col items-center justify-center ${className} motion-reduce:transition-none`,
    [className]
  );

  const spinnerClassName = useMemo(() =>
    `animate-spin gradient-text-primary drop-shadow-lg ${sizeClasses[size]} shadow-glow-sm`,
    [sizeClasses, size]
  );

  return (
    <motion.div
      className={containerClassName}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      role="status"
      aria-live="polite"
    >
      {renderSpinner()}
      {(text || estimatedTime || (showProgress && variant !== 'progress')) && (
        <motion.div
          className="mt-3 text-center space-y-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          {text && (
            <p className="text-sm text-secondary-600 font-medium">
              {text}
            </p>
          )}
          {estimatedTime && (
            <p className="text-xs text-secondary-500">
              {estimatedTime}
            </p>
          )}
          {showProgress && variant !== 'progress' && (
            <p className="text-xs font-medium text-primary-600">
              {Math.round(progress)}%
            </p>
          )}
        </motion.div>
      )}
      {!text && !estimatedTime && !(showProgress && variant !== 'progress') && (
        <span className="sr-only">Loading</span>
      )}
    </motion.div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
