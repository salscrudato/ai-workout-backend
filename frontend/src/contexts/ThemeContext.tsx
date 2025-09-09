import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  // Enhanced theming capabilities
  accentColor: string;
  setAccentColor: (color: string) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

/**
 * Theme Provider with Dark Mode Support
 * 
 * Features:
 * - Light/Dark/System theme modes
 * - Automatic system preference detection
 * - Smooth theme transitions
 * - Blue accent preservation in dark mode
 * - Local storage persistence
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'light',
  storageKey = 'ai-workout-theme',
}) => {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');
  const [accentColor, setAccentColorState] = useState('#0ea5e9');
  const [highContrast, setHighContrastState] = useState(false);
  const [reducedMotion, setReducedMotionState] = useState(false);

  // Get system theme preference
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Update actual theme based on theme setting
  const updateActualTheme = (themeValue: Theme) => {
    const newActualTheme = themeValue === 'system' ? getSystemTheme() : themeValue;
    setActualTheme(newActualTheme);
    
    // Update document class
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newActualTheme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        newActualTheme === 'dark' ? '#1e3a8a' : '#3b82f6'
      );
    }
  };

  // Set theme with persistence
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    updateActualTheme(newTheme);
    
    // Persist to localStorage
    try {
      localStorage.setItem(storageKey, newTheme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  };

  // Toggle between light and dark (skip system)
  const toggleTheme = () => {
    const newTheme = actualTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Initialize theme from localStorage or system
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(storageKey) as Theme;
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeState(savedTheme);
        updateActualTheme(savedTheme);
      } else {
        updateActualTheme(defaultTheme);
      }
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
      updateActualTheme(defaultTheme);
    }
  }, [defaultTheme, storageKey]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        updateActualTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const contextValue: ThemeContextType = {
    theme,
    actualTheme,
    setTheme,
    toggleTheme,
    accentColor,
    setAccentColor: setAccentColorState,
    highContrast,
    setHighContrast: setHighContrastState,
    reducedMotion,
    setReducedMotion: setReducedMotionState,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use Theme Context
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
