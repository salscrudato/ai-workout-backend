import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import FeedbackToast, { FeedbackToastProps } from './FeedbackToast';

interface Toast extends Omit<FeedbackToastProps, 'onDismiss'> {
  id: string;
  createdAt: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id' | 'createdAt'>) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  showSuccess: (title: string, message?: string, options?: Partial<FeedbackToastProps>) => string;
  showError: (title: string, message?: string, options?: Partial<FeedbackToastProps>) => string;
  showWarning: (title: string, message?: string, options?: Partial<FeedbackToastProps>) => string;
  showInfo: (title: string, message?: string, options?: Partial<FeedbackToastProps>) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
  defaultPosition?: FeedbackToastProps['position'];
  defaultDuration?: number;
}

/**
 * Toast Manager Provider
 * 
 * Features:
 * - Global toast state management
 * - Multiple toast positioning
 * - Auto-cleanup of expired toasts
 * - Convenient helper methods for different toast types
 * - Maximum toast limit with queue management
 * - Accessibility support
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts = 5,
  defaultPosition = 'top-right',
  defaultDuration = 4000,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const addToast = useCallback((toastData: Omit<Toast, 'id' | 'createdAt'>) => {
    const id = generateId();
    const newToast: Toast = {
      ...toastData,
      id,
      createdAt: Date.now(),
      position: toastData.position || defaultPosition,
      duration: toastData.duration || defaultDuration,
    };

    setToasts((prevToasts) => {
      const updatedToasts = [...prevToasts, newToast];
      
      // Limit the number of toasts
      if (updatedToasts.length > maxToasts) {
        return updatedToasts.slice(-maxToasts);
      }
      
      return updatedToasts;
    });

    return id;
  }, [generateId, defaultPosition, defaultDuration, maxToasts]);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Helper methods for different toast types
  const showSuccess = useCallback((
    title: string, 
    message?: string, 
    options?: Partial<FeedbackToastProps>
  ) => {
    return addToast({
      type: 'success',
      title,
      message,
      ...options,
    });
  }, [addToast]);

  const showError = useCallback((
    title: string, 
    message?: string, 
    options?: Partial<FeedbackToastProps>
  ) => {
    return addToast({
      type: 'error',
      title,
      message,
      duration: options?.duration || 6000, // Longer duration for errors
      ...options,
    });
  }, [addToast]);

  const showWarning = useCallback((
    title: string, 
    message?: string, 
    options?: Partial<FeedbackToastProps>
  ) => {
    return addToast({
      type: 'warning',
      title,
      message,
      duration: options?.duration || 5000, // Slightly longer for warnings
      ...options,
    });
  }, [addToast]);

  const showInfo = useCallback((
    title: string, 
    message?: string, 
    options?: Partial<FeedbackToastProps>
  ) => {
    return addToast({
      type: 'info',
      title,
      message,
      ...options,
    });
  }, [addToast]);

  const contextValue: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  // Group toasts by position for proper rendering
  const toastsByPosition = toasts.reduce((acc, toast) => {
    const position = toast.position || defaultPosition;
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(toast);
    return acc;
  }, {} as Record<string, Toast[]>);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Render toasts grouped by position */}
      {Object.entries(toastsByPosition).map(([position, positionToasts]) => (
        <div key={position} className="fixed z-50">
          <AnimatePresence>
            {positionToasts.map((toast, index) => (
              <div
                key={toast.id}
                style={{
                  zIndex: 1000 + index,
                }}
              >
                <FeedbackToast
                  {...toast}
                  onDismiss={() => removeToast(toast.id)}
                />
              </div>
            ))}
          </AnimatePresence>
        </div>
      ))}
    </ToastContext.Provider>
  );
};

// Hook for form-specific feedback
export const useFormFeedback = () => {
  const { showSuccess, showError, showWarning } = useToast();

  const showFormSuccess = useCallback((message: string = 'Form submitted successfully!') => {
    return showSuccess('Success', message, {
      duration: 3000,
      glow: true,
    });
  }, [showSuccess]);

  const showFormError = useCallback((message: string = 'Please check your input and try again.') => {
    return showError('Validation Error', message, {
      duration: 5000,
      glow: true,
    });
  }, [showError]);

  const showFormWarning = useCallback((message: string) => {
    return showWarning('Warning', message, {
      duration: 4000,
    });
  }, [showWarning]);

  return {
    showFormSuccess,
    showFormError,
    showFormWarning,
  };
};

// Hook for workout-specific feedback
export const useWorkoutFeedback = () => {
  const { showSuccess, showError, showInfo } = useToast();

  const showWorkoutGenerated = useCallback(() => {
    return showSuccess('Workout Generated!', 'Your personalized workout is ready.', {
      duration: 4000,
      glow: true,
    });
  }, [showSuccess]);

  const showWorkoutSaved = useCallback(() => {
    return showSuccess('Workout Saved!', 'Added to your workout history.', {
      duration: 3000,
    });
  }, [showSuccess]);

  const showWorkoutError = useCallback((message: string = 'Failed to generate workout. Please try again.') => {
    return showError('Generation Failed', message, {
      duration: 6000,
    });
  }, [showError]);

  const showWorkoutTip = useCallback((tip: string) => {
    return showInfo('Workout Tip', tip, {
      duration: 5000,
      position: 'bottom-center',
    });
  }, [showInfo]);

  return {
    showWorkoutGenerated,
    showWorkoutSaved,
    showWorkoutError,
    showWorkoutTip,
  };
};

export default ToastProvider;
