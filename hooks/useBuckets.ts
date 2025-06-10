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
export const fetchBuckets = async (jwt: string, searchQuery?: string): Promise<Bucket[]> => {
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
const fetchLikes = async (jwt: string, searchQuery?: string): Promise<Content[]> => {
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

const fetchBucketById = async (bucketId: string, jwt: string, searchQuery?: string): Promise<Bucket> => {
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
export function useBuckets(searchQuery?: string) {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(["auth"]);
  const jwt = authData?.accessToken;

  return useQuery<Bucket[], Error>({
    queryKey: ["buckets", searchQuery], // Include searchQuery in key for proper caching
    queryFn: () => {
      if (!jwt) throw new Error("No JWT found");
      return fetchBuckets(jwt, searchQuery);
    },
    enabled: !!jwt,
    // Add debouncing to avoid too many API calls while typing
    staleTime: 5000, // Consider data fresh for 5 seconds
  });
}

// Custom hook for fetching likes with search
export function useLikes(searchQuery?: string) {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(["auth"]);
  const jwt = authData?.accessToken;

  return useQuery<Content[], Error>({
    queryKey: ["likes", searchQuery], // Include searchQuery in key for proper caching
    queryFn: () => {
      if (!jwt) throw new Error("No JWT found");
      return fetchLikes(jwt, searchQuery);
    },
    enabled: !!jwt,
    // Add debouncing to avoid too many API calls while typing
    staleTime: 5000, // Consider data fresh for 5 seconds
  });
}

export function useBucketById(bucketId: string, searchQuery?: string) {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(["auth"]);
  const jwt = authData?.accessToken;

  return useQuery<Bucket, Error>({
    queryKey: ["bucket", bucketId, searchQuery || ""], // Include searchQuery in queryKey
    queryFn: () => {
      if (!jwt) throw new Error("No JWT found");
      return fetchBucketById(bucketId, jwt, searchQuery); // Pass searchQuery to API
    },
    enabled: !!jwt && !!bucketId,
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
      // Only invalidate buckets since we're adding content to an existing bucket
      queryClient.invalidateQueries({ queryKey: ["buckets"] });
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
      // Only invalidate buckets since we're creating a new bucket
      queryClient.invalidateQueries({ queryKey: ["buckets"] });
    },
  });
}