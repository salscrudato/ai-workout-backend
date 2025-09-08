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
import KeyboardShortcutsHelp from './components/ui/KeyboardShortcutsHelp';
import { ToastProvider as EnhancedToastProvider } from './components/ui/ToastManager';
import { useGlobalShortcuts } from './hooks/useKeyboardShortcuts';

import { initializeBrowserCompatibility } from './utils/browserCompatibility';

// Lazy load page components for better performance
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfileSetupPage = lazy(() => import('./pages/ProfileSetupPage'));
const WorkoutGeneratorPage = lazy(() => import('./pages/WorkoutGeneratorPage'));
const WorkoutDetailPage = lazy(() => import('./pages/WorkoutDetailPage'));
const WorkoutHistoryPage = lazy(() => import('./pages/WorkoutHistoryPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Profile Setup Route - redirects to setup if user is new
function ProfileSetupRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isNewUser, profile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isNewUser || !profile) {
    return <Navigate to="/profile-setup" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
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
  );
}

// Enhanced App component with new features
function EnhancedAppContent() {
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

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
