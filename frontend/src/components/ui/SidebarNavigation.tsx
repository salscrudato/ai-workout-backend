import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Dumbbell, LogOut } from 'lucide-react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from './Button';
import Badge from './Badge';

export interface SidebarNavigationProps {
  className?: string;
}

/**
 * Sidebar Navigation Component for Desktop
 * 
 * Features:
 * - Collapsible sidebar with smooth animations
 * - Blue gradient active states
 * - User profile section
 * - Badge support for notifications
 * - Keyboard navigation support
 */
const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ className }) => {
  const { navigationItems, activeItem, setActiveItem, isSidebarCollapsed, toggleSidebar } = useNavigation();
  const { user, profile, signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <motion.aside
      animate={{
        width: isSidebarCollapsed ? 64 : 256,
      }}
      transition={{
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={clsx(
        // Base styles with enhanced glass morphism
        'fixed left-0 top-0 bottom-0 z-40',
        'glass shadow-glass-lg border-r border-white/20',
        'shadow-2xl shadow-black/10 dark:shadow-black/30',
        // Custom className
        className,
        'motion-reduce:transition-none motion-reduce:transform-none'
      )}
    >
      {/* Header with enhanced animations */}
      <div className="flex items-center justify-between p-6 border-b border-white/20">
        <AnimatePresence mode="wait">
          {!isSidebarCollapsed ? (
            <motion.div
              key="expanded"
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="gradient-primary p-3 rounded-2xl shadow-glow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Dumbbell className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold gradient-text-primary">AI Workout</h1>
                <p className="text-sm text-neutral-500 font-medium">Your AI Trainer</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              className="gradient-primary p-3 rounded-2xl shadow-glow-lg mx-auto"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
            >
              <Dumbbell className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="ml-auto"
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <motion.div
              animate={{ rotate: isSidebarCollapsed ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          </Button>
        </motion.div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto" role="navigation" aria-label="Sidebar navigation">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || activeItem === item.id;
          
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setActiveItem(item.id)}
              className={clsx(
                // Base styles
                'group relative flex items-center rounded-xl',
                'transition-all duration-300 ease-out',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                // Padding based on collapsed state
                isSidebarCollapsed ? 'p-3 justify-center' : 'px-3 py-3',
                // Active/inactive states
                isActive
                  ? [
                      'bg-gradient-to-r from-primary-50 to-accent-50',
                      'text-primary-700 dark:text-primary-300',
                      'shadow-sm',
                      'border border-primary-200 dark:border-primary-800/40',
                    ]
                  : [
                      'text-secondary-600 dark:text-secondary-400',
                      'hover:text-primary-600 dark:hover:text-primary-400',
                      'hover:bg-primary-50 dark:hover:bg-primary-900/20',
                      'hover:shadow-sm',
                    ],
                // Disabled state
                item.disabled && 'opacity-50 pointer-events-none'
              )}
              title={isSidebarCollapsed ? item.label : undefined}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Icon */}
              <div className="relative flex items-center justify-center w-5 h-5">
                <Icon
                  className={clsx(
                    'w-5 h-5 transition-all duration-300',
                    isActive ? 'text-primary-600' : 'text-current',
                    'group-hover:scale-110'
                  )}
                />
                
                {/* Badge for collapsed state */}
                {item.badge && isSidebarCollapsed && (
                  <div className="absolute -top-1 -right-1">
                    <Badge
                      variant="error"
                      size="sm"
                      className="min-w-[16px] h-4 text-xs px-1"
                    >
                      {item.badge}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Label and badge for expanded state */}
              {!isSidebarCollapsed && (
                <div className="flex items-center justify-between flex-1 ml-3">
                  <span
                    className={clsx(
                      'font-medium transition-colors duration-300',
                      isActive ? 'text-primary-700' : 'text-current'
                    )}
                  >
                    {item.label}
                  </span>
                  
                  {item.badge && (
                    <Badge
                      variant="error"
                      size="sm"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
              )}

              {/* Active indicator */}
              {isActive && (
                <div
                  className={clsx(
                    'absolute right-0 top-1/2 transform -translate-y-1/2',
                    'w-1 h-8 rounded-l-full',
                    'bg-gradient-to-b from-primary-500 to-accent-500',
                    'animate-fade-in'
                  )}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      {user && (
        <div className="border-t border-white/15 dark:border-white/10 p-4 space-y-3">
          <div
            className={clsx(
              'flex items-center space-x-3 p-3 rounded-xl',
              'bg-secondary-50 hover:bg-secondary-100',
              'transition-colors duration-200',
              isSidebarCollapsed && 'justify-center'
            )}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>

            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-900 truncate">
                  {(profile as any)?.name || user.email?.split('@')[0]}
                </p>
                <p className="text-xs text-secondary-500 truncate">
                  {user.email}
                </p>
              </div>
            )}
          </div>

          {/* Sign Out Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className={clsx(
                'w-full justify-start text-secondary-600 hover:text-red-600',
                'hover:bg-red-50 transition-colors duration-200',
                isSidebarCollapsed && 'justify-center px-2'
              )}
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
              {!isSidebarCollapsed && (
                <span className="ml-2">Sign Out</span>
              )}
            </Button>
          </motion.div>
        </div>
      )}
    </motion.aside>
  );
};

export default SidebarNavigation;
