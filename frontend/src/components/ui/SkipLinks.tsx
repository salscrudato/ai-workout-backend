import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface SkipLink {
  href: string;
  label: string;
  description?: string;
}

interface SkipLinksProps {
  links?: SkipLink[];
  className?: string;
  position?: 'top-left' | 'top-center' | 'top-right';
}

/**
 * Skip Links Component for Enhanced Accessibility
 * 
 * Features:
 * - Keyboard navigation support
 * - Screen reader optimization
 * - Smooth focus transitions
 * - Customizable link destinations
 * - WCAG 2.1 AA compliance
 * - Mobile-friendly design
 */
const SkipLinks: React.FC<SkipLinksProps> = ({
  links = [
    { href: '#main-content', label: 'Skip to main content', description: 'Jump to the main content area' },
    { href: '#navigation', label: 'Skip to navigation', description: 'Jump to the main navigation menu' },
    { href: '#footer', label: 'Skip to footer', description: 'Jump to the footer section' },
  ],
  className,
  position = 'top-left',
}) => {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'top-right': 'top-4 right-4',
  };

  const handleSkipLinkClick = (href: string) => {
    // Find the target element
    const targetElement = document.querySelector(href);
    if (targetElement) {
      // Ensure the element is focusable
      const originalTabIndex = targetElement.getAttribute('tabindex');
      targetElement.setAttribute('tabindex', '-1');
      
      // Focus the element
      (targetElement as HTMLElement).focus();
      
      // Restore original tabindex after a short delay
      setTimeout(() => {
        if (originalTabIndex !== null) {
          targetElement.setAttribute('tabindex', originalTabIndex);
        } else {
          targetElement.removeAttribute('tabindex');
        }
      }, 100);
    }
  };

  return (
    <div
      className={clsx(
        'fixed z-[9999] pointer-events-none',
        positionClasses[position],
        className
      )}
      role="navigation"
      aria-label="Skip links"
    >
      <div className="flex flex-col space-y-2">
        {links.map((link, index) => (
          <motion.a
            key={link.href}
            href={link.href}
            className={clsx(
              // Base styles
              'inline-block px-4 py-2 text-sm font-medium',
              'bg-primary-600 text-white rounded-md shadow-lg',
              'border-2 border-transparent',
              
              // Focus styles
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              'focus:border-white focus:bg-primary-700',
              
              // Hover styles
              'hover:bg-primary-700 hover:shadow-xl',
              
              // Transitions
              'transition-all duration-200 ease-out',
              
              // Transform for off-screen positioning
              'transform -translate-y-full opacity-0 pointer-events-none',
              'focus:translate-y-0 focus:opacity-100 focus:pointer-events-auto',
              
              // High contrast mode support
              'forced-colors:border-[ButtonText] forced-colors:bg-[ButtonFace]'
            )}
            onClick={(e) => {
              e.preventDefault();
              handleSkipLinkClick(link.href);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSkipLinkClick(link.href);
              }
            }}
            aria-describedby={link.description ? `skip-desc-${index}` : undefined}
            initial={{ y: -50, opacity: 0 }}
            whileFocus={{ y: 0, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {link.label}
            
            {/* Screen reader description */}
            {link.description && (
              <span
                id={`skip-desc-${index}`}
                className="sr-only"
              >
                {link.description}
              </span>
            )}
          </motion.a>
        ))}
      </div>
      
      {/* Instructions for screen readers */}
      <div className="sr-only">
        <p>
          Use Tab to navigate through skip links. Press Enter or Space to activate a skip link.
        </p>
      </div>
    </div>
  );
};

// Hook for managing skip link targets
export const useSkipLinkTargets = () => {
  React.useEffect(() => {
    // Ensure skip link targets have proper attributes
    const targets = [
      { id: 'main-content', role: 'main' },
      { id: 'navigation', role: 'navigation' },
      { id: 'footer', role: 'contentinfo' },
    ];

    targets.forEach(({ id, role }) => {
      const element = document.getElementById(id);
      if (element) {
        // Add role if not present
        if (!element.getAttribute('role')) {
          element.setAttribute('role', role);
        }
        
        // Add aria-label for better screen reader support
        if (!element.getAttribute('aria-label')) {
          const label = id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
          element.setAttribute('aria-label', label);
        }
      }
    });
  }, []);
};

// Component for marking skip link targets
interface SkipLinkTargetProps {
  id: string;
  role?: string;
  'aria-label'?: string;
  children: React.ReactNode;
  className?: string;
}

export const SkipLinkTarget: React.FC<SkipLinkTargetProps> = ({
  id,
  role,
  'aria-label': ariaLabel,
  children,
  className,
  ...props
}) => {
  return (
    <div
      id={id}
      role={role}
      aria-label={ariaLabel}
      className={clsx(
        // Ensure the target is focusable when needed
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'rounded-sm',
        className
      )}
      tabIndex={-1}
      {...props}
    >
      {children}
    </div>
  );
};

export default SkipLinks;
