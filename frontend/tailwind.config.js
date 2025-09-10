/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  safelist: [
    // Essential gradient utilities
    'gradient-text-blue', 'gradient-text-subtle',
    // Core gradient backgrounds
    'gradient-blue', 'gradient-blue-light',
    // Essential glass effects
    'glass', 'glass-light',
    // Core shadows
    'shadow-glow', 'shadow-glow-blue',
  ],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.25rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
        '2xl': '3rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
      },
    },
    // Enhanced font family with modern system fonts
    fontFamily: {
      sans: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'Helvetica Neue',
        'Arial',
        'sans-serif',
        'Apple Color Emoji',
        'Segoe UI Emoji',
        'Segoe UI Symbol',
      ],
      mono: [
        'SF Mono',
        'Monaco',
        'Inconsolata',
        'Roboto Mono',
        'source-code-pro',
        'Menlo',
        'Consolas',
        'monospace',
      ],
    },
    extend: {
      colors: {
        // Enhanced blue gradient palette with improved contrast and accessibility
        primary: {
          50: '#f8faff',
          100: '#f0f4ff',
          200: '#e1e9ff',
          300: '#c7d6ff',
          400: '#a5b8ff',
          500: '#7c8eff',
          600: '#5b6cff',
          700: '#4c5bef',
          800: '#3d4ad9',
          900: '#2f3bb8',
          950: '#1e2785',
        },
        // Enhanced purple accent with improved vibrancy
        purple: {
          50: '#faf7ff',
          100: '#f3edff',
          200: '#e9d8ff',
          300: '#d8b4ff',
          400: '#c084ff',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c2d12',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        // Cyan for modern accents
        cyan: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        // Premium glass effects with enhanced depth
        glass: {
          white: 'rgba(255, 255, 255, 0.90)',
          'white-light': 'rgba(255, 255, 255, 0.75)',
          'white-subtle': 'rgba(255, 255, 255, 0.55)',
          'white-ultra': 'rgba(255, 255, 255, 0.95)',
          blue: 'rgba(91, 107, 255, 0.12)',
          purple: 'rgba(168, 85, 247, 0.10)',
          cyan: 'rgba(6, 182, 212, 0.08)',
          dark: 'rgba(15, 23, 42, 0.90)',
          'dark-light': 'rgba(15, 23, 42, 0.75)',
          'dark-subtle': 'rgba(15, 23, 42, 0.55)',
        },
        // Refined neutral palette
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Modern semantic colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
        },
        // Premium semantic colors
        semantic: {
          'text-primary': '#0f172a',
          'text-secondary': '#64748b',
          'text-muted': '#94a3b8',
          'bg-primary': '#ffffff',
          'bg-secondary': '#f8fafc',
          'bg-tertiary': '#f1f5f9',
          'border-primary': '#e2e8f0',
          'border-secondary': '#cbd5e1',
          'border-focus': '#6366f1',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      // Enhanced typography scale with modern proportions and improved readability
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],
        'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.015em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.03em' }],
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.035em' }],
        '6xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.04em' }],
        '7xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.045em' }],
        '8xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.05em' }],
        '9xl': ['8rem', { lineHeight: '1', letterSpacing: '-0.055em' }],
        // Display sizes for hero sections
        'display-sm': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.025em' }],
        'display-md': ['3.5rem', { lineHeight: '1.15', letterSpacing: '-0.03em' }],
        'display-lg': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.035em' }],
        'display-xl': ['6rem', { lineHeight: '1.05', letterSpacing: '-0.04em' }],
      },

      // Enhanced spacing scale for better rhythm
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },

      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        // Subtle shadows for modern design
        'soft': '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        'medium': '0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -1px rgba(15, 23, 42, 0.04)',
        'large': '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.03)',
        'xl': '0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 10px 10px -5px rgba(15, 23, 42, 0.02)',
        'inner': 'inset 0 2px 4px 0 rgba(15, 23, 42, 0.04)',

        // Subtle glow effects
        'glow': '0 0 20px rgba(139, 156, 255, 0.08)',
        'glow-sm': '0 0 10px rgba(139, 156, 255, 0.06)',
        'glow-lg': '0 0 40px rgba(139, 156, 255, 0.12)',
        'glow-blue': '0 0 30px rgba(107, 122, 255, 0.15)',
        'glow-purple': '0 0 30px rgba(176, 143, 255, 0.15)',
        'glow-cyan': '0 0 30px rgba(6, 182, 212, 0.15)',

        // Glass morphism shadows
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.25)',
        'glass-lg': '0 16px 64px 0 rgba(31, 38, 135, 0.45)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      screens: {
        'xs': '475px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    function({ addUtilities, theme }) {
      addUtilities({
        // Premium glass morphism effects with enhanced depth
        '.glass': {
          backgroundColor: 'rgba(255, 255, 255, 0.90)',
          backdropFilter: 'blur(20px) saturate(200%)',
          WebkitBackdropFilter: 'blur(20px) saturate(200%)',
          border: '1px solid rgba(255, 255, 255, 0.30)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15), 0 2px 8px 0 rgba(31, 38, 135, 0.08)',
        },

        // Enhanced gradient backgrounds
        '.gradient-purple-light': {
          background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(79, 70, 229, 0.05) 100%)',
        },
        '.glass-light': {
          backgroundColor: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.12), 0 1px 4px 0 rgba(31, 38, 135, 0.06)',
        },
        '.glass-ultra': {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(24px) saturate(220%)',
          WebkitBackdropFilter: 'blur(24px) saturate(220%)',
          border: '1px solid rgba(255, 255, 255, 0.40)',
          boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.18), 0 4px 12px 0 rgba(31, 38, 135, 0.10)',
        },
        '.glass-subtle': {
          backgroundColor: 'rgba(255, 255, 255, 0.45)',
          backdropFilter: 'blur(8px) saturate(120%)',
          WebkitBackdropFilter: 'blur(8px) saturate(120%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        },
        '.glass-dark': {
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        },

        // Subtle gradient text effects
        '.gradient-text-primary': {
          backgroundImage: `linear-gradient(135deg, ${theme('colors.primary.500')}, ${theme('colors.purple.500')})`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        },
        '.gradient-text-blue': {
          backgroundImage: `linear-gradient(135deg, ${theme('colors.primary.400')}, ${theme('colors.cyan.400')})`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        },
        '.gradient-text-purple': {
          backgroundImage: `linear-gradient(135deg, ${theme('colors.purple.500')}, ${theme('colors.primary.500')})`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        },
        '.gradient-text-subtle': {
          backgroundImage: `linear-gradient(135deg, ${theme('colors.neutral.500')}, ${theme('colors.neutral.700')})`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        },

        // Subtle gradient backgrounds
        '.gradient-primary': {
          backgroundImage: `linear-gradient(135deg, ${theme('colors.primary.500')}, ${theme('colors.purple.500')})`,
        },
        '.gradient-blue': {
          backgroundImage: `linear-gradient(135deg, ${theme('colors.primary.400')}, ${theme('colors.cyan.400')})`,
        },
        '.gradient-purple': {
          backgroundImage: `linear-gradient(135deg, ${theme('colors.purple.500')}, ${theme('colors.primary.500')})`,
        },
        '.gradient-subtle': {
          backgroundImage: `linear-gradient(135deg, ${theme('colors.primary.50')}, ${theme('colors.purple.50')})`,
        },
        '.gradient-hero': {
          backgroundImage: `linear-gradient(135deg, ${theme('colors.primary.400')} 0%, ${theme('colors.purple.400')} 50%, ${theme('colors.cyan.300')} 100%)`,
        },

        // Enhanced animated gradients
        '.gradient-animated': {
          backgroundImage: `linear-gradient(-45deg, ${theme('colors.primary.600')}, ${theme('colors.purple.600')}, ${theme('colors.cyan.500')}, ${theme('colors.primary.500')})`,
          backgroundSize: '400% 400%',
          animation: 'gradient 15s ease infinite',
        },
        '.gradient-premium': {
          backgroundImage: `linear-gradient(135deg, ${theme('colors.primary.500')} 0%, ${theme('colors.purple.500')} 50%, ${theme('colors.cyan.400')} 100%)`,
          backgroundSize: '300% 300%',
          animation: 'gradient 8s ease infinite',
        },
        '.gradient-electric': {
          backgroundImage: `linear-gradient(135deg, ${theme('colors.primary.400')} 0%, ${theme('colors.cyan.400')} 50%, ${theme('colors.purple.400')} 100%)`,
          backgroundSize: '200% 200%',
        },

        // Enhanced text gradients with better contrast
        '.gradient-text-fresh': {
          backgroundImage: `linear-gradient(135deg, ${theme('colors.primary.600')}, ${theme('colors.cyan.500')})`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          backgroundSize: '200% 200%',
        },
        '.gradient-text-modern': {
          backgroundImage: `linear-gradient(135deg, ${theme('colors.primary.700')}, ${theme('colors.purple.600')}, ${theme('colors.cyan.500')})`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          backgroundSize: '300% 300%',
        },
        '.gradient-text-luxury': {
          backgroundImage: `linear-gradient(135deg, ${theme('colors.primary.800')}, ${theme('colors.purple.700')})`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        },
      });
    },
  ],
}
