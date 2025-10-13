import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createTimedAjax } from "@/utilities/apiUtils";
import Constants from "expo-constants";

type Content = {
  id: string;
  category: string;
  subcategory?: string;
  title: string | null;
  rating: number;
  price: number | string | null;
  internalPrice?: string | null;
  phone: string | null;
  latitude: number;
  longitude: number;
  googleMapsUrl: string;
  googlePlacesImageUrl?: string;
  internalImages: string[] | null;
  bookingUrl: string | null;
  websiteUrl: string | null;
  description: string | null;
  reviews: string | null;
  tags: string;
  createdAt?: string;
  updatedAt?: string;
  internalImageUrls: string[] | null;
  address: string;
  addressShort?: string | null;
  addressLong?: string;
  userLiked?: boolean;
  userDisliked?: boolean;
  isSponsored: boolean;
  contentShareUrl: string;
  similarity: number | string;
  distance?: number;
  eventDatetimeStart?: string | null;
  eventDatetimeEnd?: string | null;
  audienceType?: string[];
};

const API_URL = Constants.expoConfig?.extra?.apiUrl as string;

// Updated interface for basic content fetching
interface BasicContentParams {
  latitude?: number;
  longitude?: number;
  category_filter?: string;
  type?: "leisure" | "business";
}

// Fixed: Now returns Content[] instead of Content and accepts optional location params
const fetchContent = async (
  params?: BasicContentParams,
  jwt?: string | null
): Promise<Content[]> => {
  const headers: Record<string, string> = {
    accept: "application/json",
  };

  // Only add Authorization header if JWT exists
  if (jwt) {
    headers["Authorization"] = `Bearer ${jwt}`;
  }

  let url = `${API_URL}/content`;

  // Add query parameters if provided
  if (
    params &&
    (params.latitude !== undefined ||
      params.longitude !== undefined ||
      params.category_filter !== undefined ||
      params.type !== undefined)
  ) {
    const cleanParams: Record<string, string> = {};
    if (params.latitude !== undefined)
      cleanParams.latitude = params.latitude.toString();
    if (params.longitude !== undefined)
      cleanParams.longitude = params.longitude.toString();
    if (params.category_filter !== undefined)
      cleanParams.category_filter = params.category_filter;
    if (params.type !== undefined) cleanParams.type = params.type;

    const queryString = new URLSearchParams(cleanParams).toString();
    url += `?${queryString}`;
  }

  const result = await createTimedAjax<Content[]>({
    url,
    method: "GET",
    headers,
    responseType: "json",
  });

  return result;
};

// Fetch content by ID function - JWT optional
const fetchContentById = async (
  contentId: string,
  jwt?: string | null
): Promise<Content> => {
  try {
    const headers: Record<string, string> = {
      accept: "application/json",
    };

    // Only add Authorization header if JWT exists
    if (jwt) {
      headers["Authorization"] = `Bearer ${jwt}`;
    }

    return await createTimedAjax<Content>({
      url: `${API_URL}/content/${contentId}`,
      method: "GET",
      headers,
      responseType: "json",
    });
  } catch (error) {
    console.error("Error fetching content by ID:", error);
    throw error;
  }
};

// Updated interface to include latitude and longitude
interface ContentParams {
  query?: string; // Keep as optional
  limit?: number;
  offset?: number;
  latitude?: number;
  longitude?: number;
  type?: "leisure" | "business";
}

// Add interface for paginated response
interface PaginatedResponse {
  items: Content[];
  total: number;
  limit: number;
  offset: number;
}

const fetchContentWithParams = async (
  params: ContentParams,
  jwt?: string | null
): Promise<PaginatedResponse> => {
  const headers: Record<string, string> = {
    accept: "application/json",
  };

  // Only add Authorization header if JWT exists
  if (jwt) {
    headers["Authorization"] = `Bearer ${jwt}`;
  }

  // Filter out undefined values and convert numbers to strings for URLSearchParams
  const cleanParams: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      cleanParams[key] = value.toString();
    }
  });

  // Construct query string from params
  const queryString = new URLSearchParams(cleanParams).toString();
  const url = `${API_URL}/content/selection/ask-kevin?${queryString}`;

  const result = await createTimedAjax<PaginatedResponse>({
    url,
    method: "GET",
    headers,
    responseType: "json",
  });

  return result;
};

