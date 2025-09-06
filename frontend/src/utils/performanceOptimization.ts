/**
 * Performance Optimization Utilities
 * 
 * Collection of utilities to optimize React app performance,
 * reduce layout shifts, and ensure smooth 60fps animations
 */

// Debounce utility for performance optimization
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

// Throttle utility for scroll and resize events
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

// Request Animation Frame utility for smooth animations
export const rafThrottle = <T extends (...args: any[]) => any>(
  func: T
): ((...args: Parameters<T>) => void) => {
  let rafId: number | null = null;
  
  return (...args: Parameters<T>) => {
    if (rafId) return;
    
    rafId = requestAnimationFrame(() => {
      func(...args);
      rafId = null;
    });
  };
};

// Intersection Observer for lazy loading and animations
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };
  
  return new IntersectionObserver(callback, defaultOptions);
};

// Preload images for better UX
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Preload multiple images
export const preloadImages = async (srcs: string[]): Promise<void[]> => {
  return Promise.all(srcs.map(preloadImage));
};

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Check if user prefers high contrast
export const prefersHighContrast = (): boolean => {
  return window.matchMedia('(prefers-contrast: high)').matches;
};

// Get device pixel ratio for high-DPI displays
export const getDevicePixelRatio = (): number => {
  return window.devicePixelRatio || 1;
};

// Check if device supports touch
export const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Optimize scroll performance
export const optimizeScroll = (element: HTMLElement): void => {
  element.style.willChange = 'scroll-position';
  element.style.webkitOverflowScrolling = 'touch';
};

// Layout shift prevention
export const preventLayoutShift = (element: HTMLElement): void => {
  element.style.contain = 'layout';
  element.style.willChange = 'auto';
};

// GPU acceleration for animations
export const enableGPUAcceleration = (element: HTMLElement): void => {
  element.style.transform = 'translateZ(0)';
  element.style.willChange = 'transform, opacity';
  element.style.backfaceVisibility = 'hidden';
};

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  // Measure function execution time
  measureFunction<T extends (...args: any[]) => any>(
    name: string,
    func: T
  ): T {
    return ((...args: Parameters<T>) => {
      const start = performance.now();
      const result = func(...args);
      const end = performance.now();
      
      this.recordMetric(name, end - start);
      
      return result;
    }) as T;
  }
  
  // Record custom metric
  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }
  
  // Get average metric value
  getAverageMetric(name: string): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;
    
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }
  
  // Get all metrics
  getAllMetrics(): Record<string, { average: number; count: number }> {
    const result: Record<string, { average: number; count: number }> = {};
    
    this.metrics.forEach((values, name) => {
      result[name] = {
        average: this.getAverageMetric(name),
        count: values.length,
      };
    });
    
    return result;
  }
  
  // Clear metrics
  clearMetrics(): void {
    this.metrics.clear();
  }
}

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  const monitor = PerformanceMonitor.getInstance();
  
  return {
    measureFunction: monitor.measureFunction.bind(monitor),
    recordMetric: monitor.recordMetric.bind(monitor),
    getAverageMetric: monitor.getAverageMetric.bind(monitor),
    getAllMetrics: monitor.getAllMetrics.bind(monitor),
    clearMetrics: monitor.clearMetrics.bind(monitor),
  };
};

// Optimize component re-renders
export const shouldComponentUpdate = (
  prevProps: Record<string, any>,
  nextProps: Record<string, any>
): boolean => {
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);
  
  if (prevKeys.length !== nextKeys.length) return true;
  
  return prevKeys.some(key => prevProps[key] !== nextProps[key]);
};

// Memory usage monitoring
export const getMemoryUsage = (): MemoryInfo | null => {
  if ('memory' in performance) {
    return (performance as any).memory;
  }
  return null;
};

// FPS monitoring
export class FPSMonitor {
  private frames: number[] = [];
  private lastTime = performance.now();
  private rafId: number | null = null;
  
  start(): void {
    const measure = () => {
      const now = performance.now();
      const delta = now - this.lastTime;
      this.lastTime = now;
      
      const fps = 1000 / delta;
      this.frames.push(fps);
      
      // Keep only last 60 frames (1 second at 60fps)
      if (this.frames.length > 60) {
        this.frames.shift();
      }
      
      this.rafId = requestAnimationFrame(measure);
    };
    
    this.rafId = requestAnimationFrame(measure);
  }
  
  stop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
  
  getAverageFPS(): number {
    if (this.frames.length === 0) return 0;
    return this.frames.reduce((sum, fps) => sum + fps, 0) / this.frames.length;
  }
  
  getCurrentFPS(): number {
    return this.frames[this.frames.length - 1] || 0;
  }
}

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
  PerformanceMonitor,
  usePerformanceMonitor,
  shouldComponentUpdate,
  getMemoryUsage,
  FPSMonitor,
};
