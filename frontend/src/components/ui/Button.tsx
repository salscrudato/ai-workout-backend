import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import LoadingSpinner from './LoadingSpinner';

/**
 * Button component variants following design system principles
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
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
  disabled,
  className,
  children,
  ...props
}, ref) => {
  // Variant styles following design system
  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-500',
    secondary: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-300 focus:ring-secondary-500',
    outline: 'border border-secondary-300 bg-transparent text-secondary-700 hover:bg-secondary-50 active:bg-secondary-100 focus:ring-secondary-500',
    ghost: 'bg-transparent text-secondary-700 hover:bg-secondary-100 active:bg-secondary-200 focus:ring-secondary-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500',
  };

  // Size styles
  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2 text-sm',
    lg: 'h-12 px-6 py-3 text-base',
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
    'rounded-md border-0',
    
    // Transitions and animations
    'transition-all duration-200 ease-in-out',
    
    // Focus and accessibility
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'focus-visible:ring-2 focus-visible:ring-offset-2',
    
    // Disabled state
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    
    // Loading state
    loading && 'cursor-wait',
    
    // Full width
    fullWidth && 'w-full',
    
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

  return (
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
});

Button.displayName = 'Button';

export default Button;
