import React, { Component } from "react";
import type { ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "../../../shared/components/Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ProfileErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ProfileErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-orden-900 flex items-center justify-center">
          <div className="max-w-md w-full mx-auto text-center space-y-6">
            <div className="bg-orden-800 rounded-lg p-8 border border-orden-700">
              <div className="flex justify-center mb-4">
                <div className="bg-red-500/20 p-3 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-orden-100 mb-2">
                Error en el Perfil
              </h2>

              <p className="text-orden-400 mb-6">
                Ha ocurrido un error inesperado al cargar tu perfil. Por favor,
                intenta recargar la página o contacta al soporte si el problema
                persiste.
              </p>

              {/* Error details in development */}
              {import.meta.env.DEV && this.state.error && (
                <div className="bg-orden-900 rounded-lg p-4 mb-6 text-left">
                  <p className="text-xs text-red-400 font-mono">
                    {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <pre className="text-xs text-orden-500 mt-2 overflow-auto">
                      {this.state.error.stack.slice(0, 300)}...
                    </pre>
                  )}
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={this.handleRetry}
                  className="bg-gold-500 hover:bg-gold-600 text-orden-900"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => window.location.reload()}
                >
                  Recargar Página
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
