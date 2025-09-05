import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export type FABSize = 'sm' | 'md' | 'lg';
export type FABVariant = 'primary' | 'secondary' | 'accent' | 'gradient' | 'premium' | 'electric' | 'glass';

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
    premium: 'gradient-blue-premium text-white hover:shadow-glow-blue-premium',
    electric: 'gradient-blue-electric text-white hover:shadow-glow-blue-electric',
    glass: 'glass-blue text-white hover:glass-blue-premium hover:shadow-glow-blue',
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
    'hover:scale-110',
    'active:scale-95',
    'hover:-translate-y-1',

    // Advanced animation effects
    pulse && 'animate-pulse',
    glow && 'animate-glow',
    morphing && 'animate-morphing',

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

    className
  );

  return (
    <button
      ref={ref}
      className={fabStyles}
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
