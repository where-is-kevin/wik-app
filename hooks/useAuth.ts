// hooks/useAuth.ts - Single source of truth for auth
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTimedAjax } from "@/utilities/apiUtils";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const API_URL = Constants.expoConfig?.extra?.apiUrl as string;

interface User {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
}

interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: User;
}


// Secure storage keys
const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_KEY = "authUser";
const FIRST_TIME_USER_KEY = "isFirstTimeUser";

// Auth storage utilities
const authStorage = {
  async getAuth(): Promise<AuthResponse | null> {
    try {
      const [token, userJson] = await Promise.all([
        SecureStore.getItemAsync(AUTH_TOKEN_KEY),
        SecureStore.getItemAsync(AUTH_USER_KEY),
      ]);

      if (token && userJson) {
        const user = JSON.parse(userJson);
        return {
          accessToken: token,
          tokenType: "Bearer",
          user,
        };
      }
      return null;
    } catch (error: any) {
      console.error("Error getting auth from storage:", error);
      // Handle decryption errors by clearing corrupted data
      if (error?.message?.includes("Could not decrypt")) {
        await this.clearAuth();
      }
      return null;
    }
  },

  async setAuth(authData: AuthResponse): Promise<void> {
    try {
      await Promise.all([
        SecureStore.setItemAsync(AUTH_TOKEN_KEY, authData.accessToken),
        SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(authData.user)),
      ]);
    } catch (error) {
      console.error("Error storing auth data:", error);
      throw error;
    }
  },

  async clearAuth(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(AUTH_TOKEN_KEY).catch(() => {}),
        SecureStore.deleteItemAsync(AUTH_USER_KEY).catch(() => {}),
      ]);
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  },

  async isFirstTimeUser(): Promise<boolean> {
    try {
      const flag = await AsyncStorage.getItem(FIRST_TIME_USER_KEY);
      return flag === null; // First time if flag doesn't exist
    } catch (error) {
      console.error("Error checking first time user:", error);
      return true; // Default to first time on error
    }
  },

  async setNotFirstTimeUser(): Promise<void> {
    try {
      await AsyncStorage.setItem(FIRST_TIME_USER_KEY, "false");
    } catch (error) {
      console.error("Error setting first time user flag:", error);
    }
  },
};


// Main auth hook
export function useAuth() {
  const queryClient = useQueryClient();

  // Query to manage auth state
  const authQuery = useQuery({
    queryKey: ["auth"],
    queryFn: authStorage.getAuth,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });


  // Logout function
  const logout = async () => {
    try {
      await authStorage.clearAuth();
      
      // Clear all cached data when logging out
      queryClient.clear();
      
      router.replace("/(auth)");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return {
    // Auth state
    authData: authQuery.data,
    isAuthenticated: Boolean(authQuery.data?.accessToken),
    token: authQuery.data?.accessToken || null,
    user: authQuery.data?.user || null,

    // Query state
    isLoading: authQuery.isLoading,
    isError: authQuery.isError,
    error: authQuery.error,


    // Actions
    logout,
    refetchAuth: authQuery.refetch,
  };
}

// Hook for getting auth headers (for API calls)
export function useAuthHeaders() {
  const { token } = useAuth();

  return {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
}
