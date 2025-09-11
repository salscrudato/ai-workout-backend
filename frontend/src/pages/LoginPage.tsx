import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Dumbbell, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { Loading } from '../components/ui';

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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loading size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side - Hero content */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="max-w-md w-full">
          {/* Logo and brand */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              AI Workout
            </h1>
            <p className="text-lg text-gray-600">
              Your personal AI fitness trainer
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6 mb-12">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI-Powered Workouts</h3>
                <p className="text-sm text-gray-600">Personalized routines created just for you</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Progress Tracking</h3>
                <p className="text-sm text-gray-600">Monitor your fitness journey with detailed insights</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Equipment Flexible</h3>
                <p className="text-sm text-gray-600">Works with any equipment or bodyweight only</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigningIn ? (
                <Loading size="sm" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
            
            {error && (
              <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {error}
              </p>
            )}
            
            <p className="mt-6 text-xs text-gray-500">
              By continuing, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-white rounded-3xl shadow-xl mx-auto flex items-center justify-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
                <Dumbbell className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Start Your Fitness Journey Today
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Join thousands of users who have transformed their fitness with AI-powered workouts tailored to their goals and equipment.
          </p>
          
          <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">10K+</div>
              <div>Workouts Generated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">5K+</div>
              <div>Happy Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">4.9★</div>
              <div>User Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
