import React from 'react';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';
import Card from './Card';

export interface EnhancedStatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'glass' | 'gradient';
  animated?: boolean;
  delay?: number;
  suffix?: string;
  prefix?: string;
}

/**
 * Enhanced StatCard component with animations and glass morphism
 * 
 * Features:
 * - Animated counters with smooth transitions
 * - Glass morphism variants
 * - Blue gradient themes
 * - Trend indicators with enhanced styling
 * - Mobile-first responsive design
 * - Hover animations and micro-interactions
 */
const EnhancedStatCard: React.FC<EnhancedStatCardProps> = ({
  title,
  value,
  icon,
  trend,
  className,
  variant = 'default',
  animated = true,
  delay = 0,
  suffix = '',
  prefix = '',
}) => {
  const variantStyles = {
    default: 'bg-white border-secondary-200 hover:shadow-medium',
    primary: 'glass-blue border-primary-200 hover:shadow-glow-blue',
    success: 'glass-light border-green-200 hover:shadow-soft',
    warning: 'glass-light border-yellow-200 hover:shadow-soft',
    error: 'glass-light border-red-200 hover:shadow-soft',
    glass: 'glass border-white/20 hover:shadow-glow-blue',
    gradient: 'gradient-blue-light border-primary-200 hover:shadow-glow-blue',
  };

  const iconVariantStyles = {
    default: 'bg-secondary-100 text-secondary-600',
    primary: 'gradient-blue text-white shadow-glow-blue',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    error: 'bg-red-100 text-red-600',
    glass: 'glass-light text-primary-600',
    gradient: 'gradient-blue-deep text-white shadow-glow-blue',
  };

  const getTrendIcon = () => {
    switch (trend?.direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = () => {
    switch (trend?.direction) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-secondary-500 bg-secondary-50';
    }
  };

  const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value;

  return (
    <Card
      variant={variant as any}
      hover
      className={clsx(
        'p-4 sm:p-6 transition-all duration-300 hover:scale-[1.02] group',
        'animate-fade-in-up',
        variantStyles[variant],
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-secondary-600 mb-2 group-hover:text-secondary-700 transition-colors truncate">
            {title}
          </p>
          
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-secondary-900 mb-3">
            {animated && typeof numericValue === 'number' ? (
              <AnimatedCounter
                value={numericValue}
                delay={delay}
                suffix={suffix}
                prefix={prefix}
                className="gradient-text-blue"
              />
            ) : (
              <span className="gradient-text-blue">{prefix}{value}{suffix}</span>
            )}
          </div>
          
          {trend && (
            <div className={clsx(
              'inline-flex items-center gap-1 sm:gap-2 px-2 py-1 rounded-full text-xs sm:text-sm font-medium',
              'transition-all duration-200 group-hover:scale-105',
              getTrendColor()
            )}>
              {getTrendIcon()}
              <span>{trend.value}</span>
              <span className="text-secondary-500 hidden sm:inline">{trend.label}</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="flex-shrink-0 ml-3 sm:ml-4">
            <div className={clsx(
              'w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center',
              'transition-all duration-300 group-hover:scale-110 group-hover:rotate-3',
              iconVariantStyles[variant]
            )}>
              {React.cloneElement(icon as React.ReactElement, {
                className: 'w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7'
              } as any)}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default EnhancedStatCard;
