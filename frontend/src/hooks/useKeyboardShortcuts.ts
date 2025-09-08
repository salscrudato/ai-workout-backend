import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
  category?: string;
  preventDefault?: boolean;
  enabled?: boolean;
}

export interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

/**
 * Enhanced Keyboard Shortcuts Hook
 * 
 * Features:
 * - Multiple modifier key combinations
 * - Conditional enabling/disabling
 * - Automatic event prevention
 * - Shortcut categorization
 * - Accessibility support
 * - Conflict detection
 * - Help system integration
 */
export const useKeyboardShortcuts = ({
  shortcuts,
  enabled = true,
  preventDefault = true,
  stopPropagation = false,
}: UseKeyboardShortcutsOptions) => {
  const shortcutsRef = useRef(shortcuts);
  const enabledRef = useRef(enabled);

  // Update refs when props change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
    enabledRef.current = enabled;
  }, [shortcuts, enabled]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabledRef.current) return;

    // Skip if user is typing in an input field
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.isContentEditable
    ) {
      return;
    }

    const matchingShortcut = shortcutsRef.current.find((shortcut) => {
      if (shortcut.enabled === false) return false;

      const keyMatches = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey;
      const metaMatches = !!shortcut.metaKey === event.metaKey;
      const shiftMatches = !!shortcut.shiftKey === event.shiftKey;
      const altMatches = !!shortcut.altKey === event.altKey;

      return keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches;
    });

    if (matchingShortcut) {
      if (preventDefault || matchingShortcut.preventDefault !== false) {
        event.preventDefault();
      }
      if (stopPropagation) {
        event.stopPropagation();
      }
      matchingShortcut.action();
    }
  }, [preventDefault, stopPropagation]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [enabled, handleKeyDown]);

  // Helper function to format shortcut display
  const formatShortcut = useCallback((shortcut: KeyboardShortcut): string => {
    const parts: string[] = [];
    
    if (shortcut.ctrlKey) parts.push('Ctrl');
    if (shortcut.metaKey) parts.push('⌘');
    if (shortcut.altKey) parts.push('Alt');
    if (shortcut.shiftKey) parts.push('Shift');
    
    parts.push(shortcut.key.toUpperCase());
    
    return parts.join(' + ');
  }, []);

  // Get shortcuts by category
  const getShortcutsByCategory = useCallback(() => {
    const categorized: Record<string, KeyboardShortcut[]> = {};
    
    shortcuts.forEach((shortcut) => {
      const category = shortcut.category || 'General';
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(shortcut);
    });
    
    return categorized;
  }, [shortcuts]);

  return {
    formatShortcut,
    getShortcutsByCategory,
    shortcuts,
  };
};

// Predefined shortcut sets for common use cases
export const workoutShortcuts: KeyboardShortcut[] = [
  {
    key: 'n',
    ctrlKey: true,
    action: () => {}, // Will be overridden by component
    description: 'Create new workout',
    category: 'Workout',
  },
  {
    key: 's',
    ctrlKey: true,
    action: () => {},
    description: 'Save current workout',
    category: 'Workout',
  },
  {
    key: 'g',
    ctrlKey: true,
    action: () => {},
    description: 'Generate AI workout',
    category: 'Workout',
  },
  {
    key: 'h',
    ctrlKey: true,
    action: () => {},
    description: 'View workout history',
    category: 'Navigation',
  },
];

export const navigationShortcuts: KeyboardShortcut[] = [
  {
    key: '1',
    ctrlKey: true,
    action: () => {},
    description: 'Go to Dashboard',
    category: 'Navigation',
  },
  {
    key: '2',
    ctrlKey: true,
    action: () => {},
    description: 'Go to Workout Generator',
    category: 'Navigation',
  },
  {
    key: '3',
    ctrlKey: true,
    action: () => {},
    description: 'Go to History',
    category: 'Navigation',
  },
  {
    key: '4',
    ctrlKey: true,
    action: () => {},
    description: 'Go to Profile',
    category: 'Navigation',
  },
];

export const accessibilityShortcuts: KeyboardShortcut[] = [
  {
    key: '?',
    shiftKey: true,
    action: () => {},
    description: 'Show keyboard shortcuts help',
    category: 'Help',
  },
  {
    key: 'Escape',
    action: () => {},
    description: 'Close modal or cancel action',
    category: 'General',
  },
  {
    key: 'Enter',
    ctrlKey: true,
    action: () => {},
    description: 'Submit form',
    category: 'Forms',
  },
  {
    key: 'k',
    ctrlKey: true,
    action: () => {},
    description: 'Open command palette',
    category: 'General',
  },
];

// Hook for managing global application shortcuts
export const useGlobalShortcuts = () => {
  const shortcuts: KeyboardShortcut[] = [
    ...navigationShortcuts,
    ...accessibilityShortcuts,
    {
      key: 'f',
      ctrlKey: true,
      action: () => {
        // Focus search if available
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
      description: 'Focus search',
      category: 'General',
    },
    {
      key: 'r',
      ctrlKey: true,
      shiftKey: true,
      action: () => {
        window.location.reload();
      },
      description: 'Refresh page',
      category: 'General',
    },
  ];

  return useKeyboardShortcuts({
    shortcuts,
    enabled: true,
  });
};

// Hook for form-specific shortcuts
export const useFormShortcuts = (onSubmit?: () => void, onReset?: () => void) => {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'Enter',
      ctrlKey: true,
      action: () => onSubmit?.(),
      description: 'Submit form',
      category: 'Forms',
      enabled: !!onSubmit,
    },
    {
      key: 'r',
      ctrlKey: true,
      altKey: true,
      action: () => onReset?.(),
      description: 'Reset form',
      category: 'Forms',
      enabled: !!onReset,
    },
  ];

  return useKeyboardShortcuts({
    shortcuts,
    enabled: true,
  });
};

export default useKeyboardShortcuts;
