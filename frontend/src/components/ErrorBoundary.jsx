import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Capture error information for debugging
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Error details:', errorInfo);
    }

    // TODO: Log error to monitoring service in production
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      // Custom error UI
      const { error, errorInfo } = this.state;
      const { fallback: CustomFallback } = this.props;

      // If a custom fallback is provided, use it
      if (CustomFallback) {
        return <CustomFallback error={error} retry={this.handleRetry} />;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600">
                We encountered an unexpected error. This has been logged and we'll work to fix it.
              </p>
            </div>

            {/* Error details for development */}
            {process.env.NODE_ENV === 'development' && error && (
              <div className="mb-6 text-left">
                <details className="bg-gray-100 rounded-lg p-4">
                  <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                    Error Details (Development)
                  </summary>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div>
                      <strong>Error:</strong>
                      <pre className="bg-red-50 p-2 rounded text-red-700 mt-1 text-xs overflow-auto">
                        {error.toString()}
                      </pre>
                    </div>
                    {errorInfo && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="bg-gray-50 p-2 rounded text-gray-600 mt-1 text-xs overflow-auto max-h-32">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-ayur-600 text-white rounded-md hover:bg-ayur-700 focus:outline-none focus:ring-2 focus:ring-ayur-500 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </button>
            </div>

            <div className="mt-6 text-sm text-gray-500">
              If this problem persists, please contact our support team.
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based error boundary for functional components
export const useErrorHandler = () => {
  return (error, errorInfo) => {
    console.error('Uncaught error:', error);
    if (errorInfo) {
      console.error('Error info:', errorInfo);
    }
    
    // You could trigger a state update here to show an error UI
    // or send the error to a logging service
  };
};

// Simple error fallback component
export const SimpleErrorFallback = ({ error, retry }) => (
  <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
    <div className="flex items-start">
      <AlertTriangle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h3 className="text-sm font-medium text-red-800 mb-1">
          Something went wrong
        </h3>
        <p className="text-sm text-red-700 mb-3">
          {error?.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={retry}
          className="text-sm text-red-800 hover:text-red-900 font-medium underline"
        >
          Try again
        </button>
      </div>
    </div>
  </div>
);

// Loading error fallback
export const LoadingErrorFallback = ({ error, retry, isLoading }) => (
  <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
    {isLoading ? (
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-ayur-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    ) : (
      <div className="text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Failed to Load
        </h3>
        <p className="text-gray-600 mb-4">
          {error?.message || 'Unable to load the requested data'}
        </p>
        <button
          onClick={retry}
          className="inline-flex items-center px-4 py-2 bg-ayur-600 text-white rounded-md hover:bg-ayur-700 focus:outline-none focus:ring-2 focus:ring-ayur-500 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </button>
      </div>
    )}
  </div>
);

export default ErrorBoundary;