/**
 * Accessibility Utilities
 * 
 * Provides utilities for WCAG 2.1 AA compliance and enhanced accessibility
 */

// Focus management utilities
export const focusManagement = {
  /**
   * Trap focus within a container element
   */
  trapFocus: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  },

  /**
   * Restore focus to a previously focused element
   */
  restoreFocus: (element: HTMLElement | null) => {
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  },

  /**
   * Get the next focusable element
   */
  getNextFocusableElement: (currentElement: HTMLElement, container?: HTMLElement) => {
    const root = container || document;
    const focusableElements = Array.from(
      root.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[];

    const currentIndex = focusableElements.indexOf(currentElement);
    return focusableElements[currentIndex + 1] || focusableElements[0];
  },

  /**
   * Get the previous focusable element
   */
  getPreviousFocusableElement: (currentElement: HTMLElement, container?: HTMLElement) => {
    const root = container || document;
    const focusableElements = Array.from(
      root.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[];

    const currentIndex = focusableElements.indexOf(currentElement);
    return focusableElements[currentIndex - 1] || focusableElements[focusableElements.length - 1];
  },
};

// Screen reader utilities
export const screenReader = {
  /**
   * Announce a message to screen readers
   */
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;

    document.body.appendChild(announcer);

    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  },

  /**
   * Create a visually hidden element for screen readers
   */
  createVisuallyHidden: (text: string) => {
    const element = document.createElement('span');
    element.className = 'sr-only';
    element.textContent = text;
    return element;
  },
};

// Color contrast utilities
export const colorContrast = {
  /**
   * Calculate relative luminance of a color
   */
  getLuminance: (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio: (color1: [number, number, number], color2: [number, number, number]) => {
    const lum1 = colorContrast.getLuminance(...color1);
    const lum2 = colorContrast.getLuminance(...color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  },

  /**
   * Check if contrast ratio meets WCAG AA standards
   */
  meetsWCAGAA: (contrastRatio: number, isLargeText = false) => {
    return isLargeText ? contrastRatio >= 3 : contrastRatio >= 4.5;
  },

  /**
   * Check if contrast ratio meets WCAG AAA standards
   */
  meetsWCAGAAA: (contrastRatio: number, isLargeText = false) => {
    return isLargeText ? contrastRatio >= 4.5 : contrastRatio >= 7;
  },
};

// Keyboard navigation utilities
export const keyboardNavigation = {
  /**
   * Handle arrow key navigation in a list
   */
  handleArrowNavigation: (
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onIndexChange: (newIndex: number) => void,
    orientation: 'horizontal' | 'vertical' = 'vertical'
  ) => {
    const { key } = event;
    let newIndex = currentIndex;

    if (orientation === 'vertical') {
      if (key === 'ArrowDown') {
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      } else if (key === 'ArrowUp') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      }
    } else {
      if (key === 'ArrowRight') {
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      } else if (key === 'ArrowLeft') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      }
    }

    if (newIndex !== currentIndex) {
      event.preventDefault();
      onIndexChange(newIndex);
      items[newIndex]?.focus();
    }
  },

  /**
   * Handle Enter and Space key activation
   */
  handleActivation: (event: KeyboardEvent, callback: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  },

  /**
   * Handle Escape key
   */
  handleEscape: (event: KeyboardEvent, callback: () => void) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      callback();
    }
  },
};

// ARIA utilities
export const aria = {
  /**
   * Generate a unique ID for ARIA relationships
   */
  generateId: (prefix = 'aria') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Set up ARIA describedby relationship
   */
  setDescribedBy: (element: HTMLElement, descriptionId: string) => {
    const existingIds = element.getAttribute('aria-describedby') || '';
    const ids = existingIds.split(' ').filter(id => id.length > 0);
    
    if (!ids.includes(descriptionId)) {
      ids.push(descriptionId);
      element.setAttribute('aria-describedby', ids.join(' '));
    }
  },

  /**
   * Remove ARIA describedby relationship
   */
  removeDescribedBy: (element: HTMLElement, descriptionId: string) => {
    const existingIds = element.getAttribute('aria-describedby') || '';
    const ids = existingIds.split(' ').filter(id => id.length > 0 && id !== descriptionId);
    
    if (ids.length > 0) {
      element.setAttribute('aria-describedby', ids.join(' '));
    } else {
      element.removeAttribute('aria-describedby');
    }
  },

  /**
   * Set up ARIA labelledby relationship
   */
  setLabelledBy: (element: HTMLElement, labelId: string) => {
    element.setAttribute('aria-labelledby', labelId);
  },

  /**
   * Set ARIA expanded state
   */
  setExpanded: (element: HTMLElement, expanded: boolean) => {
    element.setAttribute('aria-expanded', expanded.toString());
  },

  /**
   * Set ARIA selected state
   */
  setSelected: (element: HTMLElement, selected: boolean) => {
    element.setAttribute('aria-selected', selected.toString());
  },

  /**
   * Set ARIA pressed state
   */
  setPressed: (element: HTMLElement, pressed: boolean) => {
    element.setAttribute('aria-pressed', pressed.toString());
  },
};

// Motion and animation utilities for accessibility
export const motionAccessibility = {
  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Get animation duration based on user preference
   */
  getAnimationDuration: (normalDuration: number, reducedDuration = 0) => {
    return motionAccessibility.prefersReducedMotion() ? reducedDuration : normalDuration;
  },

  /**
   * Create a media query listener for reduced motion preference
   */
  createReducedMotionListener: (callback: (prefersReduced: boolean) => void) => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => callback(e.matches);
    
    mediaQuery.addEventListener('change', handler);
    callback(mediaQuery.matches); // Call immediately with current state
    
    return () => mediaQuery.removeEventListener('change', handler);
  },
};

// High contrast mode utilities
export const highContrast = {
  /**
   * Check if high contrast mode is enabled
   */
  isHighContrastMode: () => {
    return window.matchMedia('(prefers-contrast: high)').matches;
  },

  /**
   * Create a media query listener for high contrast preference
   */
  createHighContrastListener: (callback: (prefersHighContrast: boolean) => void) => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    const handler = (e: MediaQueryListEvent) => callback(e.matches);
    
    mediaQuery.addEventListener('change', handler);
    callback(mediaQuery.matches); // Call immediately with current state
    
    return () => mediaQuery.removeEventListener('change', handler);
  },
};