// New interface for infinite content params
interface InfiniteContentParams {
  query: string;
  latitude?: number | undefined; // Explicitly allow undefined
  longitude?: number | undefined; // Explicitly allow undefined
  limit?: number;
  enabled?: boolean;
  type?: "leisure" | "business";
}

// NEW: Infinite query hook for pagination
export function useInfiniteContent({
  query,
  latitude,
  longitude,
  limit = 12,
  enabled = true,
  type,
}: InfiniteContentParams) {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(["auth"]);
  const jwt = authData?.accessToken || null;

  return useInfiniteQuery({
    queryKey: [
      "content",
      "infinite",
      query,
      latitude,
      longitude,
      limit,
      type,
      !!jwt,
    ],
    queryFn: async ({ pageParam = 0 }) => {
      const params: ContentParams = {
        query,
        limit,
        offset: pageParam,
      };

      // Only add location if both lat and lon are available
      if (latitude !== undefined && longitude !== undefined) {
        params.latitude = latitude;
        params.longitude = longitude;
      }

      // Add type if provided
      if (type !== undefined) {
        params.type = type;
      }

      return fetchContentWithParams(params, jwt);
    },
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.offset + lastPage.limit;
      return nextOffset < lastPage.total ? nextOffset : undefined;
    },
    initialPageParam: 0,
    enabled: !!API_URL && !!query && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

// For basic content (SwipeableCards) - JWT optional
export function useContent(
  params?: BasicContentParams,
  locationPermissionStatus?: "granted" | "denied" | "undetermined" | null
) {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(["auth"]);
  const jwt = authData?.accessToken || null;

  // Helper function to check if params are meaningful
  const hasMeaningfulParams = (params?: BasicContentParams) => {
    if (!params) return false;

    // Check if any of the parameters have meaningful values
    return (
      params.latitude !== undefined ||
      params.longitude !== undefined ||
      (params.category_filter !== undefined &&
        params.category_filter.trim() !== "") ||
      params.type !== undefined
    );
  };

  // Determine if we should fetch based on permission status and location data
  const shouldFetch = () => {
    // Don't fetch if we don't have any meaningful parameters
    if (!hasMeaningfulParams(params)) {
      return false;
    }

    // If no permission status provided, fetch immediately (old behavior)
    if (!locationPermissionStatus) return true;

    // If permission is denied, fetch without waiting for coordinates
    if (locationPermissionStatus === "denied") return true;

    // If permission is granted, always fetch (coordinates are optional based on user preference)
    if (locationPermissionStatus === "granted") {
      return true;
    }

    // If undetermined, don't fetch yet
    return false;
  };

  return useQuery<Content[], Error>({
    queryKey: ["content", "basic", params, !!jwt], // Include JWT status in query key
    queryFn: () => fetchContent(params, jwt),
    enabled: !!API_URL && shouldFetch(),
  });
}

// For search/ask-kevin content (PaginatedContentList) - JWT optional
export function useContentWithParams(params: ContentParams | null) {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(["auth"]);
  const jwt = authData?.accessToken || null;

  return useQuery<PaginatedResponse, Error>({
    queryKey: ["content", "search", params, !!jwt], // Include JWT status in query key
    queryFn: () => {
      if (!params) throw new Error("Params not ready");
      return fetchContentWithParams(params, jwt);
    },
    enabled: !!API_URL && !!params,
  });
}

export function useContentById(contentId: string) {
  const queryClient = useQueryClient();

  return useQuery<Content, Error>({
    queryKey: ["content", "byId", contentId],
    queryFn: () => {
      // Always get fresh JWT when query executes
      const authData = queryClient.getQueryData<{ accessToken?: string }>([
        "auth",
      ]);
      const jwt = authData?.accessToken || null;
      return fetchContentById(contentId, jwt);
    },
    enabled: !!API_URL && !!contentId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
