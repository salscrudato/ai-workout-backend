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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-blue-50 to-accent-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/30 rounded-full animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-200/20 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-200/20 rounded-full animate-pulse-slow"></div>
      </div>

      <div className="flex min-h-screen relative z-10">
        {/* Left side - Hero content */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 animate-fade-in-up">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="gradient-blue p-4 rounded-2xl shadow-glow-blue animate-glow">
                  <Dumbbell className="h-10 w-10 text-white animate-bounce-gentle" />
                </div>
              </div>
              <Display
                level={1}
                gradient="fresh"
                animate="shimmer"
                hover
                className="mb-4 animate-fade-in gentle-glow"
              >
                AI Workout
              </Display>
              <Body size={1} color="secondary" className="text-xl animate-fade-in" style={{animationDelay: '0.2s'}}>
                Your personal AI fitness trainer
              </Body>
            </div>

            <div className="space-y-6 animate-fade-in" style={{animationDelay: '0.4s'}}>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-4 p-5 glass rounded-xl hover:bg-white/90 transition-all duration-300 hover:scale-105 group">
                  <div className="gradient-blue p-2 rounded-lg group-hover:shadow-glow-blue transition-all duration-300">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-secondary-700 font-medium">AI-powered workout generation</span>
                </div>
                <div className="flex items-center space-x-4 p-5 glass rounded-xl hover:bg-white/90 transition-all duration-300 hover:scale-105 group" style={{animationDelay: '0.1s'}}>
                  <div className="gradient-blue p-2 rounded-lg group-hover:shadow-glow-blue transition-all duration-300">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-secondary-700 font-medium">Personalized to your goals</span>
                </div>
                <div className="flex items-center space-x-4 p-5 glass rounded-xl hover:bg-white/90 transition-all duration-300 hover:scale-105 group" style={{animationDelay: '0.2s'}}>
                  <div className="gradient-blue p-2 rounded-lg group-hover:shadow-glow-blue transition-all duration-300">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-secondary-700 font-medium">Track your progress</span>
                </div>
              </div>

              {error && (
                <div className="glass border border-red-200 rounded-xl p-4 animate-fade-in">
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}

              <div className="animate-fade-in" style={{animationDelay: '0.6s'}}>
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                  className="w-full flex justify-center items-center px-6 py-4 border-0 text-lg font-semibold rounded-xl text-white gradient-blue hover:shadow-glow-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95 group"
                >
                {isSigningIn ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <svg className="w-6 h-6 mr-3 group-hover:animate-bounce-gentle" viewBox="0 0 24 24">
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
              </div>

              <p className="text-center text-sm text-secondary-500 animate-fade-in" style={{animationDelay: '0.8s'}}>
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Visual */}
        <div className="hidden lg:block flex-1 gradient-blue relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full animate-float"></div>
            <div className="absolute bottom-32 left-20 w-24 h-24 bg-white/5 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-white/15 rounded-full animate-pulse-slow"></div>
          </div>

          <div className="flex items-center justify-center h-full p-12 relative z-10">
            <div className="text-center text-white animate-fade-in-up">
              <div className="glass-dark p-10 rounded-3xl backdrop-blur-md hover:bg-white/20 transition-all duration-500 group">
                <div className="gradient-blue p-4 rounded-2xl mx-auto mb-6 w-fit group-hover:shadow-glow-blue transition-all duration-300">
                  <Dumbbell className="h-20 w-20 text-white animate-heartbeat" />
                </div>
                <Heading
                  level={2}
                  gradient="accent"
                  animate="glow"
                  hover
                  className="mb-3 gentle-glow"
                >
                  AI Workout
                </Heading>
                <Body size={1} className="text-xl opacity-90">Your personal AI fitness trainer</Body>
                <div className="mt-6 flex justify-center space-x-2">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
