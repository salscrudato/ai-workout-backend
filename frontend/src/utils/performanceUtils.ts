/**
 * Consolidated Performance Utilities
 * 
 * Comprehensive performance monitoring and optimization utilities
 * combining functionality from performance.ts and performanceOptimization.ts
 */

import { useEffect, useRef, useState } from 'react';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

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

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Debounce utility for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) func(...args);
    }, wait);
    
    if (callNow) func(...args);
  };
};

/**
 * Throttle utility for scroll and resize events
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Request Animation Frame utility for smooth animations
 */
export const rafThrottle = <T extends (...args: any[]) => any>(
  func: T
): ((...args: Parameters<T>) => void) => {
  let rafId: number | null = null;
  
  return (...args: Parameters<T>) => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      func(...args);
    });
  };
};

/**
 * Intersection Observer for lazy loading and animations
 */
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
    ...options,
  };
  
  return new IntersectionObserver(callback, defaultOptions);
};

/**
 * Preload images for better UX
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Preload multiple images
 */
export const preloadImages = async (srcs: string[]): Promise<void[]> => {
  return Promise.all(srcs.map(preloadImage));
};

// =============================================================================
// DEVICE AND BROWSER DETECTION
// =============================================================================

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Check if user prefers high contrast
 */
export const prefersHighContrast = (): boolean => {
  return window.matchMedia('(prefers-contrast: high)').matches;
};

/**
 * Get device pixel ratio for high-DPI displays
 */
export const getDevicePixelRatio = (): number => {
  return window.devicePixelRatio || 1;
};

/**
 * Check if device supports touch
 */
export const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// =============================================================================
// PERFORMANCE OPTIMIZATION
// =============================================================================

/**
 * Optimize scroll performance
 */
export const optimizeScroll = (element: HTMLElement): void => {
  element.style.willChange = 'scroll-position';
  (element.style as any).webkitOverflowScrolling = 'touch';
};

/**
 * Layout shift prevention
 */
export const preventLayoutShift = (element: HTMLElement): void => {
  element.style.contain = 'layout';
  element.style.willChange = 'auto';
};

/**
 * GPU acceleration for animations
 */
export const enableGPUAcceleration = (element: HTMLElement): void => {
  element.style.transform = 'translateZ(0)';
  element.style.willChange = 'transform, opacity';
  element.style.backfaceVisibility = 'hidden';
};

/**
 * Optimize component re-renders
 */
export const shouldComponentUpdate = (
  prevProps: Record<string, any>,
  nextProps: Record<string, any>
): boolean => {
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);
  
  if (prevKeys.length !== nextKeys.length) return true;
  
  return prevKeys.some(key => prevProps[key] !== nextProps[key]);
};

/**
 * Memory usage monitoring
 */
export const getMemoryUsage = (): any | null => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: Math.round(memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(memory.totalJSHeapSize / 1048576), // MB
      limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
    };
  }
  return null;
};

/**
 * Network performance information
 */
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

// =============================================================================
// PERFORMANCE MONITORING CLASS
// =============================================================================

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();
  private webVitals: WebVitals = {};

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

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

    // Also use Performance API measure
    if (performance.measure) {
      try {
        performance.measure(name, `${name}-start`);
      } catch (e) {
        // Ignore if mark doesn't exist
      }
    }

    return duration;
  }

  // Get all metrics
  getMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  // Clear all metrics
  clearMetrics(): void {
    this.metrics.clear();
  }

  // Initialize Web Vitals monitoring
  private initializeWebVitals(): void {
    // This would typically use web-vitals library
    // For now, we'll use basic Performance Observer
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        // Monitor LCP
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.webVitals.LCP = lastEntry.startTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (e) {
        // Ignore if not supported
      }
    }
  }

  // Get Web Vitals
  getWebVitals(): WebVitals {
    return { ...this.webVitals };
  }
}

// Singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// =============================================================================
// REACT HOOKS
// =============================================================================

/**
 * React hook for performance monitoring
 */
export const usePerformanceMonitor = () => {
  const monitor = PerformanceMonitor.getInstance();
  
  return {
    startTiming: monitor.startTiming.bind(monitor),
    endTiming: monitor.endTiming.bind(monitor),
    getMetrics: monitor.getMetrics.bind(monitor),
    clearMetrics: monitor.clearMetrics.bind(monitor),
    getWebVitals: monitor.getWebVitals.bind(monitor),
  };
};

/**
 * React hook for component performance tracking
 */
export const usePerformanceTracking = (componentName: string) => {
  const startTime = performance.now();

  return {
    trackRender: () => {
      const renderTime = performance.now() - startTime;
      performanceMonitor.startTiming(`${componentName}-render`);
      performanceMonitor.endTiming(`${componentName}-render`);
      return renderTime;
    },
  };
};

// =============================================================================
// MEASUREMENT UTILITIES
// =============================================================================

/**
 * Measure async function performance
 */
export const measureAsync = async <T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> => {
  performanceMonitor.startTiming(name, metadata);
  try {
    return await fn();
  } finally {
    performanceMonitor.endTiming(name);
  }
};

/**
 * Measure sync function performance
 */
export const measureSync = <T>(
  name: string,
  fn: () => T,
  metadata?: Record<string, any>
): T => {
  performanceMonitor.startTiming(name, metadata);
  try {
    return fn();
  } finally {
    performanceMonitor.endTiming(name);
  }
};

// Default export with all utilities
export default {
  debounce,
  throttle,
  rafThrottle,
  createIntersectionObserver,
  preloadImage,
  preloadImages,
  prefersReducedMotion,
  prefersHighContrast,
  getDevicePixelRatio,
  isTouchDevice,
  optimizeScroll,
  preventLayoutShift,
  enableGPUAcceleration,
  shouldComponentUpdate,
  getMemoryUsage,
  getNetworkInfo,
  performanceMonitor,
  measureAsync,
  measureSync,
  usePerformanceMonitor,
  usePerformanceTracking,
};
