import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

/**
 * Optimized Hooks System
 * 
 * Collection of performance-optimized custom hooks for:
 * - State management
 * - Event handling
 * - Performance monitoring
 * - Responsive design
 * - Animation control
 */

// Optimized local storage hook with memoization
export function useOptimizedLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Memoize the initial value from localStorage
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Optimized setter with useCallback
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

// Optimized debounced value hook
export function useOptimizedDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Optimized media query hook with memoization
export function useOptimizedMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// Optimized responsive breakpoints hook
export function useOptimizedBreakpoints() {
  const isMobile = useOptimizedMediaQuery('(max-width: 640px)');
  const isTablet = useOptimizedMediaQuery('(min-width: 641px) and (max-width: 1024px)');
  const isDesktop = useOptimizedMediaQuery('(min-width: 1025px)');
  const isLarge = useOptimizedMediaQuery('(min-width: 1280px)');

  return useMemo(() => ({
    isMobile,
    isTablet,
    isDesktop,
    isLarge,
    current: isMobile ? 'mobile' : isTablet ? 'tablet' : isDesktop ? 'desktop' : 'large'
  }), [isMobile, isTablet, isDesktop, isLarge]);
}

// Optimized intersection observer hook
export function useOptimizedIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLElement>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      options
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [options]);

  return [ref, isIntersecting];
}

// Optimized animation state hook
export function useOptimizedAnimation(
  trigger: boolean,
  duration: number = 300
): {
  shouldRender: boolean;
  animationState: 'entering' | 'entered' | 'exiting' | 'exited';
} {
  const [shouldRender, setShouldRender] = useState(trigger);
  const [animationState, setAnimationState] = useState<'entering' | 'entered' | 'exiting' | 'exited'>(
    trigger ? 'entered' : 'exited'
  );

  useEffect(() => {
    if (trigger) {
      setShouldRender(true);
      setAnimationState('entering');
      const timer = setTimeout(() => setAnimationState('entered'), 50);
      return () => clearTimeout(timer);
    } else {
      setAnimationState('exiting');
      const timer = setTimeout(() => {
        setAnimationState('exited');
        setShouldRender(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [trigger, duration]);

  return { shouldRender, animationState };
}

// Optimized form state hook
export function useOptimizedForm<T extends Record<string, any>>(
  initialValues: T,
  validationSchema?: (values: T) => Partial<Record<keyof T, string>>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    if (touched[field] && validationSchema) {
      const newErrors = validationSchema({ ...values, [field]: value });
      setErrors(prev => ({ ...prev, [field]: newErrors[field] }));
    }
  }, [values, touched, validationSchema]);

  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (validationSchema) {
      const newErrors = validationSchema(values);
      setErrors(prev => ({ ...prev, [field]: newErrors[field] }));
    }
  }, [values, validationSchema]);

  const validate = useCallback(() => {
    if (!validationSchema) return true;
    const newErrors = validationSchema(values);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationSchema]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validate,
    reset,
    isValid: Object.keys(errors).length === 0
  };
}

// Optimized async state hook
export function useOptimizedAsync<T, E = Error>() {
  const [state, setState] = useState<{
    data: T | null;
    error: E | null;
    loading: boolean;
  }>({
    data: null,
    error: null,
    loading: false
  });

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    setState({ data: null, error: null, loading: true });
    try {
      const data = await asyncFunction();
      setState({ data, error: null, loading: false });
      return data;
    } catch (error) {
      setState({ data: null, error: error as E, loading: false });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, error: null, loading: false });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
}

// Optimized previous value hook
export function useOptimizedPrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

// Optimized window size hook
export function useOptimizedWindowSize() {
  const [windowSize, setWindowSize] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  }));

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

// Performance monitoring hook for components
export function useOptimizedPerformance(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
  });

  useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} - Renders: ${renderCount.current}, Time: ${renderTime.toFixed(2)}ms`);
    }
    
    startTime.current = performance.now();
  });

  return {
    renderCount: renderCount.current,
    renderTime: performance.now() - startTime.current
  };
}
