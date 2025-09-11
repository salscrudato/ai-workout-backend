import React, { useEffect, useRef, useState, createContext, useContext } from 'react';
import { clsx } from 'clsx';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Unified Accessibility System
 * Consolidates AccessibilityOptimized, AccessibilityEnhanced, AccessibilityEnhancements
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

// Main Accessibility Provider
export interface AccessibilityProviderProps {
  children: React.ReactNode;
  announceChanges?: boolean;
  focusManagement?: boolean;
  highContrast?: boolean;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({
  children,
  announceChanges = true,
  focusManagement = true,
  highContrast = false,
}) => {
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const isReducedMotion = useReducedMotion() || false;
  const announcementRef = useRef<HTMLDivElement>(null);

  const announceMessage = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announceChanges) return;
    
    setAnnouncements(prev => [...prev, message]);
    
    // Clean up old announcements
    setTimeout(() => {
      setAnnouncements(prev => prev.slice(1));
    }, 1000);
  };

  const focusElement = (element: HTMLElement | null) => {
    if (!focusManagement || !element) return;
    
    // Ensure element is focusable
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '-1');
    }
    
    element.focus();
  };

  const contextValue: AccessibilityContextType = {
    announceMessage,
    focusElement,
    isReducedMotion,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      <div className={clsx(highContrast && 'high-contrast')}>
        {children}
        
        {/* Screen reader announcements */}
        <div
          ref={announcementRef}
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {announcements.map((message, index) => (
            <div key={index}>{message}</div>
          ))}
        </div>
      </div>
    </AccessibilityContext.Provider>
  );
};

// Skip Links Component
export interface SkipLinksProps {
  links?: Array<{ href: string; label: string }>;
  className?: string;
}

export const SkipLinks: React.FC<SkipLinksProps> = ({
  links = [
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#navigation', label: 'Skip to navigation' },
  ],
  className,
}) => {
  return (
    <div className={clsx('sr-only focus-within:not-sr-only', className)}>
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="absolute top-0 left-0 z-50 px-4 py-2 bg-primary-600 text-white rounded-br-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
};

// Focus Trap Component
export interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  restoreFocus?: boolean;
  className?: string;
}

export const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  active = true,
  restoreFocus = true,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    previousActiveElement.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    if (!container) return;

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
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [active, restoreFocus]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

// Live Region for dynamic content announcements
export interface LiveRegionProps {
  children: React.ReactNode;
  priority?: 'polite' | 'assertive';
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
      aria-live={priority}
      aria-atomic={atomic}
      className={clsx('sr-only', className)}
    >
      {children}
    </div>
  );
};

// Accessible Button with enhanced keyboard support
export interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText = 'Loading...',
  className,
  disabled,
  ...props
}) => {
  const { isReducedMotion } = useAccessibility();

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 focus:ring-neutral-500',
    ghost: 'text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        isDisabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={isDisabled}
      aria-busy={loading}
      whileHover={!isReducedMotion && !isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isReducedMotion && !isDisabled ? { scale: 0.98 } : undefined}
      {...props}
    >
      {loading ? loadingText : children}
    </motion.button>
  );
};

// High Contrast Toggle
export const HighContrastToggle: React.FC<{ className?: string }> = ({ className }) => {
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('high-contrast', highContrast);
  }, [highContrast]);

  return (
    <AccessibleButton
      variant="ghost"
      size="sm"
      onClick={() => setHighContrast(!highContrast)}
      className={className}
      aria-label={`${highContrast ? 'Disable' : 'Enable'} high contrast mode`}
    >
      {highContrast ? 'Disable' : 'Enable'} High Contrast
    </AccessibleButton>
  );
};

export default AccessibilityProvider;
