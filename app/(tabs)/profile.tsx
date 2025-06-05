import CustomView from "@/components/CustomView";
import BucketsSection from "@/components/ImageBucket/ImageBucket";
import AnimatedLoader from "@/components/Loader/AnimatedLoader";
import LikesSection from "@/components/Section/LikesSection";
import ProfileSection from "@/components/Section/ProfileSection";
import { useTheme } from "@/contexts/ThemeContext";
import { useBuckets } from "@/hooks/useBuckets";
import { useDislikes } from "@/hooks/useDislikes";
import { useLikes } from "@/hooks/useLikes";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const router = useRouter();

  const { data: user, isLoading, error } = useUser();
  const { data: likes, isLoading: likesLoading } = useLikes();
  const { data: dislikes, isLoading: dislikesLoading } = useDislikes();
  const { data: buckets, isLoading: bucketsLoading } = useBuckets();

  console.log("User data:", user);
  console.log("Likes data:", likes);
  console.log("Dislikes data:", dislikes);
  console.log("Buckets data:", buckets);

  // Placeholder image from assets
  const PLACEHOLDER_IMAGE = require("@/assets/images/placeholder-bucket.png");

  // Transform real bucket data for the UI
  const transformedBucketsData = useMemo(() => {
    if (!buckets || buckets.length === 0) return [];

    return buckets.map((bucket: any) => {
      // Extract images from bucket content
      const images =
        bucket.content
          ?.filter((item: any) => item.googlePlacesImageUrl) // Only items with images
          .slice(0, 3) // Take first 3 for the UI
          .map((item: any) => item.googlePlacesImageUrl) || [];

      // Add placeholder images if we don't have enough
      while (images.length < 3) {
        images.push(PLACEHOLDER_IMAGE);
      }

      return {
        id: bucket.id,
        title: bucket.bucketName,
        images: images,
        onPress: () => {
          router.push(`/bucket-details/${bucket.id}`);
        },
        onMorePress: () =>
          console.log("More options pressed for bucket:", bucket.id),
      };
    });
  }, [buckets, router]);

  // Transform real likes data for the UI
  const transformedLikesData = useMemo(() => {
    if (!likes || likes.length === 0) return [];

    return likes.slice(0, 10).map((like: any) => ({
      id: like.id,
      title: like.title || "Liked Item",
      image: like.googlePlacesImageUrl || like.image || PLACEHOLDER_IMAGE,
      onPress: () => {
        router.push(`/event-details/${like.id}`);
      },
      onMorePress: () => console.log("Like more options pressed for:", like.id),
    }));
  }, [likes, router]);

  // Navigate to buckets list
  const navigateToBucketsList = () => {
    router.push({
      pathname: "/profile-lists",
      params: { type: "buckets" },
    });
  };

  // Navigate to likes list
  const navigateToLikesList = () => {
    router.push({
      pathname: "/profile-lists",
      params: { type: "likes" },
    });
  };

  if (isLoading || bucketsLoading || likesLoading) {
    return <AnimatedLoader />;
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
          <BucketsSection
            buckets={transformedBucketsData}
            onSeeMorePress={navigateToBucketsList}
          />
          <LikesSection
            likes={transformedLikesData}
            onSeeMorePress={navigateToLikesList}
          />
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
});
