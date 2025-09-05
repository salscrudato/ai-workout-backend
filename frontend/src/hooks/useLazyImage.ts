import { useState, useEffect, useRef } from 'react';

export interface LazyImageOptions {
  threshold?: number;
  rootMargin?: string;
  placeholder?: string;
  fallback?: string;
}

export interface LazyImageState {
  src: string | undefined;
  isLoading: boolean;
  isLoaded: boolean;
  hasError: boolean;
}

/**
 * Custom hook for lazy loading images with performance optimization
 * 
 * Features:
 * - Intersection Observer for performance
 * - Placeholder and fallback support
 * - Loading states
 * - Error handling
 * - Mobile-optimized
 */
export const useLazyImage = (
  imageSrc: string,
  options: LazyImageOptions = {}
): LazyImageState & { ref: React.RefObject<HTMLImageElement> } => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    placeholder,
    fallback,
  } = options;

  const [state, setState] = useState<LazyImageState>({
    src: placeholder,
    isLoading: false,
    isLoaded: false,
    hasError: false,
  });

  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const imgElement = imgRef.current;
    if (!imgElement || !imageSrc) return;

    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState(prev => ({ ...prev, isLoading: true }));
          
          // Create new image to preload
          const img = new Image();
          
          img.onload = () => {
            setState({
              src: imageSrc,
              isLoading: false,
              isLoaded: true,
              hasError: false,
            });
          };
          
          img.onerror = () => {
            setState({
              src: fallback || placeholder,
              isLoading: false,
              isLoaded: false,
              hasError: true,
            });
          };
          
          img.src = imageSrc;
          
          // Stop observing once loaded
          observerRef.current?.unobserve(imgElement);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current.observe(imgElement);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [imageSrc, threshold, rootMargin, placeholder, fallback]);

  return {
    ...state,
    ref: imgRef,
  };
};

export default useLazyImage;
