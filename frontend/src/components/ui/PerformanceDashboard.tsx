import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { 
  Activity, 
  Zap, 
  Clock, 
  Eye, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { usePerformanceMonitoring, PerformanceMetrics } from '../../hooks/usePerformanceMonitoring';

interface PerformanceDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

/**
 * Performance Dashboard Component
 * 
 * Features:
 * - Real-time Core Web Vitals display
 * - Frame rate monitoring
 * - Memory usage tracking
 * - Performance score calculation
 * - Visual indicators and alerts
 * - Responsive design
 */
const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  isOpen,
  onClose,
  className,
  position = 'bottom-right',
}) => {
  const { metrics, isMonitoring, getPerformanceScore } = usePerformanceMonitoring({
    enableCoreWebVitals: true,
    enableFrameRateMonitoring: true,
    enableMemoryMonitoring: true,
    reportingInterval: 2000,
  });

  const [selectedTab, setSelectedTab] = useState<'vitals' | 'performance' | 'memory'>('vitals');

  const performanceScore = getPerformanceScore();

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  // Metric status helpers
  const getMetricStatus = (value: number | undefined, thresholds: { good: number; poor: number }) => {
    if (value === undefined) return 'unknown';
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.poor) return 'needs-improvement';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return CheckCircle;
      case 'needs-improvement': return AlertTriangle;
      case 'poor': return X;
      default: return Clock;
    }
  };

  // Core Web Vitals thresholds
  const thresholds = {
    lcp: { good: 2500, poor: 4000 },
    fid: { good: 100, poor: 300 },
    cls: { good: 0.1, poor: 0.25 },
    fcp: { good: 1800, poor: 3000 },
  };

  const MetricCard: React.FC<{
    title: string;
    value: number | undefined;
    unit: string;
    threshold: { good: number; poor: number };
    icon: React.ElementType;
    description: string;
  }> = ({ title, value, unit, threshold, icon: Icon, description }) => {
    const status = getMetricStatus(value, threshold);
    const StatusIcon = getStatusIcon(status);
    
    return (
      <motion.div
        className={clsx(
          'p-3 rounded-lg border',
          getStatusColor(status)
        )}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{title}</span>
          </div>
          <StatusIcon className="w-4 h-4" />
        </div>
        
        <div className="text-lg font-bold">
          {value !== undefined ? `${Math.round(value)}${unit}` : '—'}
        </div>
        
        <div className="text-xs opacity-75 mt-1">
          {description}
        </div>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={clsx(
            'fixed z-50 w-80 max-h-96',
            positionClasses[position],
            className
          )}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-primary-600" />
                  <h3 className="font-semibold text-gray-900">Performance</h3>
                  <div className={clsx(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    performanceScore >= 90 ? 'bg-green-100 text-green-800' :
                    performanceScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  )}>
                    {performanceScore}/100
                  </div>
                </div>
                
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                  aria-label="Close performance dashboard"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              
              {/* Status indicator */}
              <div className="flex items-center space-x-2 mt-2">
                <div className={clsx(
                  'w-2 h-2 rounded-full',
                  isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                )} />
                <span className="text-xs text-gray-600">
                  {isMonitoring ? 'Monitoring active' : 'Monitoring inactive'}
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {[
                { id: 'vitals', label: 'Core Vitals', icon: Zap },
                { id: 'performance', label: 'Performance', icon: BarChart3 },
                { id: 'memory', label: 'Memory', icon: Activity },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSelectedTab(id as any)}
                  className={clsx(
                    'flex-1 flex items-center justify-center space-x-1 py-2 text-xs font-medium transition-colors',
                    selectedTab === id
                      ? 'text-primary-600 bg-primary-50 border-b-2 border-primary-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-3 h-3" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-4 max-h-64 overflow-y-auto">
              <AnimatePresence mode="wait">
                {selectedTab === 'vitals' && (
                  <motion.div
                    key="vitals"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-3"
                  >
                    <MetricCard
                      title="LCP"
                      value={metrics.lcp}
                      unit="ms"
                      threshold={thresholds.lcp}
                      icon={Eye}
                      description="Largest Contentful Paint"
                    />
                    <MetricCard
                      title="FID"
                      value={metrics.fid}
                      unit="ms"
                      threshold={thresholds.fid}
                      icon={Clock}
                      description="First Input Delay"
                    />
                    <MetricCard
                      title="CLS"
                      value={metrics.cls ? metrics.cls * 1000 : undefined}
                      unit=""
                      threshold={{ good: 100, poor: 250 }}
                      icon={TrendingUp}
                      description="Cumulative Layout Shift"
                    />
                  </motion.div>
                )}

                {selectedTab === 'performance' && (
                  <motion.div
                    key="performance"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-3"
                  >
                    <MetricCard
                      title="FCP"
                      value={metrics.fcp}
                      unit="ms"
                      threshold={thresholds.fcp}
                      icon={Zap}
                      description="First Contentful Paint"
                    />
                    <MetricCard
                      title="Avg FPS"
                      value={metrics.averageFPS}
                      unit=""
                      threshold={{ good: 55, poor: 30 }}
                      icon={BarChart3}
                      description="Average Frame Rate"
                    />
                    <MetricCard
                      title="TTFB"
                      value={metrics.ttfb}
                      unit="ms"
                      threshold={{ good: 200, poor: 500 }}
                      icon={Clock}
                      description="Time to First Byte"
                    />
                  </motion.div>
                )}

                {selectedTab === 'memory' && (
                  <motion.div
                    key="memory"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-3"
                  >
                    <MetricCard
                      title="Memory"
                      value={metrics.memoryUsage}
                      unit="MB"
                      threshold={{ good: 50, poor: 100 }}
                      icon={Activity}
                      description="JavaScript Heap Size"
                    />
                    <MetricCard
                      title="Render"
                      value={metrics.renderTime}
                      unit="ms"
                      threshold={{ good: 16, poor: 33 }}
                      icon={TrendingUp}
                      description="Last Render Time"
                    />
                    <MetricCard
                      title="Interaction"
                      value={metrics.interactionTime}
                      unit="ms"
                      threshold={{ good: 50, poor: 100 }}
                      icon={TrendingDown}
                      description="Last Interaction Time"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PerformanceDashboard;
