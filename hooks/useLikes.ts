import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { firstValueFrom } from 'rxjs';
import { ajax } from 'rxjs/ajax';

type Like = {
  id: string;
  userId: string;
  content: Array<{
    id: string;
    title: string;
    description: string;
    imageUrl: string;
  }>;
  createdAt: string;
};

const API_URL = Constants.expoConfig?.extra?.apiUrl as string;

// Fetch likes function
const fetchLikes = async (jwt: string): Promise<Like[]> => {
  try {
    const observable$ = ajax<Like[]>({
      url: `${API_URL}/likes`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwt}`,
        accept: 'application/json',
      },
      responseType: 'json',
    });

    const response = await firstValueFrom(observable$);
    return response.response;
  } catch (error) {
    console.error("Error fetching likes:", error); // Log any errors
    throw error;
  }
};

// Add like function
type AddLikeInput = {
  contentIds: string[];
};

const addLike = async (input: AddLikeInput, jwt: string): Promise<void> => {
  const observable$ = ajax<void>({
    url: `${API_URL}/likes/add`,
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(input),
    responseType: 'json',
  });

  await firstValueFrom(observable$);
};

// Custom hook for fetching likes
export function useLikes() {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(['auth']);
  const jwt = authData?.accessToken;

  return useQuery<Like[], Error>({
    queryKey: ['likes'],
    queryFn: () => {
      if (!jwt) throw new Error('No JWT found');
      return fetchLikes(jwt);
    },
    enabled: !!jwt, // Only run if JWT is present
  });
}

// Custom hook for adding a like
export function useAddLike() {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(['auth']);
  const jwt = authData?.accessToken;

  return useMutation({
    mutationFn: (input: AddLikeInput) => {
      if (!jwt) throw new Error('No JWT found');
      return addLike(input, jwt);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["likes"] }); // Refresh likes data
    },
  });
}