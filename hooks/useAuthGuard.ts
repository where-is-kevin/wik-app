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
        setIsAuthenticated(true);
        await checkAndNavigate();
        return;
      }

      // Check SecureStore for persisted token (across app restarts)
      let token: string | null = null;
      try {
        token = await SecureStore.getItemAsync("authToken");
      } catch (error: any) {
        // Handle decryption or keychain errors
        if (
          error?.message &&
          error.message.includes("Could not decrypt the value for key")
        ) {
          await SecureStore.deleteItemAsync("authToken");
        }
        token = null;
      }

      if (token) {
        setIsAuthenticated(true);
        queryClient.setQueryData(["auth"], { accessToken: token });
        await checkAndNavigate();
      } else {
        setIsAuthenticated(false);
        router.replace("/(auth)");
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setIsAuthenticated(false);
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
      queryClient.clear();
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
