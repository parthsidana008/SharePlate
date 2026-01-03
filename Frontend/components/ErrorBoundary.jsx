import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log the error to the console and allow the UI to display details
    console.error('ErrorBoundary caught an error', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-slate-600 mb-4">An unexpected error occurred. You can reload the page or inspect the error below for debugging.</p>
            <div className="bg-slate-50 rounded-md border border-slate-100 p-3 mb-4 overflow-auto max-h-48 text-xs">
              <pre className="whitespace-pre-wrap text-xs text-slate-700">{String(this.state.error && this.state.error.message)}</pre>
              {this.state.error?.stack && (
                <details className="mt-2 text-xs text-slate-500">
                  <summary className="cursor-pointer">Show stack trace</summary>
                  <pre className="whitespace-pre-wrap mt-2 text-xs text-slate-600">{this.state.error.stack}</pre>
                </details>
              )}
            </div>
            <div className="flex justify-between items-center">
              <div>
                <button
                  onClick={() => navigator.clipboard?.writeText(this.state.error?.stack || this.state.error?.message || '')}
                  className="px-3 py-2 mr-2 bg-slate-100 text-slate-700 rounded-md text-sm"
                >
                  Copy Error
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={this.handleReload}
                  className="px-4 py-2 bg-slate-900 text-white rounded-md"
                >
                  Reload
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
