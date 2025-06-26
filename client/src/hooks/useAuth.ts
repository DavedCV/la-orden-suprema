import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/api';
import { toast } from '../components/ui/Toaster';
import type { LoginFormData } from '../schemas/auth';

export function useAuth() {
  const { user, isAuthenticated, isLoading, login, logout, setLoading } = useAuthStore();

  const handleLogin = useCallback(async (credentials: LoginFormData) => {
    try {
      setLoading(true);

      const response = await apiService.login(credentials);

      if (response.success && response.data) {
        login(response.data.user, response.data.token);

        toast({
          type: 'success',
          title: '¡Bienvenido de vuelta!',
          message: `Hola, ${response.data.user.alias}`,
        });

        return { success: true };
      } else {
        toast({
          type: 'error',
          title: 'Error de autenticación',
          message: response.message || 'Credenciales inválidas',
        });

        return {
          success: false,
          error: response.message || 'Credenciales inválidas'
        };
      }
    } catch (error) {
      console.error('Login error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

      toast({
        type: 'error',
        title: 'Error de conexión',
        message: 'No se pudo conectar con el servidor. Intenta de nuevo.',
      });

      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [login, setLoading]);

  const handleLogout = useCallback(() => {
    logout();
    toast({
      type: 'info',
      title: 'Sesión cerrada',
      message: 'Has cerrado sesión correctamente',
    });
  }, [logout]);

  const validateSession = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      setLoading(true);
      const response = await apiService.validateToken();

      if (response.success && response.data) {
        login(response.data, token);
        return true;
      } else {
        handleLogout();
        return false;
      }
    } catch {
      handleLogout();
      return false;
    } finally {
      setLoading(false);
    }
  }, [login, handleLogout, setLoading]);

  // Utility functions
  const isAdmin = user?.role === 'admin';
  const isAssassin = user?.role === 'assassin';
  const userName = user?.alias || 'Usuario';

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    isAssassin,
    userName,

    // Functions
    login: handleLogin,
    logout: handleLogout,
    validateSession,
  };
}
