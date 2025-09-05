import React, { forwardRef, InputHTMLAttributes, useState } from 'react';
import { clsx } from 'clsx';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'default' | 'error' | 'success' | 'premium' | 'glass';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  size?: InputSize;
  variant?: InputVariant;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  fullWidth?: boolean;
  animate?: boolean;
  floatingLabel?: boolean;
  microInteraction?: boolean;
}

/**
 * Reusable Input component with comprehensive features
 * 
 * Features:
 * - Multiple sizes and variants
 * - Error and success states
 * - Icon support
 * - Password visibility toggle
 * - Accessibility compliant
 * - Form integration ready
 */
const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  success,
  hint,
  size = 'md',
  variant = 'default',
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
  fullWidth = true,
  animate = true,
  floatingLabel = false,
  microInteraction = true,
  className,
  type = 'text',
  disabled,
  required,
  id,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  // Generate unique ID if not provided
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  // Determine actual input type
  const inputType = showPasswordToggle && type === 'password' 
    ? (showPassword ? 'text' : 'password')
    : type;

  // Determine variant based on state
  const currentVariant = error ? 'error' : success ? 'success' : variant;

  // Size styles
  const sizeStyles: Record<InputSize, string> = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base',
  };

  // Enhanced variant styles with sophisticated effects
  const variantStyles: Record<InputVariant, string> = {
    default: 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500 focus:shadow-glow-blue hover:border-primary-300',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500 focus:shadow-lg hover:border-red-400',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500 focus:shadow-lg hover:border-green-400',
    premium: 'border-blue-premium-300 focus:border-blue-premium-500 focus:ring-blue-premium-500 focus:shadow-glow-blue-premium hover:border-blue-premium-400',
    glass: 'glass-blue border-blue-500/20 focus:border-blue-500/40 focus:ring-blue-500/30 focus:shadow-glow-blue hover:glass-blue-premium',
  };

  // Enhanced input styles with sophisticated micro-interactions
  const inputStyles = clsx(
    // Layout
    'w-full',
    'flex items-center',

    // Typography
    'font-normal leading-none',
    'placeholder:text-secondary-400',

    // Borders and background
    variant === 'glass' ? 'bg-transparent' : 'bg-white',
    'border rounded-lg',
    'shadow-sm hover:shadow-medium',

    // Enhanced transitions and micro-interactions
    'transition-all duration-300 ease-out',
    'transform-gpu',
    animate && 'hover:scale-[1.01]',

    // Sophisticated focus states
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    microInteraction && 'focus:scale-[1.02]',
    isFocused && animate && 'scale-[1.01]',

    // Disabled state
    'disabled:bg-secondary-50 disabled:text-secondary-500 disabled:cursor-not-allowed disabled:scale-100',

    // Apply size and variant styles
    sizeStyles[size],
    variantStyles[currentVariant],

    // Icon padding adjustments
    leftIcon && 'pl-10',
    (rightIcon || showPasswordToggle) && 'pr-10',

    // Floating label adjustments
    floatingLabel && 'pt-6 pb-2',

    className
  );

  // Container styles
  const containerStyles = clsx(
    'relative',
    fullWidth ? 'w-full' : 'w-auto'
  );

  // Enhanced label styles with floating label support
  const labelStyles = clsx(
    floatingLabel ? [
      'absolute left-3 transition-all duration-300 ease-out pointer-events-none',
      'text-sm font-medium',
      (isFocused || hasValue) ? [
        'top-1 text-xs',
        currentVariant === 'error' ? 'text-red-600' : 'text-primary-600'
      ] : [
        'top-1/2 -translate-y-1/2',
        'text-secondary-500'
      ]
    ] : [
      'block text-sm font-medium mb-1',
      currentVariant === 'error' ? 'text-red-700' : 'text-secondary-700',
      disabled && 'text-secondary-500'
    ]
  );

  // Icon styles
  const iconStyles = clsx(
    'absolute top-1/2 transform -translate-y-1/2',
    'w-4 h-4',
    currentVariant === 'error' ? 'text-red-400' : 'text-secondary-400'
  );

  // Helper text styles
  const helperTextStyles = clsx(
    'mt-1 text-xs',
    currentVariant === 'error' ? 'text-red-600' : 
    currentVariant === 'success' ? 'text-green-600' : 
    'text-secondary-500'
  );

  return (
    <div className={containerStyles}>
      {/* Static Label (only show if not floating) */}
      {label && !floatingLabel && (
        <label htmlFor={inputId} className={labelStyles}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input container */}
      <div className="relative">
        {/* Left icon */}
        {leftIcon && (
          <div className={clsx(iconStyles, 'left-3')}>
            {leftIcon}
          </div>
        )}

        {/* Input field */}
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          className={inputStyles}
          disabled={disabled}
          required={required}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          onChange={(e) => {
            setHasValue(e.target.value.length > 0);
            props.onChange?.(e);
          }}
          {...props}
        />

        {/* Floating label */}
        {floatingLabel && label && (
          <label htmlFor={inputId} className={labelStyles}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Right icon or password toggle */}
        {(rightIcon || showPasswordToggle) && (
          <div className={clsx(iconStyles, 'right-3')}>
            {showPasswordToggle && type === 'password' ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-secondary-400 hover:text-secondary-600 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            ) : rightIcon ? (
              rightIcon
            ) : null}
          </div>
        )}

        {/* Error icon */}
        {error && !rightIcon && !showPasswordToggle && (
          <div className={clsx(iconStyles, 'right-3')}>
            <AlertCircle className="text-red-400" size={16} />
          </div>
        )}
      </div>

      {/* Helper text */}
      {(error || success || hint) && (
        <div className={helperTextStyles}>
          {error || success || hint}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
