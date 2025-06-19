// hooks/useAuthGuard.ts
import { useState } from "react";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useQueryClient } from "@tanstack/react-query";
import { useLocationPermissionGuard } from "./useLocationPermissionGuard";

export const useAuthGuard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const queryClient = useQueryClient();
  const { checkAndNavigate } = useLocationPermissionGuard({
    redirectToTabs: true,
  });

  const checkAuthAndNavigate = async () => {
    setIsLoading(true);

    try {
      // First check React Query cache (for current session)
      const cachedAuth = queryClient.getQueryData(["auth"]);

      if (cachedAuth) {
        // User is authenticated in current session
        setIsAuthenticated(true);
        await checkAndNavigate();
        return;
      }

      // Check SecureStore for persisted token (across app restarts)
      const token = await SecureStore.getItemAsync("authToken");

      if (token) {
        // Token exists, restore auth state
        setIsAuthenticated(true);

        // Restore the auth data to React Query cache
        queryClient.setQueryData(["auth"], { accessToken: token });

        await checkAndNavigate();
      } else {
        // No authentication found - navigate to login
        setIsAuthenticated(false);
        router.replace("/(auth)");
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setIsAuthenticated(false);
      // On error, also navigate to login
      router.replace("/(auth)");
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function to clear all auth data
  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync("authToken");
      queryClient.setQueryData(["auth"], null);
      queryClient.clear(); // Clear all cached data
      setIsAuthenticated(false);
      router.replace("/(auth)");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return {
    isLoading,
    isAuthenticated,
    checkAuthAndNavigate,
    logout,
  };
};
