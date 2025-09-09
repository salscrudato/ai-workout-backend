import React, { useEffect } from 'react';
import { clsx } from 'clsx';
import { Plus, Home, Zap, History, User } from 'lucide-react';
import { useNavigation, NavigationItem } from '../../contexts/NavigationContext';
import { useAuth } from '../../contexts/AuthContext';
import SidebarNavigation from './SidebarNavigation';
import BottomNavigation from './BottomNavigation';
import FloatingActionButton from './FloatingActionButton';

export interface AppLayoutProps {
  children: React.ReactNode;
  showFAB?: boolean;
  fabAction?: () => void;
  fabIcon?: React.ReactNode;
  fabLabel?: string;
  className?: string;
}

/**
 * Main Application Layout Component
 * 
 * Features:
 * - Responsive navigation (sidebar for desktop, bottom nav for mobile)
 * - Floating Action Button for quick actions
 * - Automatic navigation item setup
 * - Content area with proper spacing
 * - Blue gradient theme integration
 */
const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showFAB = true,
  fabAction,
  fabIcon = <Plus className="w-6 h-6" />,
  fabLabel = "Generate Workout",
  className,
}) => {
  const { updateNavigationItems, isSidebarCollapsed } = useNavigation();
  const { isAuthenticated } = useAuth();

  // Setup navigation items
  useEffect(() => {
    if (isAuthenticated) {
      const navigationItems: NavigationItem[] = [
        {
          id: 'dashboard',
          label: 'Dashboard',
          path: '/dashboard',
          icon: Home,
        },
        {
          id: 'generate',
          label: 'Generate',
          path: '/generate',
          icon: Zap,
        },
        {
          id: 'history',
          label: 'History',
          path: '/history',
          icon: History,
        },

        {
          id: 'profile',
          label: 'Profile',
          path: '/profile',
          icon: User,
        },
      ];

      updateNavigationItems(navigationItems);
    }
  }, [isAuthenticated, updateNavigationItems]);

  if (!isAuthenticated) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className="min-h-screen gradient-subtle transition-colors duration-300">
      {/* Desktop Sidebar Navigation */}
      <div className="hidden lg:block">
        <SidebarNavigation />
      </div>

      {/* Main Content Area */}
      <main
        role="main"
        aria-label="Main content"
        className={clsx(
          // Base styles
          'min-h-screen transition-all duration-300 motion-reduce:transition-none',
          // Desktop: adjust for sidebar
          'lg:ml-64',
          isSidebarCollapsed && 'lg:ml-16',
          // Mobile: adjust for bottom navigation
          'pb-20 lg:pb-0',
          // Custom className
          className
        )}
      >
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden pb-safe-bottom">
        <BottomNavigation />
      </div>

      {/* Floating Action Button */}
      {showFAB && (
        <FloatingActionButton
          variant="gradient"
          size="lg"
          icon={fabIcon}
          label={fabLabel}
          extended={false}
          position="bottom-right"
          onClick={fabAction}
          className={clsx(
            // Adjust position for mobile bottom nav
            'lg:bottom-6 lg:right-6',
            'bottom-24 right-6',
            // Add pulse animation for attention
            'animate-pulse hover:animate-none motion-reduce:animate-none'
          )}
        />
      )}
    </div>
  );
};

export default AppLayout;
