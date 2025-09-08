/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Psychologically-optimized blue palette for trust, focus, and motivation
        primary: {
          50: '#f0f9ff',   // Serenity - calming background tones
          100: '#e0f2fe',  // Clarity - clean interface elements
          200: '#bae6fd',  // Confidence - subtle accents
          300: '#7dd3fc',  // Energy - interactive elements
          400: '#38bdf8',  // Focus - primary actions
          500: '#0ea5e9',  // Trust - brand identity
          600: '#0284c7',  // Authority - important buttons
          700: '#0369a1',  // Stability - navigation elements
          800: '#075985',  // Depth - text and borders
          900: '#0c4a6e',  // Power - headings and emphasis
          950: '#082f49',  // Sophistication - premium elements
        },
        // Sophisticated blue variants for premium feel
        'blue-premium': {
          50: '#f8faff',
          100: '#f1f5ff',
          200: '#e6edff',
          300: '#d1ddff',
          400: '#b3c7ff',
          500: '#8fa8ff',
          600: '#6b82ff',
          700: '#4c63d2',
          800: '#3b4ba0',
          900: '#2d3a7a',
          950: '#1e2654',
        },
        // Deep ocean blue for sophisticated gradients
        'blue-ocean': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        // Electric blue for modern accents
        'blue-electric': {
          50: '#f0f8ff',
          100: '#e0f0fe',
          200: '#bae1fd',
          300: '#7cc8fb',
          400: '#36aaf7',
          500: '#0c8ce8',
          600: '#0070c6',
          700: '#0159a0',
          800: '#064c84',
          900: '#0a406d',
          950: '#072848',
        },
        // Enhanced accent colors with sophisticated cyan-blue blend
        accent: {
          50: '#f0fdff',
          100: '#ccfbff',
          200: '#99f6ff',
          300: '#4deeff',
          400: '#06dbff',
          500: '#00bfff',
          600: '#009bd4',
          700: '#007bb0',
          800: '#08658f',
          900: '#0d5577',
          950: '#053651',
        },
        // Advanced glass morphism support colors
        glass: {
          white: 'rgba(255, 255, 255, 0.25)',
          'white-light': 'rgba(255, 255, 255, 0.15)',
          'white-dark': 'rgba(255, 255, 255, 0.1)',
          'white-subtle': 'rgba(255, 255, 255, 0.05)',
          blue: 'rgba(14, 165, 233, 0.15)',
          'blue-light': 'rgba(14, 165, 233, 0.1)',
          'blue-dark': 'rgba(14, 165, 233, 0.05)',
          'blue-premium': 'rgba(107, 130, 255, 0.12)',
          'blue-electric': 'rgba(54, 170, 247, 0.15)',
          ocean: 'rgba(2, 132, 199, 0.12)',
          cyan: 'rgba(6, 182, 212, 0.15)',
          'cyan-light': 'rgba(6, 182, 212, 0.1)',
        },
        secondary: {
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
        // Keep orange accent for variety
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Fitness-specific colors
        muscle: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        cardio: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        strength: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },

        // Contextual color system for different user states and psychological impact
        semantic: {
          // Text colors optimized for readability and psychological impact
          'text-primary': '#0f172a',      // Authority and trust
          'text-secondary': '#475569',    // Calm and professional
          'text-tertiary': '#64748b',     // Subtle and supportive
          'text-inverse': '#ffffff',      // High contrast for dark backgrounds
          'text-link': '#0284c7',         // Trustworthy and clickable
          'text-link-hover': '#0369a1',   // Confident interaction

          // Background colors for different contexts
          'bg-primary': '#ffffff',        // Clean and spacious
          'bg-secondary': '#f8fafc',      // Subtle separation
          'bg-tertiary': '#f1f5f9',       // Gentle hierarchy
          'bg-inverse': '#0f172a',        // Premium and focused
          'bg-overlay': 'rgba(15, 23, 42, 0.8)', // Focused attention

          // Contextual state colors
          'success-bg': '#f0fdf4',        // Achievement and progress
          'success-text': '#166534',      // Positive reinforcement
          'warning-bg': '#fffbeb',        // Attention without alarm
          'warning-text': '#92400e',      // Cautious guidance
          'error-bg': '#fef2f2',          // Gentle error indication
          'error-text': '#991b1b',        // Clear problem identification
          'info-bg': '#f0f9ff',           // Helpful information
          'info-text': '#1e40af',         // Trustworthy guidance

          // Interactive states
          'interactive-primary': '#0ea5e9',
          'interactive-primary-hover': '#0284c7',
          'interactive-primary-active': '#0369a1',
          'interactive-secondary': '#e2e8f0',
          'interactive-secondary-hover': '#cbd5e1',
          'interactive-secondary-active': '#94a3b8',

          // Status colors
          'status-success': '#22c55e',
          'status-warning': '#f59e0b',
          'status-error': '#ef4444',
          'status-info': '#0ea5e9',

          // Border colors
          'border-primary': '#e2e8f0',
          'border-secondary': '#cbd5e1',
          'border-focus': '#0ea5e9',
          'border-error': '#ef4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },

      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        // Refined shadow system for depth and hierarchy
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'hard': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 4px 25px -5px rgba(0, 0, 0, 0.1)',
        'ultra': '0 20px 60px -10px rgba(0, 0, 0, 0.2), 0 8px 30px -5px rgba(0, 0, 0, 0.15)',

        // Sophisticated glow effects
        'glow': '0 0 20px rgba(14, 165, 233, 0.3)',
        'glow-sm': '0 0 10px rgba(14, 165, 233, 0.2)',
        'glow-lg': '0 0 30px rgba(14, 165, 233, 0.4)',
        'glow-xl': '0 0 40px rgba(14, 165, 233, 0.5)',

        // Premium blue glow variants
        'glow-blue': '0 0 25px rgba(14, 165, 233, 0.4)',
        'glow-blue-premium': '0 0 30px rgba(107, 130, 255, 0.4)',
        'glow-blue-electric': '0 0 25px rgba(54, 170, 247, 0.4)',
        'glow-blue-ocean': '0 0 20px rgba(2, 132, 199, 0.3)',

        // Accent and complementary glows
        'glow-accent': '0 0 20px rgba(6, 182, 212, 0.3)',
        'glow-cyan': '0 0 25px rgba(6, 182, 212, 0.4)',
        'glow-orange': '0 0 20px rgba(249, 115, 22, 0.3)',

        // Inner glows for depth
        'inner-glow': 'inset 0 0 10px rgba(14, 165, 233, 0.1)',
        'inner-glow-soft': 'inset 0 0 5px rgba(14, 165, 233, 0.05)',
        'inner-glow-strong': 'inset 0 0 15px rgba(14, 165, 233, 0.15)',

        // Layered shadows for premium feel
        'layered': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        'layered-lg': '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
        'layered-xl': '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'zoom-in': 'zoomIn 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'gradient-shift': 'gradientShift 3s ease infinite',
        'gradient-flow': 'gradientFlow 4s ease infinite',
        'gradient-wave': 'gradientWave 5s ease infinite',
        'gradient-pulse': 'gradientPulse 3s ease infinite',
        'rotate-in': 'rotateIn 0.5s ease-out',
        'flip-in': 'flipIn 0.6s ease-out',
        'rubber-band': 'rubberBand 1s ease-in-out',
        'shake': 'shake 0.5s ease-in-out',
        'jello': 'jello 1s ease-in-out',
        'swing': 'swing 1s ease-in-out',
        'tada': 'tada 1s ease-in-out',
        'wobble': 'wobble 1s ease-in-out',
        'flash': 'flash 1s ease-in-out',
        'bounce-in': 'bounceIn 0.75s ease-out',
        'bounce-out': 'bounceOut 0.75s ease-in',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'fade-in-left': 'fadeInLeft 0.6s ease-out',
        'fade-in-right': 'fadeInRight 0.6s ease-out',
        'zoom-out': 'zoomOut 0.3s ease-in',
        'slide-out-up': 'slideOutUp 0.3s ease-in',
        'slide-out-down': 'slideOutDown 0.3s ease-in',
        'roll-in': 'rollIn 1s ease-out',
        'light-speed-in': 'lightSpeedIn 1s ease-out',
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
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        // New modern animations
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        zoomIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '25%': { backgroundPosition: '100% 0%' },
          '50%': { backgroundPosition: '100% 50%' },
          '75%': { backgroundPosition: '0% 100%' },
        },
        // Enhanced gradient animations for sophisticated effects
        gradientFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        gradientWave: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '33%': { backgroundPosition: '100% 0%' },
          '66%': { backgroundPosition: '0% 100%' },
        },
        gradientPulse: {
          '0%, 100%': { backgroundPosition: '0% 50%', backgroundSize: '200% 200%' },
          '50%': { backgroundPosition: '100% 50%', backgroundSize: '300% 300%' },
        },
        // Mobile-optimized animations
        mobileBounce: {
          '0%': { transform: 'scale(1) translateY(0)' },
          '50%': { transform: 'scale(1.05) translateY(-4px)' },
          '100%': { transform: 'scale(1) translateY(0)' },
        },
        mobileSlideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        mobileFadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        swipeShimmer: {
          '0%': { left: '-100%' },
          '100%': { left: '100%' },
        },
        // Enhanced micro-interactions
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        rubberBand: {
          '0%': { transform: 'scale3d(1, 1, 1)' },
          '30%': { transform: 'scale3d(1.25, 0.75, 1)' },
          '40%': { transform: 'scale3d(0.75, 1.25, 1)' },
          '50%': { transform: 'scale3d(1.15, 0.85, 1)' },
          '65%': { transform: 'scale3d(0.95, 1.05, 1)' },
          '75%': { transform: 'scale3d(1.05, 0.95, 1)' },
          '100%': { transform: 'scale3d(1, 1, 1)' },
        },
        jello: {
          '11.1%': { transform: 'skewX(-12.5deg) skewY(-12.5deg)' },
          '22.2%': { transform: 'skewX(6.25deg) skewY(6.25deg)' },
          '33.3%': { transform: 'skewX(-3.125deg) skewY(-3.125deg)' },
          '44.4%': { transform: 'skewX(1.5625deg) skewY(1.5625deg)' },
          '55.5%': { transform: 'skewX(-0.78125deg) skewY(-0.78125deg)' },
          '66.6%': { transform: 'skewX(0.390625deg) skewY(0.390625deg)' },
          '77.7%': { transform: 'skewX(-0.1953125deg) skewY(-0.1953125deg)' },
          '88.8%': { transform: 'skewX(0.09765625deg) skewY(0.09765625deg)' },
          '100%': { transform: 'skewX(0deg) skewY(0deg)' },
        },
        morphing: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
        },
        rotateIn: {
          '0%': { transform: 'rotate(-200deg)', opacity: '0' },
          '100%': { transform: 'rotate(0)', opacity: '1' },
        },
        flipIn: {
          '0%': { transform: 'perspective(400px) rotateY(90deg)', opacity: '0' },
          '40%': { transform: 'perspective(400px) rotateY(-20deg)' },
          '60%': { transform: 'perspective(400px) rotateY(10deg)' },
          '80%': { transform: 'perspective(400px) rotateY(-5deg)' },
          '100%': { transform: 'perspective(400px) rotateY(0deg)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-10px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(10px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      // Enhanced spacing system with mathematical progression and mobile-first approach
      spacing: {
        ...require('tailwindcss/defaultTheme').spacing,
        // Extended spacing scale for premium layouts
        '13': '3.25rem',  // 52px for large buttons
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
        '160': '40rem',
        '192': '48rem',

        // Safe area utilities for modern mobile devices
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',

        // Content-aware spacing for better information architecture
        'content-xs': '0.75rem',
        'content-sm': '1rem',
        'content-md': '1.5rem',
        'content-lg': '2rem',
        'content-xl': '3rem',
        'content-2xl': '4rem',
        'content-3xl': '6rem',
      },

      // Enhanced typography scale with mathematical precision
      fontSize: {
        ...require('tailwindcss/defaultTheme').fontSize,
        // Refined scale based on 1.25 ratio (major third)
        'xs': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.01em' }],
        'sm': ['0.875rem', { lineHeight: '1.45', letterSpacing: '0.005em' }],
        'base': ['1rem', { lineHeight: '1.6', letterSpacing: '0em' }],
        'lg': ['1.125rem', { lineHeight: '1.55', letterSpacing: '-0.005em' }],
        'xl': ['1.25rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        '2xl': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.015em' }],
        '3xl': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.02em' }],
        '4xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.025em' }],
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.035em' }],
        '7xl': ['4.5rem', { lineHeight: '0.95', letterSpacing: '-0.04em' }],
        '8xl': ['6rem', { lineHeight: '0.9', letterSpacing: '-0.045em' }],
        '9xl': ['8rem', { lineHeight: '0.85', letterSpacing: '-0.05em' }],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
