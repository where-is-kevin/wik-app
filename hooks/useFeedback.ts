import { useMutation } from '@tanstack/react-query';
import { firstValueFrom } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl as string;

// Feedback data type
type FeedbackInput = {
  rating: number;
  likes: string[];
  improvements: string[];
  feedback: string;
};

// Function to send feedback to the API
const sendFeedback = async (input: FeedbackInput): Promise<void> => {
  const observable$ = ajax<void>({
    url: `${API_URL}/feedback`,
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
    responseType: 'json',
  });

  await firstValueFrom(observable$);
};

// Custom hook for sending feedback
export function useSendFeedback() {
  return useMutation({
    mutationFn: sendFeedback,
  });
}