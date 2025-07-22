import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTimedAjax } from "@/utilities/apiUtils";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = Constants.expoConfig?.extra?.apiUrl as string;

const deleteUser = async (jwt: string): Promise<void> => {
  try {
    await createTimedAjax<void>({
      url: `${API_URL}/oauth2/user`,
      method: "DELETE",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      responseType: "json",
    });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    if (error?.response) {
      // Throw the actual API response so it can be accessed in the component
      throw error.response;
    }
    throw error;
  }
};

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(["auth"]);
  const jwt = authData?.accessToken;

  return useMutation({
    mutationFn: () => {
      if (!jwt) throw new Error("No JWT found");
      return deleteUser(jwt);
    },
    onSuccess: async () => {
      // console.log('User deletion successful');
      queryClient.clear();
      await AsyncStorage.clear();
    },
    onError: (error) => {
      console.error("User deletion failed:", error);
    },
  });
}
