import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ConnectionStatus from './components/ui/ConnectionStatus';
import AppLayout from './components/ui/AppLayout';
import SkipLinks from './components/ui/SkipLinks';
import PerformanceDashboard from './components/ui/PerformanceDashboard';
import AccessibilityOptimized from './components/ui/AccessibilityOptimized';
import MobilePerformanceOptimized from './components/ui/MobilePerformanceOptimized';
import ModernLoadingSkeleton from './components/ui/ModernLoadingSkeleton';
import KeyboardShortcutsHelp from './components/ui/KeyboardShortcutsHelp';
import { ToastProvider as EnhancedToastProvider } from './components/ui/ToastManager';
import { useToast } from './components/ui/ToastManager';
import { useGlobalShortcuts } from './hooks/useKeyboardShortcuts';

import { initializeBrowserCompatibility } from './utils/browserCompatibility';

// Optimized lazy loading with preloading hints
const LoginPage = lazy(() =>
  import(/* webpackChunkName: "login" */ './pages/LoginPage')
);
const DashboardPage = lazy(() =>
  import(/* webpackChunkName: "dashboard" */ './pages/DashboardPage')
);
const ProfileSetupPage = lazy(() =>
  import(/* webpackChunkName: "profile-setup" */ './pages/ProfileSetupPage')
);
const WorkoutGeneratorPage = lazy(() =>
  import(/* webpackChunkName: "workout-generator" */ './pages/WorkoutGeneratorPage')
);
const WorkoutDetailPage = lazy(() =>
  import(/* webpackChunkName: "workout-detail" */ './pages/WorkoutDetailPage')
);
const WorkoutHistoryPage = lazy(() =>
  import(/* webpackChunkName: "workout-history" */ './pages/WorkoutHistoryPage')
);
const ProfilePage = lazy(() =>
  import(/* webpackChunkName: "profile" */ './pages/ProfilePage')
);

// Optimized Protected Route Component with memoization
const ProtectedRoute = React.memo(({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <ModernLoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
});

ProtectedRoute.displayName = 'ProtectedRoute';

// Optimized Profile Setup Route with memoization
const ProfileSetupRoute = React.memo(({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isNewUser, profile, loading } = useAuth();

  if (loading) {
    return <ModernLoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isNewUser || !profile) {
    return <Navigate to="/profile-setup" replace />;
  }

  return <>{children}</>;
});

ProfileSetupRoute.displayName = 'ProfileSetupRoute';

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <AccessibilityOptimized>
        <ModernLoadingSkeleton variant="dashboard" />
      </AccessibilityOptimized>
    );
  }

  return (
    <AccessibilityOptimized
      announceChanges
      focusManagement
      highContrast={false}
    >
      <MobilePerformanceOptimized
        lazyLoad
        optimizeImages
        enablePrefetch
      >
        <NavigationProvider>
          <AppLayout
            fabAction={() => window.location.href = '/generate'}
            showFAB={window.location.pathname !== '/generate'}
          >
        {/* Connection Status Banner */}
        <div className="sticky top-0 z-40">
          <ConnectionStatus className="mx-4 mt-4" />
        </div>

        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/profile-setup"
          element={
            <ProtectedRoute>
              <ProfileSetupPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProfileSetupRoute>
              <DashboardPage />
            </ProfileSetupRoute>
          }
        />
        <Route
          path="/generate"
          element={
            <ProfileSetupRoute>
              <WorkoutGeneratorPage />
            </ProfileSetupRoute>
          }
        />
        <Route
          path="/workout/:id"
          element={
            <ProfileSetupRoute>
              <WorkoutDetailPage />
            </ProfileSetupRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProfileSetupRoute>
              <WorkoutHistoryPage />
            </ProfileSetupRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProfileSetupRoute>
              <ProfilePage />
            </ProfileSetupRoute>
          }
        />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
          </AppLayout>
        </NavigationProvider>
      </MobilePerformanceOptimized>
    </AccessibilityOptimized>
  );
}

// Enhanced App component with new features
function EnhancedAppContent() {
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  const { showInfo } = useToast();

  // Global keyboard shortcuts
  const { shortcuts } = useGlobalShortcuts();

  // Enhanced shortcuts with app-specific actions
  const enhancedShortcuts = [
    ...shortcuts,
    {
      key: 'p',
      ctrlKey: true,
      shiftKey: true,
      action: () => setShowPerformanceDashboard(!showPerformanceDashboard),
      description: 'Toggle performance dashboard',
      category: 'Debug',
    },
    {
      key: '?',
      shiftKey: true,
      action: () => setShowKeyboardHelp(!showKeyboardHelp),
      description: 'Show keyboard shortcuts help',
      category: 'Help',
    },
  ];

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    let refreshing = false;
    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      // Give the UI a beat to paint the toast before reload, if any
      setTimeout(() => window.location.reload(), 100);
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;

      const promptAndActivate = (sw: ServiceWorker) => {
        try {
          showInfo('Updating…', 'A new version is installing.');
        } catch {
          // Silently handle toast errors
        }
        sw.postMessage({ type: 'SKIP_WAITING' });
      };

      // If already waiting (e.g., SW updated while tab was in background)
      if (reg.waiting) {
        promptAndActivate(reg.waiting);
      }

      // Listen for new updates
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          // When the new worker is installed and there's an active controller,
          // it means an update is ready.
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            promptAndActivate(newWorker);
          }
        });
      });
    }).catch(() => {});

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, [showInfo]);

  return (
    <>
      {/* Skip links for accessibility */}
      <SkipLinks />

      {/* Main app content */}
      <div id="main-content">
        <AppRoutes />
      </div>

      {/* Enhanced UI components */}
      <PerformanceDashboard
        isOpen={showPerformanceDashboard}
        onClose={() => setShowPerformanceDashboard(false)}
      />

      <KeyboardShortcutsHelp
        isOpen={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
        shortcuts={enhancedShortcuts}
      />

      {/* Connection status indicator */}
      <ConnectionStatus />
    </>
  );
}

function App() {
  // Initialize browser compatibility on app start
  useEffect(() => {
    initializeBrowserCompatibility().catch(console.error);
  }, []);

  return (
    <ThemeProvider>
      <EnhancedToastProvider>
        <ToastProvider>
          <AuthProvider>
            <Router>
              <EnhancedAppContent />
            </Router>
          </AuthProvider>
        </ToastProvider>
      </EnhancedToastProvider>
    </ThemeProvider>
  );
}

export default App;
