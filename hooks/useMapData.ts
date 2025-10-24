import React from "react";
import { useLikes } from "@/hooks/useLikes";
import { useBuckets, useBucketById } from "@/hooks/useBuckets";
import { useInfiniteContent } from "@/hooks/useContent";
import { useLocation } from "@/contexts/LocationContext";
import { useNearbyBusinessEvents, useWorldwideBusinessEvents, useBusinessEventById } from "@/hooks/useBusinessEvents";

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

export const useMapData = (source: string, searchQuery: string, bucketId?: string, type?: "leisure" | "business" | "nearby" | "worldwide" | "details", locationParams?: { latitude?: number; longitude?: number }, customData?: string, eventId?: string) => {
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
    ...locationParams, // Use the location params from UserLocationContext
    type: type === "leisure" || type === "business" ? type : undefined,
  });

  // Business events queries - use conditional params to avoid calling both
  const shouldFetchNearby = source === "business" && type === "nearby";
  const shouldFetchWorldwide = source === "business" && type === "worldwide";
  const shouldFetchDetails = source === "business" && type === "details" && !!eventId;

  const nearbyBusinessEventsQuery = useNearbyBusinessEvents(
    100, // radius_km
    20,  // limit
    shouldFetchNearby
  );
  const worldwideBusinessEventsQuery = useWorldwideBusinessEvents(
    20, // limit
    shouldFetchWorldwide
  );
  const businessEventByIdQuery = useBusinessEventById(
    eventId || "",
    shouldFetchDetails
  );


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
      case "business": {
        // Handle business events data based on type
        if (type === "nearby" && nearbyBusinessEventsQuery.data) {
          // Combine both events and localEvents from the API response and deduplicate
          const events = nearbyBusinessEventsQuery.data.events || [];
          const localEvents = nearbyBusinessEventsQuery.data.localEvents || [];

          // Create a Map to deduplicate by ID
          const eventMap = new Map();

          // Add events first
          events.forEach((event: any) => {
            const id = event.id || event.contentId;
            if (id) eventMap.set(id, event);
          });

          // Add localEvents, but don't overwrite existing events
          localEvents.forEach((event: any) => {
            const id = event.id || event.contentId;
            if (id && !eventMap.has(id)) eventMap.set(id, event);
          });

          const allEvents = Array.from(eventMap.values());
          return allEvents.map((event: any) => ({
            id: event.id || event.contentId || "",
            title: event.title || event.name || "",
            address: event.addressShort || event.addressLong || "",
            internalImageUrls: event.internalImageUrls || (event.imageUrl ? [event.imageUrl] : []),
            latitude: event.latitude,
            longitude: event.longitude,
            // Include additional business event fields
            description: event.description,
            eventDatetimeStart: event.eventDatetimeStart,
            eventDatetimeEnd: event.eventDatetimeEnd,
            isLiked: event.userLiked || false,
            category: event.category,
            rating: event.rating,
            price: event.price,
          } as ContentItem));
        } else if (type === "worldwide" && worldwideBusinessEventsQuery.data) {
          // Combine both events and localEvents from the API response and deduplicate
          const events = worldwideBusinessEventsQuery.data.events || [];
          const localEvents = worldwideBusinessEventsQuery.data.localEvents || [];

          // Create a Map to deduplicate by ID
          const eventMap = new Map();

          // Add events first
          events.forEach((event: any) => {
            const id = event.id || event.contentId;
            if (id) eventMap.set(id, event);
          });

          // Add localEvents, but don't overwrite existing events
          localEvents.forEach((event: any) => {
            const id = event.id || event.contentId;
            if (id && !eventMap.has(id)) eventMap.set(id, event);
          });

          const allEvents = Array.from(eventMap.values());
          return allEvents.map((event: any) => ({
            id: event.id || event.contentId || "",
            title: event.title || event.name || "",
            address: event.addressShort || event.addressLong || "",
            internalImageUrls: event.internalImageUrls || (event.imageUrl ? [event.imageUrl] : []),
            latitude: event.latitude,
            longitude: event.longitude,
            // Include additional business event fields
            description: event.description,
            eventDatetimeStart: event.eventDatetimeStart,
            eventDatetimeEnd: event.eventDatetimeEnd,
            isLiked: event.userLiked || false,
            category: event.category,
            rating: event.rating,
            price: event.price,
          } as ContentItem));
        } else if (type === "details" && businessEventByIdQuery.data) {
          // For business event details, show the side events
          const sideEvents = businessEventByIdQuery.data.sideEvents || [];
          return sideEvents.map((event: any) => ({
            id: event.id || event.contentId || "",
            title: event.title || event.name || "",
            address: event.addressShort || event.addressLong || "",
            internalImageUrls: event.internalImageUrls || (event.imageUrl ? [event.imageUrl] : []),
            latitude: event.latitude,
            longitude: event.longitude,
            // Include additional business event fields
            description: event.description,
            eventDatetimeStart: event.eventDatetimeStart,
            eventDatetimeEnd: event.eventDatetimeEnd,
            isLiked: event.userLiked || false,
            category: event.category,
            rating: event.rating,
            price: event.price,
          } as ContentItem));
        }
        return [];
      }
      case "custom": {
        // Handle custom data passed from navigation (e.g., side events)
        if (!customData) return [];
        try {
          const parsedData = JSON.parse(customData);
          return parsedData.map((item: any) => ({
            id: item.id,
            title: item.title,
            address: item.address,
            imageUrl: item.imageUrl,
            latitude: item.latitude,
            longitude: item.longitude,
            ...item.originalData,
          } as ContentItem));
        } catch (error) {
          console.error("Failed to parse custom data:", error);
          return [];
        }
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
    type,
    likesQuery.data,
    bucketsQuery.data,
    singleBucketQuery.data,
    contentQuery.data,
    nearbyBusinessEventsQuery.data,
    worldwideBusinessEventsQuery.data,
    businessEventByIdQuery.data,
    customData,
  ]);

  const isLoading = React.useMemo(() => {
    switch (source) {
      case "bucket-single":
        return singleBucketQuery.isLoading;
      case "buckets":
        return bucketsQuery.isLoading;
      case "content":
        return contentQuery.isLoading;
      case "business":
        if (type === "nearby") return nearbyBusinessEventsQuery.isLoading;
        if (type === "worldwide") return worldwideBusinessEventsQuery.isLoading;
        if (type === "details") return businessEventByIdQuery.isLoading;
        return false;
      case "custom":
        return false; // Custom data is synchronous
      case "likes":
      default:
        return likesQuery.isLoading;
    }
  }, [
    source,
    type,
    likesQuery.isLoading,
    bucketsQuery.isLoading,
    singleBucketQuery.isLoading,
    contentQuery.isLoading,
    nearbyBusinessEventsQuery.isLoading,
    worldwideBusinessEventsQuery.isLoading,
    businessEventByIdQuery.isLoading,
  ]);

  const isError = React.useMemo(() => {
    switch (source) {
      case "bucket-single":
        return singleBucketQuery.isError;
      case "buckets":
        return bucketsQuery.isError;
      case "content":
        return contentQuery.isError;
      case "business":
        if (type === "nearby") return nearbyBusinessEventsQuery.isError;
        if (type === "worldwide") return worldwideBusinessEventsQuery.isError;
        if (type === "details") return businessEventByIdQuery.isError;
        return false;
      case "custom":
        return false; // Custom data doesn't have error states
      case "likes":
      default:
        return likesQuery.isError;
    }
  }, [
    source,
    type,
    likesQuery.isError,
    bucketsQuery.isError,
    singleBucketQuery.isError,
    contentQuery.isError,
    nearbyBusinessEventsQuery.isError,
    worldwideBusinessEventsQuery.isError,
    businessEventByIdQuery.isError,
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