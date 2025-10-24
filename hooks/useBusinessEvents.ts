import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createTimedAjax } from "@/utilities/apiUtils";
import Constants from "expo-constants";
import { useUserLocation } from "@/contexts/UserLocationContext";

// Business Event Type Definition (matches exact API response)
export type BusinessEvent = {
  // Primary API response fields
  id: string;
  category: string;
  title: string;
  subcategory: string;
  rating?: number | null;
  internalPrice?: string | null;
  phone?: string | null;
  addressLong?: string | null;
  addressShort?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  internalImages?: string[] | null;
  eventDatetimeStart?: string | null;
  eventDatetimeEnd?: string | null;
  bookingUrl?: string | null;
  websiteUrl?: string | null;
  description?: string | null;
  tags?: string | null;
  isSponsored: boolean;
  userLiked: boolean;
  userDisliked: boolean;
  distance: number;
  similarity: number;
  isVoucher: boolean;
  voucherText?: string | null;
  addressCity?: string | null;
  addressCountry?: string | null;
  sideEventCount?: number; // Made optional as it's not always present in individual events
  price?: string | null;
  internalImageUrls?: string[] | null;
  googleMapsUrl?: string | null;
  contentShareUrl?: string | null;
  address?: string | null;
  audienceType: string[];
  sideEvents?: BusinessEvent[]; // Array of business events for side events

  // Legacy/computed fields for backward compatibility
  contentId?: string; // Mapped from id
  name?: string; // Mapped from title
  date?: string; // Legacy field - kept for backward compatibility
  coverImage?: string | null;
  eventTitle?: string;
  location?: string | null;
  logoImage?: string | null;
  image?: string | null;
  dateRange?: string;
  eventCount?: string;
  imageUrl?: string | null;
  isLiked?: boolean;
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
  localEvents: BusinessEvent[]; // New array for local events
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

  // Helper function to map event data for backward compatibility
  const mapEvent = (event: BusinessEvent) => ({
    ...event,
    // Ensure id is always present
    id: event.id || event.contentId || "",
    // Map new fields to legacy field names for backward compatibility
    contentId: event.id || "",
    name: event.title || "",
    eventTitle: event.title || "",
    // Handle image mapping - only use internalImageUrls
    logoImage: event.internalImageUrls?.[0] || null,
    coverImage:
      event.internalImageUrls?.[1] || event.internalImageUrls?.[0] || null,
    image: event.internalImageUrls?.[0] || null,
    imageUrl: event.internalImageUrls?.[0] || null,
    // Map address fields
    location: event.addressShort || event.addressLong || event.address || null,
    // Map user interaction
    isLiked: event.userLiked,
    // Ensure sideEventCount is present
    sideEventCount: event.sideEventCount || 0,
  });

  // Map both events and localEvents arrays
  const mappedEvents = result.events.map(mapEvent);
  const mappedLocalEvents = (result.localEvents || []).map(mapEvent);

  return {
    ...result,
    events: mappedEvents,
    localEvents: mappedLocalEvents,
  };
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
    // Ensure id is always present
    id: result.id || "",
    // Add backward compatibility mapping
    contentId: result.id || "",
    name: result.title || "",
    eventTitle: result.title || "",
    // Handle image mapping - only use internalImageUrls
    logoImage: result.internalImageUrls?.[0] || null,
    coverImage:
      result.internalImageUrls?.[1] || result.internalImageUrls?.[0] || null,
    image: result.internalImageUrls?.[0] || null,
    imageUrl: result.internalImageUrls?.[0] || null,
    // Map address fields
    location:
      result.addressShort || result.addressLong || result.address || null,
    // Map user interaction
    isLiked: result.userLiked,
    // Keep side event count from API or fallback to side events array length
    sideEventCount: result.sideEventCount || result.sideEvents?.length || 0,
  };
};

// Hook for fetching business events list
export function useBusinessEvents(params: BusinessEventsParams, enabled: boolean = true) {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(["auth"]);
  const jwt = authData?.accessToken || null;
  const { userLocation, getApiLocationParams } = useUserLocation();

  // Nearby events require authentication
  const requiresAuth = params.type === "nearby";

  // Get location parameters for nearby events when user selected current location
  const locationParams = params.type === "nearby" ? getApiLocationParams() : {};

  // Merge location params with the original params
  const finalParams = {
    ...params,
    ...locationParams,
  };

  // Include location in query key for nearby events so queries invalidate when location changes
  const locationKey =
    params.type === "nearby" && userLocation
      ? `${userLocation.type}-${userLocation.displayName}-${userLocation.lat}-${userLocation.lng}`
      : null;

  return useQuery<BusinessEventsResponse, Error>({
    queryKey: ["businessEvents", finalParams, !!jwt, locationKey],
    queryFn: () => fetchBusinessEvents(finalParams, jwt),
    enabled: enabled && !!API_URL && (!requiresAuth || !!jwt),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    networkMode: "offlineFirst",
  });
}

// Hook for fetching business event by ID
export function useBusinessEventById(contentId: string, enabled: boolean = true) {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(["auth"]);
  const jwt = authData?.accessToken || null;

  return useQuery<BusinessEvent, Error>({
    queryKey: ["businessEvent", "byId", contentId],
    queryFn: () => fetchBusinessEventById(contentId, jwt),
    enabled: enabled && !!API_URL && !!contentId,
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
    enabled?: boolean;
  } = {}
) {
  const { limit = 20, radiusKm = 100, enabled = true } = options;

  return useBusinessEvents({
    type,
    radius_km: type === "nearby" ? radiusKm : undefined,
    limit,
  }, enabled);
}

// Hook for worldwide business events (no auth required)
export function useWorldwideBusinessEvents(limit: number = 20, enabled: boolean = true) {
  return useConfigurableBusinessEvents("worldwide", { limit, enabled });
}

// Hook for nearby business events (auth required)
export function useNearbyBusinessEvents(
  radiusKm: number = 100,
  limit: number = 20,
  enabled: boolean = true
) {
  return useConfigurableBusinessEvents("nearby", { limit, radiusKm, enabled });
}
