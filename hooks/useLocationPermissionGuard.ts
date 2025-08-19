// hooks/useLocationPermissionGuard.ts
import { useState } from "react";
import { Platform } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

const LOCATION_PERMISSION_KEY = "@location_permission_status";
const LOCATION_PERMISSION_ASKED_KEY = "@location_permission_asked";

export type LocationPermissionStatus =
  | "granted"
  | "denied"
  | "not-asked"
  | "undetermined";

interface UseLocationPermissionGuardOptions {
  redirectToTabs?: boolean;
  skipLocationCheck?: boolean;
}

export const useLocationPermissionGuard = (
  options: UseLocationPermissionGuardOptions = {}
) => {
  const { redirectToTabs = true, skipLocationCheck = false } = options;
  const [permissionStatus, setPermissionStatus] =
    useState<LocationPermissionStatus>("not-asked");
  const [isLoading, setIsLoading] = useState(true);
  const [hasAskedBefore, setHasAskedBefore] = useState(false);

  // Save permission status to AsyncStorage
  const savePermissionStatus = async (status: LocationPermissionStatus) => {
    try {
      await AsyncStorage.setItem(LOCATION_PERMISSION_KEY, status);
      if (status !== "not-asked") {
        await AsyncStorage.setItem(LOCATION_PERMISSION_ASKED_KEY, "true");
      }
    } catch (error) {
      console.error("Error saving permission status:", error);
    }
  };

  // Check current device permission status
  const checkCurrentPermissionStatus =
    async (): Promise<LocationPermissionStatus> => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        console.log("Raw permission status from Expo:", status);
        if (status === "granted") return "granted";
        if (status === "denied") return "denied";
        return "undetermined"; // For 'undetermined' and other states
      } catch (error) {
        console.error("Error checking current permission:", error);
        return "undetermined"; // Default to undetermined to show permission screen
      }
    };

  // Main permission check logic
  const checkAndNavigate = async () => {
    if (skipLocationCheck) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Check if user has been asked before
      const hasAsked = await AsyncStorage.getItem(
        LOCATION_PERMISSION_ASKED_KEY
      );
      const wasAskedBefore = hasAsked === "true";

      // Check current device permission status
      const currentStatus = await checkCurrentPermissionStatus();

      console.log("Debug permission state:", {
        currentStatus,
        hasAsked,
        wasAskedBefore,
        platform: Platform.OS
      });

      setPermissionStatus(currentStatus);
      setHasAskedBefore(wasAskedBefore);

      // Handle different permission states with platform-specific logic
      if (currentStatus === "granted") {
        // Permission granted, go to tabs
        console.log("Permission granted, going to tabs");
        if (redirectToTabs) {
          router.replace("/(tabs)");
        }
      } else if (currentStatus === "undetermined") {
        // Always show permission screen for undetermined status
        console.log("Permission undetermined, showing permission screen");
        router.replace("/(auth)/location-permission");
      } else if (currentStatus === "denied") {
        // Check if user permanently denied or just denied once
        if (Platform.OS === "android" && !wasAskedBefore) {
          // First time denial on Android - ask again (could be "Allow Once" expiring)
          console.log("Android: First denial, asking again");
          router.replace("/(auth)/location-permission");
        } else {
          // User permanently denied permission, respect their choice
          console.log("Permission permanently denied, going to tabs anyway");
          if (redirectToTabs) {
            router.replace("/(tabs)");
          }
        }
      } else if (!wasAskedBefore) {
        // First time user - always show permission screen to request access
        console.log("First time user, showing permission screen");
        router.replace("/(auth)/location-permission");
      } else {
        // Fallback case
        console.log("Fallback: going to tabs");
        if (redirectToTabs) {
          router.replace("/(tabs)");
        }
      }
    } catch (error) {
      console.error("Error in permission check:", error);
      // On error, show permission screen to be safe
      router.replace("/(auth)/location-permission");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle permission response from the permission screen
  const handlePermissionResponse = async (granted: boolean) => {
    const status: LocationPermissionStatus = granted ? "granted" : "denied";
    await savePermissionStatus(status);
    setPermissionStatus(status);

    if (redirectToTabs) {
      router.replace("/(tabs)");
    }
  };

  // Reset permission status (useful for testing or settings)
  const resetPermissionStatus = async () => {
    try {
      await AsyncStorage.removeItem(LOCATION_PERMISSION_KEY);
      await AsyncStorage.removeItem(LOCATION_PERMISSION_ASKED_KEY);
      setPermissionStatus("not-asked");
      setHasAskedBefore(false);
    } catch (error) {
      console.error("Error resetting permission status:", error);
    }
  };

  // Check if we should show the permission screen
  const shouldShowPermissionScreen = () => {
    return (
      permissionStatus === "not-asked" ||
      (permissionStatus === "denied" && !hasAskedBefore)
    );
  };

  // Check if user can access main app
  const canAccessMainApp = () => {
    return (
      permissionStatus === "granted" ||
      (permissionStatus === "denied" && hasAskedBefore)
    );
  };

  return {
    permissionStatus,
    isLoading,
    hasAskedBefore,
    checkAndNavigate,
    handlePermissionResponse,
    resetPermissionStatus,
    shouldShowPermissionScreen,
    canAccessMainApp,
    savePermissionStatus,
  };
};
