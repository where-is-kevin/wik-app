import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  internalImageUrls?: string[];
  address?: string;
};

const API_URL = Constants.expoConfig?.extra?.apiUrl as string;

// Updated interface for basic content fetching
interface BasicContentParams {
  latitude?: number;
  longitude?: number;
}

// Fixed: Now returns Content[] instead of Content and accepts optional location params
const fetchContent = async (
  params?: BasicContentParams,
  jwt?: string
): Promise<Content[]> => {
  const headers: Record<string, string> = {
    accept: "application/json",
  };
  if (jwt) {
    headers["Authorization"] = `Bearer ${jwt}`;
  }

  let url = `${API_URL}/content`;

  // Add query parameters if provided
  if (
    params &&
    (params.latitude !== undefined || params.longitude !== undefined)
  ) {
    const cleanParams: Record<string, string> = {};
    if (params.latitude !== undefined)
      cleanParams.latitude = params.latitude.toString();
    if (params.longitude !== undefined)
      cleanParams.longitude = params.longitude.toString();

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

// Fetch content by ID function - NO AUTHENTICATION REQUIRED
const fetchContentById = async (contentId: string): Promise<Content> => {
  try {
    const observable$ = ajax<Content>({
      url: `${API_URL}/content/${contentId}`,
      method: "GET",
      headers: {
        accept: "application/json",
      },
      responseType: "json",
    });

    const response = await firstValueFrom(observable$);
    return response.response;
  } catch (error) {
    console.error("Error fetching content by ID:", error);
    throw error;
  }
};

// Fixed: Now returns Content[] instead of Content and accepts optional location params
export function useContent(params?: BasicContentParams) {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(["auth"]);
  const jwt = authData?.accessToken;

  return useQuery<Content[], Error>({
    queryKey: ["content", params],
    queryFn: () => fetchContent(params, jwt),
    enabled: !!API_URL && params !== undefined, // Only run when params are defined (even if empty)
  });
}

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
  jwt?: string
): Promise<PaginatedResponse> => {
  const headers: Record<string, string> = {
    accept: "application/json",
  };
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

export function useContentWithParams(params: ContentParams | null) {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(["auth"]);
  const jwt = authData?.accessToken;

  return useQuery<PaginatedResponse, Error>({
    queryKey: ["content", params],
    queryFn: () => {
      if (!params) throw new Error("Params not ready");
      return fetchContentWithParams(params, jwt);
    },
    enabled: !!API_URL && !!params, // Only run when params are available
  });
}

// Updated to remove JWT authentication requirement
export function useContentById(contentId: string) {
  return useQuery<Content, Error>({
    queryKey: ["content", contentId],
    queryFn: () => fetchContentById(contentId),
    enabled: !!API_URL && !!contentId,
  });
}
