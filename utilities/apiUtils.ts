import { ajax, AjaxConfig } from "rxjs/ajax";
import { firstValueFrom } from "rxjs";

const DEFAULT_TIMEOUT = 10000;

export const createTimedAjax = async <T>(config: AjaxConfig): Promise<T> => {
  const ajaxPromise = firstValueFrom(ajax<T>(config)).then(
    (response) => response.response
  );

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timed out after ${DEFAULT_TIMEOUT}ms`));
    }, DEFAULT_TIMEOUT);
  });

  return Promise.race([ajaxPromise, timeoutPromise]);
};
