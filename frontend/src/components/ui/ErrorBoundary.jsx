import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <AlertTriangle size={48} className="text-amber-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              Algo salió mal
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Ocurrió un error inesperado. Por favor recarga la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
            >
              Recargar página
            </button>
            {import.meta.env.DEV && (
              <pre className="mt-4 text-xs text-red-500 text-left bg-red-50 p-3 rounded overflow-auto max-h-40">
                {this.state.error?.message}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
