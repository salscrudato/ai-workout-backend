import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import BurgerSidebar from './BurgerSidebar';

export interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Main Application Layout Component
 *
 * Features:
 * - Burger sidebar navigation
 * - Clean content area
 * - Profile setup detection
 */
const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  className,
}) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Check if we're on the profile setup page
  const isProfileSetup = location.pathname === '/profile-setup';

  if (!isAuthenticated) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Burger Sidebar - Hidden during profile setup */}
      {!isProfileSetup && <BurgerSidebar />}

      {/* Main Content Area */}
      <main
        role="main"
        aria-label="Main content"
        className={className}
      >
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
