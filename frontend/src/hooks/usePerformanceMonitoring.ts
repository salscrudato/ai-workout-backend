import { useEffect, useState, useCallback, useRef } from 'react';

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  
  // Additional metrics
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  fmp?: number; // First Meaningful Paint
  
  // Custom metrics
  renderTime?: number;
  interactionTime?: number;
  memoryUsage?: number;
  
  // Navigation timing
  domContentLoaded?: number;
  loadComplete?: number;
  
  // Frame rate
  averageFPS?: number;
  minFPS?: number;
  maxFPS?: number;
}

export interface PerformanceConfig {
  enableCoreWebVitals?: boolean;
  enableFrameRateMonitoring?: boolean;
  enableMemoryMonitoring?: boolean;
  enableCustomMetrics?: boolean;
  reportingInterval?: number; // ms
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

/**
 * Enhanced Performance Monitoring Hook
 * 
 * Features:
 * - Core Web Vitals tracking (LCP, FID, CLS)
 * - Real-time frame rate monitoring
 * - Memory usage tracking
 * - Custom performance metrics
 * - Navigation timing analysis
 * - Automatic reporting and alerts
 */
export const usePerformanceMonitoring = (config: PerformanceConfig = {}) => {
  const {
    enableCoreWebVitals = true,
    enableFrameRateMonitoring = true,
    enableMemoryMonitoring = true,
    enableCustomMetrics = true,
    reportingInterval = 5000,
    onMetricsUpdate,
  } = config;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsHistoryRef = useRef<number[]>([]);
  const animationFrameRef = useRef<number>();

  // Core Web Vitals monitoring
  const measureCoreWebVitals = useCallback(() => {
    if (!enableCoreWebVitals || typeof window === 'undefined') return;

    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          if (lastEntry) {
            setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            setMetrics(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }));
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              setMetrics(prev => ({ ...prev, cls: clsValue }));
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // First Contentful Paint (FCP)
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.name === 'first-contentful-paint') {
              setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
            }
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });

      } catch (error) {
        console.warn('Performance monitoring not fully supported:', error);
      }
    }
  }, [enableCoreWebVitals]);

  // Frame rate monitoring
  const measureFrameRate = useCallback(() => {
    if (!enableFrameRateMonitoring) return;

    const measureFPS = () => {
      const now = performance.now();
      const delta = now - lastTimeRef.current;
      
      if (delta >= 1000) { // Calculate FPS every second
        const fps = Math.round((frameCountRef.current * 1000) / delta);
        fpsHistoryRef.current.push(fps);
        
        // Keep only last 10 measurements
        if (fpsHistoryRef.current.length > 10) {
          fpsHistoryRef.current.shift();
        }
        
        const averageFPS = Math.round(
          fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length
        );
        const minFPS = Math.min(...fpsHistoryRef.current);
        const maxFPS = Math.max(...fpsHistoryRef.current);
        
        setMetrics(prev => ({
          ...prev,
          averageFPS,
          minFPS,
          maxFPS,
        }));
        
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
      
      frameCountRef.current++;
      animationFrameRef.current = requestAnimationFrame(measureFPS);
    };

    measureFPS();
  }, [enableFrameRateMonitoring]);

  // Memory usage monitoring
  const measureMemoryUsage = useCallback(() => {
    if (!enableMemoryMonitoring || typeof window === 'undefined') return;

    // @ts-ignore - performance.memory is not in TypeScript types but exists in Chrome
    if (performance.memory) {
      // @ts-ignore
      const memoryInfo = performance.memory;
      const memoryUsage = Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024); // MB
      setMetrics(prev => ({ ...prev, memoryUsage }));
    }
  }, [enableMemoryMonitoring]);

  // Navigation timing
  const measureNavigationTiming = useCallback(() => {
    if (typeof window === 'undefined') return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const ttfb = navigation.responseStart - navigation.requestStart;
      const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart;
      const loadComplete = navigation.loadEventEnd - navigation.navigationStart;

      setMetrics(prev => ({
        ...prev,
        ttfb,
        domContentLoaded,
        loadComplete,
      }));
    }
  }, []);

  // Custom render time measurement
  const measureRenderTime = useCallback((startTime: number) => {
    if (!enableCustomMetrics) return;

    const renderTime = performance.now() - startTime;
    setMetrics(prev => ({ ...prev, renderTime }));
  }, [enableCustomMetrics]);

  // Custom interaction time measurement
  const measureInteractionTime = useCallback((startTime: number) => {
    if (!enableCustomMetrics) return;

    const interactionTime = performance.now() - startTime;
    setMetrics(prev => ({ ...prev, interactionTime }));
  }, [enableCustomMetrics]);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;

    setIsMonitoring(true);
    measureCoreWebVitals();
    measureFrameRate();
    measureNavigationTiming();

    // Set up periodic measurements
    const interval = setInterval(() => {
      measureMemoryUsage();
      if (onMetricsUpdate) {
        onMetricsUpdate(metrics);
      }
    }, reportingInterval);

    return () => {
      clearInterval(interval);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    isMonitoring,
    measureCoreWebVitals,
    measureFrameRate,
    measureMemoryUsage,
    measureNavigationTiming,
    reportingInterval,
    onMetricsUpdate,
    metrics,
  ]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  // Performance score calculation
  const getPerformanceScore = useCallback((): number => {
    let score = 100;
    
    // LCP scoring (0-4s scale)
    if (metrics.lcp) {
      if (metrics.lcp > 4000) score -= 30;
      else if (metrics.lcp > 2500) score -= 15;
    }
    
    // FID scoring (0-300ms scale)
    if (metrics.fid) {
      if (metrics.fid > 300) score -= 25;
      else if (metrics.fid > 100) score -= 10;
    }
    
    // CLS scoring (0-0.25 scale)
    if (metrics.cls) {
      if (metrics.cls > 0.25) score -= 20;
      else if (metrics.cls > 0.1) score -= 10;
    }
    
    // FPS scoring
    if (metrics.averageFPS) {
      if (metrics.averageFPS < 30) score -= 15;
      else if (metrics.averageFPS < 50) score -= 5;
    }
    
    return Math.max(0, score);
  }, [metrics]);

  // Initialize monitoring on mount
  useEffect(() => {
    const cleanup = startMonitoring();
    return cleanup;
  }, [startMonitoring]);

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    measureRenderTime,
    measureInteractionTime,
    getPerformanceScore,
  };
};

export default usePerformanceMonitoring;
