import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "../../utils";
import {
  setToastHandler,
  clearToastHandler,
  removeToast,
  type Toast,
} from "../../utils/toast";

interface ToasterProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: "bg-green-900/90 border-green-700 text-green-100",
  error: "bg-red-900/90 border-red-700 text-red-100",
  warning: "bg-yellow-900/90 border-yellow-700 text-yellow-100",
  info: "bg-blue-900/90 border-blue-700 text-blue-100",
};

export function Toaster({ position = "top-right" }: ToasterProps) {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);

  useEffect(() => {
    setToastHandler(setCurrentToasts);
    return () => {
      clearToastHandler();
    };
  }, []);

  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  return (
    <div
      className={cn(
        "fixed z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none",
        positionClasses[position]
      )}
    >
      {currentToasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={cn(
              "flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-slide-up pointer-events-auto",
              colors[toast.type]
            )}
          >
            <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{toast.title}</p>
              {toast.message && (
                <p className="text-sm opacity-90 mt-1">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 rounded-full p-1 hover:bg-white/10 transition-colors"
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
