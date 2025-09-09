import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { clsx } from 'clsx';

export interface MobilePerformanceOptimizedProps {
  children: React.ReactNode;
  className?: string;
  lazyLoad?: boolean;
  virtualizeList?: boolean;
  optimizeImages?: boolean;
  enablePrefetch?: boolean;
}

export interface LazyLoadProps {
  children: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  fallback?: React.ReactNode;
  className?: string;
}

export interface VirtualizedListProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
}

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  placeholder?: string;
}

/**
 * Mobile Performance Optimized Components
 * 
 * Provides performance optimizations specifically for mobile devices:
 * - Lazy loading with intersection observer
 * - Virtual scrolling for large lists
 * - Optimized image loading with placeholders
 * - Reduced motion support
 * - Memory-efficient rendering
 * - Touch-optimized interactions
 */

// Lazy loading component with intersection observer
export const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  threshold = 0.1,
  rootMargin = '50px',
  fallback = null,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.unobserve(element);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, hasLoaded]);

  return (
    <div ref={elementRef} className={className}>
      {isVisible || hasLoaded ? children : fallback}
    </div>
  );
};

// Virtualized list component for performance
export const VirtualizedList: React.FC<VirtualizedListProps> = ({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5,
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );
    return { start: Math.max(0, start - overscan), end };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index,
    }));
  }, [items, visibleRange]);

  return (
    <div
      ref={containerRef}
      className={clsx('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: index * itemHeight,
              left: 0,
              right: 0,
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

// Optimized image component with lazy loading and placeholders
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  loading = 'lazy',
  priority = false,
  placeholder,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  // Generate responsive srcSet for different screen densities
  const srcSet = useMemo(() => {
    if (!src) return undefined;
    
    // Simple implementation - in production, you'd use a service like Cloudinary
    const baseSrc = src.split('.').slice(0, -1).join('.');
    const extension = src.split('.').pop();
    
    return [
      `${src} 1x`,
      `${baseSrc}@2x.${extension} 2x`,
      `${baseSrc}@3x.${extension} 3x`,
    ].join(', ');
  }, [src]);

  return (
    <div className={clsx('relative overflow-hidden', className)}>
      {/* Placeholder */}
      {!isLoaded && !hasError && (
        <div
          className={clsx(
            'absolute inset-0 bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200',
            'animate-pulse'
          )}
          style={{ width, height }}
        >
          {placeholder && (
            <div className="flex items-center justify-center h-full text-neutral-400">
              {placeholder}
            </div>
          )}
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div
          className="flex items-center justify-center bg-neutral-100 text-neutral-400"
          style={{ width, height }}
        >
          <span>Failed to load image</span>
        </div>
      )}

      {/* Actual image */}
      <img
        ref={imgRef}
        src={src}
        srcSet={srcSet}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
        onLoad={handleLoad}
        onError={handleError}
        className={clsx(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        style={{
          maxWidth: '100%',
          height: 'auto',
        }}
      />
    </div>
  );
};

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    fps: 0,
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        setMetrics(prev => ({
          ...prev,
          fps,
          memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
        }));
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return metrics;
};

// Touch-optimized scroll component
export const TouchOptimizedScroll: React.FC<{
  children: React.ReactNode;
  className?: string;
  momentum?: boolean;
}> = ({ children, className, momentum = true }) => {
  return (
    <div
      className={clsx(
        'overflow-auto',
        momentum && 'scroll-smooth',
        className
      )}
      style={{
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: momentum ? 'smooth' : 'auto',
      }}
    >
      {children}
    </div>
  );
};

// Main mobile performance optimized wrapper
const MobilePerformanceOptimized: React.FC<MobilePerformanceOptimizedProps> = ({
  children,
  className,
  lazyLoad = true,
  virtualizeList = false,
  optimizeImages = true,
  enablePrefetch = true,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const metrics = usePerformanceMonitoring();

  // Prefetch critical resources
  useEffect(() => {
    if (!enablePrefetch) return;

    // Prefetch critical CSS and fonts
    const prefetchLinks = [
      { rel: 'preload', href: '/fonts/inter.woff2', as: 'font', type: 'font/woff2' },
    ];

    prefetchLinks.forEach(({ rel, href, as, type }) => {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      if (as) link.as = as;
      if (type) link.type = type;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }, [enablePrefetch]);

  const wrapperStyles = clsx(
    'mobile-performance-optimized',
    // Optimize for mobile rendering
    'transform-gpu will-change-transform',
    // Reduce motion if preferred
    shouldReduceMotion && 'motion-reduce:transition-none motion-reduce:animate-none',
    className
  );

  const content = lazyLoad ? (
    <LazyLoad>
      {children}
    </LazyLoad>
  ) : (
    children
  );

  return (
    <div className={wrapperStyles}>
      {content}
      
      {/* Performance metrics in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs z-50">
          <div>FPS: {metrics.fps}</div>
          <div>Memory: {Math.round(metrics.memoryUsage / 1024 / 1024)}MB</div>
        </div>
      )}
    </div>
  );
};

MobilePerformanceOptimized.displayName = 'MobilePerformanceOptimized';

export default MobilePerformanceOptimized;
