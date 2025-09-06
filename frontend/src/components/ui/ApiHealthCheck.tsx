import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { apiClient } from '../../services/api';
import Button from './Button';
import Card from './Card';
import { Body } from './Typography';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'checking' | 'unknown';
  message: string;
  timestamp: Date;
  responseTime?: number;
}

interface ApiHealthCheckProps {
  className?: string;
  autoCheck?: boolean;
  interval?: number;
}

/**
 * API Health Check Component
 * 
 * Provides real-time monitoring of backend API health
 */
const ApiHealthCheck: React.FC<ApiHealthCheckProps> = ({
  className,
  autoCheck = false,
  interval = 30000, // 30 seconds
}) => {
  const [health, setHealth] = useState<HealthStatus>({
    status: 'unknown',
    message: 'Not checked yet',
    timestamp: new Date(),
  });

  const checkHealth = async () => {
    setHealth(prev => ({
      ...prev,
      status: 'checking',
      message: 'Checking API health...',
    }));

    const startTime = Date.now();
    
    try {
      await apiClient.healthCheck();
      const responseTime = Date.now() - startTime;
      
      setHealth({
        status: 'healthy',
        message: 'API is responding normally',
        timestamp: new Date(),
        responseTime,
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      setHealth({
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'API health check failed',
        timestamp: new Date(),
        responseTime,
      });
    }
  };

  useEffect(() => {
    if (autoCheck) {
      // Initial check
      checkHealth();
      
      // Set up interval
      const intervalId = setInterval(checkHealth, interval);
      
      return () => clearInterval(intervalId);
    }
  }, [autoCheck, interval]);

  const getStatusIcon = () => {
    switch (health.status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'unhealthy':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'checking':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (health.status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'unhealthy':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'checking':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString();
  };

  return (
    <Card className={clsx('p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <Body size={2} weight="medium">
            API Health
          </Body>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={checkHealth}
          disabled={health.status === 'checking'}
          leftIcon={<RefreshCw className={clsx('w-4 h-4', health.status === 'checking' && 'animate-spin')} />}
        >
          Check
        </Button>
      </div>

      <motion.div
        className={clsx(
          'p-3 rounded-lg border',
          getStatusColor()
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        key={health.timestamp.getTime()} // Re-animate on status change
      >
        <div className="flex items-center justify-between mb-2">
          <Body size={3} weight="medium">
            Status: {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
          </Body>
          
          {health.responseTime && (
            <Body size={3} color="secondary">
              {health.responseTime}ms
            </Body>
          )}
        </div>
        
        <Body size={3} color="secondary" className="mb-2">
          {health.message}
        </Body>
        
        <Body size={4} color="secondary">
          Last checked: {formatTimestamp(health.timestamp)}
        </Body>
      </motion.div>

      {health.status === 'unhealthy' && (
        <motion.div
          className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <Body size={3} color="secondary">
            <strong>Troubleshooting Tips:</strong>
          </Body>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            <li>• Check your internet connection</li>
            <li>• Verify the backend server is running</li>
            <li>• Check if there are any CORS issues</li>
            <li>• Try refreshing the page</li>
          </ul>
        </motion.div>
      )}

      {autoCheck && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <Body size={4} color="secondary">
            Auto-checking every {Math.round(interval / 1000)} seconds
          </Body>
        </div>
      )}
    </Card>
  );
};

export default ApiHealthCheck;
