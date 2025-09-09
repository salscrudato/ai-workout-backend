import React, { useEffect, useState, useRef } from 'react';
import { clsx } from 'clsx';
import { motion, useReducedMotion } from 'framer-motion';

export interface AccessibilityOptimizedProps {
  children: React.ReactNode;
  className?: string;
  announceChanges?: boolean;
  focusManagement?: boolean;
  highContrast?: boolean;
  reducedMotion?: boolean;
}

export interface ScreenReaderAnnouncementProps {
  message: string;
  priority?: 'polite' | 'assertive';
  delay?: number;
}

export interface FocusManagementProps {
  children: React.ReactNode;
  trapFocus?: boolean;
  restoreFocus?: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
}

export interface HighContrastModeProps {
  children: React.ReactNode;
  enabled?: boolean;
  className?: string;
}

/**
 * Accessibility Optimized Components
 * 
 * Provides comprehensive accessibility enhancements:
 * - Screen reader announcements
 * - Focus management and keyboard navigation
 * - High contrast mode support
 * - Reduced motion preferences
 * - ARIA attributes and semantic HTML
 * - Touch accessibility for mobile
 */

// Screen reader announcement component
export const ScreenReaderAnnouncement: React.FC<ScreenReaderAnnouncementProps> = ({
  message,
  priority = 'polite',
  delay = 0,
}) => {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnnouncement(message);
      // Clear after announcement to avoid repetition
      setTimeout(() => setAnnouncement(''), 1000);
    }, delay);

    return () => clearTimeout(timer);
  }, [message, delay]);

  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
      role="status"
    >
      {announcement}
    </div>
  );
};

// Focus management component
export const FocusManagement: React.FC<FocusManagementProps> = ({
  children,
  trapFocus = false,
  restoreFocus = false,
  initialFocus,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }

    if (initialFocus?.current) {
      initialFocus.current.focus();
    }

    return () => {
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [restoreFocus, initialFocus]);

  useEffect(() => {
    if (!trapFocus || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [trapFocus]);

  return (
    <div ref={containerRef} className="focus-management-container">
      {children}
    </div>
  );
};

// High contrast mode component
export const HighContrastMode: React.FC<HighContrastModeProps> = ({
  children,
  enabled = false,
  className,
}) => {
  const [isHighContrast, setIsHighContrast] = useState(enabled);

  useEffect(() => {
    // Check for system preference
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(enabled || mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      if (!enabled) {
        setIsHighContrast(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [enabled]);

  const highContrastStyles = clsx(
    isHighContrast && [
      'high-contrast',
      // Enhanced contrast colors
      '[&_*]:!text-black [&_*]:!bg-white',
      '[&_button]:!bg-black [&_button]:!text-white [&_button]:!border-2 [&_button]:!border-black',
      '[&_input]:!bg-white [&_input]:!text-black [&_input]:!border-2 [&_input]:!border-black',
      '[&_a]:!text-blue-800 [&_a]:!underline',
      // Remove subtle effects that may reduce contrast
      '[&_*]:!shadow-none [&_*]:!backdrop-blur-none',
    ],
    className
  );

  return (
    <div className={highContrastStyles}>
      {children}
    </div>
  );
};

// Skip links component for keyboard navigation
export const SkipLinks: React.FC = () => {
  return (
    <div className="skip-links">
      <a
        href="#main-content"
        className={clsx(
          'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4',
          'bg-primary-600 text-white px-4 py-2 rounded-lg z-50',
          'focus:outline-none focus:ring-4 focus:ring-primary-300'
        )}
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className={clsx(
          'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-32',
          'bg-primary-600 text-white px-4 py-2 rounded-lg z-50',
          'focus:outline-none focus:ring-4 focus:ring-primary-300'
        )}
      >
        Skip to navigation
      </a>
    </div>
  );
};

// Accessible button component with enhanced touch targets
export const AccessibleButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}> = ({
  children,
  onClick,
  disabled = false,
  ariaLabel,
  ariaDescribedBy,
  className,
  variant = 'primary',
  size = 'md',
}) => {
  const shouldReduceMotion = useReducedMotion();

  const buttonStyles = clsx(
    // Base styles with enhanced touch targets
    'inline-flex items-center justify-center font-semibold rounded-xl',
    'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-300',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'touch-manipulation select-none',
    // Minimum touch target size (44px)
    'min-h-[44px] min-w-[44px]',
    // Variant styles
    {
      'bg-primary-600 text-white hover:bg-primary-700': variant === 'primary',
      'bg-white text-primary-600 border-2 border-primary-600 hover:bg-primary-50': variant === 'secondary',
      'bg-transparent text-primary-600 hover:bg-primary-50': variant === 'ghost',
    },
    // Size styles
    {
      'px-3 py-2 text-sm': size === 'sm',
      'px-4 py-3 text-base': size === 'md',
      'px-6 py-4 text-lg': size === 'lg',
    },
    // Animation styles (respect reduced motion)
    !shouldReduceMotion && 'transition-all duration-200 ease-out',
    !shouldReduceMotion && 'hover:scale-[1.02] active:scale-[0.98]',
    className
  );

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={buttonStyles}
      whileHover={!shouldReduceMotion ? { scale: 1.02 } : undefined}
      whileTap={!shouldReduceMotion ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.1 }}
    >
      {children}
    </motion.button>
  );
};

// Main accessibility optimized wrapper
const AccessibilityOptimized: React.FC<AccessibilityOptimizedProps> = ({
  children,
  className,
  announceChanges = false,
  focusManagement = false,
  highContrast = false,
  reducedMotion = false,
}) => {
  const [announcement, setAnnouncement] = useState('');
  const shouldReduceMotion = useReducedMotion() || reducedMotion;

  // Announce page changes for screen readers
  useEffect(() => {
    if (announceChanges) {
      setAnnouncement('Page content updated');
    }
  }, [announceChanges]);

  const wrapperStyles = clsx(
    'accessibility-optimized',
    shouldReduceMotion && 'motion-reduce:transition-none motion-reduce:animate-none',
    className
  );

  const content = (
    <div className={wrapperStyles}>
      <SkipLinks />
      {announcement && (
        <ScreenReaderAnnouncement message={announcement} />
      )}
      {children}
    </div>
  );

  if (focusManagement) {
    return (
      <FocusManagement trapFocus restoreFocus>
        {highContrast ? (
          <HighContrastMode enabled={highContrast}>
            {content}
          </HighContrastMode>
        ) : (
          content
        )}
      </FocusManagement>
    );
  }

  return highContrast ? (
    <HighContrastMode enabled={highContrast}>
      {content}
    </HighContrastMode>
  ) : (
    content
  );
};

AccessibilityOptimized.displayName = 'AccessibilityOptimized';

export default AccessibilityOptimized;
