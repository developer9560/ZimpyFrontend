// Auth Store - Zustand

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginCredentials, SignupData, AuthResponse, AdminAuthResponse, ApiResponse } from '@/src/types';
import { authAPI, userAPI } from '@/src/lib/api';
import { isAdminFromToken, extractRoleFromToken, isTokenExpired } from '@/src/lib/jwtUtils';

import { jwtDecode } from 'jwt-decode';
import { useState } from 'react';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
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
  verifySession: () => void;
  clearError: () => void;
  fetchProfile: () => Promise<void>;
  verifyAdminRole: () => Promise<boolean>;
  adminLogin: (credentials: LoginCredentials) => Promise<void>;
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
      isAdmin: false,
      isLoginOpen: false,
      isSignupOpen: false,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response: ApiResponse<AdminAuthResponse> = await authAPI.login(credentials);

          if (!response.success) {
            throw new Error(response.message || 'Login failed');
          }

          const token = response.data.accessToken;


          set({
            token: token,
            isAuthenticated: true,
            isLoading: false,
          });
          // Store token in localStorage for API interceptor
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', token);
          }
          // Verify session to set up timer
          get().verifySession();

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
          get().verifySession();
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
          isAdmin: false,
        });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('user');
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
        get().verifySession();
      },

      verifySession: () => {
        const { token, logout } = get();
        if (!token) return;

        try {
          const decoded: any = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decoded.exp < currentTime) {
            // Token expired
            logout();
          } else {
            // Optional: Set timeout to logout when token expires
            // Clearing existing timeout if sophisticated logic needed, but simple timeout works for now
            const timeUntilExpiry = (decoded.exp - currentTime) * 1000;
            if (timeUntilExpiry > 0 && timeUntilExpiry < 24 * 60 * 60 * 1000) { // Safety limit
              setTimeout(() => {
                get().logout();
                // Let the UI components handle redirect if on a protected route
              }, timeUntilExpiry);
            }
          }
        } catch (error) {
          // Invalid token format
          logout();
        }
      },

      clearError: () => {
        set({ error: null });
      },

      fetchProfile: async () => {
        const { token } = get();
        if (!token) return;

        // Check validity before fetch
        get().verifySession();
        if (!get().isAuthenticated) return;

        set({ isLoading: true });
        try {
          const response = await userAPI.getProfile();
          const userData = response.data as any;

          // Check if user has admin role
          const isAdmin = userData?.role === 'ADMIN';

          set({
            user: userData,
            isAdmin,
            isLoading: false
          });
        } catch (error) {
          set({ isLoading: false });
          // If profile fetch fails, clear auth state
          get().logout();
        }
      },

      verifyAdminRole: async (): Promise<boolean> => {
        const { token } = get();
        if (!token) return false;

        try {
          // Decode JWT token to extract role
          const isAdmin = isAdminFromToken(token);
          set({ isAdmin });
          return isAdmin;
        } catch (error) {
          console.error('Admin role verification failed:', error);
          set({ isAdmin: false });
          return false;
        }
      },

      adminLogin: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response: ApiResponse<AdminAuthResponse> = await authAPI.adminLogin(credentials);

          if (!response.success) {
            throw new Error(response.message || 'Admin login failed');
          }

          const token = response.data.accessToken;

          // Verify admin role from token BEFORE setting state
          const isAdmin = isAdminFromToken(token);

          if (!isAdmin) {
            throw new Error('Access denied. Admin privileges required.');
          }

          set({
            token: token,
            isAuthenticated: true,
            isAdmin: true,
            isLoading: false,
          });

          // Store token in localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', token);
            localStorage.setItem('adminToken', token);
          }

          // Verify session to set up timer
          get().verifySession();

          // Fetch profile to get user details
          await get().fetchProfile();
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Admin login failed';
          set({ error: message, isLoading: false });
          throw error;
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
        isAdmin: state.isAdmin,
      }),
      onRehydrateStorage: () => (state) => {
        // Verify session immediately after rehydration
        if (state) {
          state.verifySession();
        }
      },
    }
  )
);
