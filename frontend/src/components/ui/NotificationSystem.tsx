import React, { useEffect, memo } from 'react';
import { clsx } from 'clsx';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useNotifications, useAppActions, type Notification } from '../../contexts/AppStateContext';

/**
 * Notification System Component
 * 
 * Features:
 * - Multiple notification types (success, error, warning, info)
 * - Auto-dismiss with configurable duration
 * - Manual dismiss capability
 * - Smooth animations
 * - Accessible design
 * - Stack management
 */

interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

const NotificationItem = memo<NotificationItemProps>(({ notification, onDismiss }) => {
  const { type, title, message, duration = 5000, id } = notification;

  // Auto-dismiss after duration
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  // Icon mapping
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  // Style mapping
  const styles = {
    success: {
      container: 'bg-green-50 border-green-200',
      icon: 'text-green-400',
      title: 'text-green-800',
      message: 'text-green-700',
      button: 'text-green-500 hover:text-green-600',
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-400',
      title: 'text-red-800',
      message: 'text-red-700',
      button: 'text-red-500 hover:text-red-600',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-400',
      title: 'text-yellow-800',
      message: 'text-yellow-700',
      button: 'text-yellow-500 hover:text-yellow-600',
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-400',
      title: 'text-blue-800',
      message: 'text-blue-700',
      button: 'text-blue-500 hover:text-blue-600',
    },
  };

  const Icon = icons[type];
  const style = styles[type];

  return (
    <div
      className={clsx(
        'max-w-sm w-full shadow-lg rounded-lg pointer-events-auto border',
        'transform transition-all duration-300 ease-in-out',
        'animate-in slide-in-from-right-full',
        style.container
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={clsx('h-5 w-5', style.icon)} />
          </div>
          
          <div className="ml-3 w-0 flex-1">
            <p className={clsx('text-sm font-medium', style.title)}>
              {title}
            </p>
            {message && (
              <p className={clsx('mt-1 text-sm', style.message)}>
                {message}
              </p>
            )}
          </div>
          
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={clsx(
                'inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2',
                style.button
              )}
              onClick={() => onDismiss(id)}
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

NotificationItem.displayName = 'NotificationItem';

/**
 * Main Notification System Component
 */
const NotificationSystem: React.FC = () => {
  const notifications = useNotifications();
  const { removeNotification } = useAppActions();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div
      className={clsx(
        'fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none',
        'sm:items-start sm:justify-end sm:p-6',
        'z-50'
      )}
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={removeNotification}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(NotificationSystem);

/**
 * Hook for easy notification usage
 */
export const useNotify = () => {
  const { addNotification } = useAppActions();

  return {
    success: (title: string, message?: string, duration?: number) =>
      addNotification({ type: 'success', title, message, duration }),
    
    error: (title: string, message?: string, duration?: number) =>
      addNotification({ type: 'error', title, message, duration }),
    
    warning: (title: string, message?: string, duration?: number) =>
      addNotification({ type: 'warning', title, message, duration }),
    
    info: (title: string, message?: string, duration?: number) =>
      addNotification({ type: 'info', title, message, duration }),
  };
};
