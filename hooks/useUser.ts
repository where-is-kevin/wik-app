import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import { createTimedAjax } from "@/utilities/apiUtils";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  description: string | null;
  location: string;
  home: string;
  profileImage: string; // Changed from profileImageUrl to profileImage
  personalSummary: string;
  createdAt: string;
  homeGeom: [number, number]; // [longitude, latitude]
  locationGeom: [number, number]; // [longitude, latitude]
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
  // Common fields (kept for backward compatibility)
  firstName?: string;
  lastName?: string;
  email: string;
  home?: string;
  location?: string;
  description?: string;
  personalSummary?: string;
  onboardingLikes?: string[]; // Array of content IDs that user liked
  onboardingDislikes?: string[]; // Array of content IDs that user disliked

  // New structured fields
  type?: "leisure" | "business";
  fullName?: string;

  // Leisure-specific fields
  travelingReason?: string[];
  travelingTags?: string[];
  minBudget?: number;
  maxBudget?: number;
  currency?: string;

  // Business-specific fields
  travelingGoal?: string[];
  connectionTags?: string[];
  industryTags?: string[];
  networkingStyle?: string[];
  currentLocation?: string;
  role?: string;
  company?: string;
  industry?: string[];
  stage?: string;
  areasOfExpertise?: string[];
};

const createUser = async (input: CreateUserInput): Promise<User> => {
  try {
    return await createTimedAjax<User>({
      url: `${API_URL}/otp/register-request`,
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

// Validate registration code function
export type ValidateRegistrationCodeInput = {
  email: string;
  otpCode: string;
};

const validateRegistrationCode = async (input: ValidateRegistrationCodeInput): Promise<any> => {
  try {
    return await createTimedAjax<any>({
      url: `${API_URL}/otp/register-verify`,
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

// Custom hook for validating registration code
export function useValidateRegistrationCode() {
  return useMutation({
    mutationFn: validateRegistrationCode,
    retry: false, // Disable retries
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
