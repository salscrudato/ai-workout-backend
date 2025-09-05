import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';
import { MicroInteraction } from './animations';

/**
 * Button component variants following design system principles
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient' | 'premium' | 'electric' | 'glass' | 'nav';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  animate?: 'none' | 'bounce' | 'wiggle' | 'pulse' | 'rubber-band';
  success?: boolean;
  error?: boolean;
  hapticFeedback?: boolean;
  microInteraction?: boolean;
  children: React.ReactNode;
}

/**
 * Reusable Button component following SOLID principles
 * 
 * Single Responsibility: Handles button rendering and styling
 * Open/Closed: Extensible through props and variants
 * Liskov Substitution: Can be used anywhere a button is expected
 * Interface Segregation: Clean, focused interface
 * Dependency Inversion: Depends on abstractions (props) not concretions
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  animate = 'none',
  success = false,
  error = false,
  hapticFeedback = true,
  microInteraction = true,
  disabled,
  className,
  children,
  ...props
}, ref) => {
  // Enhanced variant styles with sophisticated design system
  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'gradient-blue text-white hover:shadow-glow-blue active:scale-95 focus:ring-primary-500 hover-glow',
    secondary: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-300 focus:ring-secondary-500 hover:shadow-soft',
    outline: 'border border-primary-300 bg-transparent text-primary-700 hover:bg-primary-50 active:bg-primary-100 focus:ring-primary-500 hover:border-primary-400',
    ghost: 'bg-transparent text-secondary-700 hover:bg-secondary-100 active:bg-secondary-200 focus:ring-secondary-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500 hover:shadow-lg',
    gradient: 'gradient-blue-cyan text-white hover:shadow-glow-blue active:scale-95 focus:ring-primary-500 hover:shadow-glow-lg',
    premium: 'gradient-blue-premium text-white hover:shadow-glow-blue-premium active:scale-95 focus:ring-blue-premium-500 hover:shadow-glow-xl',
    electric: 'gradient-blue-electric text-white hover:shadow-glow-blue-electric active:scale-95 focus:ring-blue-electric-500 hover:shadow-glow-lg',
    glass: 'glass-blue text-secondary-900 hover:glass-blue-premium active:bg-white/95 focus:ring-primary-500 backdrop-blur-md',
    nav: 'text-secondary-600 hover:text-primary-600 hover:bg-primary-50 active:bg-primary-100 focus:ring-primary-500 transition-all duration-200',
  };

  // Size styles with improved mobile touch targets
  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'h-9 px-3 text-xs min-w-[2.25rem]',
    md: 'h-11 px-4 py-2 text-sm min-w-[2.75rem]',
    lg: 'h-12 px-6 py-3 text-base min-w-[3rem]',
  };

  // Base styles
  const baseStyles = clsx(
    // Layout and positioning
    'inline-flex items-center justify-center',
    'relative overflow-hidden',
    
    // Typography
    'font-medium leading-none',
    'whitespace-nowrap',
    
    // Borders and radius
    'rounded-lg border-0',

    // Enhanced transitions and animations
    'transition-all duration-300 ease-out',
    'transform-gpu',

    // Refined micro-interactions
    'micro-bounce',
    'active:scale-95',
    'hover:scale-[1.02]',
    
    // Enhanced focus and accessibility
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-smooth',
    
    // Disabled state
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    
    // Loading state
    loading && 'cursor-wait',
    
    // Full width
    fullWidth && 'w-full',

    // Animation states
    animate === 'bounce' && 'animate-bounce',
    animate === 'wiggle' && 'animate-wiggle',
    animate === 'pulse' && 'animate-pulse',
    animate === 'rubber-band' && 'animate-rubber-band',

    // Enhanced feedback states with visual effects
    success && 'success-bounce shadow-glow-blue',
    error && 'error-shake shadow-glow-accent',

    // Micro-interaction enhancements
    microInteraction && 'gentle-glow hover:brightness-105',

    // Apply variant and size styles
    variantStyles[variant],
    sizeStyles[size],

    // Custom className
    className
  );

  // Icon size based on button size
  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  const buttonContent = (
    <button
      ref={ref}
      className={baseStyles}
      disabled={disabled || loading}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size={size === 'sm' ? 'sm' : 'md'} />
        </div>
      )}

      {/* Content container - hidden when loading */}
      <div className={clsx('flex items-center gap-2', loading && 'opacity-0')}>
        {leftIcon && (
          <span className={clsx('flex-shrink-0', iconSize)}>
            {leftIcon}
          </span>
        )}

        <span>{children}</span>

        {rightIcon && (
          <span className={clsx('flex-shrink-0', iconSize)}>
            {rightIcon}
          </span>
        )}
      </div>
    </button>
  );

  // Wrap with micro-interaction if enabled
  if (microInteraction) {
    return (
      <MicroInteraction
        type="button"
        disabled={disabled || loading}
        loading={loading}
        success={success}
        error={error}
        hapticFeedback={hapticFeedback}
      >
        {buttonContent}
      </MicroInteraction>
    );
  }

  return buttonContent;
});

Button.displayName = 'Button';

export default Button;
