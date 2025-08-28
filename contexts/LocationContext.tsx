// contexts/LocationContext.tsx
import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import * as Location from "expo-location";
import { AppState } from "react-native";

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
  errorMsg: string | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getCurrentLocation = async (): Promise<LocationData | null> => {
    try {
      // Only check permission status, don't request
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status);
      
      if (status !== Location.PermissionStatus.GRANTED) {
        console.log("No location permission, status:", status);
        return null;
      }

      // Clear any previous errors
      setErrorMsg(null);

      const result = await Location.getCurrentPositionAsync({});
      
      const newLocation = {
        lat: result.coords.latitude,
        lon: result.coords.longitude,
      };

      setLocation(newLocation);
      return newLocation;
    } catch (error: any) {
      console.error("Failed to get location:", error.message);
      setErrorMsg('Failed to get current location');
      return null;
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      
      if (status !== Location.PermissionStatus.GRANTED) {
        setErrorMsg('Permission to access location was denied');
        return false;
      }

      // Clear error and get location immediately
      setErrorMsg(null);
      await getCurrentLocation();
      return true;
    } catch (error: any) {
      console.error("Failed to request permission:", error);
      setErrorMsg(`Permission request failed: ${error.message}`);
      return false;
    }
  };

  // Get location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Handle app state changes - refresh location when app becomes active
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        getCurrentLocation();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  // Set up periodic refresh when we have permission
  useEffect(() => {
    if (permissionStatus === Location.PermissionStatus.GRANTED) {
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
  }, [permissionStatus]);

  return (
    <LocationContext.Provider 
      value={{ 
        location, 
        hasPermission: permissionStatus === Location.PermissionStatus.GRANTED,
        permissionStatus,
        getCurrentLocation,
        requestPermission,
        errorMsg
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
