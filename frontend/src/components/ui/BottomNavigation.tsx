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
          role="navigation"
          aria-label="Bottom navigation"
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
            'glass shadow-glass-lg border border-white/20',
            // Advanced shadow system
            'shadow-2xl shadow-black/10',
            // Subtle gradient overlay
            'before:absolute before:inset-0 before:rounded-3xl',
            'before:gradient-subtle before:opacity-30',
            'before:pointer-events-none',
            // Safe area support
            'pb-safe-bottom',
            'motion-reduce:transition-none motion-reduce:transform-none',
            className
          )}
        >
          {/* Dynamic island-style active indicator */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
            layoutId="activeIndicator"
            initial={false}
          />

          <div className="flex items-center justify-around px-4 py-3 motion-reduce:transition-none motion-reduce:transform-none">
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
                          'text-primary-600 dark:text-primary-400',
                          'bg-primary-50 dark:bg-primary-900/30',
                          'shadow-lg shadow-primary-500/20',
                        ]
                      : [
                          'text-gray-600 dark:text-gray-400',
                          'hover:text-primary-600 dark:hover:text-primary-400',
                          'hover:bg-secondary-50 dark:hover:bg-secondary-800/50',
                        ],
                    // Disabled state
                    item.disabled && 'opacity-50 pointer-events-none'
                  )}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Modern icon with subtle animations - no text labels */}
                  <motion.div
                    className="relative flex items-center justify-center w-8 h-8"
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
                        'w-6 h-6 transition-all duration-300',
                        isActive
                          ? 'text-primary-600'
                          : 'text-neutral-500 hover:text-primary-500'
                      )}
                    />

                    {/* Modern active indicator */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute -bottom-2 w-1.5 h-1.5 bg-primary-500 rounded-full shadow-glow-sm"
                          layoutId={`indicator-${item.id}`}
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Modern badge design */}
                  <AnimatePresence>
                    {item.badge && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg"
                      >
                        {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
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
