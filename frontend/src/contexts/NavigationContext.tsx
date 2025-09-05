import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  disabled?: boolean;
}

export interface NavigationState {
  isMobileMenuOpen: boolean;
  isSidebarCollapsed: boolean;
  activeItem: string;
  navigationItems: NavigationItem[];
}

export interface NavigationActions {
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleSidebar: () => void;
  setActiveItem: (itemId: string) => void;
  updateNavigationItems: (items: NavigationItem[]) => void;
}

export interface NavigationContextType extends NavigationState, NavigationActions {}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export interface NavigationProviderProps {
  children: ReactNode;
  initialItems?: NavigationItem[];
}

/**
 * Navigation Provider Component
 * 
 * Manages global navigation state including:
 * - Mobile menu visibility
 * - Sidebar collapse state
 * - Active navigation item
 * - Navigation items configuration
 */
export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
  initialItems = [],
}) => {
  const location = useLocation();
  
  const [state, setState] = useState<NavigationState>({
    isMobileMenuOpen: false,
    isSidebarCollapsed: false,
    activeItem: 'dashboard', // Default to dashboard, will be updated by useEffect
    navigationItems: initialItems,
  });

  // Actions
  const toggleMobileMenu = useCallback(() => {
    setState(prev => ({
      ...prev,
      isMobileMenuOpen: !prev.isMobileMenuOpen,
    }));
  }, []);

  const closeMobileMenu = useCallback(() => {
    setState(prev => ({
      ...prev,
      isMobileMenuOpen: false,
    }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setState(prev => ({
      ...prev,
      isSidebarCollapsed: !prev.isSidebarCollapsed,
    }));
  }, []);

  const setActiveItem = useCallback((itemId: string) => {
    setState(prev => ({
      ...prev,
      activeItem: itemId,
    }));
  }, []);

  const updateNavigationItems = useCallback((items: NavigationItem[]) => {
    setState(prev => ({
      ...prev,
      navigationItems: items,
    }));
  }, []);

  // Update active item when location changes (simplified to avoid infinite loops)
  React.useEffect(() => {
    if (state.navigationItems.length > 0) {
      const item = state.navigationItems.find(item => item.path === location.pathname);
      const activeId = item?.id || 'dashboard';
      if (activeId !== state.activeItem) {
        setState(prev => ({
          ...prev,
          activeItem: activeId,
        }));
      }
    }
  }, [location.pathname]); // Only depend on pathname to avoid infinite loops

  const contextValue: NavigationContextType = {
    ...state,
    toggleMobileMenu,
    closeMobileMenu,
    toggleSidebar,
    setActiveItem,
    updateNavigationItems,
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};

/**
 * Hook to use Navigation Context
 */
export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export default NavigationContext;
