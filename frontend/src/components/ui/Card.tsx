import React, { forwardRef, HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'flat';
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
  // Variant styles
  const variantStyles: Record<CardVariant, string> = {
    default: 'bg-white border border-secondary-200 shadow-sm',
    outlined: 'bg-white border border-secondary-300',
    elevated: 'bg-white shadow-lg border border-secondary-100',
    flat: 'bg-secondary-50',
  };

  // Padding styles
  const paddingStyles: Record<CardPadding, string> = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  // Interactive styles
  const interactiveStyles = clsx(
    hover && 'transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-0.5',
    clickable && 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
  );

  const cardStyles = clsx(
    // Base styles
    'rounded-lg',
    'overflow-hidden',
    
    // Variant styles
    variantStyles[variant],
    
    // Padding styles
    paddingStyles[padding],
    
    // Interactive styles
    interactiveStyles,
    
    // Custom className
    className
  );

  const Component = clickable ? 'button' : 'div';

  return (
    <Component
      ref={ref}
      className={cardStyles}
      {...props}
    >
      {children}
    </Component>
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
    'px-4 py-3',
    'border-b border-secondary-200',
    'bg-secondary-50',
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
    'p-4',
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
    'px-4 py-3',
    'border-t border-secondary-200',
    'bg-secondary-50',
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
