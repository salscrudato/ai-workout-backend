import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { clsx } from 'clsx';
import { AlertCircle, Info, CheckCircle2, X } from 'lucide-react';

/**
 * Accessibility Enhancement Components
 * 
 * Features:
 * - WCAG 2.1 AA compliant components
 * - Screen reader optimizations
 * - Keyboard navigation support
 * - Focus management utilities
 * - High contrast mode support
 * - Reduced motion preferences
 */

// Skip Links for keyboard navigation
interface SkipLinksProps {
  links?: Array<{ href: string; label: string }>;
}

export const SkipLinks: React.FC<SkipLinksProps> = ({
  links = [
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#navigation', label: 'Skip to navigation' },
    { href: '#footer', label: 'Skip to footer' },
  ],
}) => {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <div className="fixed top-0 left-0 z-50 p-4 bg-white shadow-lg">
        {links.map((link) => (
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

// Accessible Modal with focus trap
interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the modal
      modalRef.current?.focus();
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore focus to previously focused element
      previousFocusRef.current?.focus();
      
      // Restore body scroll
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div
        ref={modalRef}
        className={clsx(
          'relative glass-ultra rounded-3xl p-6 max-w-md w-full mx-4',
          'focus:outline-none focus:ring-2 focus:ring-primary-500',
          className
        )}
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 
                     focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Title */}
        <h2 id="modal-title" className="text-xl font-semibold text-neutral-800 mb-4 pr-8">
          {title}
        </h2>
        
        {/* Content */}
        {children}
      </motion.div>
    </div>
  );
};

// Accessible Alert Component
interface AccessibleAlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  onDismiss?: () => void;
  className?: string;
}

export const AccessibleAlert: React.FC<AccessibleAlertProps> = ({
  type,
  title,
  message,
  onDismiss,
  className,
}) => {
  const alertRef = useRef<HTMLDivElement>(null);

  // Announce to screen readers
  useEffect(() => {
    if (alertRef.current) {
      alertRef.current.focus();
    }
  }, []);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600" aria-hidden="true" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" aria-hidden="true" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" aria-hidden="true" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" aria-hidden="true" />;
    }
  };

  const getStyles = () => {
    const baseStyles = 'border-l-4 p-4 rounded-r-lg';
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-l-green-400`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-l-yellow-400`;
      case 'error':
        return `${baseStyles} bg-red-50 border-l-red-400`;
      default:
        return `${baseStyles} bg-blue-50 border-l-blue-400`;
    }
  };

  const getAriaRole = () => {
    return type === 'error' || type === 'warning' ? 'alert' : 'status';
  };

  return (
    <div
      ref={alertRef}
      className={clsx(getStyles(), className)}
      role={getAriaRole()}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      tabIndex={-1}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-neutral-800">
            {title}
          </h3>
          
          {message && (
            <p className="mt-1 text-sm text-neutral-600">
              {message}
            </p>
          )}
        </div>
        
        {onDismiss && (
          <button
            className="ml-3 flex-shrink-0 p-1 text-neutral-400 hover:text-neutral-600
                       focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
            onClick={onDismiss}
            aria-label={`Dismiss ${type} alert`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// Focus Management Hook
export const useFocusManagement = () => {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null);

  const saveFocus = () => {
    setFocusedElement(document.activeElement as HTMLElement);
  };

  const restoreFocus = () => {
    if (focusedElement) {
      focusedElement.focus();
      setFocusedElement(null);
    }
  };

  const focusFirst = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  };

  return { saveFocus, restoreFocus, focusFirst };
};

// High Contrast Mode Detection Hook
export const useHighContrastMode = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    
    setIsHighContrast(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return isHighContrast;
};

// Accessible Button with enhanced keyboard support
interface AccessibleButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  className,
  onClick,
  onFocus,
  onBlur,
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      className={clsx(
        'btn touch-target focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        `btn-${variant}`,
        `btn-${size}`,
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
      aria-disabled={disabled || loading}
      onClick={onClick}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {loading ? (
        <>
          <span className="sr-only">Loading...</span>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        </>
      ) : null}
      {children}
    </motion.button>
  );
};

export default {
  SkipLinks,
  AccessibleModal,
  AccessibleAlert,
  AccessibleButton,
  useFocusManagement,
  useHighContrastMode,
};
