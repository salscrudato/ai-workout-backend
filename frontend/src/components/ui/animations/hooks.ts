import { useEffect, useRef, useState } from 'react';
import { useAnimation, useInView } from 'framer-motion';

/**
 * Custom hooks for animations
 */

// Hook for scroll-triggered animations
export const useScrollAnimation = (threshold = 0.1) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: threshold });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('animate');
    }
  }, [isInView, controls]);

  return { ref, controls, isInView };
};

// Hook for stagger animations
export const useStaggerAnimation = (delay = 0.1) => {
  const controls = useAnimation();

  const startStagger = async (items: number) => {
    for (let i = 0; i < items; i++) {
      await new Promise(resolve => setTimeout(resolve, delay * 1000));
      controls.start('animate');
    }
  };

  return { controls, startStagger };
};

// Hook for counter animations
export const useCountUp = (end: number, duration = 2000, start = 0) => {
  const [count, setCount] = useState(start);
  const [isAnimating, setIsAnimating] = useState(false);

  const startAnimation = () => {
    setIsAnimating(true);
    const startTime = Date.now();
    const startValue = count;
    const difference = end - startValue;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + difference * easeOut);

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  };

  return { count, startAnimation, isAnimating };
};

// Hook for typing animation
export const useTypewriter = (text: string, speed = 50) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const startTyping = () => {
    setIsTyping(true);
    setDisplayText('');
    
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(prev => prev + text[index]);
        index++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, speed);

    return () => clearInterval(timer);
  };

  return { displayText, startTyping, isTyping };
};

// Hook for parallax effect
export const useParallax = (speed = 0.5) => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.pageYOffset * speed);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return offset;
};

// Hook for mouse tracking
export const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return mousePosition;
};

// Hook for intersection observer with animation
export const useIntersectionAnimation = (
  threshold = 0.1,
  rootMargin = '0px'
) => {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          controls.start('animate');
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, rootMargin, controls]);

  return { ref, isVisible, controls };
};

// Hook for gesture handling
export const useGesture = () => {
  const [gesture, setGesture] = useState<{
    isDragging: boolean;
    dragOffset: { x: number; y: number };
    scale: number;
    rotation: number;
  }>({
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    scale: 1,
    rotation: 0,
  });

  const handleDragStart = () => {
    setGesture(prev => ({ ...prev, isDragging: true }));
  };

  const handleDragEnd = () => {
    setGesture(prev => ({ 
      ...prev, 
      isDragging: false,
      dragOffset: { x: 0, y: 0 }
    }));
  };

  const handleDrag = (offset: { x: number; y: number }) => {
    setGesture(prev => ({ ...prev, dragOffset: offset }));
  };

  return {
    gesture,
    handlers: {
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
      onDrag: handleDrag,
    },
  };
};

// Hook for performance monitoring
export const useAnimationPerformance = () => {
  const [fps, setFps] = useState(60);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    const measureFPS = () => {
      frameCount.current++;
      const now = performance.now();
      
      if (now - lastTime.current >= 1000) {
        setFps(Math.round((frameCount.current * 1000) / (now - lastTime.current)));
        frameCount.current = 0;
        lastTime.current = now;
      }
      
      requestAnimationFrame(measureFPS);
    };

    const animationId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return { fps };
};
