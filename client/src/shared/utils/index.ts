import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for combining Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date formatting utilities
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  const intervals = {
    año: 31536000,
    mes: 2592000,
    semana: 604800,
    día: 86400,
    hora: 3600,
    minuto: 60,
    segundo: 1,
  };

  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      return interval === 1
        ? `Hace 1 ${unit}`
        : `Hace ${interval} ${unit}${unit === 'mes' ? 'es' : 's'}`;
    }
  }

  return 'Ahora mismo';
}

// Status styling utilities
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    // Assassin status
    'Activo': 'bg-green-100 text-green-800 border-green-200',
    'Retirado': 'bg-gray-100 text-gray-800 border-gray-200',
    'Excommunicado': 'bg-red-100 text-red-800 border-red-200',

    // Mission status
    'No Asignada': 'bg-gray-100 text-gray-800 border-gray-200',
    'Asignada': 'bg-blue-100 text-blue-800 border-blue-200',
    'En Progreso': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Completada': 'bg-green-100 text-green-800 border-green-200',
    'Fallida': 'bg-red-100 text-red-800 border-red-200',

    // Blood marker status
    'Pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Pago Pendiente de Confirmación': 'bg-blue-100 text-blue-800 border-blue-200',
    'Saldado': 'bg-green-100 text-green-800 border-green-200',
  };

  return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
}

// Currency formatting
export function formatGoldCoins(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(amount).replace('€', 'Monedas de Oro');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Form validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe tener al menos una mayúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe tener al menos una minúscula');
  }

  if (!/\d/.test(password)) {
    errors.push('La contraseña debe tener al menos un número');
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('La contraseña debe tener al menos un carácter especial');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Local storage utilities with error handling
export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

// Debounce utility for search
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
