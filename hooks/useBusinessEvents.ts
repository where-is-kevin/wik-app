import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createTimedAjax } from "@/utilities/apiUtils";
import Constants from "expo-constants";
import { useUserLocation } from "@/contexts/UserLocationContext";

// Business Event Type Definition (matches exact API response)
export type BusinessEvent = {
  // API response fields for list endpoint
  name: string;
  date?: string; // Legacy field - kept for backward compatibility
  eventDatetimeStart?: string; // New datetime field
  eventDatetimeEnd?: string; // New datetime field
  internalImageUrls: string[];
  sideEventCount: number;
  contentId: string;
  addressShort?: string;
  addressLong?: string;
  // API response fields for detail endpoint
  coverImage?: string | null;
  description?: string;
  eventTitle?: string;
  location?: string;
  logoImage?: string | null;
  sideEvents?: any[];
  // Computed fields for display
  image?: string | null;
  // Optional fields for compatibility
  id?: string;
  title?: string;
  dateRange?: string;
  eventCount?: string;
  imageUrl?: string;
  isLiked?: boolean;
  latitude?: number;
  longitude?: number;
  websiteUrl?: string;
  bookingUrl?: string;
  address?: string;
  category?: string;
  tags?: string;
  rating?: number;
  distance?: number;
};

const API_URL = Constants.expoConfig?.extra?.apiUrl as string;

// Interface for business events list params
interface BusinessEventsParams {
  type: "worldwide" | "nearby";
  radius_km?: number;
  limit?: number;
  offset?: number;
  latitude?: number;
  longitude?: number;
}

// Interface for business events response (matches API response)
interface BusinessEventsResponse {
  count: number;
  events: BusinessEvent[];
}

// Fetch business events list
const fetchBusinessEvents = async (
  params: BusinessEventsParams,
  jwt?: string | null
): Promise<BusinessEventsResponse> => {
  const headers: Record<string, string> = {
    accept: "application/json",
  };

  // Add Authorization header if JWT exists (required for nearby events)
  if (jwt) {
    headers["Authorization"] = `Bearer ${jwt}`;
  }

  // Build query parameters
  const queryParams: Record<string, string> = {
    type: params.type,
  };

  if (params.radius_km !== undefined) {
    queryParams.radius_km = params.radius_km.toString();
  }
  if (params.limit !== undefined) {
    queryParams.limit = params.limit.toString();
  }
  if (params.offset !== undefined) {
    queryParams.offset = params.offset.toString();
  }
  if (params.latitude !== undefined) {
    queryParams.latitude = params.latitude.toString();
  }
  if (params.longitude !== undefined) {
    queryParams.longitude = params.longitude.toString();
  }

  const queryString = new URLSearchParams(queryParams).toString();
  const url = `${API_URL}/business/events?${queryString}`;

  const result = await createTimedAjax<BusinessEventsResponse>({
    url,
    method: "GET",
    headers,
    responseType: "json",
  });

  return result;
};

// Fetch business event by ID (using contentId)
const fetchBusinessEventById = async (
  contentId: string,
  jwt?: string | null
): Promise<BusinessEvent> => {
  const headers: Record<string, string> = {
    accept: "application/json",
  };

  // Add Authorization header if JWT exists
  if (jwt) {
    headers["Authorization"] = `Bearer ${jwt}`;
  }

  const result = await createTimedAjax<BusinessEvent>({
    url: `${API_URL}/business/event/${contentId}`,
    method: "GET",
    headers,
    responseType: "json",
  });

  // Transform API response to expected format for detail endpoint
  return {
    ...result,
    name: result.eventTitle || result.name,
    image:
      result.coverImage || result.logoImage || result.internalImageUrls?.[0],
    sideEventCount: result.sideEvents?.length || result.sideEventCount || 0,
  };
};

// Hook for fetching business events list
export function useBusinessEvents(params: BusinessEventsParams) {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(["auth"]);
  const jwt = authData?.accessToken || null;
  const { userLocation, getApiLocationParams } = useUserLocation();

  // Nearby events require authentication
  const requiresAuth = params.type === "nearby";

  // Get location parameters for nearby events when user selected current location
  const locationParams = params.type === "nearby"
    ? getApiLocationParams()
    : {};

  // Merge location params with the original params
  const finalParams = {
    ...params,
    ...locationParams,
  };

  // Include location in query key for nearby events so queries invalidate when location changes
  const locationKey = params.type === "nearby" && userLocation
    ? `${userLocation.type}-${userLocation.displayName}-${userLocation.lat}-${userLocation.lng}`
    : null;

  return useQuery<BusinessEventsResponse, Error>({
    queryKey: ["businessEvents", finalParams, !!jwt, locationKey],
    queryFn: () => fetchBusinessEvents(finalParams, jwt),
    enabled: !!API_URL && (!requiresAuth || !!jwt),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    networkMode: "offlineFirst",
  });
}

// Hook for fetching business event by ID
export function useBusinessEventById(contentId: string) {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(["auth"]);
  const jwt = authData?.accessToken || null;

  return useQuery<BusinessEvent, Error>({
    queryKey: ["businessEvent", "byId", contentId],
    queryFn: () => fetchBusinessEventById(contentId, jwt),
    enabled: !!API_URL && !!contentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for configurable business events
export function useConfigurableBusinessEvents(
  type: "worldwide" | "nearby" = "worldwide",
  options: {
    limit?: number;
    radiusKm?: number;
  } = {}
) {
  const { limit = 20, radiusKm = 100 } = options;

  return useBusinessEvents({
    type,
    radius_km: type === "nearby" ? radiusKm : undefined,
    limit,
  });
}

// Hook for worldwide business events (no auth required)
export function useWorldwideBusinessEvents(limit: number = 20) {
  return useConfigurableBusinessEvents("worldwide", { limit });
}

// Hook for nearby business events (auth required)
export function useNearbyBusinessEvents(
  radiusKm: number = 50,
  limit: number = 20
) {
  return useConfigurableBusinessEvents("nearby", { limit, radiusKm });
}
