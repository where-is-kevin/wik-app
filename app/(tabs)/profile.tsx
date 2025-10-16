import CustomView from "@/components/CustomView";
import EmptyData from "@/components/EmptyData";
import BucketsSection from "@/components/ImageBucket/ImageBucket";
import AnimatedLoader from "@/components/Loader/AnimatedLoader";
import LikesSection from "@/components/Section/LikesSection";
import ProfileSection from "@/components/Section/ProfileSection";
import { useTheme } from "@/contexts/ThemeContext";
import { useBuckets } from "@/hooks/useBuckets";
import { useLikes } from "@/hooks/useLikes";
import { useUser } from "@/hooks/useUser";
import { ErrorScreen } from "@/components/ErrorScreen";
import { bucketsHaveContent, likesHaveContent } from "@/utilities/hasContent";
import { getErrorMessage } from "@/utilities/errorUtils";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useCallback } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Using SVG placeholder via component error handling

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const router = useRouter();

  const { data: user, isLoading, isError, error, refetch } = useUser();
  const {
    data: likesData,
    isLoading: likesLoading,
    isError: likesError,
    refetch: refetchLikes,
  } = useLikes(undefined, true, 10); // Limit to 10 likes

  const {
    data: bucketsData,
    isLoading: bucketsLoading,
    isError: bucketsError,
    refetch: refetchBuckets,
  } = useBuckets(undefined, true, 10); // Limit to 10 buckets

  // Flatten the paginated data
  const buckets = useMemo(() => {
    if (!bucketsData?.pages) return [];
    return bucketsData.pages.flatMap((page) => page.items);
  }, [bucketsData]);

  const likes = useMemo(() => {
    if (!likesData?.pages) return [];
    return likesData.pages.flatMap((page) => page.items);
  }, [likesData]);

  const hasBucketsContent = bucketsHaveContent(buckets || []);
  const hasLikesContent = likesHaveContent(likes || []);

  // Create stable navigation functions
  const navigateToBucketDetails = useCallback(
    (bucketId: string) => {
      router.push(`/bucket-details/${bucketId}`);
    },
    [router]
  );

  const navigateToEventDetails = useCallback(
    (eventId: string) => {
      router.push(`/event-details/${eventId}`);
    },
    [router]
  );

  // Create stable onPress handlers for buckets
  const createBucketHandlers = useMemo(() => {
    const handlers = new Map();

    buckets?.forEach((bucket: any) => {
      if (!handlers.has(bucket.bucketId)) {
        handlers.set(bucket.bucketId, {
          onPress: () => navigateToBucketDetails(bucket.bucketId),
          onMorePress: () => {},
        });
      }
    });

    return handlers;
  }, [buckets, navigateToBucketDetails]);

  // Transform real bucket data for the UI with stable reference
  const transformedBucketsData = useMemo(() => {
    if (!buckets || buckets.length === 0) return [];

    return buckets.map((bucket: any) => {
      // Extract images from bucket content - only process valid items
      const validItems =
        bucket.content?.filter((item: any) => {
          const hasInternalImage =
            item.internalImageUrls &&
            Array.isArray(item.internalImageUrls) &&
            item.internalImageUrls.length > 0;
          return hasInternalImage;
        }) || [];

      const images = validItems
        .slice(0, 3) // Take first 3 for the UI
        .map((item: any) => {
          // Use internal image only
          if (
            item.internalImageUrls &&
            Array.isArray(item.internalImageUrls) &&
            item.internalImageUrls.length > 0
          ) {
            return item.internalImageUrls[0];
          }
          return ""; // Empty string for SVG placeholder
        });

      // Add placeholder images if we don't have enough (create stable array)
      const finalImages = [...images];
      while (finalImages.length < 3) {
        finalImages.push(""); // Empty string for SVG placeholder
      }

      // Get stable handlers from the map
      const handlers = createBucketHandlers.get(bucket.bucketId) || {
        onPress: () => navigateToBucketDetails(bucket.bucketId),
        onMorePress: () => {},
      };

      return {
        id: bucket.id,
        title: bucket.bucketName,
        images: finalImages,
        bucketShareUrl: bucket.bucketShareUrl,
        onPress: handlers.onPress,
        onMorePress: handlers.onMorePress,
      };
    });
  }, [buckets, createBucketHandlers, navigateToBucketDetails]);

  // Transform real likes data for the UI
  const transformedLikesData = useMemo(() => {
    if (!likes || likes.length === 0) return [];

    return likes.map((like: any) => {
      // Use internal image first, then fallback to legacy image field, then placeholder
      let image = ""; // Empty string for SVG placeholder
      if (
        like.internalImageUrls &&
        Array.isArray(like.internalImageUrls) &&
        like.internalImageUrls.length > 0
      ) {
        image = like.internalImageUrls[0];
      } else if (
        like.image &&
        typeof like.image === "string" &&
        like.image.trim() !== ""
      ) {
        image = like.image;
      }

      return {
        id: like.id,
        title: like.title || like.address || like.category || "Unknown",
        image: image,
        onPress: () => navigateToEventDetails(like.id),
        onMorePress: () => {},
        category: like.category,
        contentShareUrl: like.contentShareUrl,
      };
    });
  }, [likes, navigateToEventDetails]);

  // Navigate to buckets list - stable callback
  const navigateToBucketsList = useCallback(() => {
    router.push({
      pathname: "/profile-lists",
      params: { type: "buckets" },
    });
  }, [router]);

  // Navigate to likes list - stable callback
  const navigateToLikesList = useCallback(() => {
    router.push({
      pathname: "/profile-lists",
      params: { type: "likes" },
    });
  }, [router]);

  // Handle retry for any failed data - stable callback
  const handleRetry = useCallback(() => {
    if (isError) {
      refetch();
    }
    if (likesError) {
      refetchLikes();
    }
    if (bucketsError) {
      refetchBuckets();
    }
  }, [isError, likesError, bucketsError, refetch, refetchLikes, refetchBuckets]);




  // Show loading state
  if (isLoading || bucketsLoading || likesLoading) {
    return (
      <CustomView style={{ flex: 1 }}>
        <AnimatedLoader />
      </CustomView>
    );
  }

  // Show error state if any data failed to load
  if (isError || likesError || bucketsError) {
    return (
      <CustomView style={{ flex: 1 }}>
        <ErrorScreen
          title={getErrorMessage(error).title}
          message={getErrorMessage(error).message}
          onRetry={handleRetry}
        />
      </CustomView>
    );
  }

  return (
    <>
      <StatusBar style="dark" translucent />
      {/* Use a View with absolute positioning as background for the status bar area */}
      <CustomView
        bgColor={colors.overlay}
        style={[styles.statusBarBackground, { height: insets.top }]}
      />

      <CustomView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          <ProfileSection user={user} />

          {/* Buckets Section */}
          {hasBucketsContent && (
            <BucketsSection
              buckets={transformedBucketsData}
              onSeeMorePress={navigateToBucketsList}
            />
          )}
          {!hasBucketsContent && (
            <CustomView>
              <EmptyData type="buckets" style={styles.sectionEmptyState} />
            </CustomView>
          )}

          {/* Likes Section */}
          {hasLikesContent && (
            <LikesSection
              likes={transformedLikesData}
              onSeeMorePress={navigateToLikesList}
            />
          )}
          {!hasLikesContent && (
            <EmptyData type="likes" style={styles.sectionEmptyState} />
          )}
        </ScrollView>

      </CustomView>
    </>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    flex: 1,
  },
  statusBarBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionEmptyState: {
    paddingVertical: 40,
    flex: 0, // Don't take full height in sections
  },
});
