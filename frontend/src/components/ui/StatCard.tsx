import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { motion, useAnimation } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label?: string;
    direction: 'up' | 'down' | 'neutral';
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'premium' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  loading?: boolean;
  animate?: boolean;
  countUp?: boolean;
  delay?: number;
}

/**
 * Modern StatCard component for displaying key metrics and statistics
 */
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  size = 'md',
  className,
  onClick,
  loading = false,
  animate = true,
  countUp = true,
  delay = 0,
}) => {
  const [displayValue, setDisplayValue] = useState(countUp ? 0 : value);
  const controls = useAnimation();
  const variantStyles = {
    default: 'bg-white border-secondary-200 hover:border-secondary-300 hover:shadow-medium',
    primary: 'bg-primary-50 border-primary-200 hover:border-primary-300 hover:shadow-glow-blue',
    success: 'bg-success-50 border-success-200 hover:border-success-300 hover:shadow-lg',
    warning: 'bg-warning-50 border-warning-200 hover:border-warning-300 hover:shadow-lg',
    error: 'bg-error-50 border-error-200 hover:border-error-300 hover:shadow-lg',
    premium: 'glass-blue-premium border-blue-premium-200 hover:glass-blue-electric hover:shadow-glow-blue-premium',
    glass: 'glass-light border-white/20 hover:glass hover:shadow-glow-blue',
  };

  const sizeStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const valueSizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';

    switch (trend.direction) {
      case 'up':
        return 'text-success-600 bg-success-100';
      case 'down':
        return 'text-error-600 bg-error-100';
      default:
        return 'text-secondary-600 bg-secondary-100';
    }
  };

  // Count-up animation effect
  useEffect(() => {
    if (countUp && typeof value === 'number') {
      const duration = 1500; // 1.5 seconds
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, countUp]);

  // Card entrance animation
  useEffect(() => {
    if (animate) {
      controls.start({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: 0.5,
          delay,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
      });
    }
  }, [animate, controls, delay]);

  if (loading) {
    return (
      <div
        className={clsx(
          'rounded-xl border animate-pulse',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
      >
        <div className="space-y-3">
          <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
          <div className="h-8 bg-secondary-200 rounded w-1/2"></div>
          {subtitle && <div className="h-3 bg-secondary-200 rounded w-2/3"></div>}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 20, scale: 0.95 } : false}
      animate={controls}
      whileHover={onClick ? {
        scale: 1.03,
        y: -4,
        transition: { duration: 0.2 }
      } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={clsx(
        'rounded-xl border transition-all duration-300',
        'shadow-soft backdrop-blur-sm',
        variantStyles[variant],
        sizeStyles[size],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {icon && (
              <div className={clsx('text-secondary-500', iconSizes[size])}>
                {icon}
              </div>
            )}
            <p className="text-sm font-medium text-secondary-600 truncate">
              {title}
            </p>
          </div>
          
          <motion.p
            className={clsx('font-bold text-secondary-900', valueSizes[size])}
            key={displayValue}
            initial={countUp ? { scale: 1.2, opacity: 0 } : false}
            animate={countUp ? { scale: 1, opacity: 1 } : undefined}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {displayValue}
          </motion.p>
          
          {subtitle && (
            <p className="text-sm text-secondary-500 mt-1 truncate">
              {subtitle}
            </p>
          )}
        </div>

        {trend && (
          <div
            className={clsx(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
              getTrendColor()
            )}
          >
            {getTrendIcon()}
            <span>
              {trend.value > 0 ? '+' : ''}{trend.value}
              {trend.label && ` ${trend.label}`}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
