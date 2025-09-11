import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { 
  CheckCircle, 
  Star, 
  Zap, 
  Trophy,
  Target,
  Flame,
  Award,
  TrendingUp
} from 'lucide-react';

export interface ProgressCelebrationProps {
  trigger: boolean;
  type: 'exercise' | 'set' | 'milestone' | 'streak' | 'personal-best';
  message: string;
  value?: string | number;
  duration?: number;
  position?: 'top' | 'center' | 'bottom';
  className?: string;
}

/**
 * Animated progress celebration component for real-time workout feedback
 */
const ProgressCelebration: React.FC<ProgressCelebrationProps> = ({
  trigger,
  type,
  message,
  value,
  duration = 2000,
  position = 'top',
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsVisible(true);
      setIsAnimating(true);
      
      const hideTimer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          setIsVisible(false);
        }, 300);
      }, duration);

      return () => clearTimeout(hideTimer);
    }
  }, [trigger, duration]);

  const getTypeConfig = () => {
    switch (type) {
      case 'exercise':
        return {
          icon: CheckCircle,
          iconColor: 'text-success-500',
          bgColor: 'bg-success-100',
          borderColor: 'border-success-300',
          textColor: 'text-success-800',
          animation: 'animate-bounce-gentle',
        };
      case 'set':
        return {
          icon: Target,
          iconColor: 'text-primary-500',
          bgColor: 'bg-primary-100',
          borderColor: 'border-primary-300',
          textColor: 'text-primary-800',
          animation: 'animate-pulse-slow',
        };
      case 'milestone':
        return {
          icon: Award,
          iconColor: 'text-purple-500',
          bgColor: 'bg-purple-100',
          borderColor: 'border-purple-300',
          textColor: 'text-purple-800',
          animation: 'animate-bounce-gentle',
        };
      case 'streak':
        return {
          icon: Flame,
          iconColor: 'text-orange-500',
          bgColor: 'bg-orange-100',
          borderColor: 'border-orange-300',
          textColor: 'text-orange-800',
          animation: 'animate-pulse-slow',
        };
      case 'personal-best':
        return {
          icon: Trophy,
          iconColor: 'text-yellow-500',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-300',
          textColor: 'text-yellow-800',
          animation: 'animate-bounce-gentle',
        };
      default:
        return {
          icon: Star,
          iconColor: 'text-primary-500',
          bgColor: 'bg-primary-100',
          borderColor: 'border-primary-300',
          textColor: 'text-primary-800',
          animation: 'animate-pulse-slow',
        };
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      case 'bottom':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 left-1/2 transform -translate-x-1/2';
    }
  };

  if (!isVisible) return null;

  const config = getTypeConfig();
  const IconComponent = config.icon;

  return (
    <div
      className={clsx(
        'fixed z-50 pointer-events-none',
        getPositionClasses(),
        className
      )}
    >
      <div
        className={clsx(
          'glass-premium rounded-2xl border-2 p-4 shadow-glow-blue transition-all duration-300 transform',
          config.bgColor,
          config.borderColor,
          isAnimating 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-2'
        )}
      >
        <div className="flex items-center gap-3">
          {/* Animated Icon */}
          <div className={clsx(
            'w-10 h-10 rounded-full glass-light flex items-center justify-center',
            config.animation
          )}>
            <IconComponent className={clsx('w-5 h-5', config.iconColor)} />
          </div>
          
          {/* Message Content */}
          <div className="flex-1 min-w-0">
            <div className={clsx('font-semibold text-sm', config.textColor)}>
              {message}
            </div>
            {value && (
              <div className={clsx('text-lg font-bold', config.textColor)}>
                {value}
              </div>
            )}
          </div>
          
          {/* Sparkle Effects for Special Achievements */}
          {(type === 'milestone' || type === 'personal-best' || type === 'streak') && (
            <div className="relative">
              <Star className="w-3 h-3 text-yellow-400 animate-pulse" />
              <Star className="w-2 h-2 text-yellow-400 absolute -top-1 -right-1 animate-pulse delay-300" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressCelebration;
