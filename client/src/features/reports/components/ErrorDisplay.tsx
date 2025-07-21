import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "../../../shared/components/Button";

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <div className="min-h-screen bg-orden-900 flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md">
        <AlertTriangle className="h-16 w-16 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-orden-100">
          Error al cargar datos
        </h2>
        <p className="text-orden-400">{message}</p>
        {onRetry && (
          <Button
            onClick={onRetry}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        )}
      </div>
    </div>
  );
}
