import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import { createTimedAjax } from "@/utilities/apiUtils";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  description: string;
  location: string;
  home: string;
  profileImageUrl: string;
  personalSummary: string;
  createdAt: string;
};

const API_URL = Constants.expoConfig?.extra?.apiUrl as string;

const fetchUser = async (jwt: string): Promise<User> => {
  try {
    return await createTimedAjax<User>({
      url: `${API_URL}/oauth2/user`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt}`,
        accept: "application/json",
      },
      responseType: "json",
    });
  } catch (error: any) {
    console.error("Error fetching user:", error);
    if (error?.response) {
      // Throw the actual API response so it can be accessed in the component
      throw error.response;
    }
    throw error;
  }
};

// Create user function
export type CreateUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  home: string;
  location: string;
  password: string;
  description: string;
  personalSummary: string;
  onboardingLikes?: string[]; // Array of content IDs that user liked
  onboardingDislikes?: string[]; // Array of content IDs that user disliked
};

const createUser = async (input: CreateUserInput): Promise<User> => {
  try {
    return await createTimedAjax<User>({
      url: `${API_URL}/oauth2/user`,
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      responseType: "json",
    });
  } catch (error: any) {
    if (error?.response) {
      // Throw the actual API response so it can be accessed in the component
      throw error.response;
    }
    throw error;
  }
};

const updateUser = async (jwt: string, updated: any): Promise<User> => {
  try {
    return await createTimedAjax<User>({
      url: `${API_URL}/oauth2/user`,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(updated),
      responseType: "json",
    });
  } catch (error: any) {
    console.error("Error updating user:", error);
    if (error?.response) {
      // Throw the actual API response so it can be accessed in the component
      throw error.response;
    }
    throw error;
  }
};

export function useUser() {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(["auth"]);
  const jwt = authData?.accessToken;

  return useQuery<User, Error>({
    queryKey: ["user"],
    queryFn: () => {
      if (!jwt) throw new Error("No JWT found");
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
  const authData = queryClient.getQueryData<{ accessToken?: string }>(["auth"]);
  const jwt = authData?.accessToken;

  return useMutation({
    mutationFn: async (updated: any) => {
      if (!jwt) throw new Error("No JWT found");
      return updateUser(jwt, updated);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data);
    },
  });
}
