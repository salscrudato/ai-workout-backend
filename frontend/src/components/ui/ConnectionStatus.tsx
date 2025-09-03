import React, { useState, useEffect, memo } from 'react';
import { clsx } from 'clsx';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { apiClient } from '../../services/api';

interface ConnectionStatusProps {
  className?: string;
}

/**
 * Connection Status Component
 * 
 * Shows the current connection status to the backend API
 * Helps users understand when features might be limited due to connectivity issues
 */
const ConnectionStatus: React.FC<ConnectionStatusProps> = memo(({ className }) => {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  // Check connection status by trying to fetch equipment (which doesn't require auth)
  const checkConnection = async () => {
    try {
      setStatus('checking');

      // Try to fetch equipment as a simple connectivity test
      // This uses the same API client configuration and avoids CORS issues
      await apiClient.getEquipment();

      setStatus('connected');
      setLastCheck(new Date());
    } catch (error: any) {
      console.warn('Connection check failed:', error);

      // Check if it's a network/connection error vs other errors
      if (error.message?.includes('Unable to connect to the server') ||
          error.message?.includes('Network Error') ||
          error.message?.includes('Failed to fetch')) {
        setStatus('disconnected');
      } else {
        // API is responding but might have other issues (auth, etc.)
        // Still consider it "connected" from a network perspective
        setStatus('connected');
      }

      setLastCheck(new Date());
    }
  };

  // Initial connection check and periodic checks
  useEffect(() => {
    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Don't show anything if connected
  if (status === 'connected') {
    return null;
  }

  const statusConfig = {
    checking: {
      icon: Wifi,
      text: 'Checking connection...',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600',
      borderColor: 'border-yellow-200',
    },
    disconnected: {
      icon: WifiOff,
      text: 'Backend unavailable - Limited functionality',
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={clsx(
        'flex items-center gap-2 px-3 py-2 rounded-md border text-sm',
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <Icon className={clsx('w-4 h-4', config.iconColor)} />
      <span className="flex-1">{config.text}</span>
      
      {status === 'disconnected' && (
        <button
          onClick={checkConnection}
          className={clsx(
            'text-xs px-2 py-1 rounded border',
            'hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500',
            'border-red-300 text-red-700'
          )}
        >
          Retry
        </button>
      )}
    </div>
  );
});

ConnectionStatus.displayName = 'ConnectionStatus';

export default ConnectionStatus;
