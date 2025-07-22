import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastActivity: number;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: User) => void;
  updateLastActivity: () => void;
  isTokenExpired: () => boolean;
}

// Token expiration check (7 days as per backend)
const TOKEN_EXPIRY_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      lastActivity: Date.now(),

      login: (user: User, token: string) => {
        localStorage.setItem('token', token);
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          lastActivity: Date.now(),
        });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          lastActivity: 0,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      updateUser: (user: User) => {
        set({
          user,
          isAuthenticated: true,
          lastActivity: Date.now(),
        });
      },

      updateLastActivity: () => {
        set({ lastActivity: Date.now() });
      },

      isTokenExpired: () => {
        const { lastActivity } = get();
        return Date.now() - lastActivity > TOKEN_EXPIRY_TIME;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        lastActivity: state.lastActivity,
      }),
      // Check token expiration on store rehydration
      onRehydrateStorage: () => (state) => {
        if (state?.isTokenExpired?.()) {
          state.logout();
        }
      },
    }
  )
);
