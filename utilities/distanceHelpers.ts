import { UserLocationData } from "@/contexts/UserLocationContext";

/**
 * Determines if distance should be displayed based on user location preferences and distance data
 * @param distance - The distance value from the item
 * @param userLocation - The user's location preference from context
 * @returns boolean - Whether distance should be shown
 */
export const shouldShowDistance = (
  distance: number | undefined | null,
  userLocation: UserLocationData | null
): boolean => {
  return !!(distance && userLocation?.type === 'current');
};

/**
 * Checks if distance is valid and should be displayed
 * Useful for more complex distance checks in event details
 * @param distance - The distance value from the item
 * @param userLocation - The user's location preference from context
 * @returns boolean - Whether distance should be shown
 */
export const shouldShowValidDistance = (
  distance: number | undefined | null,
  userLocation: UserLocationData | null
): boolean => {
  return !!(
    distance != null &&
    typeof distance === "number" &&
    distance > 0 &&
    userLocation?.type === 'current'
  );
};