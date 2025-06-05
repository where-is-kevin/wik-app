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

// Fetch buckets function
const fetchBuckets = async (jwt: string): Promise<Bucket[]> => {
  try {
    const observable$ = ajax<Bucket[]>({
      url: `${API_URL}/buckets`,
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

// Fetch bucket by ID function
const fetchBucketById = async (bucketId: string, jwt: string): Promise<Bucket> => {
  try {
    const observable$ = ajax<Bucket>({
      url: `${API_URL}/buckets/${bucketId}`,
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

// Fetch content by ID function
const fetchContentById = async (contentId: string, jwt: string): Promise<Content> => {
  try {
    const observable$ = ajax<Content>({
      url: `${API_URL}/content/${contentId}`,
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
    console.error("Error fetching content by ID:", error);
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

// Custom hook for fetching buckets
export function useBuckets() {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(["auth"]);
  const jwt = authData?.accessToken;

  return useQuery<Bucket[], Error>({
    queryKey: ["buckets"],
    queryFn: () => {
      if (!jwt) throw new Error("No JWT found");
      return fetchBuckets(jwt);
    },
    enabled: !!jwt,
  });
}

// Custom hook for fetching bucket by ID
export function useBucketById(bucketId: string) {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(["auth"]);
  const jwt = authData?.accessToken;

  return useQuery<Bucket, Error>({
    queryKey: ["bucket", bucketId],
    queryFn: () => {
      if (!jwt) throw new Error("No JWT found");
      return fetchBucketById(bucketId, jwt);
    },
    enabled: !!jwt && !!bucketId,
  });
}

// Custom hook for fetching content by ID
export function useContentById(contentId: string) {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(["auth"]);
  const jwt = authData?.accessToken;

  return useQuery<Content, Error>({
    queryKey: ["content", contentId],
    queryFn: () => {
      if (!jwt) throw new Error("No JWT found");
      return fetchContentById(contentId, jwt);
    },
    enabled: !!jwt && !!contentId,
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
      queryClient.invalidateQueries({ queryKey: ["buckets"] });
    },
  });
}