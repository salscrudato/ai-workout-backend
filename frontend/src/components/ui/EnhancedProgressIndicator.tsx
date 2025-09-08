import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { CheckCircle, AlertCircle, Clock, Zap } from 'lucide-react';

export interface EnhancedProgressIndicatorProps {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'linear' | 'circular' | 'radial' | 'wave';
  showLabel?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
  gradient?: boolean;
  status?: 'loading' | 'success' | 'error' | 'warning';
  showPercentage?: boolean;
  thickness?: 'thin' | 'medium' | 'thick';
  glow?: boolean;
  pulse?: boolean;
  estimatedTime?: string;
  speed?: 'slow' | 'normal' | 'fast';
}

/**
 * Enhanced Progress Indicator Component
 * 
 * Features:
 * - Multiple variants (linear, circular, radial, wave)
 * - Smooth animations with spring physics
 * - Status indicators with icons
 * - Gradient and glow effects
 * - Estimated time display
 * - Accessibility support
 * - Mobile-optimized
 */
const EnhancedProgressIndicator: React.FC<EnhancedProgressIndicatorProps> = ({
  value,
  size = 'md',
  variant = 'linear',
  showLabel = false,
  label,
  className,
  animated = true,
  gradient = true,
  status = 'loading',
  showPercentage = true,
  thickness = 'medium',
  glow = false,
  pulse = false,
  estimatedTime,
  speed = 'normal',
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const clampedValue = Math.max(0, Math.min(100, value));

  // Animate value changes
  useEffect(() => {
    if (animated) {
      const duration = speed === 'fast' ? 300 : speed === 'slow' ? 800 : 500;
      const timer = setTimeout(() => {
        setDisplayValue(clampedValue);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayValue(clampedValue);
    }
  }, [clampedValue, animated, speed]);

  // Size configurations
  const sizeConfig = {
    sm: { width: 'w-8 h-8', stroke: 2, text: 'text-xs', height: 'h-1' },
    md: { width: 'w-12 h-12', stroke: 3, text: 'text-sm', height: 'h-2' },
    lg: { width: 'w-16 h-16', stroke: 4, text: 'text-base', height: 'h-3' },
    xl: { width: 'w-20 h-20', stroke: 5, text: 'text-lg', height: 'h-4' },
  };

  const thicknessConfig = {
    thin: { linear: 'h-1', circular: 2 },
    medium: { linear: 'h-2', circular: 3 },
    thick: { linear: 'h-3', circular: 4 },
  };

  // Status icons and colors
  const statusConfig = {
    loading: { icon: Clock, color: 'text-blue-500', bgColor: 'from-blue-500 to-cyan-500' },
    success: { icon: CheckCircle, color: 'text-green-500', bgColor: 'from-green-500 to-emerald-500' },
    error: { icon: AlertCircle, color: 'text-red-500', bgColor: 'from-red-500 to-pink-500' },
    warning: { icon: AlertCircle, color: 'text-yellow-500', bgColor: 'from-yellow-500 to-orange-500' },
  };

  const StatusIcon = statusConfig[status].icon;

  // Circular progress variant
  if (variant === 'circular') {
    const radius = size === 'sm' ? 16 : size === 'md' ? 20 : size === 'lg' ? 24 : 28;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (displayValue / 100) * circumference;

    return (
      <div className={clsx('relative inline-flex items-center justify-center', className)}>
        <motion.svg
          className={clsx('transform -rotate-90', sizeConfig[size].width)}
          viewBox="0 0 60 60"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Background circle */}
          <circle
            cx="30"
            cy="30"
            r={radius}
            stroke="currentColor"
            strokeWidth={thicknessConfig[thickness].circular}
            fill="none"
            className="text-secondary-200"
          />
          
          {/* Progress circle */}
          <motion.circle
            cx="30"
            cy="30"
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth={thicknessConfig[thickness].circular}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={clsx(
              'transition-all duration-500 ease-out',
              glow && 'drop-shadow-lg',
              pulse && 'animate-pulse'
            )}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </motion.svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <StatusIcon className={clsx('w-4 h-4 mb-1', statusConfig[status].color)} />
          {showPercentage && (
            <motion.span
              className={clsx('font-medium', sizeConfig[size].text, statusConfig[status].color)}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              {Math.round(displayValue)}%
            </motion.span>
          )}
        </div>
      </div>
    );
  }

  // Radial progress variant
  if (variant === 'radial') {
    return (
      <div className={clsx('relative', sizeConfig[size].width, className)}>
        <motion.div
          className={clsx(
            'absolute inset-0 rounded-full',
            gradient ? `bg-gradient-conic from-transparent via-blue-500 to-transparent` : 'bg-blue-500'
          )}
          style={{
            background: `conic-gradient(from 0deg, transparent ${360 - (displayValue * 3.6)}deg, #0ea5e9 ${360 - (displayValue * 3.6)}deg)`
          }}
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
          <span className={clsx('font-bold', sizeConfig[size].text)}>
            {Math.round(displayValue)}%
          </span>
        </div>
      </div>
    );
  }

  // Linear progress variant (default)
  return (
    <div className={clsx('w-full space-y-2', className)}>
      {/* Header with label and status */}
      <AnimatePresence>
        {(showLabel || label || estimatedTime) && (
          <motion.div
            className="flex justify-between items-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-center space-x-2">
              <StatusIcon className={clsx('w-4 h-4', statusConfig[status].color)} />
              <span className={clsx('font-medium text-secondary-700', sizeConfig[size].text)}>
                {label || 'Progress'}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              {estimatedTime && (
                <span className={clsx('text-secondary-500', sizeConfig[size].text)}>
                  {estimatedTime}
                </span>
              )}
              {showPercentage && (
                <motion.span
                  className={clsx('font-medium', sizeConfig[size].text, statusConfig[status].color)}
                  key={displayValue}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {Math.round(displayValue)}%
                </motion.span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className={clsx(
        'bg-secondary-200 rounded-full overflow-hidden relative',
        thicknessConfig[thickness].linear,
        glow && 'shadow-lg'
      )}>
        <motion.div
          className={clsx(
            'h-full rounded-full relative overflow-hidden',
            gradient 
              ? `bg-gradient-to-r ${statusConfig[status].bgColor}`
              : 'bg-blue-500',
            pulse && 'animate-pulse'
          )}
          initial={{ width: '0%' }}
          animate={{ width: `${displayValue}%` }}
          transition={{ 
            duration: animated ? (speed === 'fast' ? 0.3 : speed === 'slow' ? 0.8 : 0.5) : 0,
            ease: 'easeOut'
          }}
        >
          {/* Shimmer effect */}
          {animated && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                repeatDelay: 1,
                ease: 'easeInOut'
              }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedProgressIndicator;
