import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Wifi, WifiOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

export interface SmartLoadingStatesProps {
  isLoading: boolean;
  error?: string | null;
  success?: boolean;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  showProgress?: boolean;
  progress?: number;
  estimatedTime?: number;
  className?: string;
  variant?: 'default' | 'minimal' | 'skeleton' | 'dots';
}

/**
 * Smart Loading States Component
 * 
 * Features:
 * - Multiple loading variants (spinner, skeleton, dots)
 * - Progress indication with time estimation
 * - Network status awareness
 * - Error and success states
 * - Smooth state transitions
 * - Accessibility support
 */
const SmartLoadingStates: React.FC<SmartLoadingStatesProps> = ({
  isLoading,
  error,
  success = false,
  loadingText = 'Loading...',
  successText = 'Success!',
  errorText,
  showProgress = false,
  progress = 0,
  estimatedTime,
  className,
  variant = 'default',
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Track loading time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLoading) {
      setTimeElapsed(0);
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  // Render skeleton loading
  const renderSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded-lg w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded-lg w-5/6"></div>
    </div>
  );

  // Render dots loading
  const renderDots = () => (
    <div className="flex space-x-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-blue-500 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );

  // Render progress bar
  const renderProgress = () => (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span>{loadingText}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className="bg-blue-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      {estimatedTime && (
        <div className="text-xs text-gray-500 text-center">
          Estimated time: {estimatedTime}s
        </div>
      )}
    </div>
  );

  // Main loading content
  const renderLoadingContent = () => {
    switch (variant) {
      case 'skeleton':
        return renderSkeleton();
      case 'dots':
        return (
          <div className="flex flex-col items-center space-y-3">
            {renderDots()}
            <span className="text-sm text-gray-600">{loadingText}</span>
          </div>
        );
      case 'minimal':
        return (
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            <span className="text-sm text-gray-600">{loadingText}</span>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-8 h-8 text-blue-500" />
            </motion.div>
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-gray-900">{loadingText}</p>
              {showProgress && renderProgress()}
              {timeElapsed > 5 && (
                <p className="text-xs text-gray-500">
                  This is taking longer than usual...
                </p>
              )}
              {!isOnline && (
                <div className="flex items-center justify-center space-x-1 text-orange-600">
                  <WifiOff className="w-4 h-4" />
                  <span className="text-xs">No internet connection</span>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className={clsx('flex items-center justify-center p-4', className)}>
      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center space-y-3 text-center"
          >
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-900">
                {errorText || error}
              </p>
              {!isOnline && (
                <p className="text-xs text-red-600 mt-1">
                  Please check your internet connection
                </p>
              )}
            </div>
          </motion.div>
        ) : success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center space-y-3 text-center"
          >
            <motion.div
              className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            >
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </motion.div>
            <p className="text-sm font-medium text-green-900">{successText}</p>
          </motion.div>
        ) : isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderLoadingContent()}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default SmartLoadingStates;
