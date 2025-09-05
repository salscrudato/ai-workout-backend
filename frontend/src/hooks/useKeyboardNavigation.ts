import { useEffect, useCallback } from 'react';

export interface KeyboardNavigationOptions {
  enabled?: boolean;
  trapFocus?: boolean;
  autoFocus?: boolean;
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
}

/**
 * Custom hook for keyboard navigation and accessibility
 * 
 * Features:
 * - Arrow key navigation
 * - Focus trapping
 * - Escape key handling
 * - WCAG compliance
 * - Mobile-friendly
 */
export const useKeyboardNavigation = (
  containerRef: React.RefObject<HTMLElement>,
  options: KeyboardNavigationOptions = {}
) => {
  const {
    enabled = true,
    trapFocus = false,
    autoFocus = false,
    onEscape,
    onEnter,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
  } = options;

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="menuitem"]:not([disabled])',
    ].join(', ');

    return Array.from(
      containerRef.current.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];
  }, [containerRef]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const { key, target } = event;
    const focusableElements = getFocusableElements();
    const currentIndex = focusableElements.indexOf(target as HTMLElement);

    switch (key) {
      case 'Escape':
        event.preventDefault();
        onEscape?.();
        break;

      case 'Enter':
        if (target instanceof HTMLElement && target.getAttribute('role') === 'button') {
          event.preventDefault();
          target.click();
        }
        onEnter?.();
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (onArrowUp) {
          onArrowUp();
        } else if (focusableElements.length > 0) {
          const nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
          focusableElements[nextIndex]?.focus();
        }
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (onArrowDown) {
          onArrowDown();
        } else if (focusableElements.length > 0) {
          const nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
          focusableElements[nextIndex]?.focus();
        }
        break;

      case 'ArrowLeft':
        if (onArrowLeft) {
          event.preventDefault();
          onArrowLeft();
        }
        break;

      case 'ArrowRight':
        if (onArrowRight) {
          event.preventDefault();
          onArrowRight();
        }
        break;

      case 'Tab':
        if (trapFocus && focusableElements.length > 0) {
          if (event.shiftKey) {
            // Shift + Tab (backward)
            if (currentIndex <= 0) {
              event.preventDefault();
              focusableElements[focusableElements.length - 1]?.focus();
            }
          } else {
            // Tab (forward)
            if (currentIndex >= focusableElements.length - 1) {
              event.preventDefault();
              focusableElements[0]?.focus();
            }
          }
        }
        break;
    }
  }, [enabled, getFocusableElements, onEscape, onEnter, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, trapFocus]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    // Auto focus first element
    if (autoFocus) {
      const focusableElements = getFocusableElements();
      focusableElements[0]?.focus();
    }

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, enabled, autoFocus, getFocusableElements, handleKeyDown]);

  return {
    getFocusableElements,
  };
};

export default useKeyboardNavigation;
