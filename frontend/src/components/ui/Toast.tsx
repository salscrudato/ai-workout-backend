import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import Button from './Button';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Toast Notification Component with Micro-Interactions
 * 
 * Features:
 * - Smooth slide-in animations
 * - Auto-dismiss with progress bar
 * - Blue gradient themes
 * - Action buttons
 * - Mobile-optimized
 * - Accessibility support
 */
const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  action,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Trigger entrance animation
    const showTimer = setTimeout(() => setIsVisible(true), 50);

    // Auto-dismiss timer
    const dismissTimer = setTimeout(() => {
      handleClose();
    }, duration);

    // Progress bar animation
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100));
        return Math.max(0, newProgress);
      });
    }, 100);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
      clearInterval(progressTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300); // Wait for exit animation
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    const baseStyles = 'glass border-l-4';
    
    switch (type) {
      case 'success':
        return `${baseStyles} border-l-green-500 text-green-800`;
      case 'error':
        return `${baseStyles} border-l-red-500 text-red-800`;
      case 'warning':
        return `${baseStyles} border-l-yellow-500 text-yellow-800`;
      case 'info':
      default:
        return `${baseStyles} border-l-primary-500 text-primary-800`;
    }
  };

  const getProgressColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
      default:
        return 'gradient-blue';
    }
  };

  return (
    <div
      className={clsx(
        'relative max-w-sm w-full rounded-xl shadow-glow-blue overflow-hidden',
        'transform transition-all duration-300 ease-out',
        getStyles(),
        isVisible
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-full opacity-0 scale-95'
      )}
    >
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-secondary-200">
        <div
          className={clsx(
            'h-full transition-all duration-100 ease-linear',
            getProgressColor()
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start">
          {/* Icon */}
          <div className="flex-shrink-0 mr-3 mt-0.5">
            {getIcon()}
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold mb-1 truncate">
              {title}
            </h4>
            {message && (
              <p className="text-xs opacity-90 leading-relaxed">
                {message}
              </p>
            )}

            {/* Action Button */}
            {action && (
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={action.onClick}
                  className="text-xs"
                >
                  {action.label}
                </Button>
              </div>
            )}
          </div>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="flex-shrink-0 ml-2 w-6 h-6 p-0 hover:bg-secondary-200"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
