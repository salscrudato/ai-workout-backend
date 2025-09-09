/**
 * Browser Compatibility Utilities
 * 
 * Provides feature detection and fallbacks for cross-browser compatibility
 */

// Feature detection utilities
export const featureDetection = {
  /**
   * Check if CSS backdrop-filter is supported
   */
  supportsBackdropFilter: (): boolean => {
    return CSS.supports('backdrop-filter', 'blur(1px)') || 
           CSS.supports('-webkit-backdrop-filter', 'blur(1px)');
  },

  /**
   * Check if CSS Grid is supported
   */
  supportsGrid: (): boolean => {
    return CSS.supports('display', 'grid');
  },

  /**
   * Check if CSS Flexbox is supported
   */
  supportsFlexbox: (): boolean => {
    return CSS.supports('display', 'flex');
  },

  /**
   * Check if CSS custom properties (variables) are supported
   */
  supportsCustomProperties: (): boolean => {
    return CSS.supports('--test', '0');
  },

  /**
   * Check if Intersection Observer is supported
   */
  supportsIntersectionObserver: (): boolean => {
    return 'IntersectionObserver' in window;
  },

  /**
   * Check if ResizeObserver is supported
   */
  supportsResizeObserver: (): boolean => {
    return 'ResizeObserver' in window;
  },

  /**
   * Check if Web Animations API is supported
   */
  supportsWebAnimations: (): boolean => {
    return 'animate' in document.createElement('div');
  },

  /**
   * Check if CSS containment is supported
   */
  supportsContainment: (): boolean => {
    return CSS.supports('contain', 'layout');
  },

  /**
   * Check if prefers-reduced-motion is supported
   */
  supportsPrefersReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion)').media !== 'not all';
  },

  /**
   * Check if prefers-color-scheme is supported
   */
  supportsPrefersColorScheme: (): boolean => {
    return window.matchMedia('(prefers-color-scheme)').media !== 'not all';
  },

  /**
   * Check if touch events are supported
   */
  supportsTouchEvents: (): boolean => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  /**
   * Check if pointer events are supported
   */
  supportsPointerEvents: (): boolean => {
    return 'onpointerdown' in window;
  },
};

