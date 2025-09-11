import React, { forwardRef, ButtonHTMLAttributes, useMemo } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
// Simple animation variants
const buttonVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

const advancedButtonVariants = {
  initial: { scale: 1, opacity: 1 },
  hover: { scale: 1.02, opacity: 0.9 },
  tap: { scale: 0.98 },
};

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'gradient' | 'premium' | 'luxury' | 'minimal' | 'electric' | 'glass';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
  animate?: string; // For backward compatibility
  enhancedAnimation?: boolean; // Enable advanced micro-interactions
  ripple?: boolean; // Enable ripple effect
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  children,
  disabled,
  enhancedAnimation = false,
  ripple = false,
  ...props
}, ref) => {
  // Memoize variant classes for better performance
  const variantClasses = useMemo(() => {
    const variants = {
      primary: 'btn-primary micro-bounce focus-premium',
      secondary: 'btn-secondary micro-bounce focus-premium',
      ghost: 'btn-ghost gentle-glow focus-premium',
      outline: 'btn-outline micro-bounce focus-premium',
      gradient: 'gradient-aurora text-white premium-shadow-lg micro-bounce focus-premium',
      premium: 'glass-premium text-primary-700 premium-shadow-lg micro-bounce focus-premium',
      luxury: 'glass-tinted text-primary-800 premium-shadow-xl gentle-glow focus-premium',
      minimal: 'btn-ghost gentle-glow focus-premium',
      electric: 'gradient-ocean text-white premium-shadow-lg micro-bounce focus-premium',
      glass: 'glass-premium text-primary-700 premium-shadow focus-premium'
    };
    return variants[variant] || variants.primary;
  }, [variant]);

  const getSizeClasses = () => {
    const sizes = {
      sm: 'btn-sm',
      md: 'btn-md',
      lg: 'btn-lg',
      xl: 'btn-xl'
    };
    return sizes[size];
  };

  const buttonClasses = clsx(
    'btn',
    variantClasses,
    getSizeClasses(),
    {
      'w-full': fullWidth,
      'opacity-50 cursor-not-allowed': disabled || loading,
    },
    // Enhanced mobile interactions
    'touch-manipulation select-none',
    'active:scale-[0.98] active:transition-transform active:duration-75',
    enhancedAnimation && 'transform-gpu will-change-transform',
    className
  );

  const renderIcon = (icon: React.ReactNode, position: 'left' | 'right') => {
    if (!icon) return null;

    return (
      <span className={clsx(
        'inline-flex items-center justify-center',
        position === 'left' ? 'mr-2' : 'ml-2',
        size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
      )}>
        {icon}
      </span>
    );
  };

  // Choose animation variant based on props
  const animationVariant = enhancedAnimation ? advancedButtonVariants : buttonVariants;

  if (enhancedAnimation) {
    return (
      <motion.button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || loading}
        variants={animationVariant}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        whileFocus="focus"
        {...(props as any)}
      >
        <div className="flex items-center justify-center relative overflow-hidden">
          {loading ? (
            <motion.div
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          ) : (
            renderIcon(leftIcon, 'left')
          )}
          <span>{loading && loadingText ? loadingText : children}</span>
          {!loading && renderIcon(rightIcon, 'right')}

          {/* Ripple effect */}
          {ripple && (
            <motion.div
              className="absolute inset-0 bg-white/20 rounded-full scale-0"
              whileTap={{ scale: 4, opacity: [0.5, 0] }}
              transition={{ duration: 0.3 }}
            />
          )}
        </div>
      </motion.button>
    );
  }

  return (
    <button
      ref={ref}
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      <div className="flex items-center justify-center">
        {loading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : (
          renderIcon(leftIcon, 'left')
        )}
        <span>{loading && loadingText ? loadingText : children}</span>
        {!loading && renderIcon(rightIcon, 'right')}
      </div>
    </button>
  );
});

Button.displayName = 'Button';

export default Button;