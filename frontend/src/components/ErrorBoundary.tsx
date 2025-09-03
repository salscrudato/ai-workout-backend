import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import Button from './ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'global';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

/**
 * Comprehensive Error Boundary Component
 * 
 * Features:
 * - Catches JavaScript errors in component tree
 * - Provides different UI based on error level
 * - Logs errors with structured information
 * - Offers recovery actions
 * - Integrates with error reporting services
 */
class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    this.logError(error, errorInfo);
    
    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      level: this.props.level || 'component',
      retryCount: this.retryCount,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error Details:', errorDetails);
      console.groupEnd();
    }

    // In production, you would send this to an error reporting service
    // Example: Sentry, LogRocket, Bugsnag, etc.
    if (process.env.NODE_ENV === 'production') {
      // window.errorReportingService?.captureException(error, {
      //   extra: errorDetails,
      //   tags: {
      //     component: 'ErrorBoundary',
      //     level: this.props.level || 'component',
      //   },
      // });
    }
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
      });
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  private handleReportBug = () => {
    const { error, errorInfo, errorId } = this.state;
    const subject = encodeURIComponent(`Bug Report: ${error?.message || 'Unknown Error'}`);
    const body = encodeURIComponent(`
Error ID: ${errorId}
Error Message: ${error?.message}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}

Component Stack:
${errorInfo?.componentStack}

Error Stack:
${error?.stack}

Please describe what you were doing when this error occurred:
[Your description here]
    `);
    
    window.open(`mailto:support@example.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorId } = this.state;
      const { level = 'component' } = this.props;
      const canRetry = this.retryCount < this.maxRetries;

      // Different UI based on error level
      if (level === 'global') {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Something went wrong
              </h1>
              
              <p className="text-gray-600 mb-6">
                We're sorry, but something unexpected happened. Our team has been notified.
              </p>
              
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-6 p-3 bg-red-50 rounded-md text-left">
                  <p className="text-sm font-medium text-red-800 mb-1">Error Details:</p>
                  <p className="text-xs text-red-700 font-mono break-all">
                    {error?.message}
                  </p>
                  {errorId && (
                    <p className="text-xs text-red-600 mt-1">ID: {errorId}</p>
                  )}
                </div>
              )}
              
              <div className="space-y-3">
                <Button
                  onClick={this.handleReload}
                  variant="primary"
                  fullWidth
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                >
                  Reload Page
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  fullWidth
                  leftIcon={<Home className="w-4 h-4" />}
                >
                  Go to Dashboard
                </Button>
                
                <Button
                  onClick={this.handleReportBug}
                  variant="ghost"
                  size="sm"
                  fullWidth
                  leftIcon={<Bug className="w-4 h-4" />}
                >
                  Report Bug
                </Button>
              </div>
            </div>
          </div>
        );
      }

      if (level === 'page') {
        return (
          <div className="min-h-96 flex items-center justify-center p-8">
            <div className="max-w-sm w-full text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Page Error
              </h2>
              
              <p className="text-gray-600 mb-4">
                This page encountered an error and couldn't load properly.
              </p>
              
              <div className="space-y-2">
                {canRetry && (
                  <Button
                    onClick={this.handleRetry}
                    variant="primary"
                    size="sm"
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                  >
                    Try Again ({this.maxRetries - this.retryCount} left)
                  </Button>
                )}
                
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  size="sm"
                  leftIcon={<Home className="w-4 h-4" />}
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </div>
        );
      }

      // Component level error
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Component Error
              </h3>
              <p className="text-sm text-red-700 mt-1">
                This component encountered an error and couldn't render properly.
              </p>
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  className="mt-2 text-sm text-red-800 underline hover:text-red-900"
                >
                  Try again ({this.maxRetries - this.retryCount} left)
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
