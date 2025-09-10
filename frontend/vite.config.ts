import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Optimize React plugin for production
      babel: {
        plugins: process.env.NODE_ENV === 'production' ? [
          // Remove console.log in production only
          ['babel-plugin-transform-remove-console', { exclude: ['error', 'warn'] }],
        ] : [],
      },
    }),
  ],

  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@pages': resolve(__dirname, './src/pages'),
      '@services': resolve(__dirname, './src/services'),
      '@utils': resolve(__dirname, './src/utils'),
      '@types': resolve(__dirname, './src/types'),
    },
  },

  build: {
    // Optimize build output for maximum performance
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: process.env.NODE_ENV === 'development',

    // Optimize bundle size
    reportCompressedSize: false, // Faster builds
    chunkSizeWarningLimit: 1000,

    // Enable CSS code splitting
    cssCodeSplit: true,

    // Optimize asset handling
    assetsInlineLimit: 4096, // Inline assets smaller than 4KB

    // Advanced Rollup configuration for optimal bundling
    rollupOptions: {
      output: {
        // Optimized chunk naming strategy
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId;
          if (facadeModuleId) {
            if (facadeModuleId.includes('node_modules')) {
              return 'vendor/[name]-[hash].js';
            }
            if (facadeModuleId.includes('pages')) {
              return 'pages/[name]-[hash].js';
            }
            if (facadeModuleId.includes('components')) {
              return 'components/[name]-[hash].js';
            }
          }
          return 'chunks/[name]-[hash].js';
        },
        entryFileNames: 'entry/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
            return `images/[name]-[hash].[ext]`;
          }
          if (/css/i.test(ext || '')) {
            return `styles/[name]-[hash].[ext]`;
          }
          return `assets/[name]-[hash].[ext]`;
        },

        // Optimized manual chunk splitting
        manualChunks: (id) => {
          // Vendor chunks - more granular splitting
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
              return 'form-vendor';
            }
            if (id.includes('firebase')) {
              return 'firebase-vendor';
            }
            if (id.includes('lucide-react') || id.includes('clsx') || id.includes('framer-motion')) {
              return 'ui-vendor';
            }
            if (id.includes('axios')) {
              return 'http-vendor';
            }
            if (id.includes('date-fns')) {
              return 'utils-vendor';
            }
            return 'vendor';
          }

          // App chunks
          if (id.includes('/contexts/')) {
            return 'contexts';
          }
          if (id.includes('/services/')) {
            return 'services';
          }
          if (id.includes('/pages/')) {
            return 'pages';
          }
          if (id.includes('/components/ui/')) {
            return 'ui-components';
          }
          if (id.includes('/components/')) {
            return 'components';
          }
          if (id.includes('/utils/')) {
            return 'utils';
          }
        },
      },

      // Tree shaking optimizations
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
      },
    },

    // CommonJS optimization
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },

  // Development server optimization
  server: {
    hmr: {
      overlay: false, // Disable error overlay for better UX
      port: 24678, // Custom HMR port
    },
    host: true, // Listen on all addresses
    port: 5173,
    strictPort: false,
    // Optimize file watching
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**'],
    },
  },

  // Dependency optimization for faster dev startup
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-hook-form',
      '@hookform/resolvers/zod',
      'zod',
      'axios',
      'lucide-react',
      'clsx',
      'date-fns',
      'framer-motion',
    ],
    exclude: ['firebase'],
    // Force optimization of these dependencies
    force: false,
  },

  // Performance optimizations
  esbuild: {
    // Remove console.log in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    // Optimize for modern browsers
    target: 'es2020',
  },

  // CSS optimization
  css: {
    devSourcemap: process.env.NODE_ENV === 'development',
    preprocessorOptions: {
      // Add any CSS preprocessor options here
    },
  },

  // Define global constants
  define: {
    __DEV__: process.env.NODE_ENV === 'development',
    __PROD__: process.env.NODE_ENV === 'production',
  },
});
