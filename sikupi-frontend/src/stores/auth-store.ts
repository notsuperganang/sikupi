// FILE: src/stores/auth-store.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/types/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,

      // Actions
      setUser: (user) => set({ user }),
      
      setToken: (token) => set({ token }),
      
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setInitialized: (initialized) => set({ isInitialized: initialized }),
      
      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      }),
      
      initialize: () => {
        const state = get();
        if (state.token && state.user) {
          set({ 
            isAuthenticated: true,
            isInitialized: true 
          });
        } else {
          set({ 
            isAuthenticated: false,
            isInitialized: true 
          });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);