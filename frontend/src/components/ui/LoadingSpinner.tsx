import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'pulse' | 'gradient' | 'premium';
  className?: string;
  text?: string;
  color?: string;
}

/**
 * A memoized loading spinner component that prevents unnecessary re-renders
 * @param size - Size of the spinner (sm, md, lg)
 * @param className - Additional CSS classes
 * @param text - Optional text to display below the spinner
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(({
  size = 'md',
  variant = 'default',
  className = '',
  text,
  color
}) => {
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
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <motion.div
            className={`rounded-full bg-current ${baseClasses}`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        );

      case 'gradient':
        return (
          <motion.div
            className={`rounded-full gradient-blue ${baseClasses}`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{
              background: 'conic-gradient(from 0deg, transparent, #0ea5e9, transparent)',
            }}
          />
        );

      case 'premium':
        return (
          <motion.div
            className="relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <div className={`rounded-full border-4 border-transparent ${baseClasses}`}>
              <div className="absolute inset-0 rounded-full border-4 border-t-primary-500 border-r-transparent border-b-accent-500 border-l-transparent animate-spin" />
              <div className="absolute inset-2 rounded-full border-2 border-t-transparent border-r-primary-300 border-b-transparent border-l-accent-300 animate-spin" style={{ animationDirection: 'reverse' }} />
            </div>
          </motion.div>
        );

      default:
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className={`animate-spin drop-shadow-lg ${baseClasses}`} />
          </motion.div>
        );
    }
  };

  // Memoize combined className to prevent string concatenation on every render
  const containerClassName = useMemo(() =>
    `flex flex-col items-center justify-center ${className}`,
    [className]
  );

  const spinnerClassName = useMemo(() =>
    `animate-spin text-primary-600 drop-shadow-lg ${sizeClasses[size]}`,
    [sizeClasses, size]
  );

  return (
    <motion.div
      className={containerClassName}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {renderSpinner()}
      {text && (
        <motion.p
          className="mt-3 text-sm text-secondary-600 font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
