import {
  useMutation,
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import Constants from "expo-constants";
import { createTimedAjax } from "@/utilities/apiUtils";

// Match API output for Bucket and Content
type Content = {
  id: string;
  category: string;
  title: string;
  rating?: number;
  price?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  googlePlacesImageUrl?: string;
  internalImageUrls?: string[];
  bookingUrl?: string;
  websiteUrl?: string;
  websiteScrape?: string;
  description?: string;
  descriptionGeminiEmbedding?: number[];
  descriptionMinilmEmbedding?: number[];
  reviews?: string;
  reviewsGeminiEmbedding?: number[];
  tags?: string;
  createdAt: string;
  updatedAt: string;
  contentShareUrl?: string;
  image?: string; // fallback image property
  eventDatetime?: string; // event datetime for events
};

type Bucket = {
  id: string;
  bucketId: string;
  userId: string;
  bucketName: string;
  contentIds: string[];
  content: Content[];
  bucketShareUrl?: string;
};

// Paginated response structure
type PaginatedResponse<T> = {
  items: T[];
  limit: number;
  offset: number;
  total: number;
};

const API_URL = Constants.expoConfig?.extra?.apiUrl as string;

// Fetch buckets function with pagination
export const fetchBuckets = async (
  jwt: string,
  pageParam: number = 0,
  searchQuery?: string,
  limit: number = 20
): Promise<PaginatedResponse<Bucket>> => {
  try {
    const params = new URLSearchParams({
      offset: pageParam.toString(),
      limit: limit.toString(),
    });

    if (searchQuery && searchQuery.trim()) {
      params.append("query", searchQuery.trim());
    }

    const url = `${API_URL}/buckets?${params.toString()}`;

    return await createTimedAjax<PaginatedResponse<Bucket>>({
      url,
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt}`,
        accept: "application/json",
      },
      responseType: "json",
    });
  } catch (error) {
    console.error("Error fetching buckets:", error);
    throw error;
  }
};

const fetchBucketById = async (
  bucketId: string,
  jwt: string,
  searchQuery?: string
): Promise<Bucket> => {
  try {
    let url = `${API_URL}/buckets/${bucketId}`;

    if (searchQuery && searchQuery.trim()) {
      const params = new URLSearchParams({ query: searchQuery.trim() });
      url += `?${params.toString()}`;
    }

    return await createTimedAjax<Bucket>({
      url,
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt}`,
        accept: "application/json",
      },
      responseType: "json",
    });
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
  await createTimedAjax<void>({
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
  await createTimedAjax<void>({
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
};

// Custom hook for fetching buckets with infinite pagination
export function useBuckets(
  searchQuery?: string,
  enabled: boolean = true,
  limit: number = 20
) {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(["auth"]);
  const jwt = authData?.accessToken;

  const normalizedSearchQuery = searchQuery?.trim() || "";

  return useInfiniteQuery<PaginatedResponse<Bucket>, Error>({
    queryKey: ["buckets", normalizedSearchQuery, limit],
    queryFn: ({ pageParam = 0 }) => {
      if (!jwt) throw new Error("No JWT found");
      return fetchBuckets(
        jwt,
        pageParam as number,
        normalizedSearchQuery || undefined,
        limit
      );
    },
    enabled: !!jwt && enabled,
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.offset + lastPage.items.length;
      return nextOffset < lastPage.total ? nextOffset : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useBucketById(bucketId: string, searchQuery?: string, enabled: boolean = true) {
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
    enabled: !!jwt && !!bucketId && enabled,
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
