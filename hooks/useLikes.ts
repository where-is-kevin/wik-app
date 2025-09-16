import {
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import Constants from "expo-constants";
import { createTimedAjax } from "@/utilities/apiUtils";

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
  distance?: number; // optional distance for sorting
  similarity?: number; // similarity score for sorting
  eventDatetime?: string; // event datetime for events
};

// Paginated response structure
type PaginatedResponse<T> = {
  items: T[];
  limit: number;
  offset: number;
  total: number;
};

const API_URL = Constants.expoConfig?.extra?.apiUrl as string;

// Fetch likes function with pagination
const fetchLikes = async (
  jwt: string,
  pageParam: number = 0,
  searchQuery?: string,
  limit: number = 20
): Promise<PaginatedResponse<Content>> => {
  try {
    const params = new URLSearchParams({
      offset: pageParam.toString(),
      limit: limit.toString(),
    });

    if (searchQuery && searchQuery.trim()) {
      params.append("query", searchQuery.trim());
    }

    const url = `${API_URL}/likes?${params.toString()}`;

    return await createTimedAjax<PaginatedResponse<Content>>({
      url,
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt}`,
        accept: "application/json",
      },
      responseType: "json",
    });
  } catch (error) {
    console.error("Error fetching likes:", error);
    throw error;
  }
};

// Add like function
type AddLikeInput = {
  contentIds: string[];
};

const addLike = async (input: AddLikeInput, jwt: string): Promise<void> => {
  await createTimedAjax<void>({
    url: `${API_URL}/likes/add`,
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

// Custom hook for fetching likes with infinite pagination
export function useLikes(
  searchQuery?: string,
  enabled: boolean = true,
  limit: number = 20
) {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(["auth"]);
  const jwt = authData?.accessToken;

  const normalizedSearchQuery = searchQuery?.trim() || "";

  return useInfiniteQuery<PaginatedResponse<Content>, Error>({
    queryKey: ["likes", normalizedSearchQuery, limit],
    queryFn: ({ pageParam = 0 }) => {
      if (!jwt) throw new Error("No JWT found");
      return fetchLikes(
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

// Custom hook for adding a like
export function useAddLike() {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(["auth"]);
  const jwt = authData?.accessToken;

  return useMutation({
    mutationFn: (input: AddLikeInput) => {
      if (!jwt) throw new Error("No JWT found");
      return addLike(input, jwt);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["likes"] });
    },
  });
}
