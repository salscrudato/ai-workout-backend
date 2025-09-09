import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Enhanced Hook System for Component Logic
 * 
 * This system provides reusable hooks for common component patterns:
 * - Enhanced state management with validation
 * - Performance optimizations with memoization
 * - Accessibility helpers
 * - Animation and interaction hooks
 * - Data fetching and caching
 */

// Enhanced toggle hook with callbacks
export function useToggle(
  initialValue: boolean = false,
  options?: {
    onToggle?: (value: boolean) => void;
    onTrue?: () => void;
    onFalse?: () => void;
  }
) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(prev => {
      const newValue = !prev;
      options?.onToggle?.(newValue);
      if (newValue) {
        options?.onTrue?.();
      } else {
        options?.onFalse?.();
      }
      return newValue;
    });
  }, [options]);

  const setTrue = useCallback(() => {
    setValue(true);
    options?.onTrue?.();
  }, [options]);

  const setFalse = useCallback(() => {
    setValue(false);
    options?.onFalse?.();
  }, [options]);

  return {
    value,
    toggle,
    setTrue,
    setFalse,
    setValue,
  };
}

// Enhanced form validation hook
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: Partial<Record<keyof T, (value: any) => string | null>>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouchedState] = useState<Partial<Record<keyof T, boolean>>>({});

  const validateField = useCallback((name: keyof T, value: any) => {
    const rule = validationRules[name];
    if (rule) {
      const error = rule(value);
      setErrors(prev => ({
        ...prev,
        [name]: error,
      }));
      return error === null;
    }
    return true;
  }, [validationRules]);

  const validateAll = useCallback(() => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validationRules).forEach(key => {
      const fieldName = key as keyof T;
      const rule = validationRules[fieldName];
      if (rule) {
        const error = rule(values[fieldName]);
        if (error) {
          newErrors[fieldName] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validationRules]);

  const setValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));
    validateField(name, value);
  }, [validateField]);

  const setTouched = useCallback((name: keyof T, isTouched: boolean = true) => {
    setTouchedState(prev => ({
      ...prev,
      [name]: isTouched,
    }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouchedState({});
  }, [initialValues]);

  const isValid = useMemo(() => {
    return Object.values(errors).every(error => !error);
  }, [errors]);

  const hasErrors = useMemo(() => {
    return Object.values(errors).some(error => !!error);
  }, [errors]);

  return {
    values,
    errors,
    touched,
    isValid,
    hasErrors,
    setValue,
    setTouched,
    validateField,
    validateAll,
    reset,
  };
}

// Enhanced intersection observer hook
export function useIntersectionObserver(
  options?: IntersectionObserverInit & {
    triggerOnce?: boolean;
    onIntersect?: (entry: IntersectionObserverEntry) => void;
    onLeave?: (entry: IntersectionObserverEntry) => void;
  }
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isCurrentlyIntersecting = entry.isIntersecting;
        
        setIsIntersecting(isCurrentlyIntersecting);
        
        if (isCurrentlyIntersecting) {
          setHasIntersected(true);
          options?.onIntersect?.(entry);
          
          if (options?.triggerOnce) {
            observer.unobserve(element);
          }
        } else if (hasIntersected) {
          options?.onLeave?.(entry);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [options, hasIntersected]);

  return {
    elementRef,
    isIntersecting,
    hasIntersected,
  };
}

// Enhanced media query hook
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

// Enhanced responsive breakpoints hook
export function useBreakpoints() {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isLarge = useMediaQuery('(min-width: 1280px)');
  const isXLarge = useMediaQuery('(min-width: 1536px)');

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLarge,
    isXLarge,
    current: isMobile ? 'mobile' : isTablet ? 'tablet' : isDesktop ? 'desktop' : isLarge ? 'large' : 'xlarge',
  };
}

// Enhanced keyboard navigation hook
export function useKeyboardNavigation(
  items: any[],
  options?: {
    loop?: boolean;
    onSelect?: (item: any, index: number) => void;
    onEscape?: () => void;
  }
) {
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex(prev => {
          const next = prev + 1;
          if (next >= items.length) {
            return options?.loop ? 0 : prev;
          }
          return next;
        });
        break;

      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex(prev => {
          const next = prev - 1;
          if (next < 0) {
            return options?.loop ? items.length - 1 : prev;
          }
          return next;
        });
        break;

      case 'Enter':
        event.preventDefault();
        if (activeIndex >= 0 && activeIndex < items.length) {
          options?.onSelect?.(items[activeIndex], activeIndex);
        }
        break;

      case 'Escape':
        event.preventDefault();
        setActiveIndex(-1);
        options?.onEscape?.();
        break;
    }
  }, [items, activeIndex, options]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    activeIndex,
    setActiveIndex,
  };
}

// Enhanced focus management hook
export function useFocusManagement() {
  const focusableElementsSelector = 
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(focusableElementsSelector);
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  const restoreFocus = useCallback(() => {
    const previouslyFocusedElement = document.activeElement as HTMLElement;
    
    return () => {
      previouslyFocusedElement?.focus();
    };
  }, []);

  return {
    trapFocus,
    restoreFocus,
  };
}

// Enhanced animation hook with performance optimization
export function useAnimation(
  options?: {
    duration?: number;
    easing?: string;
    delay?: number;
    onComplete?: () => void;
  }
) {
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | undefined>(undefined);

  const animate = useCallback((
    element: HTMLElement,
    keyframes: Keyframe[],
    animationOptions?: KeyframeAnimationOptions
  ) => {
    if (!element) return;

    setIsAnimating(true);

    const animation = element.animate(keyframes, {
      duration: options?.duration || 300,
      easing: options?.easing || 'ease-out',
      delay: options?.delay || 0,
      fill: 'forwards',
      ...animationOptions,
    });

    animation.addEventListener('finish', () => {
      setIsAnimating(false);
      options?.onComplete?.();
    });

    return animation;
  }, [options]);

  const cancelAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      setIsAnimating(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimation();
    };
  }, [cancelAnimation]);

  return {
    animate,
    isAnimating,
    cancelAnimation,
  };
}

// Enhanced route management hook
export function useRouteManagement() {
  const location = useLocation();
  const navigate = useNavigate();

  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  }, [navigate]);

  const goToRoute = useCallback((path: string, options?: { replace?: boolean; state?: any }) => {
    navigate(path, options);
  }, [navigate]);

  const isCurrentRoute = useCallback((path: string) => {
    return location.pathname === path;
  }, [location.pathname]);

  const getQueryParam = useCallback((key: string) => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get(key);
  }, [location.search]);

  const setQueryParam = useCallback((key: string, value: string) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set(key, value);
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
  }, [location, navigate]);

  return {
    location,
    goBack,
    goToRoute,
    isCurrentRoute,
    getQueryParam,
    setQueryParam,
  };
}
