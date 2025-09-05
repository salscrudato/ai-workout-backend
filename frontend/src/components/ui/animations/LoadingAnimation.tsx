import React from 'react';
import { motion } from 'framer-motion';
import { spinnerVariants, pulseVariants } from './variants';

export type LoadingType = 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'progress';

export interface LoadingAnimationProps {
  type?: LoadingType;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
  progress?: number; // For progress type
}

/**
 * Loading Animation Component
 * 
 * Provides various loading animations with:
 * - Multiple animation types
 * - Consistent sizing and colors
 * - Blue gradient theme integration
 * - Performance optimized
 */
const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  type = 'spinner',
  size = 'md',
  color = 'primary',
  className,
  progress = 0,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    white: 'text-white',
  };

  const renderSpinner = () => (
    <motion.div
      className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      variants={spinnerVariants}
      animate="animate"
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="31.416"
          strokeDashoffset="31.416"
          fill="none"
          className="opacity-25"
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="31.416"
          strokeDashoffset="23.562"
          fill="none"
          className="opacity-75"
        />
      </svg>
    </motion.div>
  );

  const renderDots = () => (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`w-2 h-2 rounded-full bg-current ${colorClasses[color]}`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.2,
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <motion.div
      className={`${sizeClasses[size]} rounded-full bg-current ${colorClasses[color]} ${className}`}
      variants={pulseVariants}
      animate="animate"
    />
  );

  const renderSkeleton = () => (
    <div className={`space-y-3 ${className}`}>
      <motion.div
        className="h-4 bg-gradient-to-r from-secondary-200 via-primary-100 to-secondary-200 rounded"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          backgroundSize: '200% 100%',
        }}
      />
      <motion.div
        className="h-4 bg-gradient-to-r from-secondary-200 via-primary-100 to-secondary-200 rounded w-3/4"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
          delay: 0.2,
        }}
        style={{
          backgroundSize: '200% 100%',
        }}
      />
      <motion.div
        className="h-4 bg-gradient-to-r from-secondary-200 via-primary-100 to-secondary-200 rounded w-1/2"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
          delay: 0.4,
        }}
        style={{
          backgroundSize: '200% 100%',
        }}
      />
    </div>
  );

  const renderProgress = () => (
    <div className={`w-full bg-secondary-200 rounded-full h-2 ${className}`}>
      <motion.div
        className="bg-gradient-to-r from-primary-500 to-blue-600 h-2 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{
          duration: 0.5,
          ease: 'easeOut',
        }}
      />
    </div>
  );

  switch (type) {
    case 'spinner':
      return renderSpinner();
    case 'dots':
      return renderDots();
    case 'pulse':
      return renderPulse();
    case 'skeleton':
      return renderSkeleton();
    case 'progress':
      return renderProgress();
    default:
      return renderSpinner();
  }
};

export default LoadingAnimation;
