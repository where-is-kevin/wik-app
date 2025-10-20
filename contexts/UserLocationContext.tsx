import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type LocationType = 'current' | 'selected';

export interface UserLocationData {
  type: LocationType;
  displayName: string;
  lat?: number;
  lng?: number;
  // For selected locations
  address?: string;
  placeId?: string;
}

interface UserLocationContextType {
  userLocation: UserLocationData | null;
  setUserLocation: (location: UserLocationData) => Promise<void>;
  clearUserLocation: () => Promise<void>;
  shouldSendCoordinates: () => boolean;
  getApiLocationParams: (deviceLocation?: { lat: number; lon: number }) => { latitude?: number; longitude?: number };
  isLoading: boolean;
}

const UserLocationContext = createContext<UserLocationContextType | undefined>(undefined);

const STORAGE_KEY = '@user_location_preference';

export const UserLocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userLocation, setUserLocationState] = useState<UserLocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted location preference on mount
  useEffect(() => {
    loadUserLocation();
  }, []);

  const loadUserLocation = async () => {
    try {
      const storedLocation = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedLocation) {
        const parsedLocation = JSON.parse(storedLocation);
        setUserLocationState(parsedLocation);
      }
    } catch (error) {
      console.error('Failed to load user location preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setUserLocation = async (location: UserLocationData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(location));
      setUserLocationState(location);
    } catch (error) {
      console.error('Failed to save user location preference:', error);
    }
  };

  const clearUserLocation = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUserLocationState(null);
    } catch (error) {
      console.error('Failed to clear user location preference:', error);
    }
  };

  // Only send coordinates if user chose "Current Location"
  const shouldSendCoordinates = (): boolean => {
    return userLocation?.type === 'current' &&
           userLocation?.lat !== undefined &&
           userLocation?.lng !== undefined;
  };

  // Get parameters for API calls
  const getApiLocationParams = (deviceLocation?: { lat: number; lon: number }) => {
    // If user has explicitly set a preference
    if (userLocation) {
      if (shouldSendCoordinates()) {
        return {
          latitude: userLocation.lat,
          longitude: userLocation.lng,
        };
      }
      // User chose a specific location - don't send coordinates
      return {};
    }

    // No user preference set - default to device location if available
    if (deviceLocation?.lat && deviceLocation?.lon) {
      return {
        latitude: deviceLocation.lat,
        longitude: deviceLocation.lon,
      };
    }

    // No preference and no device location - send no coordinates
    return {};
  };

  return (
    <UserLocationContext.Provider
      value={{
        userLocation,
        setUserLocation,
        clearUserLocation,
        shouldSendCoordinates,
        getApiLocationParams,
        isLoading,
      }}
    >
      {children}
    </UserLocationContext.Provider>
  );
};

export const useUserLocation = (): UserLocationContextType => {
  const context = useContext(UserLocationContext);
  if (!context) {
    throw new Error("useUserLocation must be used within a UserLocationProvider");
  }
  return context;
};