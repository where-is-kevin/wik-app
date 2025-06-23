import { useMutation, useQueryClient } from "@tanstack/react-query";
import { firstValueFrom } from "rxjs";
import { ajax } from "rxjs/ajax";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.apiUrl as string;

type ChangePasswordInput = {
  email: string;
  oldPassword: string;
  newPassword: string;
};

const changePassword = async (
  input: ChangePasswordInput,
  jwt: string
): Promise<void> => {
  try {
    const observable$ = ajax<void>({
      url: `${API_URL}/oauth2/update-password`,
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        email: input.email,
        oldPassword: input.oldPassword,
        newPassword: input.newPassword,
      }),
      responseType: "json",
    });

    await firstValueFrom(observable$);
  } catch (error: any) {
    console.error("Error changing password:", error);
    if (error?.response) {
      // Throw the actual API response so it can be accessed in the component
      throw error.response;
    }
    throw error;
  }
};

export function useChangePassword() {
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(["auth"]);
  const jwt = authData?.accessToken;

  return useMutation({
    mutationFn: (input: ChangePasswordInput) => {
      if (!jwt) throw new Error("No JWT found");
      return changePassword(input, jwt);
    },
    onSuccess: () => {
      // console.log('Password change successful');
      // Optionally invalidate auth queries if needed
      // queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    onError: (error) => {
      console.error("Password change failed:", error);
    },
  });
}
