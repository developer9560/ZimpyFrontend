// Auth Store - Zustand

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginCredentials, SignupData, AuthResponse, AdminAuthResponse } from '@/src/types';
import { authAPI, userAPI } from '@/src/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  // Modal State
  isLoginOpen: boolean;
  isSignupOpen: boolean;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  loginWithOTP: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearError: () => void;
  fetchProfile: () => Promise<void>;
  // Password Reset Flow
  requestPasswordReset: (email: string) => Promise<void>;
  verifyResetOTP: (email: string, otp: string) => Promise<void>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
  resendResetOTP: (email: string) => Promise<void>;
  // Modal Actions
  openLogin: () => void;
  closeLogin: () => void;
  openSignup: () => void;
  closeSignup: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isLoginOpen: false,
      isSignupOpen: false,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response: AdminAuthResponse = await authAPI.login(credentials);
          set({
            token: response.accessToken, // use accessToken from response
            isAuthenticated: true,
            isLoading: false,
          });
          // Store token in localStorage for API interceptor
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', response.accessToken);
          }
          // Fetch profile after login to get user details
          await get().fetchProfile();
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      signup: async (data: SignupData) => {
        set({ isLoading: true, error: null });
        try {
          // Backend returns: "User registered successfully" - no token
          await authAPI.signup(data);
          set({ isLoading: false });
          // After signup, user needs to login
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Signup failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      loginWithOTP: async (phone: string, otp: string) => {
        set({ isLoading: true, error: null });
        try {
          const response: AuthResponse = await authAPI.verifyOTP(phone, otp);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', response.token);
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'OTP verification failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
        }
      },

      setUser: (user: User) => {
        set({ user });
      },

      setToken: (token: string) => {
        set({ token, isAuthenticated: true });
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', token);
        }
      },

      clearError: () => {
        set({ error: null });
      },

      fetchProfile: async () => {
        const { token } = get();
        if (!token) return;

        set({ isLoading: true });
        try {
          const response = await userAPI.getProfile();
          set({ user: response.data as any, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          // If profile fetch fails, clear auth state
          get().logout();
        }
      },

      // Password Reset Actions
      requestPasswordReset: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          await authAPI.requestPasswordReset(email);
          set({ isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to send OTP';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      verifyResetOTP: async (email: string, otp: string) => {
        set({ isLoading: true, error: null });
        try {
          await authAPI.verifyPasswordResetOTP(email, otp);
          set({ isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Invalid OTP';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      resetPassword: async (email: string, otp: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        try {
          await authAPI.confirmPasswordReset(email, otp, newPassword);
          set({ isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to reset password';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      resendResetOTP: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          await authAPI.resendPasswordResetOTP(email);
          set({ isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to resend OTP';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      // Modal Actions
      openLogin: () => set({ isLoginOpen: true, isSignupOpen: false, error: null }),
      closeLogin: () => set({ isLoginOpen: false, error: null }),
      openSignup: () => set({ isSignupOpen: true, isLoginOpen: false, error: null }),
      closeSignup: () => set({ isSignupOpen: false, error: null }),
    }),
    {
      name: 'zimpy-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
