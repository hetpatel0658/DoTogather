import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="p-4 text-center">
          <h2 className="text-xl font-bold text-red-500 mb-2">Something went wrong</h2>
          <p className="text-white mb-4">Please try refreshing the page</p>
          {this.state.error && (
            <div className="mb-4 p-2 bg-gray-800 rounded text-left overflow-auto max-h-40 text-sm text-gray-300">
              <p className="font-bold">Error: {this.state.error.message}</p>
              <p className="text-xs mt-2">{this.state.error.stack}</p>
            </div>
          )}
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-app-teal text-black rounded-lg"
          >
            Refresh
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;