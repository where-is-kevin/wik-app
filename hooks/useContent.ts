import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { firstValueFrom } from "rxjs";
import { ajax } from "rxjs/ajax";
import Constants from "expo-constants";

type Content = {
  id: string;
  category: string;
  title: string;
  rating: number;
  price: number | null;
  phone: string | null;
  latitude: number;
  longitude: number;
  googleMapsUrl: string;
  googlePlacesImageUrl: string;
  internalImages: string[];
  bookingUrl: string | null;
  websiteUrl: string | null;
  description: string | null;
  reviews: string | null;
  tags: string;
  createdAt: string;
  updatedAt: string;
  internalImageUrls: string[];
  address: string;
  userLiked?: boolean;
  userDisliked?: boolean;
  isSponsored: boolean;
  contentShareUrl: string;
  similarity: number;
  distance?: number;
};

const API_URL = Constants.expoConfig?.extra?.apiUrl as string;

// Updated interface for basic content fetching
interface BasicContentParams {
  latitude?: number;
  longitude?: number;
  category_filter?: string;
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
    (params.latitude !== undefined || params.longitude !== undefined || params.category_filter !== undefined)
  ) {
    const cleanParams: Record<string, string> = {};
    if (params.latitude !== undefined)
      cleanParams.latitude = params.latitude.toString();
    if (params.longitude !== undefined)
      cleanParams.longitude = params.longitude.toString();
    if (params.category_filter !== undefined)
      cleanParams.category_filter = params.category_filter;

    const queryString = new URLSearchParams(cleanParams).toString();
    url += `?${queryString}`;
  }

  const observable$ = ajax<Content[]>({
    url,
    method: "GET",
    headers,
    responseType: "json",
  });

  const response = await firstValueFrom(observable$);
  return response.response;
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

    const observable$ = ajax<Content>({
      url: `${API_URL}/content/${contentId}`,
      method: "GET",
      headers,
      responseType: "json",
    });

    const response = await firstValueFrom(observable$);
    return response.response;
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

  const observable$ = ajax<PaginatedResponse>({
    url: `${API_URL}/content/selection/ask-kevin?${queryString}`,
    method: "GET",
    headers,
    responseType: "json",
  });

  const response = await firstValueFrom(observable$);
  return response.response;
};

// New interface for infinite content params
interface InfiniteContentParams {
  query: string;
  latitude?: number | undefined; // Explicitly allow undefined
  longitude?: number | undefined; // Explicitly allow undefined
  limit?: number;
  enabled?: boolean;
}

// NEW: Infinite query hook for pagination
export function useInfiniteContent({
  query,
  latitude,
  longitude,
  limit = 20,
  enabled = true,
}: InfiniteContentParams) {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(["auth"]);
  const jwt = authData?.accessToken || null;

  return useInfiniteQuery({
    queryKey: ["content", "infinite", query, latitude, longitude, limit, !!jwt],
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
export function useContent(params?: BasicContentParams) {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(["auth"]);
  const jwt = authData?.accessToken || null;

  return useQuery<Content[], Error>({
    queryKey: ["content", "basic", params, !!jwt], // Include JWT status in query key
    queryFn: () => fetchContent(params, jwt),
    enabled: !!API_URL, // Removed params check - let it work without params
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
    // Don't include JWT in query key - let React Query handle auth changes differently
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
