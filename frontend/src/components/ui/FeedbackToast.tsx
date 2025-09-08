import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { CheckCircle, AlertCircle, Info, X, Zap } from 'lucide-react';

export interface FeedbackToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  showIcon?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  animate?: boolean;
  glow?: boolean;
  progress?: boolean;
}

/**
 * Enhanced Feedback Toast Component
 * 
 * Features:
 * - Multiple feedback types with appropriate icons and colors
 * - Smooth animations with spring physics
 * - Auto-dismiss with progress indicator
 * - Multiple positioning options
 * - Glow effects for enhanced visual feedback
 * - Accessibility support with ARIA labels
 * - Mobile-optimized touch targets
 */
const FeedbackToast: React.FC<FeedbackToastProps> = ({
  type,
  title,
  message,
  duration = 4000,
  position = 'top-right',
  showIcon = true,
  dismissible = true,
  onDismiss,
  className,
  animate = true,
  glow = true,
  progress = true,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progressValue, setProgressValue] = useState(100);

  // Auto-dismiss timer
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      // Progress animation
      if (progress) {
        const progressTimer = setInterval(() => {
          setProgressValue((prev) => {
            const decrement = 100 / (duration / 100);
            return Math.max(0, prev - decrement);
          });
        }, 100);

        return () => {
          clearTimeout(timer);
          clearInterval(progressTimer);
        };
      }

      return () => clearTimeout(timer);
    }
  }, [duration, progress]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss?.();
    }, 300);
  };

  // Type configurations
  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50 border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-500',
      glowColor: 'shadow-glow-green',
      progressColor: 'bg-green-500',
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50 border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-500',
      glowColor: 'shadow-glow-red',
      progressColor: 'bg-red-500',
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-50 border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-500',
      glowColor: 'shadow-glow-yellow',
      progressColor: 'bg-yellow-500',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-500',
      glowColor: 'shadow-glow-blue',
      progressColor: 'bg-blue-500',
    },
  };

  // Position configurations
  const positionConfig = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  // Animation variants
  const toastVariants = {
    initial: {
      opacity: 0,
      scale: 0.8,
      y: position.includes('top') ? -50 : 50,
      x: position.includes('right') ? 50 : position.includes('left') ? -50 : 0,
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      x: 0,
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: position.includes('top') ? -50 : 50,
      x: position.includes('right') ? 50 : position.includes('left') ? -50 : 0,
    },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={clsx(
            'fixed z-50 max-w-sm w-full',
            positionConfig[position],
            className
          )}
          variants={animate ? toastVariants : undefined}
          initial={animate ? 'initial' : undefined}
          animate={animate ? 'animate' : undefined}
          exit={animate ? 'exit' : undefined}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 25,
            duration: 0.3,
          }}
        >
          <div
            className={clsx(
              'relative overflow-hidden rounded-lg border p-4',
              'backdrop-blur-sm bg-white/95',
              config.bgColor,
              glow && config.glowColor,
              'shadow-lg'
            )}
            role="alert"
            aria-live="polite"
          >
            {/* Progress bar */}
            {progress && duration > 0 && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
                <motion.div
                  className={clsx('h-full', config.progressColor)}
                  initial={{ width: '100%' }}
                  animate={{ width: `${progressValue}%` }}
                  transition={{ duration: 0.1, ease: 'linear' }}
                />
              </div>
            )}

            <div className="flex items-start space-x-3">
              {/* Icon */}
              {showIcon && (
                <motion.div
                  className="flex-shrink-0"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                >
                  <Icon className={clsx('w-5 h-5', config.iconColor)} />
                </motion.div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <motion.h4
                  className={clsx('text-sm font-medium', config.textColor)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  {title}
                </motion.h4>
                {message && (
                  <motion.p
                    className={clsx('mt-1 text-sm', config.textColor, 'opacity-80')}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 0.8, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                  >
                    {message}
                  </motion.p>
                )}
              </div>

              {/* Dismiss button */}
              {dismissible && (
                <motion.button
                  className={clsx(
                    'flex-shrink-0 p-1 rounded-md',
                    'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300',
                    'transition-colors duration-200',
                    config.textColor
                  )}
                  onClick={handleDismiss}
                  aria-label="Dismiss notification"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </div>

            {/* Enhanced visual effects */}
            {type === 'success' && (
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.5, duration: 0.6 }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackToast;
