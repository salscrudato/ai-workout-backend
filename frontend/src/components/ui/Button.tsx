import React, { forwardRef, ButtonHTMLAttributes, useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { MicroInteraction } from './animations';

/**
 * Button component variants following design system principles
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient' | 'premium' | 'luxury' | 'electric' | 'glass' | 'minimal' | 'nav';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  animate?: 'none' | 'bounce' | 'wiggle' | 'pulse' | 'rubber-band' | 'success' | 'error';
  success?: boolean;
  error?: boolean;
  hapticFeedback?: boolean;
  microInteraction?: boolean;
  children: React.ReactNode;
  // Enhanced accessibility props
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaPressed?: boolean;
  ariaExpanded?: boolean;
  loadingText?: string;
  // Enhanced feedback props
  progress?: number; // 0-100 for progress indication
  showProgress?: boolean;
  successMessage?: string;
  errorMessage?: string;
  autoResetState?: boolean; // Auto-reset success/error state after delay
  feedbackDuration?: number; // Duration to show feedback state (ms)
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
  progress = 0,
  showProgress = false,
  successMessage,
  errorMessage,
  autoResetState = true,
  feedbackDuration = 2000,
  success = false,
  error = false,
  hapticFeedback = true,
  microInteraction = true,
  disabled,
  className,
  children,
  ariaLabel,
  ariaDescribedBy,
  ariaPressed,
  ariaExpanded,
  loadingText = 'Loading...',
  ...props
}, ref) => {
  // State management for enhanced feedback
  const [currentState, setCurrentState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [showFeedback, setShowFeedback] = useState(false);

  // Auto-reset state management
  useEffect(() => {
    if (success && autoResetState) {
      setCurrentState('success');
      setShowFeedback(true);
      const timer = setTimeout(() => {
        setCurrentState('idle');
        setShowFeedback(false);
      }, feedbackDuration);
      return () => clearTimeout(timer);
    }
  }, [success, autoResetState, feedbackDuration]);

  useEffect(() => {
    if (error && autoResetState) {
      setCurrentState('error');
      setShowFeedback(true);
      const timer = setTimeout(() => {
        setCurrentState('idle');
        setShowFeedback(false);
      }, feedbackDuration);
      return () => clearTimeout(timer);
    }
  }, [error, autoResetState, feedbackDuration]);

  useEffect(() => {
    if (loading) {
      setCurrentState('loading');
    } else if (!success && !error) {
      setCurrentState('idle');
    }
  }, [loading, success, error]);

  // Enhanced variant styles with sophisticated design system
  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'gradient-blue text-white hover:shadow-glow-blue active:scale-95 focus:ring-primary-500 hover-glow',
    secondary: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-300 focus:ring-secondary-500 hover:shadow-soft',
    outline: 'border border-primary-300 bg-transparent text-primary-700 hover:bg-primary-50 active:bg-primary-100 focus:ring-primary-500 hover:border-primary-400',
    ghost: 'bg-transparent text-secondary-700 hover:bg-secondary-100 active:bg-secondary-200 focus:ring-secondary-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500 hover:shadow-lg',
    gradient: 'gradient-blue-cyan text-white hover:shadow-glow-blue active:scale-95 focus:ring-primary-500 hover:shadow-glow-lg',
    premium: 'gradient-blue-premium text-white hover:shadow-glow-blue-premium active:scale-95 focus:ring-blue-premium-500 hover:shadow-glow-xl',
    luxury: 'gradient-text-luxury bg-gradient-to-r from-slate-900 to-slate-700 text-white hover:from-slate-800 hover:to-slate-600 shadow-xl hover:shadow-2xl active:scale-95 focus:ring-slate-500',
    electric: 'gradient-blue-electric text-white hover:shadow-glow-blue-electric active:scale-95 focus:ring-blue-electric-500 hover:shadow-glow-lg',
    glass: 'glass-blue text-secondary-900 hover:glass-blue-premium active:bg-white/95 focus:ring-primary-500 backdrop-blur-md',
    minimal: 'bg-transparent text-slate-700 hover:bg-slate-50 active:bg-slate-100 focus:ring-slate-500 border border-slate-200 hover:border-slate-300',
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
    animate === 'success' && 'animate-success-bounce',
    animate === 'error' && 'animate-error-shake',

    // Enhanced feedback states with visual effects
    currentState === 'success' && 'bg-green-500 text-white shadow-glow-green',
    currentState === 'error' && 'bg-red-500 text-white shadow-glow-red',

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

  // Enhanced content rendering with feedback states
  const renderContent = () => {
    if (currentState === 'success') {
      return (
        <motion.div
          className="flex items-center gap-2"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <CheckCircle className={iconSize} />
          <span>{successMessage || 'Success!'}</span>
        </motion.div>
      );
    }

    if (currentState === 'error') {
      return (
        <motion.div
          className="flex items-center gap-2"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <AlertCircle className={iconSize} />
          <span>{errorMessage || 'Error!'}</span>
        </motion.div>
      );
    }

    if (currentState === 'loading') {
      return (
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <LoadingSpinner
            size={size === 'sm' ? 'sm' : 'md'}
            variant={showProgress ? 'progress' : 'default'}
            progress={progress}
            showProgress={showProgress}
          />
          <span>{loadingText}</span>
        </motion.div>
      );
    }

    // Default content
    return (
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
      >
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
      </motion.div>
    );
  };

  const buttonContent = (
    <motion.button
      ref={ref}
      className={baseStyles}
      disabled={disabled || loading || currentState === 'success' || currentState === 'error'}
      aria-label={ariaLabel || (loading ? loadingText : undefined)}
      aria-describedby={ariaDescribedBy}
      aria-pressed={ariaPressed}
      aria-expanded={ariaExpanded}
      aria-busy={loading}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      {...(props as any)}
    >
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </motion.button>
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
