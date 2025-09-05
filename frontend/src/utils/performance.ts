/**
 * Performance monitoring and optimization utilities
 */

export interface PerformanceMetrics {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface WebVitals {
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();
  private webVitals: WebVitals = {};

  constructor() {
    this.initializeWebVitals();
  }

  // Start timing a performance metric
  startTiming(name: string, metadata?: Record<string, any>): void {
    const metric: PerformanceMetrics = {
      name,
      startTime: performance.now(),
      metadata,
    };
    
    this.metrics.set(name, metric);
    
    // Also use Performance API mark
    if (performance.mark) {
      performance.mark(`${name}-start`);
    }
  }

  // End timing and calculate duration
  endTiming(name: string): number | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" not found`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;
    
    metric.endTime = endTime;
    metric.duration = duration;

    // Use Performance API measure
    if (performance.mark && performance.measure) {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
    }

    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  // Get timing for a specific metric
  getTiming(name: string): PerformanceMetrics | null {
    return this.metrics.get(name) || null;
  }

  // Get all metrics
  getAllMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  // Clear all metrics
  clearMetrics(): void {
    this.metrics.clear();
    if (performance.clearMarks) {
      performance.clearMarks();
    }
    if (performance.clearMeasures) {
      performance.clearMeasures();
    }
  }

  // Get Web Vitals
  getWebVitals(): WebVitals {
    return { ...this.webVitals };
  }

  // Initialize Web Vitals monitoring
  private initializeWebVitals(): void {
    // First Contentful Paint
    this.observePerformanceEntry('paint', (entries) => {
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        this.webVitals.FCP = fcpEntry.startTime;
      }
    });

    // Largest Contentful Paint
    this.observePerformanceEntry('largest-contentful-paint', (entries) => {
      const lcpEntry = entries[entries.length - 1];
      if (lcpEntry) {
        this.webVitals.LCP = lcpEntry.startTime;
      }
    });

    // First Input Delay
    this.observePerformanceEntry('first-input', (entries) => {
      const fidEntry = entries[0];
      if (fidEntry) {
        this.webVitals.FID = (fidEntry as any).processingStart - fidEntry.startTime;
      }
    });

    // Cumulative Layout Shift
    this.observePerformanceEntry('layout-shift', (entries) => {
      let clsValue = 0;
      for (const entry of entries) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      this.webVitals.CLS = clsValue;
    });

    // Time to First Byte
    if (performance.getEntriesByType) {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        this.webVitals.TTFB = navigationEntries[0].responseStart - navigationEntries[0].requestStart;
      }
    }
  }

  private observePerformanceEntry(type: string, callback: (entries: PerformanceEntry[]) => void): void {
    if (!PerformanceObserver) return;

    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      
      observer.observe({ type, buffered: true });
      this.observers.set(type, observer);
    } catch (error) {
      console.warn(`Failed to observe ${type}:`, error);
    }
  }

  // Disconnect all observers
  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }

  // Get performance report
  getPerformanceReport(): {
    metrics: PerformanceMetrics[];
    webVitals: WebVitals;
    recommendations: string[];
  } {
    const metrics = this.getAllMetrics();
    const webVitals = this.getWebVitals();
    const recommendations: string[] = [];

    // Generate recommendations based on metrics
    if (webVitals.FCP && webVitals.FCP > 2500) {
      recommendations.push('First Contentful Paint is slow. Consider optimizing critical resources.');
    }

    if (webVitals.LCP && webVitals.LCP > 4000) {
      recommendations.push('Largest Contentful Paint is slow. Optimize images and critical path.');
    }

    if (webVitals.FID && webVitals.FID > 300) {
      recommendations.push('First Input Delay is high. Reduce JavaScript execution time.');
    }

    if (webVitals.CLS && webVitals.CLS > 0.25) {
      recommendations.push('Cumulative Layout Shift is high. Ensure proper sizing for dynamic content.');
    }

    const slowMetrics = metrics.filter(m => m.duration && m.duration > 1000);
    if (slowMetrics.length > 0) {
      recommendations.push(`${slowMetrics.length} slow operations detected. Review: ${slowMetrics.map(m => m.name).join(', ')}`);
    }

    return {
      metrics,
      webVitals,
      recommendations,
    };
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions
export const measureAsync = async <T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> => {
  performanceMonitor.startTiming(name, metadata);
  try {
    const result = await fn();
    return result;
  } finally {
    performanceMonitor.endTiming(name);
  }
};

export const measureSync = <T>(
  name: string,
  fn: () => T,
  metadata?: Record<string, any>
): T => {
  performanceMonitor.startTiming(name, metadata);
  try {
    const result = fn();
    return result;
  } finally {
    performanceMonitor.endTiming(name);
  }
};

// React hook for component performance
export const usePerformanceTracking = (componentName: string) => {
  const startTime = performance.now();

  return {
    trackRender: () => {
      const renderTime = performance.now() - startTime;
      if (renderTime > 16) { // More than one frame
        console.warn(`Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`);
      }
    },
    trackInteraction: (interactionName: string, fn: () => void) => {
      measureSync(`${componentName}-${interactionName}`, fn);
    },
  };
};

// Bundle size analyzer
export const analyzeBundleSize = () => {
  if (typeof window !== 'undefined' && (window as any).__webpack_require__) {
    const modules = (window as any).__webpack_require__.cache;
    const moduleStats = Object.keys(modules).map(id => ({
      id,
      size: JSON.stringify(modules[id]).length,
    }));

    moduleStats.sort((a, b) => b.size - a.size);
    
    console.table(moduleStats.slice(0, 20)); // Top 20 largest modules
    
    return moduleStats;
  }
  
  return null;
};

// Memory usage monitoring
export const getMemoryUsage = () => {
  if (typeof window !== 'undefined' && (performance as any).memory) {
    const memory = (performance as any).memory;
    return {
      used: Math.round(memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(memory.totalJSHeapSize / 1048576), // MB
      limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
    };
  }
  
  return null;
};

// Network performance
export const getNetworkInfo = () => {
  if (typeof window !== 'undefined' && (navigator as any).connection) {
    const connection = (navigator as any).connection;
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData,
    };
  }
  
  return null;
};

export default performanceMonitor;
