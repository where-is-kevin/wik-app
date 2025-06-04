import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { firstValueFrom } from 'rxjs';
import { ajax } from 'rxjs/ajax';

type User = {
  id: string;
  username: string;
  email: string;
  description: string;
  location: string;
  home: string;
  profileImageUrl: string;
  createdAt: string;
};

const API_URL = Constants.expoConfig?.extra?.apiUrl as string;

const fetchUser = async (jwt: string): Promise<User> => {
  const observable$ = ajax<User>({
    url: `${API_URL}/oauth2/user`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${jwt}`,
      accept: 'application/json',
    },
    responseType: 'json',
  });

  const response = await firstValueFrom(observable$);
  return response.response;
};

// Create user function
type CreateUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

const createUser = async (input: CreateUserInput): Promise<User> => {
  console.log('API URL:', API_URL);
  console.log(Constants.expoConfig?.extra);
  const observable$ = ajax<User>({
    url: `${API_URL}/oauth2/user`,
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
    responseType: 'json',
  });

  const response = await firstValueFrom(observable$);
  return response.response;
};

export function useUser() {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(['auth']);
  const jwt = authData?.accessToken;

  return useQuery<User, Error>({
    queryKey: ['user'],
    queryFn: () => {
      if (!jwt) throw new Error('No JWT found');
      return fetchUser(jwt);
    },
    enabled: !!jwt, // Only run if JWT is present
  });
}

// Custom hook for creating a user
export function useCreateUser() {
  return useMutation({
    mutationFn: createUser,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(['auth']);
  const jwt = authData?.accessToken;

  return useMutation({
    mutationFn: async (updated: any) => {
      const observable$ = ajax({
        url: `${API_URL}/oauth2/user`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(updated),
        responseType: 'json',
      });

      const response = await firstValueFrom(observable$);
      return response.response;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data);
    },
  });
}