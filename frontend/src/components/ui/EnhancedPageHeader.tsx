import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { ArrowLeft, MoreHorizontal } from 'lucide-react';
import { Display, Heading, Body } from './Typography';
import Button from './Button';
import EnhancedBreadcrumbs from './EnhancedBreadcrumbs';

/**
 * Enhanced Page Header Component
 * 
 * Features:
 * - Sophisticated information hierarchy
 * - Contextual actions and navigation
 * - Responsive design with mobile optimization
 * - Smooth animations and micro-interactions
 * - Accessibility-compliant structure
 */

interface PageAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  actions?: PageAction[];
  breadcrumbs?: boolean;
  className?: string;
  variant?: 'default' | 'centered' | 'minimal';
  backgroundPattern?: boolean;
  children?: React.ReactNode;
}

const EnhancedPageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  description,
  showBackButton = false,
  onBack,
  actions = [],
  breadcrumbs = true,
  className,
  variant = 'default',
  backgroundPattern = false,
  children,
}) => {
  const renderActions = () => {
    if (actions.length === 0) return null;

    // Show only primary action on mobile, rest in dropdown
    const primaryAction = actions.find(action => action.variant === 'primary') || actions[0];
    const secondaryActions = actions.filter(action => action !== primaryAction);

    return (
      <div className="flex items-center space-x-3">
        {/* Mobile: Show only primary action */}
        <div className="sm:hidden">
          <Button
            variant={primaryAction.variant || 'primary'}
            size="md"
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
            leftIcon={primaryAction.icon}
            enhancedAnimation
          >
            {primaryAction.label}
          </Button>
          
          {secondaryActions.length > 0 && (
            <Button
              variant="ghost"
              size="md"
              className="ml-2"
              leftIcon={<MoreHorizontal className="w-4 h-4" />}
            >
              More
            </Button>
          )}
        </div>

        {/* Desktop: Show all actions */}
        <div className="hidden sm:flex items-center space-x-3">
          {actions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
            >
              <Button
                variant={action.variant || 'secondary'}
                size="md"
                onClick={action.onClick}
                disabled={action.disabled}
                leftIcon={action.icon}
                enhancedAnimation
              >
                {action.label}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'centered':
        return 'text-center';
      case 'minimal':
        return 'py-4';
      default:
        return '';
    }
  };

  return (
    <motion.header
      className={clsx(
        'relative',
        backgroundPattern && 'bg-gradient-to-br from-neutral-50 via-white to-primary-50/30',
        className
      )}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background Pattern */}
      {backgroundPattern && (
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-purple-500" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23000%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%227%22%20cy%3D%227%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        </div>
      )}

      <div className="relative">
        {/* Breadcrumbs */}
        {breadcrumbs && (
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <EnhancedBreadcrumbs />
          </motion.div>
        )}

        <div className={clsx('space-y-4', getVariantClasses())}>
          {/* Header Content */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Back Button and Title Row */}
              <div className="flex items-center space-x-3 mb-2">
                {showBackButton && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onBack}
                      leftIcon={<ArrowLeft className="w-4 h-4" />}
                      className="hover-lift-subtle"
                    >
                      Back
                    </Button>
                  </motion.div>
                )}

                <motion.div
                  className="flex-1 min-w-0"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  {variant === 'minimal' ? (
                    <Heading level={2} gradient="fresh" className="truncate">
                      {title}
                    </Heading>
                  ) : (
                    <Display level={2} gradient="modern" className="truncate">
                      {title}
                    </Display>
                  )}
                </motion.div>
              </div>

              {/* Subtitle */}
              {subtitle && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <Heading level={4} color="secondary" className="mb-2">
                    {subtitle}
                  </Heading>
                </motion.div>
              )}

              {/* Description */}
              {description && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <Body size={1} color="secondary" className="max-w-3xl">
                    {description}
                  </Body>
                </motion.div>
              )}
            </div>

            {/* Actions */}
            {actions.length > 0 && (
              <motion.div
                className="flex-shrink-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                {renderActions()}
              </motion.div>
            )}
          </div>

          {/* Custom Children */}
          {children && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              {children}
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default EnhancedPageHeader;
