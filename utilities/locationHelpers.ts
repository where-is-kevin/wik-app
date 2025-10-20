import { UserLocationData } from "@/contexts/UserLocationContext";

/**
 * Helper function to create a "Current Location" preference
 * Call this when user selects "Current Location" during onboarding
 */
export const createCurrentLocationPreference = (
  lat: number,
  lng: number,
  displayName: string = "Current Location"
): UserLocationData => {
  return {
    type: 'current',
    displayName,
    lat,
    lng,
  };
};

/**
 * Helper function to create a "Selected Location" preference
 * Call this when user selects a specific city/location during onboarding
 */
export const createSelectedLocationPreference = (
  displayName: string,
  address?: string,
  placeId?: string
): UserLocationData => {
  return {
    type: 'selected',
    displayName,
    address,
    placeId,
    // No lat/lng for selected locations - APIs won't get coordinates
  };
};

/**
 * Example usage in onboarding:
 *
 * // If user picks "Current Location":
 * const currentLocationData = createCurrentLocationPreference(
 *   deviceLocation.lat,
 *   deviceLocation.lng,
 *   "Current Location"
 * );
 * await setUserLocation(currentLocationData);
 *
 * // If user picks "New York":
 * const selectedLocationData = createSelectedLocationPreference(
 *   "New York",
 *   "New York, NY, USA",
 *   "ChIJOwg_06VPwokRYv534QaPC8g"
 * );
 * await setUserLocation(selectedLocationData);
 */