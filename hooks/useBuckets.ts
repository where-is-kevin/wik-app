import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import { firstValueFrom } from "rxjs";
import { ajax } from "rxjs/ajax";

// Match API output for Bucket and Content
type Content = {
  id: string;
  category: string;
  title: string;
  rating: number;
  price: string;
  phone: string;
  latitude: number;
  longitude: number;
  googleMapsUrl: string;
  googlePlacesImageUrl: string;
  internalImages: string[] | [];
  bookingUrl: string;
  websiteUrl: string;
  websiteScrape: string;
  description: string;
  descriptionGeminiEmbedding: number[];
  descriptionMinilmEmbedding: number[];
  reviews: string;
  reviewsGeminiEmbedding: number[];
  tags: string;
  createdAt: string;
  updatedAt: string;
};

type Bucket = {
  id: string;
  userId: string;
  bucketName: string;
  contentIds: string[];
  content: Content[];
};

const API_URL = Constants.expoConfig?.extra?.apiUrl as string;

// Fetch buckets function with search
export const fetchBuckets = async (
  jwt: string,
  searchQuery?: string
): Promise<Bucket[]> => {
  try {
    // Build URL with search parameter if provided
    let url = `${API_URL}/buckets`;
    if (searchQuery && searchQuery.trim()) {
      const params = new URLSearchParams({ query: searchQuery.trim() });
      url += `?${params.toString()}`;
    }

    const observable$ = ajax<Bucket[]>({
      url,
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt}`,
        accept: "application/json",
      },
      responseType: "json",
    });

    const response = await firstValueFrom(observable$);
    return response.response;
  } catch (error) {
    console.error("Error fetching buckets:", error);
    throw error;
  }
};

// Fetch likes function with search (assuming similar API structure)
const fetchLikes = async (
  jwt: string,
  searchQuery?: string
): Promise<Content[]> => {
  try {
    // Build URL with search parameter if provided
    let url = `${API_URL}/likes`;
    if (searchQuery && searchQuery.trim()) {
      const params = new URLSearchParams({ query: searchQuery.trim() });
      url += `?${params.toString()}`;
    }

    const observable$ = ajax<Content[]>({
      url,
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt}`,
        accept: "application/json",
      },
      responseType: "json",
    });

    const response = await firstValueFrom(observable$);
    return response.response;
  } catch (error) {
    console.error("Error fetching likes:", error);
    throw error;
  }
};

const fetchBucketById = async (
  bucketId: string,
  jwt: string,
  searchQuery?: string
): Promise<Bucket> => {
  try {
    // Construct the base URL
    let url = `${API_URL}/buckets/${bucketId}`;

    // Add search query as URL parameter if provided
    if (searchQuery && searchQuery.trim()) {
      const params = new URLSearchParams({ query: searchQuery.trim() });
      url += `?${params.toString()}`;
    }

    const observable$ = ajax<Bucket>({
      url,
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt}`,
        accept: "application/json",
      },
      responseType: "json",
    });

    const response = await firstValueFrom(observable$);
    return response.response;
  } catch (error) {
    console.error("Error fetching bucket by ID:", error);
    throw error;
  }
};

// Add bucket function
type AddBucketInput = {
  id: string;
  bucketName: string;
  contentIds?: string[];
};

const addBucket = async (input: AddBucketInput, jwt: string): Promise<void> => {
  const observable$ = ajax<void>({
    url: `${API_URL}/buckets/add`,
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(input),
    responseType: "json",
  });

  await firstValueFrom(observable$);
};

// Create bucket function (POST /buckets/create)
type CreateBucketInput = {
  bucketName: string;
  contentIds?: string[];
};

const createBucket = async (
  input: CreateBucketInput,
  jwt: string
): Promise<void> => {
  const observable$ = ajax<void>({
    url: `${API_URL}/buckets/create`,
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(input),
    responseType: "json",
  });

  await firstValueFrom(observable$);
};

// Custom hook for fetching buckets with search
export function useBuckets(searchQuery?: string, enabled: boolean = true) {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(["auth"]);
  const jwt = authData?.accessToken;

  // Use empty string as default to ensure consistent caching
  const normalizedSearchQuery = searchQuery?.trim() || "";

  return useQuery<Bucket[], Error>({
    queryKey: ["buckets", normalizedSearchQuery],
    queryFn: () => {
      if (!jwt) throw new Error("No JWT found");
      return fetchBuckets(jwt, normalizedSearchQuery || undefined);
    },
    enabled: !!jwt && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
  });
}

// Custom hook for fetching likes with search
export function useLikes(searchQuery?: string, enabled: boolean = true) {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(["auth"]);
  const jwt = authData?.accessToken;

  // Use empty string as default to ensure consistent caching
  const normalizedSearchQuery = searchQuery?.trim() || "";

  return useQuery<Content[], Error>({
    queryKey: ["likes", normalizedSearchQuery],
    queryFn: () => {
      if (!jwt) throw new Error("No JWT found");
      return fetchLikes(jwt, normalizedSearchQuery || undefined);
    },
    enabled: !!jwt && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
  });
}

export function useBucketById(bucketId: string, searchQuery?: string) {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(["auth"]);
  const jwt = authData?.accessToken;

  const normalizedSearchQuery = searchQuery?.trim() || "";

  return useQuery<Bucket, Error>({
    queryKey: ["bucket", bucketId, normalizedSearchQuery],
    queryFn: () => {
      if (!jwt) throw new Error("No JWT found");
      return fetchBucketById(bucketId, jwt, normalizedSearchQuery || undefined);
    },
    enabled: !!jwt && !!bucketId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Custom hook for adding a bucket
export function useAddBucket() {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(["auth"]);
  const jwt = authData?.accessToken;

  return useMutation({
    mutationFn: (input: AddBucketInput) => {
      if (!jwt) throw new Error("No JWT found");
      return addBucket(input, jwt);
    },
    onSuccess: () => {
      // Invalidate all bucket-related queries
      queryClient.invalidateQueries({ queryKey: ["buckets"] });
      queryClient.invalidateQueries({ queryKey: ["bucket"] });
    },
  });
}

// Custom hook for creating a bucket (/buckets/create)
export function useCreateBucket() {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(["auth"]);
  const jwt = authData?.accessToken;

  return useMutation({
    mutationFn: (input: CreateBucketInput) => {
      if (!jwt) throw new Error("No JWT found");
      return createBucket(input, jwt);
    },
    onSuccess: () => {
      // Invalidate all bucket-related queries
      queryClient.invalidateQueries({ queryKey: ["buckets"] });
    },
  });
}