// Browser detection utilities
export const browserDetection = {
  /**
   * Get browser information
   */
  getBrowserInfo: () => {
    const userAgent = navigator.userAgent;
    const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
    const isFirefox = /Firefox/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && /Apple Computer/.test(navigator.vendor);
    const isEdge = /Edg/.test(userAgent);
    const isIE = /MSIE|Trident/.test(userAgent);

    return {
      isChrome,
      isFirefox,
      isSafari,
      isEdge,
      isIE,
      userAgent,
    };
  },

  /**
   * Check if browser is modern (supports ES6+ features)
   */
  isModernBrowser: (): boolean => {
    try {
      // Test for ES6 features
      eval('const test = () => {}; class Test {}');
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Get browser version
   */
  getBrowserVersion: (): string => {
    const userAgent = navigator.userAgent;
    const match = userAgent.match(/(chrome|firefox|safari|edge|msie|trident)\/?\s*(\d+)/i);
    return match ? match[2] : 'unknown';
  },
};

// Polyfill utilities
export const polyfills = {
  /**
   * Load Intersection Observer polyfill if needed
   */
  loadIntersectionObserverPolyfill: async (): Promise<void> => {
    if (!featureDetection.supportsIntersectionObserver()) {
      // Provide a basic fallback without trying to load external polyfill
      console.warn('IntersectionObserver not supported, using fallback');
      if (!('IntersectionObserver' in window)) {
        (window as any).IntersectionObserver = class {
          constructor(callback: any) {
            // Basic fallback - immediately trigger callback for all observed elements
            this.callback = callback;
          }
          observe(element: Element) {
            // Simulate intersection
            setTimeout(() => {
              this.callback([{ isIntersecting: true, target: element }]);
            }, 0);
          }
          unobserve() {}
          disconnect() {}
          callback: any;
        };
      }
    }
  },

  /**
   * Load ResizeObserver polyfill if needed
   */
  loadResizeObserverPolyfill: async (): Promise<void> => {
    if (!featureDetection.supportsResizeObserver()) {
      // Provide a basic fallback without trying to load external polyfill
      console.warn('ResizeObserver not supported, using fallback');
      if (!('ResizeObserver' in window)) {
        (window as any).ResizeObserver = class {
          constructor(callback: any) {
            this.callback = callback;
          }
          observe() {}
          unobserve() {}
          disconnect() {}
          callback: any;
        };
      }
    }
  },

  /**
   * Load Web Animations API polyfill if needed
   */
  loadWebAnimationsPolyfill: async (): Promise<void> => {
    if (!featureDetection.supportsWebAnimations()) {
      // Provide a basic fallback without trying to load external polyfill
      console.warn('Web Animations API not supported, using fallback');
      if (!('animate' in Element.prototype)) {
        (Element.prototype as any).animate = function() {
          return {
            cancel: () => {},
            finish: () => {},
            pause: () => {},
            play: () => {},
            reverse: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
          } as any;
        };
      }
    }
  },

  /**
   * Apply CSS custom properties fallback
   */
  applyCSSVariablesFallback: (): void => {
    if (!featureDetection.supportsCustomProperties()) {
      // Add fallback styles for browsers that don't support CSS variables
      const style = document.createElement('style');
      style.textContent = `
        .gradient-blue { background: #3b82f6; }
        .gradient-text-blue { color: #3b82f6; }
        .glass { background: rgba(255, 255, 255, 0.8); }
        .glass-blue { background: rgba(59, 130, 246, 0.15); }
      `;
      document.head.appendChild(style);
    }
  },
};

// Fallback utilities
export const fallbacks = {
  /**
   * Create backdrop-filter fallback
   */
  createBackdropFilterFallback: (element: HTMLElement, fallbackColor: string): void => {
    if (!featureDetection.supportsBackdropFilter()) {
      element.style.backgroundColor = fallbackColor;
      element.classList.add('backdrop-fallback');
    }
  },

  /**
   * Create CSS Grid fallback using Flexbox
   */
  createGridFallback: (container: HTMLElement): void => {
    if (!featureDetection.supportsGrid()) {
      container.style.display = 'flex';
      container.style.flexWrap = 'wrap';
      container.classList.add('grid-fallback');
      
      // Apply fallback styles to grid items
      const items = container.children;
      for (let i = 0; i < items.length; i++) {
        const item = items[i] as HTMLElement;
        item.style.flex = '1 1 auto';
        item.style.minWidth = '300px';
      }
    }
  },

  /**
   * Create smooth scrolling fallback
   */
  createSmoothScrollFallback: (): void => {
    if (!CSS.supports('scroll-behavior', 'smooth')) {
      // Add polyfill for smooth scrolling
      const links = document.querySelectorAll('a[href^="#"]');
      links.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const target = document.querySelector((link as HTMLAnchorElement).hash);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });
    }
  },

  /**
   * Create animation fallback for reduced motion
   */
  createAnimationFallback: (): void => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion || !featureDetection.supportsPrefersReducedMotion()) {
      const style = document.createElement('style');
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      `;
      document.head.appendChild(style);
    }
  },

  /**
   * Create touch event fallbacks
   */
  createTouchEventFallbacks: (): void => {
    if (!featureDetection.supportsTouchEvents()) {
      // Add mouse event listeners as fallbacks for touch events
      document.addEventListener('mousedown', (e) => {
        const touchEvent = new CustomEvent('touchstart', {
          detail: { clientX: e.clientX, clientY: e.clientY }
        });
        e.target?.dispatchEvent(touchEvent);
      });

      document.addEventListener('mousemove', (e) => {
        const touchEvent = new CustomEvent('touchmove', {
          detail: { clientX: e.clientX, clientY: e.clientY }
        });
        e.target?.dispatchEvent(touchEvent);
      });

      document.addEventListener('mouseup', (e) => {
        const touchEvent = new CustomEvent('touchend', {
          detail: { clientX: e.clientX, clientY: e.clientY }
        });
        e.target?.dispatchEvent(touchEvent);
      });
    }
  },
};

// Initialization utility
export const initializeBrowserCompatibility = async (): Promise<void> => {
  // Load necessary polyfills with error handling
  try {
    await Promise.allSettled([
      polyfills.loadIntersectionObserverPolyfill(),
      polyfills.loadResizeObserverPolyfill(),
      polyfills.loadWebAnimationsPolyfill(),
    ]);
  } catch (error) {
    console.warn('Some polyfills failed to load, but the app will continue with fallbacks:', error);
  }

  // Apply fallbacks
  polyfills.applyCSSVariablesFallback();
  fallbacks.createSmoothScrollFallback();
  fallbacks.createAnimationFallback();
  fallbacks.createTouchEventFallbacks();

  // Add browser-specific classes to body
  const browserInfo = browserDetection.getBrowserInfo();
  const body = document.body;
  
  if (browserInfo.isChrome) body.classList.add('browser-chrome');
  if (browserInfo.isFirefox) body.classList.add('browser-firefox');
  if (browserInfo.isSafari) body.classList.add('browser-safari');
  if (browserInfo.isEdge) body.classList.add('browser-edge');
  if (browserInfo.isIE) body.classList.add('browser-ie');
  
  if (!browserDetection.isModernBrowser()) {
    body.classList.add('browser-legacy');
  }

  // Add feature detection classes
  if (!featureDetection.supportsBackdropFilter()) {
    body.classList.add('no-backdrop-filter');
  }
  
  if (!featureDetection.supportsGrid()) {
    body.classList.add('no-css-grid');
  }
  
  if (!featureDetection.supportsCustomProperties()) {
    body.classList.add('no-css-variables');
  }

  console.log('Browser compatibility initialized', {
    browser: browserInfo,
    features: {
      backdropFilter: featureDetection.supportsBackdropFilter(),
      grid: featureDetection.supportsGrid(),
      customProperties: featureDetection.supportsCustomProperties(),
      intersectionObserver: featureDetection.supportsIntersectionObserver(),
      webAnimations: featureDetection.supportsWebAnimations(),
    },
  });
};
