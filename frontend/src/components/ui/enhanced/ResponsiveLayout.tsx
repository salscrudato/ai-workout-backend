import React, { useState, useEffect, forwardRef } from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

/**
 * Enhanced Responsive Layout Components
 * 
 * This module provides responsive layout components that adapt seamlessly
 * across all screen sizes with mobile-first design principles:
 * - Fluid typography and spacing
 * - Responsive grid systems
 * - Adaptive navigation patterns
 * - Touch-optimized interactions
 */

// Responsive container with fluid sizing
export interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  center?: boolean;
  fluid?: boolean;
}

export const ResponsiveContainer = forwardRef<HTMLDivElement, ResponsiveContainerProps>(({
  children,
  maxWidth = 'lg',
  padding = 'md',
  center = true,
  fluid = false,
  className,
  ...props
}, ref) => {
  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  const paddingStyles = {
    none: 'px-0',
    sm: 'px-4 sm:px-6',
    md: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-6 sm:px-8 lg:px-12',
    xl: 'px-8 sm:px-12 lg:px-16',
  };

  const containerStyles = clsx(
    'w-full',
    !fluid && maxWidthStyles[maxWidth],
    paddingStyles[padding],
    center && 'mx-auto',
    className
  );

  return (
    <div ref={ref} className={containerStyles} {...props}>
      {children}
    </div>
  );
});

ResponsiveContainer.displayName = 'ResponsiveContainer';

// Enhanced responsive grid with breakpoint-specific columns
export interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  cols?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  autoFit?: boolean; // Auto-fit columns based on min width
  minItemWidth?: string; // e.g., '250px'
}

export const ResponsiveGrid = forwardRef<HTMLDivElement, ResponsiveGridProps>(({
  children,
  cols = { default: 1 },
  gap = 'md',
  autoFit = false,
  minItemWidth = '250px',
  className,
  ...props
}, ref) => {
  const gapStyles = {
    none: 'gap-0',
    sm: 'gap-3 sm:gap-4',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
    xl: 'gap-8 sm:gap-10',
  };

  const getGridCols = () => {
    if (autoFit) {
      return `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`;
    }

    const { default: defaultCols, sm, md, lg, xl } = cols;
    let classes = `grid-cols-${defaultCols}`;
    
    if (sm) classes += ` sm:grid-cols-${sm}`;
    if (md) classes += ` md:grid-cols-${md}`;
    if (lg) classes += ` lg:grid-cols-${lg}`;
    if (xl) classes += ` xl:grid-cols-${xl}`;
    
    return classes;
  };

  const gridStyles = clsx(
    'grid',
    !autoFit && getGridCols(),
    gapStyles[gap],
    className
  );

  const gridStyle = autoFit ? {
    gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`,
  } : undefined;

  return (
    <div 
      ref={ref} 
      className={gridStyles} 
      style={gridStyle}
      {...props}
    >
      {children}
    </div>
  );
});

ResponsiveGrid.displayName = 'ResponsiveGrid';

// Responsive stack layout with adaptive spacing
export interface ResponsiveStackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  direction?: 'column' | 'row' | 'responsive'; // responsive = column on mobile, row on desktop
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl'; // When to switch from column to row
}

export const ResponsiveStack = forwardRef<HTMLDivElement, ResponsiveStackProps>(({
  children,
  direction = 'column',
  spacing = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  breakpoint = 'md',
  className,
  ...props
}, ref) => {
  const spacingStyles = {
    none: 'gap-0',
    sm: 'gap-2 sm:gap-3',
    md: 'gap-3 sm:gap-4',
    lg: 'gap-4 sm:gap-6',
    xl: 'gap-6 sm:gap-8',
  };

  const alignStyles = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const justifyStyles = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  const getDirectionClasses = () => {
    if (direction === 'responsive') {
      return `flex-col ${breakpoint}:flex-row`;
    }
    return direction === 'row' ? 'flex-row' : 'flex-col';
  };

  const stackStyles = clsx(
    'flex',
    getDirectionClasses(),
    spacingStyles[spacing],
    alignStyles[align],
    justifyStyles[justify],
    wrap && 'flex-wrap',
    className
  );

  return (
    <div ref={ref} className={stackStyles} {...props}>
      {children}
    </div>
  );
});

ResponsiveStack.displayName = 'ResponsiveStack';

// Mobile-first navigation component
export interface MobileNavigationProps {
  children: React.ReactNode;
  variant?: 'bottom' | 'sidebar' | 'top';
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  children,
  variant = 'bottom',
  isOpen = false,
  onToggle,
  className,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (variant === 'bottom' && isMobile) {
    return (
      <div className={clsx(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-white border-t border-gray-200',
        'safe-area-inset-bottom',
        className
      )}>
        <div className="flex items-center justify-around py-2">
          {children}
        </div>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <>
        {/* Backdrop */}
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onToggle}
          />
        )}

        {/* Sidebar */}
        <motion.div
          initial={isMobile ? { x: '-100%' } : { x: 0 }}
          animate={isMobile ? { x: isOpen ? 0 : '-100%' } : { x: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={clsx(
            'fixed left-0 top-0 h-full z-50',
            'bg-white shadow-xl',
            'w-80 max-w-[80vw]',
            !isMobile && 'relative w-auto max-w-none shadow-none',
            className
          )}
        >
          {children}
        </motion.div>
      </>
    );
  }

  // Top navigation (default)
  return (
    <div className={clsx(
      'sticky top-0 z-40',
      'bg-white/95 backdrop-blur-sm border-b border-gray-200',
      className
    )}>
      {children}
    </div>
  );
};

// Responsive text component with fluid typography
export interface ResponsiveTextProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  color?: 'primary' | 'secondary' | 'accent' | 'muted' | 'success' | 'warning' | 'error';
  responsive?: boolean; // Enable responsive scaling
}

export const ResponsiveText = forwardRef<any, ResponsiveTextProps>(({
  children,
  as: Component = 'p',
  size = 'base',
  weight = 'normal',
  color = 'primary',
  responsive = true,
  className,
  ...props
}, ref) => {
  const sizeStyles = responsive ? {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
    '2xl': 'text-2xl sm:text-3xl',
    '3xl': 'text-3xl sm:text-4xl',
    '4xl': 'text-4xl sm:text-5xl',
    '5xl': 'text-5xl sm:text-6xl',
  } : {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
  };

  const weightStyles = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
  };

  const colorStyles = {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    accent: 'text-blue-600',
    muted: 'text-gray-500',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
  };

  const textStyles = clsx(
    sizeStyles[size],
    weightStyles[weight],
    colorStyles[color],
    className
  );

  return (
    <Component ref={ref} className={textStyles} {...props}>
      {children}
    </Component>
  );
});

ResponsiveText.displayName = 'ResponsiveText';
