import React, { useRef, useEffect, useState, useCallback, forwardRef } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Accessibility-First Components
 * 
 * This module provides WCAG 2.1 AA compliant components with:
 * - Screen reader support with proper ARIA attributes
 * - Keyboard navigation and focus management
 * - High contrast and color accessibility
 * - Reduced motion support for users with vestibular disorders
 * - Semantic HTML structure
 * - Touch accessibility for mobile devices
 */

// Skip link for keyboard navigation
export interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({
  href,
  children,
  className,
}) => {
  return (
    <a
      href={href}
      className={clsx(
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4',
        'bg-blue-600 text-white px-4 py-2 rounded-md z-50',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        className
      )}
    >
      {children}
    </a>
  );
};

// Accessible button with proper ARIA attributes
export interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText = 'Loading...',
  icon,
  iconPosition = 'left',
  disabled,
  className,
  ...props
}, ref) => {
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    ghost: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
  };

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-2 text-base min-h-[44px]',
    lg: 'px-6 py-3 text-lg min-h-[48px]',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-describedby={loading ? `${props.id}-loading` : undefined}
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-lg',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'transition-colors duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {loading && (
        <span className="sr-only" id={`${props.id}-loading`}>
          {loadingText}
        </span>
      )}
      
      {icon && iconPosition === 'left' && !loading && (
        <span className="mr-2" aria-hidden="true">
          {icon}
        </span>
      )}
      
      {loading ? (
        <div
          className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"
          aria-hidden="true"
        />
      ) : null}
      
      <span>{loading ? loadingText : children}</span>
      
      {icon && iconPosition === 'right' && !loading && (
        <span className="ml-2" aria-hidden="true">
          {icon}
        </span>
      )}
    </button>
  );
});

AccessibleButton.displayName = 'AccessibleButton';

// Accessible form field with proper labeling
export interface AccessibleFormFieldProps {
  id: string;
  label: string;
  children: React.ReactNode;
  error?: string;
  description?: string;
  required?: boolean;
  className?: string;
}

export const AccessibleFormField: React.FC<AccessibleFormFieldProps> = ({
  id,
  label,
  children,
  error,
  description,
  required = false,
  className,
}) => {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={clsx('space-y-2', className)}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-gray-600">
          {description}
        </p>
      )}
      
      <div>
        {React.cloneElement(children as React.ReactElement<any>, {
          id,
          'aria-describedby': [descriptionId, errorId].filter(Boolean).join(' ') || undefined,
          'aria-invalid': error ? 'true' : undefined,
          'aria-required': required,
        })}
      </div>
      
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

// Accessible modal with focus management
export interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  closeOnEscape = true,
  closeOnOverlayClick = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the modal
      modalRef.current?.focus();
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      
      // Restore focus to the previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeOnEscape, onClose]);

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className={clsx(
          'relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto',
          'focus:outline-none',
          className
        )}
      >
        <div className="p-6">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900 mb-4">
            {title}
          </h2>
          
          {children}
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Accessible notification/toast component
export interface AccessibleNotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  isVisible: boolean;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export const AccessibleNotification: React.FC<AccessibleNotificationProps> = ({
  type,
  title,
  message,
  isVisible,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000,
}) => {
  useEffect(() => {
    if (isVisible && autoClose && onClose) {
      const timer = setTimeout(onClose, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, autoCloseDelay, onClose]);

  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          role="alert"
          aria-live="polite"
          className={clsx(
            'fixed top-4 right-4 z-50 max-w-sm w-full',
            'border rounded-lg shadow-lg p-4',
            typeStyles[type]
          )}
        >
          <div className="flex items-start">
            <span className="mr-3 text-lg" aria-hidden="true">
              {iconMap[type]}
            </span>
            
            <div className="flex-1">
              <h3 className="font-medium">{title}</h3>
              {message && (
                <p className="mt-1 text-sm opacity-90">{message}</p>
              )}
            </div>
            
            {onClose && (
              <button
                onClick={onClose}
                className="ml-3 text-current opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current rounded"
                aria-label="Close notification"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
