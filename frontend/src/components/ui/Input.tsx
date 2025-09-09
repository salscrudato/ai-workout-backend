import React, { forwardRef, InputHTMLAttributes, useState, useMemo, useCallback } from 'react';
import { clsx } from 'clsx';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  size?: InputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  size = 'md',
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
  fullWidth = true,
  className,
  type = 'text',
  disabled,
  required,
  id,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  // Memoize stable values for better performance
  const inputId = useMemo(() => id || `input-${Math.random().toString(36).substring(2, 11)}`, [id]);
  const helperId = useMemo(() => `${inputId}-help`, [inputId]);

  const inputType = useMemo(() =>
    showPasswordToggle && type === 'password'
      ? (showPassword ? 'text' : 'password')
      : type,
    [showPasswordToggle, type, showPassword]
  );

  // Memoize size styles for better performance
  const sizeStyles = useMemo(() => ({
    sm: 'h-9 px-4 text-sm',
    md: 'h-11 px-4 text-base',
    lg: 'h-12 px-5 text-lg',
  }), []);

  // Optimize password toggle handler
  const togglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const inputStyles = clsx(
    // Base styles with premium glass morphism and mobile optimization
    'glass-premium rounded-xl border-0 premium-shadow focus-premium',
    'placeholder:text-neutral-400 text-neutral-900',
    'transition-all duration-300 ease-out',
    'focus:shadow-glow-sm focus:ring-4 focus:ring-primary-500/30 focus:outline-none',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'motion-reduce:transition-none',
    // Mobile optimizations
    'touch-manipulation',
    'text-base', // Prevents zoom on iOS
    sizeStyles[size],
    {
      'w-full': fullWidth,
      'border-error-300 focus:border-error-500 focus:ring-error-500/30 shadow-glow-sm': error,
      'pl-11': leftIcon,
      'pr-11': rightIcon || showPasswordToggle,
    },
    className
  );

  const renderIcon = (icon: React.ReactNode, position: 'left' | 'right') => {
    if (!icon) return null;

    return (
      <div className={clsx(
        'absolute inset-y-0 flex items-center pointer-events-none',
        position === 'left' ? 'left-0 pl-3' : 'right-0 pr-3'
      )}>
        <span className="text-neutral-400 w-4 h-4">
          {icon}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-neutral-700 mb-2"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          disabled={disabled}
          required={required}
          className={inputStyles}
          aria-describedby={helperId}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />

        {renderIcon(leftIcon, 'left')}
        {renderIcon(rightIcon, 'right')}

        {showPasswordToggle && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={togglePassword}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-neutral-400" />
            ) : (
              <Eye className="h-4 w-4 text-neutral-400" />
            )}
          </button>
        )}
      </div>

      {(error || hint) && (
        <div id={helperId} className="flex items-start space-x-1">
          {error && (
            <>
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-red-600">{error}</span>
            </>
          )}
          {!error && hint && (
            <span className="text-sm text-neutral-500">{hint}</span>
          )}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;