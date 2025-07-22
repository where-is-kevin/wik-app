import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTimedAjax } from "@/utilities/apiUtils";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

const API_URL = Constants.expoConfig?.extra?.apiUrl as string;

// Add types for your auth response based on actual API response
interface User {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
}

interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: User;
}

interface LoginData {
  username: string;
  password: string;
}

const login = async (data: LoginData): Promise<AuthResponse> => {
  const params = new URLSearchParams();
  params.append("grant_type", "password");
  params.append("username", data.username);
  params.append("password", data.password);
  params.append("scope", "");
  params.append("client_id", "string");
  params.append("client_secret", "string");

  try {
    // Convert Observable to Promise for React Query
    return await createTimedAjax<AuthResponse>({
      url: `${API_URL}/oauth2/login`,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        accept: "application/json",
      },
      body: params.toString(),
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
