import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Enhanced Breadcrumbs Component
 * 
 * Features:
 * - Automatic breadcrumb generation from routes
 * - Smooth animations between navigation
 * - Mobile-optimized responsive design
 * - Contextual icons for different sections
 * - Accessibility-compliant navigation
 */

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  maxItems?: number;
}

const routeLabels: Record<string, { label: string; icon?: React.ReactNode }> = {
  '/dashboard': { label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
  '/generate': { label: 'Generate Workout' },
  '/history': { label: 'Workout History' },
  '/profile': { label: 'Profile' },
  '/workout': { label: 'Workout' },
  '/profile-setup': { label: 'Profile Setup' },
};

const EnhancedBreadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className,
  showHome = true,
  maxItems = 4,
}) => {
  const location = useLocation();

  // Generate breadcrumbs from current path if items not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    if (showHome && location.pathname !== '/dashboard') {
      breadcrumbs.push({
        label: 'Dashboard',
        path: '/dashboard',
        icon: <Home className="w-4 h-4" />,
      });
    }

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const routeInfo = routeLabels[currentPath];
      
      if (routeInfo) {
        breadcrumbs.push({
          label: routeInfo.label,
          path: currentPath,
          icon: routeInfo.icon,
          isActive: index === pathSegments.length - 1,
        });
      } else {
        // Fallback for dynamic routes
        breadcrumbs.push({
          label: segment.charAt(0).toUpperCase() + segment.slice(1),
          path: currentPath,
          isActive: index === pathSegments.length - 1,
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Truncate breadcrumbs if too many
  const displayBreadcrumbs = breadcrumbs.length > maxItems
    ? [
        breadcrumbs[0],
        { label: '...', path: '', isEllipsis: true },
        ...breadcrumbs.slice(-2),
      ]
    : breadcrumbs;

  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs for single-level navigation
  }

  return (
    <nav
      className={clsx(
        'flex items-center space-x-1 text-sm',
        'overflow-x-auto scrollbar-hide',
        className
      )}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1 min-w-0">
        {displayBreadcrumbs.map((item, index) => (
          <motion.li
            key={`${item.path}-${index}`}
            className="flex items-center space-x-1 min-w-0"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            )}
            
            {(item as any).isEllipsis ? (
              <span className="text-neutral-400 px-2">...</span>
            ) : (item as BreadcrumbItem).isActive ? (
              <motion.span
                className="flex items-center space-x-1 text-neutral-800 font-medium truncate"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {(item as BreadcrumbItem).icon}
                <span className="truncate">{item.label}</span>
              </motion.span>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={item.path}
                  className="flex items-center space-x-1 text-neutral-600 hover:text-primary-600 
                           transition-colors duration-200 truncate group"
                >
                  {(item as BreadcrumbItem).icon && (
                    <span className="group-hover:text-primary-600 transition-colors">
                      {(item as BreadcrumbItem).icon}
                    </span>
                  )}
                  <span className="truncate hover:underline">{item.label}</span>
                </Link>
              </motion.div>
            )}
          </motion.li>
        ))}
      </ol>
    </nav>
  );
};

export default EnhancedBreadcrumbs;
