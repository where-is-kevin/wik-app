// hooks/useLocationPermissionGuard.ts
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useLocation } from '@/contexts/LocationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const LOCATION_PERMISSION_KEY = '@location_permission_status';
const LOCATION_PERMISSION_ASKED_KEY = '@location_permission_asked';

export type LocationPermissionStatus = 'granted' | 'denied' | 'not-asked';

interface UseLocationPermissionGuardOptions {
  redirectToTabs?: boolean;
  skipLocationCheck?: boolean;
}

export const useLocationPermissionGuard = (options: UseLocationPermissionGuardOptions = {}) => {
  const { redirectToTabs = true, skipLocationCheck = false } = options;
  const { hasLocationPermission } = useLocation();
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus>('not-asked');
  const [isLoading, setIsLoading] = useState(true);
  const [hasAskedBefore, setHasAskedBefore] = useState(false);

  // Save permission status to AsyncStorage
  const savePermissionStatus = async (status: LocationPermissionStatus) => {
    try {
      await AsyncStorage.setItem(LOCATION_PERMISSION_KEY, status);
      if (status !== 'not-asked') {
        await AsyncStorage.setItem(LOCATION_PERMISSION_ASKED_KEY, 'true');
      }
    } catch (error) {
      console.error('Error saving permission status:', error);
    }
  };

  // Load permission status from AsyncStorage
  const loadPermissionStatus = async (): Promise<LocationPermissionStatus> => {
    try {
      const savedStatus = await AsyncStorage.getItem(LOCATION_PERMISSION_KEY);
      const hasAsked = await AsyncStorage.getItem(LOCATION_PERMISSION_ASKED_KEY);
      
      setHasAskedBefore(hasAsked === 'true');
      
      if (savedStatus) {
        return savedStatus as LocationPermissionStatus;
      }
      return 'not-asked';
    } catch (error) {
      console.error('Error loading permission status:', error);
      return 'not-asked';
    }
  };

  // Check current device permission status
  const checkCurrentPermissionStatus = async (): Promise<LocationPermissionStatus> => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted' ? 'granted' : 'denied';
    } catch (error) {
      console.error('Error checking current permission:', error);
      return 'denied';
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
      const hasAsked = await AsyncStorage.getItem(LOCATION_PERMISSION_ASKED_KEY);
      const wasAskedBefore = hasAsked === 'true';
      
      // Check current device permission status
      const currentStatus = await checkCurrentPermissionStatus();
      
      setPermissionStatus(currentStatus);
      setHasAskedBefore(wasAskedBefore);

      // Simple navigation logic
      if (currentStatus === 'granted') {
        // Permission granted, go to tabs
        if (redirectToTabs) {
          router.replace('/(tabs)');
        }
      } else if (wasAskedBefore) {
        // User was asked before (and denied), don't ask again
        if (redirectToTabs) {
          router.replace('/(tabs)');
        }
      } else {
        // Never asked before, show permission screen
        router.replace('/(auth)/location-permission');
      }
    } catch (error) {
      console.error('Error in permission check:', error);
      router.replace('/(auth)/location-permission');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle permission response from the permission screen
  const handlePermissionResponse = async (granted: boolean) => {
    const status: LocationPermissionStatus = granted ? 'granted' : 'denied';
    await savePermissionStatus(status);
    setPermissionStatus(status);
    
    if (redirectToTabs) {
      router.replace('/(tabs)');
    }
  };

  // Reset permission status (useful for testing or settings)
  const resetPermissionStatus = async () => {
    try {
      await AsyncStorage.removeItem(LOCATION_PERMISSION_KEY);
      await AsyncStorage.removeItem(LOCATION_PERMISSION_ASKED_KEY);
      setPermissionStatus('not-asked');
      setHasAskedBefore(false);
    } catch (error) {
      console.error('Error resetting permission status:', error);
    }
  };

  // Check if we should show the permission screen
  const shouldShowPermissionScreen = () => {
    return permissionStatus === 'not-asked' || (permissionStatus === 'denied' && !hasAskedBefore);
  };

  // Check if user can access main app
  const canAccessMainApp = () => {
    return permissionStatus === 'granted' || (permissionStatus === 'denied' && hasAskedBefore);
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