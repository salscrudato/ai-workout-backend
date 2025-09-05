import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { clsx } from 'clsx';
import { useTheme } from '../../contexts/ThemeContext';
import Button from './Button';

export interface ThemeToggleProps {
  variant?: 'button' | 'dropdown' | 'icon-only';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Theme Toggle Component
 * 
 * Features:
 * - Light/Dark/System theme switching
 * - Smooth transitions
 * - Blue gradient themes
 * - Mobile-optimized
 * - Accessibility support
 */
const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'button',
  size = 'md',
  className,
}) => {
  const { theme, actualTheme, setTheme, toggleTheme } = useTheme();

  const getIcon = () => {
    switch (actualTheme) {
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'light':
      default:
        return <Sun className="w-4 h-4" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'dark':
        return 'Dark Mode';
      case 'light':
        return 'Light Mode';
      case 'system':
      default:
        return 'System Theme';
    }
  };

  if (variant === 'icon-only') {
    return (
      <Button
        variant="ghost"
        size={size}
        onClick={toggleTheme}
        className={clsx(
          'w-10 h-10 p-0 rounded-full',
          'hover:bg-primary-50 hover:text-primary-600',
          'transition-all duration-300',
          className
        )}
        aria-label={`Switch to ${actualTheme === 'light' ? 'dark' : 'light'} mode`}
      >
        {getIcon()}
      </Button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={clsx('relative', className)}>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as any)}
          className={clsx(
            'appearance-none bg-transparent border border-secondary-300 rounded-lg',
            'px-3 py-2 pr-8 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'hover:border-primary-400 transition-colors duration-200'
          )}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <Monitor className="w-4 h-4 text-secondary-400" />
        </div>
      </div>
    );
  }

  // Default button variant
  return (
    <Button
      variant="outline"
      size={size}
      onClick={toggleTheme}
      leftIcon={getIcon()}
      className={clsx(
        'transition-all duration-300',
        'hover:shadow-glow-blue',
        className
      )}
    >
      {getLabel()}
    </Button>
  );
};

export default ThemeToggle;
