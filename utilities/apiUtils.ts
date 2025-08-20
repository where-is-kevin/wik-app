import { ajax, AjaxConfig } from "rxjs/ajax";
import { firstValueFrom } from "rxjs";

const DEFAULT_TIMEOUT = 10000;

export const createTimedAjax = async <T>(config: AjaxConfig): Promise<T> => {
  const ajaxPromise = firstValueFrom(ajax<T>(config))
    .then((response) => response.response)
    .catch((error) => {
      // Enhanced error handling for network connectivity issues
      if (error?.status === 0 || error?.code === 'NETWORK_ERROR' || 
          error?.name === 'NetworkError' || error?.message?.includes('Network Error') ||
          error?.message?.includes('Failed to fetch') || error?.message?.includes('net::')) {
        const networkError = new Error('No internet connection available');
        networkError.name = 'NetworkError';
        throw networkError;
      }
      throw error;
    });

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      const timeoutError = new Error(`Request timed out after ${DEFAULT_TIMEOUT}ms`);
      timeoutError.name = 'TimeoutError';
      reject(timeoutError);
    }, DEFAULT_TIMEOUT);
  });

  return Promise.race([ajaxPromise, timeoutPromise]);
};
