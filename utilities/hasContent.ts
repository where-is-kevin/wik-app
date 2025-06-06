// utils/bucketUtils.ts

/**
 * Check if buckets have actual content (not just empty buckets)
 * @param buckets - Array of bucket objects
 * @returns boolean - true if at least one bucket has content
 */
export const bucketsHaveContent = (buckets: any[]): boolean => {
    if (!buckets || buckets.length === 0) return false;
  
    // Check if at least one bucket has content
    return buckets.some(
      (bucket: any) =>
        bucket.content &&
        Array.isArray(bucket.content) &&
        bucket.content.length > 0
    );
  };
  
  /**
   * Check if likes array has items
   * @param likes - Array of like objects
   * @returns boolean - true if likes array has items
   */
  export const likesHaveContent = (likes: any[]): boolean => {
    return likes && Array.isArray(likes) && likes.length > 0;
  };