import { useMutation } from "@tanstack/react-query";
import { createTimedAjax } from "@/utilities/apiUtils";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.apiUrl as string;

interface OTPRequestData {
  email: string;
}

interface OTPVerifyData {
  email: string;
  otpCode: string;
}

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

const requestOTP = async (data: OTPRequestData): Promise<void> => {
  try {
    return await createTimedAjax<void>({
      url: `${API_URL}/otp/request`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(data),
      responseType: "json",
    });
  } catch (error: any) {
    if (error?.response) {
      throw error.response;
    }
    throw error;
  }
};

const verifyOTP = async (data: OTPVerifyData): Promise<AuthResponse> => {
  try {
    return await createTimedAjax<AuthResponse>({
      url: `${API_URL}/otp/verify`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(data),
      responseType: "json",
    });
  } catch (error: any) {
    if (error?.response) {
      throw error.response;
    }
    throw error;
  }
};

export const useOTPRequest = () => {
  return useMutation({
    mutationFn: requestOTP,
    retry: false,
  });
};

export const useOTPVerify = () => {
  return useMutation({
    mutationFn: verifyOTP,
    retry: false,
  });
};