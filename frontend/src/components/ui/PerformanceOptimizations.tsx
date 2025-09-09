import React, { memo, useMemo, useCallback, lazy, Suspense } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { clsx } from 'clsx';

/**
 * Performance Optimization Components
 * 
 * Features:
 * - Lazy loading with intelligent preloading
 * - Memoized components for optimal re-renders
 * - Reduced motion support for accessibility
 * - Optimized image loading with WebP support
 * - Virtual scrolling for large lists
 * - Performance monitoring hooks
 */

// Optimized Image Component with WebP support and lazy loading
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = memo(({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  placeholder = 'empty',
  blurDataURL,
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  // Generate WebP source if supported
  const webpSrc = useMemo(() => {
    if (src.includes('.jpg') || src.includes('.jpeg') || src.includes('.png')) {
      return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    return src;
  }, [src]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
  }, []);

  return (
    <div className={clsx('relative overflow-hidden', className)}>
      {placeholder === 'blur' && blurDataURL && !isLoaded && (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110"
          aria-hidden="true"
        />
      )}
      
      <picture>
        <source srcSet={webpSrc} type="image/webp" />
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={clsx(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      </picture>
      
      {hasError && (
        <div className="absolute inset-0 bg-neutral-100 flex items-center justify-center">
          <span className="text-neutral-400 text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Memoized Card Component for lists
interface MemoizedCardProps {
  id: string;
  title: string;
  description?: string;
  image?: string;
  onClick?: () => void;
  className?: string;
}

export const MemoizedCard: React.FC<MemoizedCardProps> = memo(({
  id,
  title,
  description,
  image,
  onClick,
  className,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const cardVariants = useMemo(() => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: shouldReduceMotion ? {} : { y: -4, scale: 1.02 },
  }), [shouldReduceMotion]);

  return (
    <motion.div
      className={clsx(
        'glass rounded-2xl p-6 cursor-pointer hover-lift-subtle',
        className
      )}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      onClick={onClick}
      layout
    >
      {image && (
        <OptimizedImage
          src={image}
          alt={title}
          className="w-full h-48 rounded-lg mb-4"
        />
      )}
      
      <h3 className="text-lg font-semibold text-neutral-800 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-neutral-600 text-sm line-clamp-3">
          {description}
        </p>
      )}
    </motion.div>
  );
});

MemoizedCard.displayName = 'MemoizedCard';

// Virtual List Component for large datasets
interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
    }));
  }, [items, itemHeight, scrollTop, containerHeight, overscan]);

  const totalHeight = items.length * itemHeight;
  const offsetY = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan) * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      className={clsx('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(({ item, index }) => (
            <div key={index} style={{ height: itemHeight }}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Lazy Loading Wrapper with Intersection Observer
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback = <div className="animate-pulse bg-neutral-200 rounded h-32" />,
  rootMargin = '50px',
  threshold = 0.1,
  className,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : fallback}
    </div>
  );
};

// Performance Monitor Hook
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = React.useState({
    renderTime: 0,
    memoryUsage: 0,
    fps: 0,
  });

  React.useEffect(() => {
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

    measureFPS();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  const measureRenderTime = useCallback((fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    
    setMetrics(prev => ({
      ...prev,
      renderTime: end - start,
    }));
  }, []);

  return { metrics, measureRenderTime };
};

// Debounced Input Component
interface DebouncedInputProps {
  value: string;
  onChange: (value: string) => void;
  delay?: number;
  placeholder?: string;
  className?: string;
}

export const DebouncedInput: React.FC<DebouncedInputProps> = memo(({
  value,
  onChange,
  delay = 300,
  placeholder,
  className,
}) => {
  const [localValue, setLocalValue] = React.useState(value);

  // Debounce the onChange callback
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, delay);

    return () => clearTimeout(timer);
  }, [localValue, onChange, delay]);

  // Update local value when prop changes
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <input
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      placeholder={placeholder}
      className={clsx(
        'w-full px-4 py-2 border border-neutral-300 rounded-lg',
        'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
        'transition-colors duration-200',
        className
      )}
    />
  );
});

DebouncedInput.displayName = 'DebouncedInput';

export default {
  OptimizedImage,
  MemoizedCard,
  VirtualList,
  LazyWrapper,
  usePerformanceMonitor,
  DebouncedInput,
};
