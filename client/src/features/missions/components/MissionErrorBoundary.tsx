import { Component } from "react";
import type { ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "../../../shared/components/Button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class MissionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Mission Management Error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-orden-900 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md mx-auto px-4">
            <div className="bg-red-500/20 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-orden-100 mb-2">
                Error en la Gestión de Misiones
              </h2>
              <p className="text-orden-400 mb-4">
                Ha ocurrido un problema inesperado. Por favor, intenta recargar
                la página.
              </p>
              {this.state.error && (
                <details className="text-left bg-orden-800 p-3 rounded border text-sm text-orden-300">
                  <summary className="cursor-pointer mb-2 font-medium">
                    Detalles técnicos
                  </summary>
                  <code className="text-xs">{this.state.error.message}</code>
                </details>
              )}
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={this.handleRetry} variant="primary">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="secondary"
              >
                Recargar Página
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
