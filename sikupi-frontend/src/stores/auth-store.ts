// FILE 2: sikupi-frontend/src/stores/auth-store.ts
// TAMBAHKAN missing properties yang blocking auth:

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/lib/types/auth";

interface AuthStore {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean; // ADDED: Missing property
  
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setIsInitialized: (isInitialized: boolean) => void;
  setIsLoading: (isLoading: boolean) => void; // ADDED: Missing action
  clearAuth: () => void;
  initialize: () => Promise<void>; // ADDED: Missing initialize method
  
  // Helper methods
  updateUser: (userData: Partial<User>) => void;
  isRole: (role: User['userType']) => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      token: null,
      isAuthenticated: false,
      isInitialized: false,
      isLoading: false, // ADDED: Initial state

      // Core Actions
      setUser: (user: User | null) => {
        set({ user });
      },

      setToken: (token: string | null) => {
        set({ token });
        
        // Sync with localStorage untuk compatibility dengan API service
        if (typeof window !== "undefined") {
          if (token) {
            localStorage.setItem("sikupi_token", token);
          } else {
            localStorage.removeItem("sikupi_token");
            localStorage.removeItem("sikupi_refresh_token");
          }
        }
      },

      setIsAuthenticated: (isAuthenticated: boolean) => {
        set({ isAuthenticated });
      },

      setIsInitialized: (isInitialized: boolean) => {
        set({ isInitialized });
      },

      setIsLoading: (isLoading: boolean) => { // ADDED: Missing setter
        set({ isLoading });
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isInitialized: true,
          isLoading: false
        });
        
        // Clear localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("sikupi_token");
          localStorage.removeItem("sikupi_refresh_token");
        }
      },

      // ADDED: Missing initialize method
      initialize: async () => {
        set({ isLoading: true });
        
        try {
          // Check if we have a token in localStorage
          if (typeof window !== "undefined") {
            const token = localStorage.getItem("sikupi_token");
            if (token) {
              // For now, just set token - real profile fetch happens in useAuthInitializer
              set({ 
                token,
                isAuthenticated: true,
                isInitialized: true,
                isLoading: false
              });
              return;
            }
          }
          
          set({ isInitialized: true, isLoading: false });
        } catch (error) {
          console.error("Auth initialization error:", error);
          set({ isInitialized: true, isLoading: false });
        }
      },

      // Helper Methods
      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({
            user: {
              ...user,
              ...userData,
              updatedAt: new Date().toISOString(),
            }
          });
        }
      },

      isRole: (role: User['userType']) => {
        const { user } = get();
        return user?.userType === role;
      },
    }),
    {
      name: "sikupi-auth", // Name for localStorage key
      storage: createJSONStorage(() => {
        // Only use localStorage in browser environment
        if (typeof window !== "undefined") {
          return localStorage;
        }
        // Return a mock storage for SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      // Only persist certain fields to avoid storing sensitive data
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isInitialized: state.isInitialized,
        // Don't persist token here, it's handled separately
      }),
      // Rehydration callback
      onRehydrateStorage: () => (state) => {
        // Sync token from localStorage on hydration
        if (typeof window !== "undefined" && state) {
          const token = localStorage.getItem("sikupi_token");
          if (token && state.isAuthenticated) {
            state.token = token;
          } else if (!token) {
            // Token doesn't exist, clear auth
            state.user = null;
            state.isAuthenticated = false;
            state.token = null;
          }
        }
      },
    }
  )
);

// Selectors (for better performance and cleaner code)
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthToken = () => useAuthStore((state) => state.token);
export const useIsInitialized = () => useAuthStore((state) => state.isInitialized);
export const useIsLoading = () => useAuthStore((state) => state.isLoading); // ADDED: Missing selector

// Role-based selectors
export const useIsSeller = () => useAuthStore((state) => state.isRole("seller"));
export const useIsBuyer = () => useAuthStore((state) => state.isRole("buyer"));
export const useIsAdmin = () => useAuthStore((state) => state.isRole("admin"));

// Authentication status checks
export const useAuthStatus = () => {
  return useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    isInitialized: state.isInitialized,
    isLoading: state.isLoading, // ADDED: Include isLoading
    user: state.user,
    userType: state.user?.userType,
  }));
};