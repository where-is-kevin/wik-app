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
import React from "react";
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

  // Sample data for buckets - added id field
  const bucketsData = [
    {
      id: "123", // Add unique ID for each bucket
      title: "Douro Valley with family",
      images: [
        "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=300&auto=format",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=150&auto=format",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=150&auto=format",
      ],
      onPress: () => {
        router.push(`/bucket-details/123`);
      },
      onMorePress: () => console.log("More options pressed"),
    },
    {
      id: "456", // Add unique ID for each bucket
      title: "Adventure in the Alps",
      images: [
        "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=300&auto=format",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=150&auto=format",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=150&auto=format",
      ],
      onPress: () => {
        router.push(`/bucket-details/456`);
      },
      onMorePress: () => console.log("More options pressed"),
    },
  ];

  // Sample data for likes
  const likesData = [
    {
      id: "123",
      title: "Douro Valley with family",
      image:
        "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=300&auto=format",
      onPress: () => {
        router.push(`/event-details/123`);
      },
      onMorePress: () => console.log("Like more options pressed"),
    },
    {
      id: "456",
      title: "Douro Valley with family",
      image:
        "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=300&auto=format",
      onPress: () => {
        router.push(`/event-details/456`);
      },
      onMorePress: () => console.log("Like more options pressed"),
    },
  ];

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

  if (isLoading) {
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
            buckets={bucketsData}
            onSeeMorePress={navigateToBucketsList}
          />
          <LikesSection
            likes={likesData}
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
