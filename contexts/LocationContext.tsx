// contexts/LocationContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import * as Location from "expo-location";
import { AppState, AppStateStatus } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface LocationContextType {
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  requestLocationPermission: () => Promise<boolean>;
  refreshLocation: () => Promise<void>;
  hasLocationPermission: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

const LOCATION_STORAGE_KEY = "user_location";
const LOCATION_EXPIRY_TIME = 2 * 60 * 1000; // 2 minutes

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  // Load cached location on mount
  useEffect(() => {
    loadCachedLocation();
    checkLocationPermission();
  }, []);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        // Check permission status when app becomes active (user might have changed it in settings)
        await checkLocationPermission();
        
        if (hasLocationPermission) {
          // Refresh location when app becomes active
          refreshLocationIfStale();
        }
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription?.remove();
  }, [hasLocationPermission]);

  const loadCachedLocation = async () => {
    try {
      const cachedLocation = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
      if (cachedLocation) {
        const parsedLocation = JSON.parse(cachedLocation);
        
        // Only use cached location if it's not stale
        if (Date.now() - parsedLocation.timestamp <= LOCATION_EXPIRY_TIME) {
          setLocation(parsedLocation);
        } else {
          // If stale, trigger immediate refresh
          refreshLocation();
        }
      }
    } catch (error) {
      console.error("Error loading cached location:", error);
    }
  };

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setHasLocationPermission(status === "granted");
    } catch (error) {
      console.error("Error checking location permission:", error);
    }
  };

  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setError("Location permission denied");
        setHasLocationPermission(false);
        return false;
      }

      setHasLocationPermission(true);
      await getCurrentLocation();
      return true;
    } catch (error) {
      setError("Failed to request location permission");
      console.error("Location permission error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCurrentLocation =
    useCallback(async (): Promise<LocationData | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const locationResult = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeInterval: 500,
          distanceInterval: 5,
        });

        const newLocation: LocationData = {
          latitude: locationResult.coords.latitude,
          longitude: locationResult.coords.longitude,
          timestamp: Date.now(),
        };

        setLocation(newLocation);
        await AsyncStorage.setItem(
          LOCATION_STORAGE_KEY,
          JSON.stringify(newLocation)
        );

        return newLocation;
      } catch (error) {
        setError("Failed to get current location");
        console.error("Get location error:", error);
        return null;
      } finally {
        setIsLoading(false);
      }
    }, []);

  const refreshLocation = useCallback(async (): Promise<void> => {
    if (!hasLocationPermission) {
      setError("Location permission not granted");
      return;
    }
    await getCurrentLocation();
  }, [hasLocationPermission, getCurrentLocation]);

  const refreshLocationIfStale = useCallback(async () => {
    if (!location || Date.now() - location.timestamp > LOCATION_EXPIRY_TIME) {
      await refreshLocation();
    }
  }, [location, refreshLocation]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo<LocationContextType>(
    () => ({
      location,
      isLoading,
      error,
      requestLocationPermission,
      refreshLocation,
      hasLocationPermission,
    }),
    [
      location,
      isLoading,
      error,
      requestLocationPermission,
      refreshLocation,
      hasLocationPermission,
    ]
  );

  return (
    <LocationContext.Provider value={value}>
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

// Custom hook for API calls that need location
export const useLocationForAPI = () => {
  const { location, refreshLocation, hasLocationPermission } = useLocation();

  // 🔥 This is the key fix - memoize the function
  const getLocationForAPI = useCallback(async (): Promise<{
    lat: number;
    lon: number;
  } | null> => {
    if (!hasLocationPermission) {
      return null;
    }

    // Check if location is stale (older than 5 minutes)
    if (!location || Date.now() - location.timestamp > LOCATION_EXPIRY_TIME) {
      await refreshLocation();
    }

    return location
      ? { lat: location.latitude, lon: location.longitude }
      : null;
  }, [hasLocationPermission, location, refreshLocation]);

  // Also memoize the return object
  return useMemo(
    () => ({
      getLocationForAPI,
      hasLocationPermission,
    }),
    [getLocationForAPI, hasLocationPermission]
  );
};
