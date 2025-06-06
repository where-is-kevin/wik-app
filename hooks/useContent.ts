import { useQuery, useQueryClient } from '@tanstack/react-query';
import { firstValueFrom } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import Constants from 'expo-constants';

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
  bookingUrl: string | null;
  websiteUrl: string | null;
  description: string | null;
  reviews: string | null;
  tags: string;
  createdAt: string;
  updatedAt: string;
};

const API_URL = Constants.expoConfig?.extra?.apiUrl as string;

// Fixed: Now returns Content[] instead of Content
const fetchContent = async (jwt?: string): Promise<Content[]> => {
  const headers: Record<string, string> = {
    accept: 'application/json',
  };
  if (jwt) {
    headers['Authorization'] = `Bearer ${jwt}`;
  }

  const observable$ = ajax<Content[]>({
    url: `${API_URL}/content`,
    method: 'GET',
    headers,
    responseType: 'json',
  });

  const response = await firstValueFrom(observable$);
  return response.response;
};

// Fixed: Now returns Content[] instead of Content
export function useContent() {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(['auth']);
  const jwt = authData?.accessToken;

  return useQuery<Content[], Error>({
    queryKey: ['content'],
    queryFn: () => fetchContent(jwt),
    enabled: !!API_URL,
  });
}

const fetchContentWithParams = async (
  params: { query?: string; limit?: number; offset?: number },
  jwt?: string
): Promise<Content[]> => {
  const headers: Record<string, string> = {
    accept: 'application/json',
  };
  if (jwt) {
    headers['Authorization'] = `Bearer ${jwt}`;
  }

  // Construct query string from params
  const queryString = new URLSearchParams(params as Record<string, string>).toString();

  const observable$ = ajax<Content[]>({
    url: `${API_URL}/content/selection/ask-kevin?${queryString}`,
    method: 'GET',
    headers,
    responseType: 'json',
  });

  const response = await firstValueFrom(observable$);
  return response.response;
};

export function useContentWithParams(params: { query?: string; limit?: number; offset?: number }) {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(['auth']);
  const jwt = authData?.accessToken;

  return useQuery<Content[], Error>({
    queryKey: ['content', params],
    queryFn: () => fetchContentWithParams(params, jwt),
    enabled: !!API_URL,
  });
}