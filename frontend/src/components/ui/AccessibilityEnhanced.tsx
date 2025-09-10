import React, { useEffect, useRef, useState, createContext, useContext } from 'react';
import { clsx } from 'clsx';

/**
 * Enhanced Accessibility System
 * 
 * Provides comprehensive accessibility features including keyboard navigation,
 * screen reader support, focus management, and WCAG compliance utilities.
 */

// Accessibility Context
interface AccessibilityContextType {
  announceMessage: (message: string, priority?: 'polite' | 'assertive') => void;
  focusElement: (element: HTMLElement | null) => void;
  isReducedMotion: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

// Accessibility Provider
export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const announcerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const announceMessage = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcerRef.current) {
      announcerRef.current.textContent = message;
      announcerRef.current.setAttribute('aria-live', priority);
      
      // Clear after announcement
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = '';
        }
      }, 1000);
    }
  };

  const focusElement = (element: HTMLElement | null) => {
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{ announceMessage, focusElement, isReducedMotion }}
    >
      {children}
      {/* Screen reader announcer */}
      <div
        ref={announcerRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />
    </AccessibilityContext.Provider>
  );
};

// Skip Links Component
export const SkipLinks: React.FC = () => {
  const skipLinks = [
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#navigation', label: 'Skip to navigation' },
    { href: '#footer', label: 'Skip to footer' },
  ];

  return (
    <div className="sr-only focus-within:not-sr-only">
      <div className="fixed top-0 left-0 z-50 p-4 bg-white shadow-lg">
        {skipLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="block p-2 text-primary-600 underline hover:text-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
};

// Focus Trap Component
export interface FocusTrapProps {
  children: React.ReactNode;
  active: boolean;
  className?: string;
}

export const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  active,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const lastFocusableRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    firstFocusableRef.current = focusableElements[0] as HTMLElement;
    lastFocusableRef.current = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusableRef.current) {
          e.preventDefault();
          lastFocusableRef.current?.focus();
        }
      } else {
        if (document.activeElement === lastFocusableRef.current) {
          e.preventDefault();
          firstFocusableRef.current?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstFocusableRef.current?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [active]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

// Keyboard Navigation Hook
export const useKeyboardNavigation = (
  items: HTMLElement[],
  options: {
    loop?: boolean;
    orientation?: 'horizontal' | 'vertical';
    onSelect?: (index: number) => void;
  } = {}
) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { loop = true, orientation = 'vertical', onSelect } = options;

  const handleKeyDown = (e: KeyboardEvent) => {
    const isVertical = orientation === 'vertical';
    const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
    const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';

    switch (e.key) {
      case nextKey:
        e.preventDefault();
        setCurrentIndex((prev) => {
          const next = prev + 1;
          return next >= items.length ? (loop ? 0 : prev) : next;
        });
        break;
      case prevKey:
        e.preventDefault();
        setCurrentIndex((prev) => {
          const next = prev - 1;
          return next < 0 ? (loop ? items.length - 1 : prev) : next;
        });
        break;
      case 'Home':
        e.preventDefault();
        setCurrentIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setCurrentIndex(items.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect?.(currentIndex);
        break;
    }
  };

  useEffect(() => {
    items[currentIndex]?.focus();
  }, [currentIndex, items]);

  return { currentIndex, handleKeyDown };
};

// ARIA Live Region Component
export interface LiveRegionProps {
  children: React.ReactNode;
  priority?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  className?: string;
}

export const LiveRegion: React.FC<LiveRegionProps> = ({
  children,
  priority = 'polite',
  atomic = true,
  className,
}) => {
  return (
    <div
      className={clsx('sr-only', className)}
      aria-live={priority}
      aria-atomic={atomic}
    >
      {children}
    </div>
  );
};

// Accessible Button Component
export interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText = 'Loading...',
  children,
  disabled,
  className,
  ...props
}) => {
  const variantClasses = {
    primary: 'gradient-aurora text-white hover:shadow-glow-blue',
    secondary: 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300',
    ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-xl font-semibold',
        'transition-all duration-300 transform touch-target',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
        'motion-reduce:transition-none motion-reduce:transform-none',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-describedby={loading ? 'loading-description' : undefined}
      {...props}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
          <span>{loadingText}</span>
          <span id="loading-description" className="sr-only">
            Please wait while the action is being processed
          </span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

// High Contrast Mode Toggle
export const HighContrastToggle: React.FC = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleHighContrast = () => {
    const newValue = !isHighContrast;
    setIsHighContrast(newValue);
    document.documentElement.classList.toggle('high-contrast', newValue);
  };

  return (
    <button
      onClick={toggleHighContrast}
      className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
      aria-label={`${isHighContrast ? 'Disable' : 'Enable'} high contrast mode`}
      aria-pressed={isHighContrast}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    </button>
  );
};
