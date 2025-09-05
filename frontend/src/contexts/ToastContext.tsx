import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { clsx } from 'clsx';
import Toast, { ToastType, ToastProps } from '../components/ui/Toast';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastContextType {
  showToast: (toast: Omit<ToastData, 'id'>) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/**
 * Toast Provider with Micro-Interactions
 * 
 * Features:
 * - Multiple toast management
 * - Stacked animations
 * - Auto-dismiss functionality
 * - Position customization
 * - Mobile-optimized layout
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts = 5,
  position = 'top-right',
}) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const showToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = generateId();
    const newToast: ToastData = { ...toast, id };

    setToasts(prev => {
      const updated = [newToast, ...prev];
      // Limit number of toasts
      return updated.slice(0, maxToasts);
    });
  }, [maxToasts]);

  const showSuccess = useCallback((title: string, message?: string) => {
    showToast({ type: 'success', title, message });
  }, [showToast]);

  const showError = useCallback((title: string, message?: string) => {
    showToast({ type: 'error', title, message });
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string) => {
    showToast({ type: 'warning', title, message });
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string) => {
    showToast({ type: 'info', title, message });
  }, [showToast]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const getPositionStyles = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
      default:
        return 'top-4 right-4';
    }
  };

  const contextValue: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearAll,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Toast Container */}
      <div
        className={clsx(
          'fixed z-50 pointer-events-none',
          'flex flex-col gap-3',
          'max-w-sm w-full',
          'px-4 sm:px-0',
          getPositionStyles()
        )}
      >
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className="pointer-events-auto"
            style={{
              transform: `translateY(${index * 4}px) scale(${1 - index * 0.02})`,
              zIndex: toasts.length - index,
            }}
          >
            <Toast
              {...toast}
              onClose={removeToast}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

/**
 * Hook to use Toast Context
 */
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
