/**
 * String utility functions
 */

/**
 * Trims whitespace from the beginning and end of a string
 * Returns empty string if input is null, undefined, or not a string
 */
export const trimString = (str: string | null | undefined): string => {
  if (typeof str !== 'string' || str === null || str === undefined) {
    return '';
  }
  return str.trim();
};

/**
 * Trims whitespace and returns null if the result is empty
 * Useful for cases where you want to conditionally render based on content
 */
export const trimOrNull = (str: string | null | undefined): string | null => {
  const trimmed = trimString(str);
  return trimmed === '' ? null : trimmed;
};

/**
 * Trims whitespace and returns a fallback string if empty
 */
export const trimWithFallback = (
  str: string | null | undefined,
  fallback: string = ''
): string => {
  const trimmed = trimString(str);
  return trimmed === '' ? fallback : trimmed;
};