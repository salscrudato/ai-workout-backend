import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export interface DataPoint {
  label: string;
  value: number;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface DataVisualizationProps {
  data: DataPoint[];
  type: 'bar' | 'line' | 'progress' | 'radial';
  title?: string;
  subtitle?: string;
  height?: number;
  animate?: boolean;
  showValues?: boolean;
  className?: string;
  variant?: 'default' | 'premium' | 'glass';
}

const DataVisualization: React.FC<DataVisualizationProps> = ({
  data,
  type,
  title,
  subtitle,
  height = 200,
  animate = true,
  showValues = true,
  className,
  variant = 'default',
}) => {
  const [animatedData, setAnimatedData] = useState<DataPoint[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const maxValue = Math.max(...data.map(d => d.value));

  // Animation effect for data
  useEffect(() => {
    if (animate) {
      setAnimatedData(data.map(d => ({ ...d, value: 0 })));
      
      const timer = setTimeout(() => {
        setIsVisible(true);
        setAnimatedData(data);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setAnimatedData(data);
      setIsVisible(true);
    }
  }, [data, animate]);

  const getVariantStyles = () => {
    switch (variant) {
      case 'premium':
        return 'glass-blue-premium border-blue-premium-200 shadow-glow-blue-premium';
      case 'glass':
        return 'glass-light border-white/20 shadow-glow-blue';
      default:
        return 'bg-white border-secondary-200 shadow-soft';
    }
  };

  const renderBarChart = () => (
    <div className="flex items-end justify-between gap-2" style={{ height }}>
      {animatedData.map((item, index) => (
        <motion.div
          key={item.label}
          className="flex flex-col items-center flex-1 min-w-0"
          initial={animate ? { opacity: 0, y: 20 } : false}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: index * 0.1, duration: 0.5 }}
        >
          <div className="relative flex-1 w-full flex items-end">
            <motion.div
              className={clsx(
                'w-full rounded-t-lg',
                item.color || 'gradient-blue-electric'
              )}
              initial={animate ? { height: 0 } : false}
              animate={isVisible ? { 
                height: `${(item.value / maxValue) * 100}%` 
              } : {}}
              transition={{ 
                delay: index * 0.1 + 0.2, 
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            />
            {showValues && (
              <motion.span
                className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-secondary-600"
                initial={animate ? { opacity: 0, scale: 0.8 } : false}
                animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: index * 0.1 + 0.5, duration: 0.3 }}
              >
                {item.value}
              </motion.span>
            )}
          </div>
          <span className="text-xs text-secondary-500 mt-2 truncate w-full text-center">
            {item.label}
          </span>
        </motion.div>
      ))}
    </div>
  );

  const renderProgressBars = () => (
    <div className="space-y-4">
      {animatedData.map((item, index) => (
        <motion.div
          key={item.label}
          className="space-y-2"
          initial={animate ? { opacity: 0, x: -20 } : false}
          animate={isVisible ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: index * 0.1, duration: 0.5 }}
        >
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-secondary-700">
              {item.label}
            </span>
            {showValues && (
              <motion.span
                className="text-sm font-semibold text-primary-600"
                initial={animate ? { scale: 0 } : false}
                animate={isVisible ? { scale: 1 } : {}}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.3 }}
              >
                {item.value}%
              </motion.span>
            )}
          </div>
          <div className="relative h-3 bg-secondary-100 rounded-full overflow-hidden">
            <motion.div
              className={clsx(
                'h-full rounded-full',
                item.color || 'gradient-blue-electric'
              )}
              initial={animate ? { width: 0 } : false}
              animate={isVisible ? { width: `${item.value}%` } : {}}
              transition={{ 
                delay: index * 0.1 + 0.2, 
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderRadialProgress = () => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    
    return (
      <div className="flex flex-wrap justify-center gap-6">
        {animatedData.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          const strokeDasharray = circumference;
          const strokeDashoffset = circumference - (percentage / 100) * circumference;
          
          return (
            <motion.div
              key={item.label}
              className="flex flex-col items-center"
              initial={animate ? { opacity: 0, scale: 0.8 } : false}
              animate={isVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className="relative">
                <svg width="140" height="140" className="transform -rotate-90">
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-secondary-200"
                  />
                  <motion.circle
                    cx="70"
                    cy="70"
                    r={radius}
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={strokeDasharray}
                    initial={animate ? { strokeDashoffset: circumference } : false}
                    animate={isVisible ? { strokeDashoffset } : {}}
                    transition={{ 
                      delay: index * 0.1 + 0.3, 
                      duration: 1,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0ea5e9" />
                      <stop offset="50%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#6b82ff" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    className="text-2xl font-bold gradient-text-blue"
                    initial={animate ? { scale: 0 } : false}
                    animate={isVisible ? { scale: 1 } : {}}
                    transition={{ delay: index * 0.1 + 0.5, duration: 0.3 }}
                  >
                    {item.value}
                  </motion.span>
                  {showValues && (
                    <span className="text-xs text-secondary-500">
                      {Math.round(percentage)}%
                    </span>
                  )}
                </div>
              </div>
              <span className="text-sm font-medium text-secondary-700 mt-2 text-center">
                {item.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderVisualization = () => {
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'progress':
        return renderProgressBars();
      case 'radial':
        return renderRadialProgress();
      default:
        return renderBarChart();
    }
  };

  return (
    <motion.div
      className={clsx(
        'rounded-xl border p-6 backdrop-blur-sm',
        getVariantStyles(),
        className
      )}
      initial={animate ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-lg font-semibold gradient-text-blue mb-1">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-secondary-600">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div className="relative">
        {renderVisualization()}
      </div>
    </motion.div>
  );
};

export default DataVisualization;
