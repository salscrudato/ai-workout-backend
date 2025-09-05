import React, { forwardRef, HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'flat' | 'outline' | 'glass' | 'glass-light' | 'glass-subtle' | 'glass-blue' | 'glass-blue-premium' | 'glass-blue-electric' | 'glass-cyan' | 'glass-ocean' | 'gradient' | 'gradient-premium';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  hover?: boolean;
  clickable?: boolean;
  children: React.ReactNode;
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Reusable Card component system following composition pattern
 * 
 * Features:
 * - Multiple variants (default, outlined, elevated, flat)
 * - Configurable padding
 * - Hover and clickable states
 * - Composable header, body, footer
 * - Accessibility support
 */
const Card = forwardRef<HTMLDivElement, CardProps>(({
  variant = 'default',
  padding = 'md',
  hover = false,
  clickable = false,
  className,
  children,
  ...props
}, ref) => {
  // Enhanced variant styles with sophisticated aesthetics and premium feel
  const variantStyles: Record<CardVariant, string> = {
    default: 'bg-white border border-secondary-200 shadow-soft hover:shadow-medium transition-all duration-300 ease-out',
    outlined: 'bg-white border border-secondary-300 hover:border-primary-300 transition-all duration-300 ease-out',
    elevated: 'bg-white shadow-medium hover:shadow-hard border border-secondary-100 transition-all duration-300 ease-out',
    flat: 'bg-secondary-50 hover:bg-secondary-100',
    outline: 'bg-white border border-gray-300 hover:border-primary-300',
    glass: 'glass hover:bg-white/90 border border-white/20 hover:shadow-glow-blue',
    'glass-light': 'glass-light hover:bg-white/70 border border-white/15 hover:shadow-soft',
    'glass-subtle': 'glass-subtle hover:bg-white/50 border border-white/10 hover:shadow-soft',
    'glass-blue': 'glass-blue hover:glass-blue-premium border border-blue-500/25 hover:shadow-glow-blue',
    'glass-blue-premium': 'glass-blue-premium hover:bg-blue-premium-500/15 border border-blue-premium-500/25 hover:shadow-glow-blue-premium',
    'glass-blue-electric': 'glass-blue-electric hover:bg-blue-electric-500/20 border border-blue-electric-500/25 hover:shadow-glow-blue-electric',
    'glass-cyan': 'glass-cyan hover:bg-cyan-500/20 border border-cyan-500/25 hover:shadow-glow-cyan',
    'glass-ocean': 'glass-ocean hover:bg-blue-ocean-500/15 border border-blue-ocean-500/20 hover:shadow-glow-blue-ocean',
    gradient: 'gradient-blue-light border border-primary-200 hover:shadow-glow-blue',
    'gradient-premium': 'gradient-premium border border-blue-premium-200 hover:shadow-glow-blue-premium',
  };

  // Padding styles
  const paddingStyles: Record<CardPadding, string> = {
    none: '',
    sm: 'p-4 sm:p-5',
    md: 'p-5 sm:p-7',
    lg: 'p-7 sm:p-9',
  };

  // Enhanced interactive styles with refined micro-interactions
  const interactiveStyles = clsx(
    hover && 'transition-all duration-300 ease-out hover:shadow-medium hover:-translate-y-1 hover:scale-[1.02] micro-bounce',
    clickable && 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:scale-[0.98] focus-smooth'
  );

  const cardStyles = clsx(
    // Base styles
    'rounded-xl',
    'overflow-hidden',
    'transform-gpu',

    // Variant styles
    variantStyles[variant],

    // Padding styles
    paddingStyles[padding],

    // Interactive styles
    interactiveStyles,

    // Custom className
    className
  );

  if (clickable) {
    return (
      <button
        ref={ref as any}
        className={cardStyles}
        {...(props as any)}
      >
        {children}
      </button>
    );
  }

  return (
    <div
      ref={ref}
      className={cardStyles}
      {...props}
    >
      {children}
    </div>
  );
});

/**
 * Card Header component
 */
const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(({
  className,
  children,
  ...props
}, ref) => {
  const headerStyles = clsx(
    'px-6 py-4 sm:px-7 sm:py-5',
    'border-b border-secondary-200',
    'bg-secondary-50/50',
    className
  );

  return (
    <div ref={ref} className={headerStyles} {...props}>
      {children}
    </div>
  );
});

/**
 * Card Body component
 */
const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(({
  className,
  children,
  ...props
}, ref) => {
  const bodyStyles = clsx(
    'p-6 sm:p-7',
    className
  );

  return (
    <div ref={ref} className={bodyStyles} {...props}>
      {children}
    </div>
  );
});

/**
 * Card Footer component
 */
const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(({
  className,
  children,
  ...props
}, ref) => {
  const footerStyles = clsx(
    'px-6 py-4 sm:px-7 sm:py-5',
    'border-t border-secondary-200',
    'bg-secondary-50/50',
    className
  );

  return (
    <div ref={ref} className={footerStyles} {...props}>
      {children}
    </div>
  );
});

// Set display names for better debugging
Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardBody.displayName = 'CardBody';
CardFooter.displayName = 'CardFooter';

// Export compound component
export default Object.assign(Card, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});

// Export individual components for flexibility
export { CardHeader, CardBody, CardFooter };
