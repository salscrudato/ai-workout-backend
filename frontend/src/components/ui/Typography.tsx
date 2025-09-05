import React, { forwardRef, HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export type TypographyVariant = 
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'body1' | 'body2' | 'caption' | 'overline'
  | 'display1' | 'display2';

export type TypographyColor =
  | 'primary' | 'secondary' | 'accent' | 'muted' | 'blue' | 'deep'
  | 'gradient-blue' | 'gradient-accent' | 'gradient-deep' | 'gradient-fresh' | 'gradient-modern';

export type TypographyWeight =
  | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';

export type TypographyGradient =
  | 'blue' | 'premium' | 'electric' | 'accent' | 'deep' | 'fresh' | 'modern' | 'subtle' | 'luxury' | 'flow';

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  color?: TypographyColor;
  weight?: TypographyWeight;
  align?: 'left' | 'center' | 'right' | 'justify';
  component?: keyof React.JSX.IntrinsicElements;
  gradient?: boolean | TypographyGradient;
  animate?: boolean | 'pulse' | 'shimmer' | 'glow' | 'flow' | 'wave' | 'gradient-pulse';
  hover?: boolean;
  children: React.ReactNode;
}

/**
 * Enhanced Typography Component with Advanced Gradient Support
 *
 * Features:
 * - Multiple typography variants with modern scaling
 * - Beautiful gradient text effects with subtle animations
 * - Responsive font sizes with mobile-first approach
 * - Micro-interactions and hover effects
 * - Accessibility support with proper contrast
 * - Fresh, modern aesthetic with light theme optimization
 */
const Typography = forwardRef<HTMLElement, TypographyProps>(({
  variant = 'body1',
  color = 'primary',
  weight = 'normal',
  align = 'left',
  component,
  gradient = false,
  animate = false,
  hover = false,
  className,
  children,
  ...props
}, ref) => {
  // Determine the HTML element to render
  const getComponent = (): keyof React.JSX.IntrinsicElements => {
    if (component) return component;
    
    switch (variant) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return variant;
      case 'display1':
      case 'display2':
        return 'h1';
      case 'body1':
      case 'body2':
      case 'caption':
      case 'overline':
      default:
        return 'p';
    }
  };

  // Variant styles with mobile-first responsive design
  const variantStyles: Record<TypographyVariant, string> = {
    display1: 'text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight',
    display2: 'text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight',
    h1: 'text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight',
    h2: 'text-xl sm:text-2xl lg:text-3xl font-semibold leading-tight',
    h3: 'text-lg sm:text-xl lg:text-2xl font-semibold leading-snug',
    h4: 'text-base sm:text-lg lg:text-xl font-semibold leading-snug',
    h5: 'text-sm sm:text-base lg:text-lg font-medium leading-snug',
    h6: 'text-xs sm:text-sm lg:text-base font-medium leading-snug',
    body1: 'text-sm sm:text-base leading-relaxed',
    body2: 'text-xs sm:text-sm leading-relaxed',
    caption: 'text-xs leading-normal',
    overline: 'text-xs uppercase tracking-wider leading-normal',
  };

  // Enhanced color styles with expanded gradient support
  const colorStyles: Record<TypographyColor, string> = {
    primary: 'text-secondary-900',
    secondary: 'text-secondary-600',
    accent: 'text-primary-600',
    muted: 'text-secondary-500',
    blue: 'text-blue-600',
    deep: 'text-secondary-800',
    'gradient-blue': 'gradient-text-blue',
    'gradient-accent': 'gradient-text-accent',
    'gradient-deep': 'gradient-text-deep',
    'gradient-fresh': 'gradient-text-fresh',
    'gradient-modern': 'gradient-text-modern',
  };

  // Enhanced gradient type mapping with sophisticated variants
  const gradientStyles: Record<string, string> = {
    blue: 'gradient-text-blue',
    premium: 'gradient-text-premium',
    electric: 'gradient-text-electric',
    accent: 'gradient-text-accent',
    deep: 'gradient-text-deep',
    fresh: 'gradient-text-fresh',
    modern: 'gradient-text-modern',
    subtle: 'gradient-text-subtle',
    luxury: 'gradient-text-luxury',
    flow: 'gradient-text-flow',
  };

  // Enhanced animation styles for sophisticated effects
  const animationStyles = {
    pulse: 'animate-pulse',
    shimmer: 'text-shimmer',
    glow: 'text-glow-pulse',
    flow: 'animate-gradient-flow',
    wave: 'animate-gradient-wave',
    'gradient-pulse': 'animate-gradient-pulse',
  };

  // Weight styles
  const weightStyles: Record<TypographyWeight, string> = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
  };

  // Alignment styles
  const alignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  };

  // Determine gradient class
  const getGradientClass = () => {
    if (!gradient) return null;

    if (typeof gradient === 'string') {
      return gradientStyles[gradient] || gradientStyles.blue;
    }

    return gradientStyles.blue;
  };

  // Determine animation class
  const getAnimationClass = () => {
    if (!animate) return null;

    if (typeof animate === 'string') {
      return animationStyles[animate as keyof typeof animationStyles];
    }

    return 'animate-pulse';
  };

  // Build className with enhanced micro-interactions
  const typographyStyles = clsx(
    // Base styles with smooth transitions
    'font-inter antialiased transition-all duration-300 ease-out',

    // Variant styles
    variantStyles[variant],

    // Color styles (gradient takes precedence)
    gradient ? getGradientClass() : colorStyles[color],

    // Weight styles (only if not already specified in variant)
    !variantStyles[variant].includes('font-') && weightStyles[weight],

    // Alignment
    alignStyles[align],

    // Animation classes
    animate && getAnimationClass(),

    // Hover effects for interactive elements
    hover && 'hover:scale-105 hover:brightness-110 cursor-pointer',

    // Gradient background size for smooth animations
    gradient && 'bg-size-200 hover:bg-pos-100',

    // Custom className
    className
  );

  const Component = getComponent() as React.ElementType;

  return (
    <Component
      ref={ref as any}
      className={typographyStyles}
      {...props}
    >
      {children}
    </Component>
  );
});

Typography.displayName = 'Typography';

export default Typography;

// Convenience components for common use cases
export const Heading = forwardRef<HTMLElement, Omit<TypographyProps, 'variant'> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }>(
  ({ level = 1, ...props }, ref) => (
    <Typography ref={ref} variant={`h${level}` as TypographyVariant} {...props} />
  )
);

export const Display = forwardRef<HTMLElement, Omit<TypographyProps, 'variant'> & { level?: 1 | 2 }>(
  ({ level = 1, ...props }, ref) => (
    <Typography ref={ref} variant={`display${level}` as TypographyVariant} {...props} />
  )
);

export const Body = forwardRef<HTMLElement, Omit<TypographyProps, 'variant'> & { size?: 1 | 2 }>(
  ({ size = 1, ...props }, ref) => (
    <Typography ref={ref} variant={`body${size}` as TypographyVariant} {...props} />
  )
);

Heading.displayName = 'Heading';
Display.displayName = 'Display';
Body.displayName = 'Body';
