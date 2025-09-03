import React, { memo, useMemo } from 'react';
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
    `animate-spin text-primary-600 ${sizeClasses[size]}`,
    [sizeClasses, size]
  );

  return (
    <div className={containerClassName}>
      <Loader2 className={spinnerClassName} />
      {text && (
        <p className="mt-2 text-sm text-secondary-600">{text}</p>
      )}
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
