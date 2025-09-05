import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

/**
 * A memoized loading spinner component that prevents unnecessary re-renders
 * @param size - Size of the spinner (sm, md, lg)
 * @param className - Additional CSS classes
 * @param text - Optional text to display below the spinner
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(({
  size = 'md',
  className = '',
  text
}) => {
  // Memoize size classes to prevent recreation on every render
  const sizeClasses = useMemo(() => ({
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }), []);

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
      transition={{ duration: 0.2 }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 className={spinnerClassName} />
      </motion.div>
      {text && (
        <motion.p
          className="mt-2 text-sm text-secondary-600"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
