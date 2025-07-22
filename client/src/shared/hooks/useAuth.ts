import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/api';
import type { LoginForm, User } from '../types';
import { toast } from '../utils/toast';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, login, logout, setLoading, updateUser } = useAuthStore();

  // Validate token on app start
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiService.validateToken();

        if (response.success && response.data) {
          updateUser(response.data);
        } else {
          // Invalid token, clear it
          localStorage.removeItem('token');
          logout();
        }
      } catch (error) {
        console.error('Token validation failed:', error);
        localStorage.removeItem('token');
        logout();
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [setLoading, updateUser, logout]);

  const handleLogin = async (credentials: LoginForm): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // Clear any existing invalid tokens first
      localStorage.removeItem('token');

      const response = await apiService.login(credentials);

      if (response.success && response.data) {
        const { user, token } = response.data;
        login(user, token);

        toast({
          type: 'success',
          title: 'Bienvenido a La Orden Suprema',
          message: response.message || `Hola, ${user.alias}`,
        });

        return { success: true };
      } else {
        const errorMessage = response.message || 'Error desconocido durante el login';
        toast({
          type: 'error',
          title: 'Error de autenticación',
          message: errorMessage,
        });
        return { success: false, error: errorMessage };
      }
    } catch (error: unknown) {
      const errorMessage = (error instanceof Error ? error.message : 'Error de conexión. Verifique su red y trate nuevamente.');
      console.error('Login error:', error);
      toast({
        type: 'error',
        title: 'Error de conexión',
        message: errorMessage,
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      setLoading(true);

      // Try to notify the backend, but don't wait for it
      apiService.logout().catch(error => {
        console.warn('Logout API call failed:', error);
      });

      logout();
      toast({
        type: 'success',
        title: 'Sesión cerrada',
        message: 'Sesión cerrada exitosamente',
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      logout();
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await apiService.refreshToken();

      if (response.success && response.data?.token) {
        localStorage.setItem('token', response.data.token);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  const updateUserProfile = async (updatedUser: User): Promise<void> => {
    updateUser(updatedUser);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
    refreshToken,
    updateUser: updateUserProfile,
    // Helper methods
    isAdmin: user?.role === 'admin',
    isAssassin: user?.role === 'assassin',
  };
};
