import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ConnectionStatus from './components/ui/ConnectionStatus';
import AppLayout from './components/ui/AppLayout';

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

function App() {
  // Initialize browser compatibility on app start
  useEffect(() => {
    initializeBrowserCompatibility().catch(console.error);
  }, []);

  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
