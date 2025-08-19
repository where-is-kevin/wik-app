import React from "react";
import { useLikes } from "@/hooks/useLikes";
import { useBuckets, useBucketById } from "@/hooks/useBuckets";
import { useInfiniteContent } from "@/hooks/useContent";
import { useLocation } from "@/contexts/LocationContext";

// Type definitions for different data sources
export type LikesContent = {
  id: string;
  title: string;
  latitude?: number;
  longitude?: number;
  similarity?: number;
  [key: string]: any;
};

export type ContentItem = {
  id: string;
  title: string;
  latitude?: number;
  longitude?: number;
  [key: string]: any;
};

export type SearchContent = {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  [key: string]: any;
};

export type BucketItem = {
  id: string;
  bucketName: string;
  content: ContentItem[];
  [key: string]: any;
};

export type MapDataItem = LikesContent | ContentItem | SearchContent | BucketItem;

// Type guard
export const hasLocation = (
  item: MapDataItem
): item is
  | (LikesContent & { latitude: number; longitude: number })
  | (ContentItem & { latitude: number; longitude: number })
  | SearchContent => {
  return (
    "latitude" in item &&
    "longitude" in item &&
    typeof item.latitude === "number" &&
    typeof item.longitude === "number" &&
    !isNaN(item.latitude) &&
    !isNaN(item.longitude) &&
    Math.abs(item.latitude) <= 90 &&
    Math.abs(item.longitude) <= 180
  );
};

export const useMapData = (source: string, searchQuery: string, bucketId?: string) => {
  const { location } = useLocation();

  // Use appropriate data hook based on source
  const likesQuery = useLikes(searchQuery, source === "likes");
  const bucketsQuery = useBuckets(searchQuery, source === "buckets");
  const singleBucketQuery = useBucketById(
    bucketId || "",
    searchQuery,
    source === "bucket-single"
  );
  const contentQuery = useInfiniteContent({
    query: searchQuery,
    enabled: source === "content",
    latitude: location?.lat,
    longitude: location?.lon,
  });

  const data = React.useMemo(() => {
    switch (source) {
      case "bucket-single": {
        if (!singleBucketQuery.data?.content) return [];
        return singleBucketQuery.data.content.map(
          (contentItem) =>
            ({
              ...contentItem,
              bucketName: singleBucketQuery.data.bucketName,
              bucketId: singleBucketQuery.data.bucketId,
            } as ContentItem)
        );
      }
      case "buckets": {
        const buckets =
          bucketsQuery.data?.pages.flatMap((page) => page.items) || [];
        // Flatten bucket content items for map display
        const flattenedItems: ContentItem[] = [];
        buckets.forEach((bucket) => {
          if (bucket.content && Array.isArray(bucket.content)) {
            bucket.content.forEach((contentItem) => {
              flattenedItems.push({
                ...contentItem,
                bucketName: bucket.bucketName,
                bucketId: bucket.id,
              } as ContentItem);
            });
          }
        });
        return flattenedItems;
      }
      case "content": {
        const contentItems =
          contentQuery.data?.pages.flatMap((page) => page.items) || [];
        return contentItems.map(
          (item) =>
            ({
              ...item,
            } as SearchContent)
        );
      }
      case "likes":
      default: {
        const likesItems =
          likesQuery.data?.pages.flatMap((page) => page.items) || [];
        return likesItems.map(
          (item) =>
            ({
              ...item,
            } as LikesContent)
        );
      }
    }
  }, [
    source,
    likesQuery.data,
    bucketsQuery.data,
    singleBucketQuery.data,
    contentQuery.data,
  ]);

  const isLoading = React.useMemo(() => {
    switch (source) {
      case "bucket-single":
        return singleBucketQuery.isLoading;
      case "buckets":
        return bucketsQuery.isLoading;
      case "content":
        return contentQuery.isLoading;
      case "likes":
      default:
        return likesQuery.isLoading;
    }
  }, [
    source,
    likesQuery.isLoading,
    bucketsQuery.isLoading,
    singleBucketQuery.isLoading,
    contentQuery.isLoading,
  ]);

  const isError = React.useMemo(() => {
    switch (source) {
      case "bucket-single":
        return singleBucketQuery.isError;
      case "buckets":
        return bucketsQuery.isError;
      case "content":
        return contentQuery.isError;
      case "likes":
      default:
        return likesQuery.isError;
    }
  }, [
    source,
    likesQuery.isError,
    bucketsQuery.isError,
    singleBucketQuery.isError,
    contentQuery.isError,
  ]);

  const userLocation = React.useMemo(() => {
    return location ? { latitude: location.lat, longitude: location.lon } : null;
  }, [location]);

  return {
    data,
    isLoading,
    isError,
    locationLoading: false, // Location context doesn't expose loading state
    locationError: null, // Location context doesn't expose error state
    userLocation,
  };
};