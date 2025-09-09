import React, { useEffect, useRef, useCallback, useState } from 'react';
import { clsx } from 'clsx';

/**
 * Keyboard Navigation Utilities
 * 
 * Provides comprehensive keyboard navigation support including:
 * - Focus management and trapping
 * - Arrow key navigation for lists and grids
 * - Tab order management
 * - Escape key handling
 * - Custom keyboard shortcuts
 */

// Hook for managing focus trap within a container
export const useFocusTrap = (isActive: boolean = true) => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    // Focus the first element when trap becomes active
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return containerRef;
};

// Hook for arrow key navigation in lists
export const useArrowNavigation = (
  items: HTMLElement[],
  orientation: 'horizontal' | 'vertical' | 'grid' = 'vertical',
  gridColumns?: number
) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!items.length) return;

    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        if (orientation === 'vertical') {
          newIndex = Math.min(currentIndex + 1, items.length - 1);
        } else if (orientation === 'grid' && gridColumns) {
          newIndex = Math.min(currentIndex + gridColumns, items.length - 1);
        }
        break;

      case 'ArrowUp':
        if (orientation === 'vertical') {
          newIndex = Math.max(currentIndex - 1, 0);
        } else if (orientation === 'grid' && gridColumns) {
          newIndex = Math.max(currentIndex - gridColumns, 0);
        }
        break;

      case 'ArrowRight':
        if (orientation === 'horizontal') {
          newIndex = Math.min(currentIndex + 1, items.length - 1);
        } else if (orientation === 'grid') {
          newIndex = Math.min(currentIndex + 1, items.length - 1);
        }
        break;

      case 'ArrowLeft':
        if (orientation === 'horizontal') {
          newIndex = Math.max(currentIndex - 1, 0);
        } else if (orientation === 'grid') {
          newIndex = Math.max(currentIndex - 1, 0);
        }
        break;

      case 'Home':
        newIndex = 0;
        break;

      case 'End':
        newIndex = items.length - 1;
        break;

      default:
        return;
    }

    if (newIndex !== currentIndex) {
      event.preventDefault();
      setCurrentIndex(newIndex);
      items[newIndex]?.focus();
    }
  }, [currentIndex, items, orientation, gridColumns]);

  return {
    currentIndex,
    setCurrentIndex,
    handleKeyDown,
  };
};

// Accessible list component with keyboard navigation
export interface KeyboardNavigableListProps {
  children: React.ReactNode[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  onSelectionChange?: (index: number) => void;
  role?: string;
}

export const KeyboardNavigableList: React.FC<KeyboardNavigableListProps> = ({
  children,
  orientation = 'vertical',
  className,
  onSelectionChange,
  role = 'list',
}) => {
  const listRef = useRef<HTMLUListElement>(null);
  const [items, setItems] = useState<HTMLElement[]>([]);
  const { currentIndex, handleKeyDown } = useArrowNavigation(items, orientation);

  useEffect(() => {
    if (listRef.current) {
      const listItems = Array.from(
        listRef.current.querySelectorAll('[role="listitem"], li')
      ) as HTMLElement[];
      setItems(listItems);
    }
  }, [children]);

  useEffect(() => {
    onSelectionChange?.(currentIndex);
  }, [currentIndex, onSelectionChange]);

  useEffect(() => {
    const list = listRef.current;
    if (list) {
      list.addEventListener('keydown', handleKeyDown);
      return () => list.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown]);

  return (
    <ul
      ref={listRef}
      role={role}
      className={clsx('focus:outline-none', className)}
      tabIndex={0}
    >
      {children.map((child, index) => (
        <li
          key={index}
          role="listitem"
          tabIndex={-1}
          className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        >
          {child}
        </li>
      ))}
    </ul>
  );
};

// Hook for custom keyboard shortcuts
export const useKeyboardShortcuts = (shortcuts: Record<string, () => void>) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = [
        event.ctrlKey && 'ctrl',
        event.metaKey && 'meta',
        event.altKey && 'alt',
        event.shiftKey && 'shift',
        event.key.toLowerCase(),
      ]
        .filter(Boolean)
        .join('+');

      const handler = shortcuts[key];
      if (handler) {
        event.preventDefault();
        handler();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// Accessible dropdown with keyboard navigation
export interface KeyboardDropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  className?: string;
}

export const KeyboardDropdown: React.FC<KeyboardDropdownProps> = ({
  trigger,
  children,
  isOpen,
  onToggle,
  onClose,
  className,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [items, setItems] = useState<HTMLElement[]>([]);
  const { currentIndex, setCurrentIndex, handleKeyDown } = useArrowNavigation(items, 'vertical');

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const dropdownItems = Array.from(
        dropdownRef.current.querySelectorAll('[role="menuitem"], button, a')
      ) as HTMLElement[];
      setItems(dropdownItems);
      setCurrentIndex(0);
      dropdownItems[0]?.focus();
    }
  }, [isOpen, children, setCurrentIndex]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
        triggerRef.current?.focus();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      dropdownRef.current.addEventListener('keydown', handleKeyDown);
      return () => dropdownRef.current?.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  return (
    <div className={clsx('relative', className)}>
      <button
        ref={triggerRef}
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' && !isOpen) {
            event.preventDefault();
            onToggle();
          }
        }}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          role="menu"
          className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-full"
        >
          {children.map((child, index) => (
            <div
              key={index}
              role="menuitem"
              tabIndex={-1}
              className="focus:outline-none focus:bg-blue-50 hover:bg-blue-50"
            >
              {child}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Accessible tabs with keyboard navigation
export interface KeyboardTabsProps {
  tabs: Array<{ id: string; label: string; content: React.ReactNode }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const KeyboardTabs: React.FC<KeyboardTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
}) => {
  const tabListRef = useRef<HTMLDivElement>(null);
  const [tabElements, setTabElements] = useState<HTMLElement[]>([]);
  const { handleKeyDown } = useArrowNavigation(tabElements, 'horizontal');

  useEffect(() => {
    if (tabListRef.current) {
      const tabs = Array.from(
        tabListRef.current.querySelectorAll('[role="tab"]')
      ) as HTMLElement[];
      setTabElements(tabs);
    }
  }, [tabs]);

  useEffect(() => {
    if (tabListRef.current) {
      tabListRef.current.addEventListener('keydown', handleKeyDown);
      return () => tabListRef.current?.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown]);

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={clsx('w-full', className)}>
      <div
        ref={tabListRef}
        role="tablist"
        className="flex border-b border-gray-200"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            className={clsx(
              'px-4 py-2 font-medium text-sm border-b-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="mt-4"
      >
        {activeTabContent}
      </div>
    </div>
  );
};
