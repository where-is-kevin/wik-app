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
  websiteScrape: string | null;
  description: string | null;
  descriptionGeminiEmbedding: any;
  descriptionMinilmEmbedding: any;
  reviews: string | null;
  reviewsGeminiEmbedding: any;
  tags: string;
  createdAt: string;
  updatedAt: string;
};

const API_URL = Constants.expoConfig?.extra?.apiUrl as string;

const fetchContent = async (jwt?: string): Promise<Content> => {
  const headers: Record<string, string> = {
    accept: 'application/json',
  };
  if (jwt) {
    headers['Authorization'] = `Bearer ${jwt}`;
  }

  const observable$ = ajax<Content>({
    url: `${API_URL}/content/random`,
    method: 'GET',
    headers,
    responseType: 'json',
  });

  const response = await firstValueFrom(observable$);
  return response.response;
};

export function useContent() {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(['auth']);
  const jwt = authData?.accessToken;

  return useQuery<Content, Error>({
    queryKey: ['content'],
    queryFn: () => fetchContent(jwt),
    enabled: !!API_URL,
  });
}