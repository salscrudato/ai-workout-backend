import React, { useEffect, useState, useRef } from 'react';
import { clsx } from 'clsx';

/**
 * Screen Reader Utilities and ARIA Helpers
 * 
 * Provides comprehensive screen reader support including:
 * - Live regions for dynamic content announcements
 * - Screen reader only content
 * - ARIA landmarks and labels
 * - Status and progress announcements
 * - Form validation announcements
 */

// Screen reader only content
export interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
}

export const ScreenReaderOnly: React.FC<ScreenReaderOnlyProps> = ({
  children,
  as: Component = 'span',
  className,
}) => {
  return (
    <Component
      className={clsx(
        'sr-only',
        // Ensure content is accessible when focused
        'focus:not-sr-only focus:absolute focus:top-0 focus:left-0',
        'focus:bg-white focus:p-2 focus:z-50 focus:border focus:border-gray-300',
        className
      )}
    >
      {children}
    </Component>
  );
};

// Live region for announcing dynamic content changes
export interface LiveRegionProps {
  children: React.ReactNode;
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  className?: string;
}

export const LiveRegion: React.FC<LiveRegionProps> = ({
  children,
  politeness = 'polite',
  atomic = false,
  relevant = 'all',
  className,
}) => {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={clsx('sr-only', className)}
    >
      {children}
    </div>
  );
};

// Hook for announcing messages to screen readers
export const useScreenReaderAnnouncement = () => {
  const [announcement, setAnnouncement] = useState<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const announce = (message: string, delay: number = 100) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Clear the announcement first to ensure it's re-read
    setAnnouncement('');

    // Set the new announcement after a brief delay
    timeoutRef.current = setTimeout(() => {
      setAnnouncement(message);
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    announce,
    AnnouncementRegion: () => (
      <LiveRegion politeness="assertive">
        {announcement}
      </LiveRegion>
    ),
  };
};

// Accessible progress indicator with screen reader support
export interface AccessibleProgressProps {
  value: number;
  max?: number;
  label?: string;
  description?: string;
  showPercentage?: boolean;
  className?: string;
}

export const AccessibleProgress: React.FC<AccessibleProgressProps> = ({
  value,
  max = 100,
  label,
  description,
  showPercentage = true,
  className,
}) => {
  const percentage = Math.round((value / max) * 100);
  const progressId = React.useId();
  const labelId = label ? `${progressId}-label` : undefined;
  const descriptionId = description ? `${progressId}-description` : undefined;

  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <label id={labelId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
          {showPercentage && (
            <span className="text-sm text-gray-500" aria-hidden="true">
              {percentage}%
            </span>
          )}
        </div>
      )}
      
      {description && (
        <p id={descriptionId} className="text-sm text-gray-600 mb-2">
          {description}
        </p>
      )}
      
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
        className="w-full bg-gray-200 rounded-full h-2"
      >
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <ScreenReaderOnly>
        Progress: {percentage}% complete
      </ScreenReaderOnly>
    </div>
  );
};

// Accessible status indicator
export interface AccessibleStatusProps {
  status: 'success' | 'error' | 'warning' | 'info' | 'loading';
  children: React.ReactNode;
  showIcon?: boolean;
  className?: string;
}

export const AccessibleStatus: React.FC<AccessibleStatusProps> = ({
  status,
  children,
  showIcon = true,
  className,
}) => {
  const statusConfig = {
    success: {
      icon: '✓',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      ariaLabel: 'Success',
    },
    error: {
      icon: '✕',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      ariaLabel: 'Error',
    },
    warning: {
      icon: '⚠',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      ariaLabel: 'Warning',
    },
    info: {
      icon: 'ℹ',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      ariaLabel: 'Information',
    },
    loading: {
      icon: '⟳',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      ariaLabel: 'Loading',
    },
  };

  const config = statusConfig[status];

  return (
    <div
      role="status"
      aria-label={config.ariaLabel}
      className={clsx(
        'flex items-center p-3 rounded-lg border',
        config.color,
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      {showIcon && (
        <span
          className="mr-2 text-lg"
          aria-hidden="true"
        >
          {config.icon}
        </span>
      )}
      
      <div className="flex-1">
        {children}
      </div>
      
      <ScreenReaderOnly>
        Status: {config.ariaLabel}
      </ScreenReaderOnly>
    </div>
  );
};

// Accessible form validation summary
export interface ValidationSummaryProps {
  errors: Array<{ field: string; message: string }>;
  title?: string;
  className?: string;
}

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  errors,
  title = 'Please correct the following errors:',
  className,
}) => {
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus the summary when errors appear
    if (errors.length > 0 && summaryRef.current) {
      summaryRef.current.focus();
    }
  }, [errors.length]);

  if (errors.length === 0) return null;

  return (
    <div
      ref={summaryRef}
      role="alert"
      aria-labelledby="error-summary-title"
      tabIndex={-1}
      className={clsx(
        'bg-red-50 border border-red-200 rounded-lg p-4 mb-6',
        'focus:outline-none focus:ring-2 focus:ring-red-500',
        className
      )}
    >
      <h2 id="error-summary-title" className="text-lg font-semibold text-red-800 mb-3">
        {title}
      </h2>
      
      <ul className="list-disc list-inside space-y-1">
        {errors.map((error, index) => (
          <li key={index} className="text-red-700">
            <strong>{error.field}:</strong> {error.message}
          </li>
        ))}
      </ul>
      
      <ScreenReaderOnly>
        {errors.length} validation {errors.length === 1 ? 'error' : 'errors'} found
      </ScreenReaderOnly>
    </div>
  );
};

// Accessible breadcrumb navigation
export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface AccessibleBreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: string;
  className?: string;
}

export const AccessibleBreadcrumb: React.FC<AccessibleBreadcrumbProps> = ({
  items,
  separator = '/',
  className,
}) => {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-gray-400" aria-hidden="true">
                {separator}
              </span>
            )}
            
            {item.current ? (
              <span
                aria-current="page"
                className="text-gray-900 font-medium"
              >
                {item.label}
              </span>
            ) : item.href ? (
              <a
                href={item.href}
                className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              >
                {item.label}
              </a>
            ) : (
              <span className="text-gray-500">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Accessible data table with proper headers and descriptions
export interface AccessibleTableProps {
  caption?: string;
  headers: string[];
  rows: Array<Array<React.ReactNode>>;
  className?: string;
}

export const AccessibleTable: React.FC<AccessibleTableProps> = ({
  caption,
  headers,
  rows,
  className,
}) => {
  const tableId = React.useId();

  return (
    <div className="overflow-x-auto">
      <table
        id={tableId}
        className={clsx(
          'min-w-full divide-y divide-gray-200',
          className
        )}
      >
        {caption && (
          <caption className="text-left text-sm text-gray-600 mb-4">
            {caption}
          </caption>
        )}
        
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody className="bg-white divide-y divide-gray-200">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
