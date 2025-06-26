interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

// Simple global state for toasts
let globalToasts: Toast[] = [];
let globalSetToasts: ((toasts: Toast[]) => void) | null = null;

export function setToastHandler(handler: (toasts: Toast[]) => void) {
  globalSetToasts = handler;
}

export function clearToastHandler() {
  globalSetToasts = null;
}

export function toast(options: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36);
  const newToast: Toast = {
    id,
    duration: 5000,
    ...options,
  };

  globalToasts = [...globalToasts, newToast];
  globalSetToasts?.(globalToasts);

  // Auto remove toast after duration
  if (newToast.duration && newToast.duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, newToast.duration);
  }
}

export function removeToast(id: string) {
  globalToasts = globalToasts.filter((toast) => toast.id !== id);
  globalSetToasts?.(globalToasts);
}

export type { Toast };
