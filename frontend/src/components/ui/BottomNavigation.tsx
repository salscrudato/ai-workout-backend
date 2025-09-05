import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../../contexts/NavigationContext';
import Badge from './Badge';

export interface BottomNavigationProps {
  className?: string;
}

/**
 * Bottom Navigation Component for Mobile
 * 
 * Features:
 * - Fixed bottom positioning
 * - Blue gradient active states
 * - Badge support for notifications
 * - Smooth animations
 * - Touch-optimized targets
 */
const BottomNavigation: React.FC<BottomNavigationProps> = ({ className }) => {
  const { navigationItems, activeItem, setActiveItem } = useNavigation();
  const location = useLocation();

  // Filter items for bottom navigation (typically 4-5 main items)
  const bottomNavItems = navigationItems.slice(0, 5);

  if (bottomNavItems.length === 0) {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.2
      }}
      className={clsx(
        // Base styles with enhanced visual appeal
        'fixed bottom-0 left-0 right-0 z-50',
        'glass-light border-t border-white/20',
        // Enhanced shadow and effects
        'shadow-glow-blue backdrop-blur-xl',
        // Subtle gradient overlay for depth
        'before:absolute before:inset-0 before:bg-gradient-to-t before:from-blue-500/5 before:to-transparent before:pointer-events-none',
        // Safe area support
        'pb-safe-bottom',
        // Custom className
        className
      )}
    >
      <div className="flex items-center justify-around px-2 py-3">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || activeItem === item.id;
          
          return (
            <motion.div
              key={item.id}
              layout
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Link
                to={item.path}
                onClick={() => setActiveItem(item.id)}
                className={clsx(
                  // Base styles
                  'relative flex flex-col items-center justify-center',
                  'min-w-[64px] px-3 py-2 rounded-xl',
                  'transition-all duration-300 ease-out',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                  // Touch targets - Apple HIG recommends 44px minimum
                  'min-h-[48px]',
                  // Mobile touch optimization
                  'mobile-touch no-zoom',
                  // Enhanced active/inactive states with sophisticated effects
                  isActive
                    ? [
                        'text-primary-600',
                        'glass-blue-premium',
                        'shadow-glow-blue',
                        'transform scale-105',
                      ]
                    : [
                        'text-secondary-500',
                        'hover:text-primary-500',
                        'hover:glass-blue-light',
                        'hover:shadow-soft',
                      ],
                  // Disabled state
                  item.disabled && 'opacity-50 pointer-events-none'
                )}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Icon container with sophisticated animation */}
                <motion.div
                  className="relative flex items-center justify-center w-6 h-6 mb-1"
                  animate={isActive ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  } : {}}
                  transition={{
                    duration: 0.6,
                    ease: 'easeInOut',
                    repeat: isActive ? Infinity : 0,
                    repeatDelay: 3
                  }}
                >
                  <motion.div
                    animate={isActive ? { y: [-2, 2, -2] } : {}}
                    transition={{
                      duration: 2,
                      ease: 'easeInOut',
                      repeat: isActive ? Infinity : 0
                    }}
                  >
                    <Icon
                      className={clsx(
                        'w-5 h-5 transition-all duration-300',
                        isActive ? 'text-primary-600' : 'text-current'
                      )}
                    />
                  </motion.div>

                  {/* Badge with animation */}
                  <AnimatePresence>
                    {item.badge && (
                      <motion.div
                        className="absolute -top-1 -right-1"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Badge
                          variant="error"
                          size="sm"
                          className="min-w-[16px] h-4 text-xs px-1 animate-pulse"
                        >
                          {item.badge}
                        </Badge>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Label with enhanced animation */}
                <motion.span
                  className={clsx(
                    'text-xs font-medium leading-none',
                    'transition-all duration-300',
                    isActive
                      ? 'text-primary-600 font-semibold'
                      : 'text-secondary-500'
                  )}
                  animate={isActive ? {
                    scale: [1, 1.05, 1],
                  } : {}}
                  transition={{
                    duration: 0.4,
                    ease: 'easeInOut',
                    delay: 0.1
                  }}
                >
                  {item.label}
                </motion.span>

                {/* Enhanced active indicator with morphing animation */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      className="absolute -top-0.5 left-1/2"
                      initial={{
                        scale: 0,
                        opacity: 0,
                        x: '-50%',
                        borderRadius: '50%'
                      }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                        borderRadius: ['50%', '25%', '12px'],
                        background: [
                          'linear-gradient(90deg, #0ea5e9, #06b6d4)',
                          'linear-gradient(90deg, #3b82f6, #0ea5e9)',
                          'linear-gradient(90deg, #6b82ff, #36aaf7)'
                        ]
                      }}
                      exit={{
                        scale: 0,
                        opacity: 0,
                        transition: { duration: 0.2 }
                      }}
                      transition={{
                        duration: 0.6,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }}
                      className="w-8 h-1 rounded-full gradient-blue-electric"
                    />
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default BottomNavigation;
