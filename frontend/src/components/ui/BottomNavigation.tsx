import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useNavigation } from '../../contexts/NavigationContext';
import Badge from './Badge';

export interface BottomNavigationProps {
  className?: string;
}

/**
 * Enhanced Bottom Navigation Component for Mobile
 *
 * Features:
 * - Modern iOS/Android-style navigation
 * - Haptic feedback simulation
 * - Dynamic island-style active indicator
 * - Gesture-based interactions
 * - Smart hiding on scroll
 * - Improved accessibility
 * - Smooth spring animations
 */
const BottomNavigation: React.FC<BottomNavigationProps> = ({ className }) => {
  const { navigationItems, activeItem, setActiveItem } = useNavigation();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Enhanced scroll behavior for smart hiding
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = Math.abs(currentScrollY - lastScrollY);

      // Only hide/show if scroll difference is significant
      if (scrollDifference > 10) {
        setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100);
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Filter items for bottom navigation (typically 4-5 main items)
  const bottomNavItems = navigationItems.slice(0, 5);

  if (bottomNavItems.length === 0) {
    return null;
  }

  // Haptic feedback simulation
  const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            mass: 0.8
          }}
          className={clsx(
            // Modern mobile navigation styling
            'fixed bottom-0 left-0 right-0 z-50',
            'mx-4 mb-4 rounded-3xl',
            // Enhanced glass morphism with premium feel
            'backdrop-blur-2xl bg-white/80 dark:bg-gray-900/80',
            'border border-white/20 dark:border-gray-700/30',
            // Advanced shadow system
            'shadow-2xl shadow-black/10 dark:shadow-black/30',
            // Subtle gradient overlay
            'before:absolute before:inset-0 before:rounded-3xl',
            'before:bg-gradient-to-t before:from-blue-500/5 before:to-transparent',
            'before:pointer-events-none',
            // Safe area support
            'pb-safe-bottom',
            className
          )}
          style={{
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          }}
        >
          {/* Dynamic island-style active indicator */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
            layoutId="activeIndicator"
            initial={false}
          />

          <div className="flex items-center justify-around px-4 py-3">
            {bottomNavItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || activeItem === item.id;

              return (
                <motion.div
                  key={item.id}
                  layout
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25
                  }}
                  className="relative"
                >
                <Link
                  to={item.path}
                  onClick={() => {
                    setActiveItem(item.id);
                    triggerHapticFeedback('light');
                  }}
                  className={clsx(
                    // Modern mobile navigation item styling
                    'relative flex flex-col items-center justify-center',
                    'min-w-[56px] px-2 py-2 rounded-2xl',
                    'transition-all duration-300 ease-out',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
                    // Touch targets optimized for mobile
                    'min-h-[52px]',
                    // Enhanced touch feedback
                    'mobile-touch no-zoom active:scale-95',
                    // Modern active/inactive states
                    isActive
                      ? [
                          'text-blue-600 dark:text-blue-400',
                          'bg-blue-50 dark:bg-blue-900/30',
                          'shadow-lg shadow-blue-500/20',
                        ]
                      : [
                          'text-gray-600 dark:text-gray-400',
                          'hover:text-blue-600 dark:hover:text-blue-400',
                          'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                        ],
                    // Disabled state
                    item.disabled && 'opacity-50 pointer-events-none'
                  )}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Modern icon with subtle animations */}
                  <motion.div
                    className="relative flex items-center justify-center w-6 h-6 mb-1"
                    animate={isActive ? {
                      scale: [1, 1.1, 1],
                    } : {}}
                    transition={{
                      duration: 0.3,
                      ease: "easeInOut",
                    }}
                  >
                    <Icon
                      className={clsx(
                        'w-5 h-5 transition-all duration-300',
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-current'
                      )}
                    />

                    {/* Modern active indicator */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute -bottom-1 w-1 h-1 bg-blue-500 rounded-full"
                          layoutId={`indicator-${item.id}`}
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Clean, readable label */}
                  <motion.span
                    className={clsx(
                      'text-xs font-medium transition-all duration-300',
                      'leading-tight text-center max-w-[48px] truncate',
                      isActive
                        ? 'text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-current'
                    )}
                    animate={isActive ? { scale: 1.02 } : { scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </motion.span>

                  {/* Modern badge design */}
                  <AnimatePresence>
                    {item.badge && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg"
                      >
                        {item.badge > 99 ? '99+' : item.badge}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.nav>
    )}
  </AnimatePresence>
  );
};

export default BottomNavigation;
