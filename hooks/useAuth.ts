// hooks/useAuth.ts - Single source of truth for auth
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTimedAjax } from "@/utilities/apiUtils";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
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

interface LoginData {
  username: string;
  password: string;
}

// Secure storage keys
const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_KEY = "authUser";

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
};

// Login API call
const loginApi = async (data: LoginData): Promise<AuthResponse> => {
  const params = new URLSearchParams();
  params.append("grant_type", "password");
  params.append("username", data.username);
  params.append("password", data.password);
  params.append("scope", "");
  params.append("client_id", "string");
  params.append("client_secret", "string");

  try {
    return await createTimedAjax<AuthResponse>({
      url: `${API_URL}/oauth2/login`,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        accept: "application/json",
      },
      body: params.toString(),
      responseType: "json",
    });
  } catch (error: any) {
    if (error?.response) {
      throw error.response;
    }
    throw error;
  }
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

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: async (data: AuthResponse) => {
      try {
        // Store in secure storage first
        await authStorage.setAuth(data);

        // Then update query cache
        queryClient.setQueryData(["auth"], data);
      } catch (error) {
        console.error("Error saving auth data:", error);
        throw error;
      }
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });

  // Logout function
  const logout = async () => {
    try {
      await authStorage.clearAuth();
      queryClient.setQueryData(["auth"], null);
      queryClient.removeQueries({ queryKey: ["auth"] });
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

    // Login - keeping same interface as your old useLogin hook
    mutate: loginMutation.mutate, // This matches your current usage
    isPending: loginMutation.isPending, // This matches your current usage
    loginError: loginMutation.error,

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
