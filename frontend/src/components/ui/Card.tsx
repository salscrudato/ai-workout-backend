import React, { forwardRef, HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { cardVariants } from './animations/variants';

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'outline' | 'glass' | 'glass-light' | 'glass-blue' | 'glass-cyan' | 'glass-ultra' | 'luxury' | 'sophisticated' | 'premium-elevated' | 'glass-blue-premium' | 'gradient';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  hover?: boolean;
  clickable?: boolean;
  children: React.ReactNode;
  enhancedAnimation?: boolean; // Enable advanced micro-interactions
  depth?: 'subtle' | 'medium' | 'elevated'; // Control shadow depth
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
  enhancedAnimation = false,
  depth = 'medium',
  ...props
}, ref) => {
  const variantStyles: Record<CardVariant, string> = {
    default: 'glass rounded-2xl shadow-soft',
    outlined: 'glass-light rounded-2xl border border-neutral-200/50',
    elevated: 'glass rounded-2xl shadow-medium',
    outline: 'glass-light rounded-2xl border border-neutral-200/50',
    glass: 'glass rounded-2xl shadow-glass',
    'glass-light': 'glass-light rounded-2xl shadow-glass-sm',
    'glass-blue': 'glass rounded-2xl bg-primary-50/30 border border-primary-200/30',
    'glass-cyan': 'glass rounded-2xl bg-cyan-50/30 border border-cyan-200/30',
    'glass-ultra': 'glass-premium rounded-2xl premium-shadow-xl border border-white/30 micro-bounce',
    luxury: 'glass-premium rounded-3xl premium-shadow-lg gentle-glow',
    sophisticated: 'glass-tinted rounded-2xl premium-shadow micro-bounce',
    'premium-elevated': 'glass-premium rounded-3xl premium-shadow-xl gentle-glow',
    'glass-blue-premium': 'glass-tinted rounded-2xl border border-primary-200/40 premium-shadow-lg micro-bounce',
    gradient: 'gradient-ocean rounded-2xl border border-white/20 premium-shadow gentle-glow',
  };

  const paddingStyles: Record<CardPadding, string> = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const depthStyles = {
    subtle: 'shadow-soft',
    medium: 'shadow-medium',
    elevated: 'shadow-large',
  };

  const cardClasses = clsx(
    'card transition-all duration-300 ease-out motion-reduce:transition-none',
    variantStyles[variant],
    paddingStyles[padding],
    depthStyles[depth],
    {
      'hover-lift': hover && !enhancedAnimation,
      'cursor-pointer': clickable,
      'hover:shadow-glow-sm': hover && !clickable && !enhancedAnimation,
    },
    className
  );

  if (enhancedAnimation) {
    return (
      <motion.div
        ref={ref}
        className={cardClasses}
        variants={cardVariants}
        initial="initial"
        whileHover={hover ? "hover" : undefined}
        whileTap={clickable ? "tap" : undefined}
        whileFocus={clickable ? "focus" : undefined}
        {...(props as any)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      ref={ref}
      className={cardClasses}
      {...props}
    >
      {children}
    </div>
  );
});

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(({
  className,
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={clsx('card-header', className)}
    {...props}
  >
    {children}
  </div>
));

const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(({
  className,
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={clsx('card-content', className)}
    {...props}
  >
    {children}
  </div>
));

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(({
  className,
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={clsx('card-footer', className)}
    {...props}
  >
    {children}
  </div>
));

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardBody.displayName = 'CardBody';
CardFooter.displayName = 'CardFooter';

export default Card;
export { CardHeader, CardBody, CardFooter };
