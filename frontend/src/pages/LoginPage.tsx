import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Dumbbell, Zap, Target, Users } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Display, Heading, Body } from '../components/ui/Typography';

const LoginPage: React.FC = () => {
  const { signInWithGoogle, isAuthenticated, loading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setError(null);
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed:', error);
      setError('Failed to sign in. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Animated background elements - responsive sizing */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-primary-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-96 sm:h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="w-full max-w-sm sm:max-w-md relative z-10">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="gradient-aurora p-3 sm:p-4 rounded-2xl sm:rounded-3xl premium-shadow-lg micro-bounce">
              <Dumbbell className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text-primary mb-2 sm:mb-3 animate-fade-in">
            AI Workout
          </h1>
          <p className="text-neutral-600 text-base sm:text-lg font-medium animate-fade-in-up px-2">
            Your personal AI fitness trainer
          </p>
        </div>

        <div className="glass-premium backdrop-blur-xl animate-scale-in p-4 sm:p-6 lg:p-8 premium-shadow-xl">
          <div className="space-y-6 sm:space-y-8">
            {/* Feature highlights with glass effect - mobile optimized */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 glass-tinted rounded-xl sm:rounded-2xl micro-bounce touch-target">
                <div className="gradient-aurora p-2 sm:p-3 rounded-xl sm:rounded-2xl premium-shadow-sm flex-shrink-0">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="text-neutral-700 font-medium text-sm sm:text-base">AI-powered workout generation</span>
              </div>
              <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 glass-tinted rounded-xl sm:rounded-2xl micro-bounce touch-target">
                <div className="gradient-ocean p-2 sm:p-3 rounded-xl sm:rounded-2xl premium-shadow-sm flex-shrink-0">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="text-neutral-700 font-medium text-sm sm:text-base">Personalized to your goals</span>
              </div>
              <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 glass-tinted rounded-xl sm:rounded-2xl micro-bounce touch-target">
                <div className="gradient-blue p-3 rounded-2xl shadow-glow-sm">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <span className="text-neutral-700 font-medium">Track your progress</span>
              </div>
            </div>

            {error && (
              <div className="glass-light border border-error-200/50 text-error-700 px-4 py-3 rounded-xl animate-fade-in">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="btn btn-primary btn-xl w-full hover-glow relative overflow-hidden group"
            >
              {isSigningIn ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <svg className="w-6 h-6 mr-3 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            <div className="text-center space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent"></div>
                <span className="text-sm text-neutral-500 font-medium">Secure & Private</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent"></div>
              </div>

              <p className="text-sm text-neutral-500 leading-relaxed">
                By continuing, you agree to our{' '}
                <a href="#" className="text-primary-600 hover:text-primary-700 underline underline-offset-2 transition-colors">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary-600 hover:text-primary-700 underline underline-offset-2 transition-colors">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
