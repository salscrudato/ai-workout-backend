import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

/**
 * Enhanced Feedback System
 * 
 * Provides comprehensive user feedback with:
 * - Premium visual design
 * - Smooth animations
 * - Multiple feedback types
 * - Auto-dismiss functionality
 * - Progress indicators
 * - Action buttons
 */

export type FeedbackType = 'success' | 'error' | 'warning' | 'info' | 'loading';
export type FeedbackPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface FeedbackItem {
  id: string;
  type: FeedbackType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  progress?: number;
}

interface EnhancedFeedbackProps {
  items: FeedbackItem[];
  position?: FeedbackPosition;
  maxItems?: number;
  onDismiss: (id: string) => void;
}

const feedbackIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
  loading: Info
};

const feedbackStyles = {
  success: 'glass-premium border-l-4 border-l-success-500 text-success-800',
  error: 'glass-premium border-l-4 border-l-error-500 text-error-800',
  warning: 'glass-premium border-l-4 border-l-warning-500 text-warning-800',
  info: 'glass-tinted border-l-4 border-l-primary-500 text-primary-800',
  loading: 'glass-tinted border-l-4 border-l-primary-500 text-primary-800'
};

const positionStyles = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
};

const FeedbackItem = memo<{
  item: FeedbackItem;
  onDismiss: (id: string) => void;
}>(({ item, onDismiss }) => {
  const [progress, setProgress] = useState(100);
  const Icon = feedbackIcons[item.type];

  useEffect(() => {
    if (item.persistent || !item.duration) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (item.duration! / 100));
        if (newProgress <= 0) {
          onDismiss(item.id);
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [item.duration, item.persistent, item.id, onDismiss]);

  const handleDismiss = useCallback(() => {
    onDismiss(item.id);
  }, [item.id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      className={clsx(
        'relative overflow-hidden rounded-xl premium-shadow-lg p-4 mb-3 max-w-sm',
        'backdrop-blur-xl border border-white/20',
        feedbackStyles[item.type]
      )}
    >
      {/* Progress bar */}
      {!item.persistent && item.duration && (
        <div className="absolute bottom-0 left-0 h-1 bg-current/20 w-full">
          <motion.div
            className="h-full bg-current/60"
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </div>
      )}

      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold mb-1">{item.title}</h4>
          {item.message && (
            <p className="text-sm opacity-90">{item.message}</p>
          )}
          
          {item.progress !== undefined && (
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Progress</span>
                <span>{item.progress}%</span>
              </div>
              <div className="w-full bg-current/20 rounded-full h-2">
                <motion.div
                  className="bg-current/60 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}
          
          {item.action && (
            <button
              onClick={item.action.onClick}
              className="mt-2 text-xs font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-current/30 rounded"
            >
              {item.action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 hover:bg-current/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-current/30"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
});

FeedbackItem.displayName = 'FeedbackItem';

export const EnhancedFeedback = memo<EnhancedFeedbackProps>(({
  items,
  position = 'top-right',
  maxItems = 5,
  onDismiss
}) => {
  const visibleItems = items.slice(0, maxItems);

  return (
    <div className={clsx('fixed z-50', positionStyles[position])}>
      <AnimatePresence mode="popLayout">
        {visibleItems.map(item => (
          <FeedbackItem
            key={item.id}
            item={item}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
});

EnhancedFeedback.displayName = 'EnhancedFeedback';

// Hook for managing feedback state
export function useEnhancedFeedback() {
  const [items, setItems] = useState<FeedbackItem[]>([]);

  const addFeedback = useCallback((
    type: FeedbackType,
    title: string,
    options?: Partial<Omit<FeedbackItem, 'id' | 'type' | 'title'>>
  ) => {
    const id = Math.random().toString(36).substring(2, 15);
    const newItem: FeedbackItem = {
      id,
      type,
      title,
      duration: type === 'error' ? 8000 : 5000,
      ...options
    };

    setItems(prev => [newItem, ...prev]);
    return id;
  }, []);

  const removeFeedback = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
  }, []);

  const updateFeedback = useCallback((id: string, updates: Partial<FeedbackItem>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  return {
    items,
    addFeedback,
    removeFeedback,
    clearAll,
    updateFeedback,
    // Convenience methods
    success: (title: string, options?: Partial<Omit<FeedbackItem, 'id' | 'type' | 'title'>>) => 
      addFeedback('success', title, options),
    error: (title: string, options?: Partial<Omit<FeedbackItem, 'id' | 'type' | 'title'>>) => 
      addFeedback('error', title, options),
    warning: (title: string, options?: Partial<Omit<FeedbackItem, 'id' | 'type' | 'title'>>) => 
      addFeedback('warning', title, options),
    info: (title: string, options?: Partial<Omit<FeedbackItem, 'id' | 'type' | 'title'>>) => 
      addFeedback('info', title, options),
    loading: (title: string, options?: Partial<Omit<FeedbackItem, 'id' | 'type' | 'title'>>) => 
      addFeedback('loading', title, { persistent: true, ...options })
  };
}

// Context for global feedback management
export const FeedbackContext = React.createContext<ReturnType<typeof useEnhancedFeedback> | null>(null);

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const feedback = useEnhancedFeedback();

  return (
    <FeedbackContext.Provider value={feedback}>
      {children}
      <EnhancedFeedback
        items={feedback.items}
        onDismiss={feedback.removeFeedback}
      />
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = React.useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};
