// contexts/LocationContext.tsx
import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import * as Location from "expo-location";
import { AppState, Platform } from "react-native";

interface LocationData {
  lat: number;
  lon: number;
}

interface LocationContextType {
  location: LocationData | null;
  hasPermission: boolean;
  permissionStatus: Location.PermissionStatus | null;
  getCurrentLocation: () => Promise<LocationData | null>;
  requestPermission: () => Promise<boolean>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use the proper Expo hook for foreground permissions
  const [foregroundStatus, requestForegroundPermission] = Location.useForegroundPermissions();

  const getCurrentLocation = async (): Promise<LocationData | null> => {
    try {
      // Check if we have permission using the hook status
      if (foregroundStatus?.status !== Location.PermissionStatus.GRANTED) {
        console.log("No location permission, status:", foregroundStatus?.status);
        return null;
      }

      // Get location - on Android, this will fail if "Allow Once" expired
      const result = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        mayShowUserSettingsDialog: false,
      });

      const newLocation = {
        lat: result.coords.latitude,
        lon: result.coords.longitude,
      };

      setLocation(newLocation);
      return newLocation;
    } catch (error: any) {
      console.error("Failed to get location:", error.message);
      
      // On Android, "Allow Once" expiration shows as permission error even though status is "granted"
      if (Platform.OS === 'android' && error.message?.includes('permission')) {
        console.log("Android: Location permission likely expired (Allow Once)");
        // This will trigger the permission hook to re-check
        setLocation(null);
      }
      
      return null;
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      const result = await requestForegroundPermission();
      return result.status === Location.PermissionStatus.GRANTED;
    } catch (error) {
      console.error("Failed to request permission:", error);
      return false;
    }
  };

  // Get location when permission is granted and on app focus for Android "Allow Once"
  useEffect(() => {
    if (foregroundStatus?.status === Location.PermissionStatus.GRANTED) {
      getCurrentLocation();
    }
  }, [foregroundStatus?.status]);

  // Handle app state changes - according to Expo docs, this is when "Allow Once" expires
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // When app becomes active, try to get location again
        // On Android with "Allow Once", this is when we'll detect the permission expired
        if (foregroundStatus?.status === Location.PermissionStatus.GRANTED) {
          getCurrentLocation();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [foregroundStatus?.status]);

  // Set up periodic refresh
  useEffect(() => {
    if (foregroundStatus?.status === Location.PermissionStatus.GRANTED) {
      intervalRef.current = setInterval(getCurrentLocation, REFRESH_INTERVAL);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [foregroundStatus?.status]);

  // Refresh when app becomes active
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active" && foregroundStatus?.status === Location.PermissionStatus.GRANTED) {
        getCurrentLocation();
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription?.remove();
  }, [foregroundStatus?.status]);

  return (
    <LocationContext.Provider 
      value={{ 
        location, 
        hasPermission: foregroundStatus?.status === Location.PermissionStatus.GRANTED,
        permissionStatus: foregroundStatus?.status || null,
        getCurrentLocation,
        requestPermission
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
