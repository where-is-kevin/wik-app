import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { createTimedAjax } from '@/utilities/apiUtils';

type Dislike = {
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

// Fetch dislikes function
const fetchDislikes = async (jwt: string): Promise<Dislike[]> => {
  try {
    return await createTimedAjax<Dislike[]>({
      url: `${API_URL}/dislikes`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwt}`,
        accept: 'application/json',
      },
      responseType: 'json',
    });
  } catch (error) {
    console.error("Error fetching dislikes:", error);
    throw error;
  }
};

// Add dislike function
type AddDislikeInput = {
  contentIds: string[];
};

const addDislike = async (input: AddDislikeInput, jwt: string): Promise<void> => {
  await createTimedAjax<void>({
    url: `${API_URL}/dislikes/add`,
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(input),
    responseType: 'json',
  });
};

// Custom hook for fetching dislikes
export function useDislikes() {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(['auth']);
  const jwt = authData?.accessToken;

  return useQuery<Dislike[], Error>({
    queryKey: ['dislikes'],
    queryFn: () => {
      if (!jwt) throw new Error('No JWT found');
      return fetchDislikes(jwt);
    },
    enabled: !!jwt,
  });
}

// Custom hook for adding a dislike
export function useAddDislike() {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(['auth']);
  const jwt = authData?.accessToken;

  return useMutation({
    mutationFn: (input: AddDislikeInput) => {
      if (!jwt) throw new Error('No JWT found');
      return addDislike(input, jwt);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dislikes"] });
    },
  });
}