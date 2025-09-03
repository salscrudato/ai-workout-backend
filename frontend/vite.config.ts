import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize build output
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false, // Disable sourcemaps in production for smaller bundle

    // Generate unique filenames for better cache busting
    rollupOptions: {
      output: {
        // Improved chunk naming strategy
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId) {
            // Create meaningful chunk names based on the module
            if (facadeModuleId.includes('node_modules')) {
              return 'vendor/[name]-[hash].js'
            }
            if (facadeModuleId.includes('pages')) {
              return 'pages/[name]-[hash].js'
            }
            if (facadeModuleId.includes('components')) {
              return 'components/[name]-[hash].js'
            }
          }
          return 'chunks/[name]-[hash].js'
        },
        entryFileNames: 'entry/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',

        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'firebase-vendor': ['firebase/app', 'firebase/auth'],
          'ui-vendor': ['lucide-react', 'clsx'],
          'http-vendor': ['axios'],

          // App chunks
          'auth': ['./src/contexts/AuthContext.tsx', './src/services/api.ts'],
          'pages': [
            './src/pages/LoginPage.tsx',
            './src/pages/DashboardPage.tsx',
            './src/pages/ProfileSetupPage.tsx',
            './src/pages/WorkoutGeneratorPage.tsx',
            './src/pages/WorkoutDetailPage.tsx',
            './src/pages/WorkoutHistoryPage.tsx',
            './src/pages/ProfilePage.tsx'
          ]
        }
      }
    },

    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,

    // Enable CSS code splitting
    cssCodeSplit: true,

    // Optimize dependencies
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  },

  // Optimize development
  server: {
    hmr: {
      overlay: false // Disable error overlay for better development experience
    }
  },

  // Optimize dependencies
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
      'date-fns'
    ],
    exclude: ['firebase']
  }
})
