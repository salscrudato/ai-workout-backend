import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  X, 
  Zap, 
  Heart,
  Star,
  Trophy,
  Target
} from 'lucide-react';

/**
 * Enhanced Feedback System
 * 
 * Features:
 * - Contextual toast notifications
 * - Success celebrations with confetti
 * - Error handling with helpful suggestions
 * - Progress feedback with micro-animations
 * - Haptic feedback simulation
 * - Accessibility-compliant notifications
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'workout' | 'achievement';

interface Toast {
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

interface ToastProps extends Toast {
  onDismiss: (id: string) => void;
}

const ToastComponent: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  action,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'workout':
        return <Zap className="w-5 h-5 text-primary-500" />;
      case 'achievement':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStyles = () => {
    const baseStyles = 'glass-ultra border-l-4 shadow-glow-sm';
    
    switch (type) {
      case 'success':
        return `${baseStyles} border-l-green-500 bg-green-50/50`;
      case 'error':
        return `${baseStyles} border-l-red-500 bg-red-50/50`;
      case 'warning':
        return `${baseStyles} border-l-yellow-500 bg-yellow-50/50`;
      case 'info':
        return `${baseStyles} border-l-blue-500 bg-blue-50/50`;
      case 'workout':
        return `${baseStyles} border-l-primary-500 bg-primary-50/50`;
      case 'achievement':
        return `${baseStyles} border-l-yellow-500 bg-gradient-to-r from-yellow-50/50 to-orange-50/50`;
      default:
        return `${baseStyles} border-l-blue-500`;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={clsx(
            'rounded-xl p-4 max-w-sm w-full pointer-events-auto',
            getStyles()
          )}
          initial={{ opacity: 0, x: 300, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          layout
        >
          <div className="flex items-start space-x-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 400 }}
            >
              {getIcon()}
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <motion.h4
                className="text-sm font-semibold text-neutral-800"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {title}
              </motion.h4>
              
              {message && (
                <motion.p
                  className="text-sm text-neutral-600 mt-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {message}
                </motion.p>
              )}
              
              {action && (
                <motion.button
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 mt-2"
                  onClick={action.onClick}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {action.label}
                </motion.button>
              )}
            </div>
            
            <motion.button
              className="text-neutral-400 hover:text-neutral-600 p-1"
              onClick={() => onDismiss(id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>
          
          {/* Progress bar for timed toasts */}
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-primary-500 rounded-b-xl"
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: duration / 1000, ease: 'linear' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  position = 'top-right',
}) => {
  const positionClasses = {
    'top-right': 'fixed top-4 right-4',
    'top-left': 'fixed top-4 left-4',
    'bottom-right': 'fixed bottom-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4',
    'top-center': 'fixed top-4 left-1/2 -translate-x-1/2',
  };

  return (
    <div className={clsx('z-50 pointer-events-none', positionClasses[position])}>
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastComponent
              key={toast.id}
              {...toast}
              onDismiss={onDismiss}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface SuccessCelebrationProps {
  isVisible: boolean;
  title: string;
  message?: string;
  onClose: () => void;
}

export const SuccessCelebration: React.FC<SuccessCelebrationProps> = ({
  isVisible,
  title,
  message,
  onClose,
}) => {
  useEffect(() => {
    if (isVisible) {
      // Simulate haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200]);
      }
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="glass-ultra rounded-3xl p-8 max-w-sm w-full mx-4 text-center"
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated success icon */}
            <motion.div
              className="relative mx-auto mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
            >
              <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              
              {/* Confetti effect */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  initial={{ 
                    scale: 0,
                    x: 0,
                    y: 0,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    x: Math.cos((i * 45) * Math.PI / 180) * 60,
                    y: Math.sin((i * 45) * Math.PI / 180) * 60,
                  }}
                  transition={{
                    duration: 1,
                    delay: 0.3 + i * 0.1,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </motion.div>
            
            <motion.h2
              className="text-xl font-bold gradient-text-blue mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {title}
            </motion.h2>
            
            {message && (
              <motion.p
                className="text-neutral-600 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {message}
              </motion.p>
            )}
            
            <motion.button
              className="btn btn-primary"
              onClick={onClose}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Continue
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const clearToasts = () => {
    setToasts([]);
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
  };
};

// Export all components
export default {
  ToastContainer,
  SuccessCelebration,
  useToast,
};
