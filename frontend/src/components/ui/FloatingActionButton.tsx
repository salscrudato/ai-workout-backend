import React, { forwardRef, ButtonHTMLAttributes, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export type FABSize = 'sm' | 'md' | 'lg';
export type FABVariant = 'primary' | 'secondary' | 'accent' | 'gradient' | 'premium' | 'electric' | 'glass';

export interface FABAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export interface FloatingActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: FABSize;
  variant?: FABVariant;
  icon: React.ReactNode;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  extended?: boolean;
  pulse?: boolean;
  glow?: boolean;
  morphing?: boolean;
  // Enhanced features
  actions?: FABAction[];
  expandDirection?: 'up' | 'down' | 'left' | 'right';
  hapticFeedback?: boolean;
}

/**
 * Modern Floating Action Button component
 * 
 * Features:
 * - Multiple sizes and variants
 * - Positioning options
 * - Extended FAB with label
 * - Smooth animations and hover effects
 * - Mobile-optimized touch targets
 */
const FloatingActionButton = forwardRef<HTMLButtonElement, FloatingActionButtonProps>(({
  size = 'md',
  variant = 'primary',
  icon,
  label,
  position = 'bottom-right',
  extended = false,
  pulse = false,
  glow = false,
  morphing = false,
  className,
  ...props
}, ref) => {
  const sizeStyles: Record<FABSize, string> = {
    sm: extended ? 'h-10 px-4' : 'h-10 w-10',
    md: extended ? 'h-12 px-6' : 'h-12 w-12',
    lg: extended ? 'h-14 px-8' : 'h-14 w-14',
  };

  const variantStyles: Record<FABVariant, string> = {
    primary: 'gradient-blue text-white hover:shadow-glow-blue',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 hover:shadow-lg',
    accent: 'bg-accent-500 text-white hover:bg-accent-600 hover:shadow-glow-accent',
    gradient: 'gradient-blue-cyan text-white hover:shadow-glow-blue',
    premium: 'gradient-premium text-white hover:shadow-glow-blue-premium',
    electric: 'gradient-blue-electric text-white hover:shadow-glow-blue-electric',
    glass: 'glass text-white hover:glass-light hover:shadow-glow-blue',
  };

  const positionStyles = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-6 right-6',
    'top-left': 'fixed top-6 left-6',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  // Reduced motion & safe-area handling
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    'matchMedia' in window &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const isBottomPosition = position === 'bottom-right' || position === 'bottom-left';
  const safeAreaStyle = isBottomPosition ? { bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' } : undefined;

  const fabStyles = clsx(
    // Base styles
    'inline-flex items-center justify-center',
    'rounded-full',
    'font-medium',
    'shadow-lg',
    'z-50',

    // Enhanced transitions and sophisticated animations
    'transition-all duration-300 ease-out',
    'transform-gpu',
    'motion-reduce:transform-none motion-reduce:transition-none',
    'hover:scale-110 motion-reduce:hover:scale-100',
    'active:scale-95',
    'hover:-translate-y-1 motion-reduce:hover:-translate-y-0',

    // Advanced animation effects
    pulse && 'animate-pulse motion-reduce:animate-none',
    glow && 'animate-glow motion-reduce:animate-none',
    morphing && 'animate-morphing motion-reduce:animate-none',

    // Focus and accessibility
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',

    // Disabled state
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',

    // Apply size, variant, and position styles
    sizeStyles[size],
    variantStyles[variant],
    positionStyles[position],

    // Extended FAB specific styles
    extended && 'gap-2',

    // Minimum tap target
    'min-w-[3rem] min-h-[3rem]',

    className
  );

  // Derive aria-label when not provided
  const anyProps = props as any;
  const ariaLabelFromProps = anyProps && anyProps['aria-label'];
  const computedAriaLabel = ariaLabelFromProps || label || 'Primary action';

  return (
    <button
      ref={ref}
      type="button"
      aria-label={computedAriaLabel}
      className={fabStyles}
      style={{ ...(props.style || {}), ...(safeAreaStyle || {}) }}
      {...props}
    >
      <span className={clsx('flex-shrink-0', iconSizes[size])}>
        {icon}
      </span>
      {extended && label && (
        <span className="whitespace-nowrap">{label}</span>
      )}
    </button>
  );
});

FloatingActionButton.displayName = 'FloatingActionButton';

export default FloatingActionButton;
