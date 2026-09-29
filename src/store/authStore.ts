/**
 * Deal Intelligence Agent - Authentication Store
 * 
 * Zustand store driven strictly by backend API authentication.
 * No hardcoded or fake users.
 */

import { create } from 'zustand';
import { api, clearAuthTokens, getAuthToken, setAuthTokens } from '../lib/api/client';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string; rememberMe?: boolean }) => Promise<void>;
  register: (userData: {
    fullName: string;
    email: string;
    company: string;
    role: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Listen for 401 unauthorized events from API client
  if (typeof window !== 'undefined') {
    window.addEventListener('auth:unauthorized', () => {
      set({ user: null, token: null, isAuthenticated: false });
    });
  }

  return {
    user: null,
    token: getAuthToken(),
    isAuthenticated: !!getAuthToken(),
    isLoading: !!getAuthToken(), // If we have a token, start loading to verify
    error: null,

    login: async (credentials) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.auth.login(credentials);
        setAuthTokens(response.token, response.refreshToken);
        set({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (err: any) {
        let msg = 'Authentication failed. Please check credentials or backend availability.';
        if (typeof err?.message === 'string' && err.message !== '[object Object]') {
          msg = err.message;
        } else if (typeof err?.error?.message === 'string') {
          msg = err.error.message;
        } else if (typeof err?.error === 'string') {
          msg = err.error;
        }
        set({
          error: msg,
          isLoading: false,
          isAuthenticated: false,
        });
        throw err;
      }
    },

    register: async (userData) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.auth.register(userData);
        setAuthTokens(response.token, response.refreshToken);
        set({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (err: any) {
        let msg = 'Registration failed. Please check connection and try again.';
        if (typeof err?.message === 'string' && err.message !== '[object Object]') {
          msg = err.message;
        } else if (typeof err?.error?.message === 'string') {
          msg = err.error.message;
        } else if (typeof err?.error === 'string') {
          msg = err.error;
        }
        set({
          error: msg,
          isLoading: false,
          isAuthenticated: false,
        });
        throw err;
      }
    },

    logout: () => {
      clearAuthTokens();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    },

    checkAuth: async () => {
      const token = getAuthToken();
      if (!token) {
        set({ isAuthenticated: false, isLoading: false, user: null });
        return;
      }

      set({ isLoading: true });
      try {
        const user = await api.auth.getCurrentUser();
        set({ user, isAuthenticated: true, isLoading: false });
      } catch {
        // Token invalid or backend unreachable
        clearAuthTokens();
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    },

    clearError: () => set({ error: null }),
  };
});
