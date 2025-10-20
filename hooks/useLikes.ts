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
  title: string | null;
  rating: number;
  price: number | string | null;
  internalPrice?: string | null;
  phone: string | null;
  latitude: number;
  longitude: number;
  addressLong?: string;
  addressShort?: string;
  googleMapsUrl: string;
  internalImages: string[] | null;
  internalImageUrls: string[] | null;
  eventDatetimeStart?: string | null;
  eventDatetimeEnd?: string | null;
  bookingUrl: string | null;
  websiteUrl: string | null;
  description: string | null;
  tags: string;
  isSponsored: boolean;
  userLiked: boolean;
  userDisliked: boolean;
  distance: number;
  similarity: number | string;
  contentShareUrl: string;
  address: string;
  // Legacy fields for backward compatibility
  image?: string;
  createdAt?: string;
  updatedAt?: string;
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
