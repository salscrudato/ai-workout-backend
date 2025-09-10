import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

/**
 * Premium UI Polish Components
 * 
 * Provides sophisticated finishing touches including enhanced error handling,
 * premium loading states, and polished micro-interactions for a world-class user experience.
 */

// Enhanced Toast Notification System
export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50 border-green-200',
      iconColor: 'text-green-500',
      titleColor: 'text-green-800',
      messageColor: 'text-green-700',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50 border-red-200',
      iconColor: 'text-red-500',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700',
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-50 border-yellow-200',
      iconColor: 'text-yellow-500',
      titleColor: 'text-yellow-800',
      messageColor: 'text-yellow-700',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-500',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-700',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={clsx(
            'relative p-4 rounded-xl border shadow-lg backdrop-blur-sm',
            config.bgColor
          )}
        >
          <div className="flex items-start gap-3">
            <Icon className={clsx('w-5 h-5 mt-0.5 flex-shrink-0', config.iconColor)} />
            <div className="flex-1 min-w-0">
              <h4 className={clsx('font-semibold text-sm', config.titleColor)}>
                {title}
              </h4>
              {message && (
                <p className={clsx('text-sm mt-1', config.messageColor)}>
                  {message}
                </p>
              )}
            </div>
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => onClose(id), 300);
              }}
              className={clsx(
                'p-1 rounded-lg hover:bg-black/5 transition-colors',
                config.iconColor
              )}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Toast Container
export const ToastContainer: React.FC<{ toasts: ToastProps[] }> = ({ toasts }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
};

// Enhanced Error Boundary
export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-pink-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-premium rounded-2xl p-8 max-w-md w-full text-center"
      >
        <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        
        <h2 className="text-xl font-bold text-red-800 mb-3">
          Oops! Something went wrong
        </h2>
        
        <p className="text-red-700 mb-6 text-sm leading-relaxed">
          We encountered an unexpected error. Don't worry, this has been reported to our team.
        </p>
        
        <details className="mb-6 text-left">
          <summary className="cursor-pointer text-sm text-red-600 hover:text-red-800">
            Technical Details
          </summary>
          <pre className="mt-2 p-3 bg-red-100 rounded-lg text-xs text-red-800 overflow-auto">
            {error.message}
          </pre>
        </details>
        
        <div className="flex gap-3">
          <button
            onClick={resetError}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 px-4 py-2 bg-neutral-200 text-neutral-800 rounded-lg hover:bg-neutral-300 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Premium Loading Overlay
export interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  progress?: number;
  onCancel?: () => void;
}

export const PremiumLoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Loading...',
  progress,
  onCancel,
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-premium rounded-2xl p-8 max-w-sm w-full mx-4 text-center"
      >
        {/* Animated loading icon */}
        <div className="relative w-16 h-16 mx-auto mb-6">
          <motion.div
            className="absolute inset-0 border-4 border-primary-200 rounded-full"
          />
          <motion.div
            className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        
        <h3 className="text-lg font-semibold text-neutral-800 mb-2">
          {message}
        </h3>
        
        {progress !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-neutral-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <motion.div
                className="gradient-blue h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}
        
        <p className="text-sm text-neutral-600 mb-6">
          Please wait while we process your request...
        </p>
        
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-800 transition-colors"
          >
            Cancel
          </button>
        )}
      </motion.div>
    </motion.div>
  );
};

// Success Celebration Animation
export const SuccessCelebration: React.FC<{
  isVisible: boolean;
  title: string;
  message?: string;
  onComplete?: () => void;
}> = ({ isVisible, title, message, onComplete }) => {
  useEffect(() => {
    if (isVisible && onComplete) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        className="glass-premium rounded-2xl p-8 max-w-sm w-full mx-4 text-center"
      >
        {/* Success animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
          >
            <CheckCircle className="w-10 h-10 text-green-500" />
          </motion.div>
        </motion.div>
        
        {/* Confetti effect */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              initial={{
                x: '50%',
                y: '50%',
                scale: 0,
              }}
              animate={{
                x: `${50 + (Math.random() - 0.5) * 200}%`,
                y: `${50 + (Math.random() - 0.5) * 200}%`,
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: 0.5 + Math.random() * 0.5,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-xl font-bold text-green-800 mb-3"
        >
          {title}
        </motion.h2>
        
        {message && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-green-700 text-sm"
          >
            {message}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
};
