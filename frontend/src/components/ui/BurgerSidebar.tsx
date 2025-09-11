import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, Home, Zap, History, User, LogOut, Dumbbell } from 'lucide-react';
import { clsx } from 'clsx';

interface BurgerSidebarProps {
  className?: string;
}

const BurgerSidebar: React.FC<BurgerSidebarProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();

  // Close sidebar function with useCallback to prevent unnecessary re-renders
  const closeSidebar = useCallback(() => {
    console.log('🔧 Closing sidebar'); // Debug log
    setIsOpen(false);
  }, []);

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        closeSidebar();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when sidebar is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeSidebar]);

  // Close sidebar when route changes
  useEffect(() => {
    closeSidebar();
  }, [location.pathname, closeSidebar]);

  const navigationItems = [
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

  const handleSignOut = async () => {
    try {
      await signOut();
      closeSidebar();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <>
      {/* Burger Menu Button */}
      <button
        onClick={() => {
          console.log('🍔 Opening sidebar'); // Debug log
          setIsOpen(true);
        }}
        className={clsx(
          'fixed top-4 left-4 sm:top-6 sm:left-6 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors',
          className
        )}
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 cursor-pointer"
          onClick={(e) => {
            console.log('🌫️ Overlay clicked'); // Debug log
            e.stopPropagation();
            closeSidebar();
          }}
          role="button"
          tabIndex={-1}
          aria-label="Close sidebar"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              closeSidebar();
            }
          }}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside sidebar from closing it
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">AI Workout</h2>
            </div>
          </div>
          <button
            onClick={(e) => {
              console.log('❌ Close button clicked'); // Debug log
              e.stopPropagation();
              closeSidebar();
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-6">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    onClick={closeSidebar}
                    className={clsx(
                      'flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sign Out Button */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default BurgerSidebar;
