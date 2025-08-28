// hooks/useLocationPermissionGuard.ts
import { useState } from "react";
import { router } from "expo-router";
import * as Location from "expo-location";

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

  // Check current device permission status using modern async API
  const checkCurrentPermissionStatus =
    async (): Promise<LocationPermissionStatus> => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        console.log("Raw permission status from Expo:", status);
        
        switch (status) {
          case Location.PermissionStatus.GRANTED:
            return "granted";
          case Location.PermissionStatus.DENIED:
            return "denied";
          case Location.PermissionStatus.UNDETERMINED:
          default:
            return "undetermined";
        }
      } catch (error) {
        console.error("Error checking current permission:", error);
        return "undetermined"; // Default to undetermined to show permission screen
      }
    };

  // Simplified permission check logic following Expo docs pattern
  const checkAndNavigate = async () => {
    if (skipLocationCheck) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Simply check current permission status
      const { status } = await Location.getForegroundPermissionsAsync();
      
      console.log("Location permission status:", status);

      if (status === Location.PermissionStatus.GRANTED) {
        // Permission already granted, go to tabs
        console.log("Permission granted, going to tabs");
        setPermissionStatus("granted");
        if (redirectToTabs) {
          router.replace("/(tabs)");
        }
      } else {
        // Permission not granted (undetermined or denied), show permission screen
        console.log("Permission not granted, showing permission screen");
        setPermissionStatus(status === Location.PermissionStatus.DENIED ? "denied" : "undetermined");
        router.replace("/(auth)/location-permission");
      }
    } catch (error) {
      console.error("Error checking location permission:", error);
      // On error, show permission screen to be safe
      router.replace("/(auth)/location-permission");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle permission response from the permission screen
  const handlePermissionResponse = async (granted: boolean) => {
    const status: LocationPermissionStatus = granted ? "granted" : "denied";
    setPermissionStatus(status);

    if (redirectToTabs) {
      router.replace("/(tabs)");
    }
  };

  // Request permission following Expo docs pattern
  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === Location.PermissionStatus.GRANTED;
      
      console.log("Location permission request result:", status);
      setPermissionStatus(granted ? "granted" : "denied");
      
      if (!granted) {
        console.log("Permission to access location was denied");
      }
      
      return granted;
    } catch (error) {
      console.error("Failed to request location permission:", error);
      setPermissionStatus("denied");
      return false;
    }
  };

  return {
    permissionStatus,
    isLoading,
    checkAndNavigate,
    handlePermissionResponse,
    requestLocationPermission,
  };
};
