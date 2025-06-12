import { useMutation, useQueryClient } from '@tanstack/react-query';
import { firstValueFrom } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl as string;

const login = async (data: {
  username: string;
  password: string;
}) => {
  const params = new URLSearchParams();
  params.append('grant_type', 'password');
  params.append('username', data.username);
  params.append('password', data.password);
  params.append('scope', '');
  params.append('client_id', 'string');
  params.append('client_secret', 'string');

  console.log('Login params:', params.toString());

  try {
    const observable$ = ajax({
      url: `${API_URL}/oauth2/login`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        accept: 'application/json',
      },
      body: params.toString(),
      responseType: 'json',
    });

    // Convert Observable to Promise for React Query
    const response = await firstValueFrom(observable$);
    return response.response;
  } catch (error: any) {
    if (error?.response) {
      // Throw the actual API response so it can be accessed in the component
      throw error.response;
    }
    throw error;
  }
};

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      queryClient.setQueryData(['auth'], data);
      console.log('Login successful:', data);
    },
  });
}