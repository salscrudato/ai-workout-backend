import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { Home, Zap, User, Settings, Menu, X } from 'lucide-react';

/**
 * Enhanced Navigation System
 * 
 * Features:
 * - Smooth page transitions
 * - Mobile-first responsive design
 * - Premium visual effects
 * - Gesture support
 * - Breadcrumb navigation
 * - Progress indicators
 */

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  disabled?: boolean;
}

interface EnhancedNavigationProps {
  items: NavigationItem[];
  className?: string;
  variant?: 'bottom' | 'sidebar' | 'top';
  showLabels?: boolean;
  onNavigate?: (path: string) => void;
}

const defaultNavigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: Home },
  { id: 'generate', label: 'Generate', path: '/generate', icon: Zap },
  { id: 'profile', label: 'Profile', path: '/profile', icon: User },
  { id: 'settings', label: 'Settings', path: '/settings', icon: Settings }
];

const pageTransitions = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const navigationVariants = {
  bottom: {
    container: 'fixed bottom-0 left-0 right-0 z-40 glass-premium border-t border-white/20 premium-shadow-xl',
    nav: 'flex justify-around items-center px-4 py-2 safe-area-pb',
    item: 'flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-[60px] touch-target',
    icon: 'w-5 h-5 mb-1',
    label: 'text-xs font-medium'
  },
  sidebar: {
    container: 'fixed left-0 top-0 bottom-0 z-40 w-64 glass-premium border-r border-white/20 premium-shadow-xl transform transition-transform duration-300',
    nav: 'flex flex-col p-4 space-y-2 mt-16',
    item: 'flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 hover:bg-white/10 touch-target',
    icon: 'w-5 h-5',
    label: 'text-sm font-medium'
  },
  top: {
    container: 'fixed top-0 left-0 right-0 z-40 glass-premium border-b border-white/20 premium-shadow-xl',
    nav: 'flex justify-center items-center px-4 py-3',
    item: 'flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 hover:bg-white/10 touch-target',
    icon: 'w-4 h-4',
    label: 'text-sm font-medium'
  }
};

const NavigationItem = memo<{
  item: NavigationItem;
  isActive: boolean;
  variant: 'bottom' | 'sidebar' | 'top';
  showLabels: boolean;
  onClick: () => void;
}>(({ item, isActive, variant, showLabels, onClick }) => {
  const styles = navigationVariants[variant];
  const Icon = item.icon;

  return (
    <motion.button
      onClick={onClick}
      disabled={item.disabled}
      className={clsx(
        styles.item,
        {
          'text-primary-600 bg-primary-50/50': isActive,
          'text-neutral-600 hover:text-primary-600': !isActive,
          'opacity-50 cursor-not-allowed': item.disabled
        }
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative">
        <Icon className={styles.icon} />
        {item.badge && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-error-500 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1"
          >
            {item.badge}
          </motion.span>
        )}
      </div>
      {showLabels && (
        <span className={styles.label}>
          {item.label}
        </span>
      )}
    </motion.button>
  );
});

NavigationItem.displayName = 'NavigationItem';

export const EnhancedNavigation = memo<EnhancedNavigationProps>(({
  items = defaultNavigationItems,
  className,
  variant = 'bottom',
  showLabels = true,
  onNavigate
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const styles = navigationVariants[variant];

  const handleNavigate = useCallback((path: string) => {
    navigate(path);
    onNavigate?.(path);
    if (variant === 'sidebar') {
      setIsOpen(false);
    }
  }, [navigate, onNavigate, variant]);

  const toggleSidebar = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    if (variant === 'sidebar') {
      setIsOpen(false);
    }
  }, [location.pathname, variant]);

  if (variant === 'sidebar') {
    return (
      <>
        {/* Mobile menu button */}
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 glass-premium rounded-xl premium-shadow-lg lg:hidden touch-target"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.div
          initial={{ x: -256 }}
          animate={{ x: isOpen ? 0 : -256 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={clsx(styles.container, className, 'lg:translate-x-0')}
        >
          <nav className={styles.nav}>
            {items.map(item => (
              <NavigationItem
                key={item.id}
                item={item}
                isActive={location.pathname === item.path}
                variant={variant}
                showLabels={showLabels}
                onClick={() => handleNavigate(item.path)}
              />
            ))}
          </nav>
        </motion.div>
      </>
    );
  }

  return (
    <div className={clsx(styles.container, className)}>
      <nav className={styles.nav}>
        {items.map(item => (
          <NavigationItem
            key={item.id}
            item={item}
            isActive={location.pathname === item.path}
            variant={variant}
            showLabels={showLabels}
            onClick={() => handleNavigate(item.path)}
          />
        ))}
      </nav>
    </div>
  );
});

EnhancedNavigation.displayName = 'EnhancedNavigation';

// Page transition wrapper
export const PageTransition = memo<{
  children: React.ReactNode;
  className?: string;
}>(({ children, className }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransitions}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
});

PageTransition.displayName = 'PageTransition';

// Breadcrumb navigation
export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const EnhancedBreadcrumb = memo<BreadcrumbProps>(({ items, className }) => {
  const navigate = useNavigate();

  return (
    <nav className={clsx('flex items-center space-x-2 text-sm', className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-neutral-400">/</span>
          )}
          {item.path ? (
            <button
              onClick={() => navigate(item.path!)}
              className="text-primary-600 hover:text-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/30 rounded px-1"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-neutral-600 font-medium">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
});

EnhancedBreadcrumb.displayName = 'EnhancedBreadcrumb';

// Progress indicator for multi-step flows
interface ProgressIndicatorProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export const ProgressIndicator = memo<ProgressIndicatorProps>(({
  steps,
  currentStep,
  className
}) => {
  return (
    <div className={clsx('flex items-center justify-between', className)}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center">
            <motion.div
              className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300',
                {
                  'bg-primary-600 text-white': index <= currentStep,
                  'bg-neutral-200 text-neutral-600': index > currentStep
                }
              )}
              animate={{
                scale: index === currentStep ? 1.1 : 1,
                boxShadow: index === currentStep ? '0 0 0 4px rgba(59, 130, 246, 0.2)' : '0 0 0 0px transparent'
              }}
            >
              {index + 1}
            </motion.div>
            <span className={clsx(
              'mt-2 text-xs font-medium',
              {
                'text-primary-600': index <= currentStep,
                'text-neutral-500': index > currentStep
              }
            )}>
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 h-px bg-neutral-200 mx-4">
              <motion.div
                className="h-full bg-primary-600"
                initial={{ width: '0%' }}
                animate={{ width: index < currentStep ? '100%' : '0%' }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
});

ProgressIndicator.displayName = 'ProgressIndicator';
