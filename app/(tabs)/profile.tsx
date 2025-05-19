import { StyleSheet, ScrollView } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import CustomView from "@/components/CustomView";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BucketsSection from "@/components/ImageBucket/ImageBucket";
import LikesSection from "@/components/Section/LikesSection";
import { useTheme } from "@/contexts/ThemeContext";
import ProfileSection from "@/components/Section/ProfileSection";

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  // Sample data for buckets
  const bucketsData = [
    {
      title: "Douro Valley with family",
      images: [
        "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=300&auto=format",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=150&auto=format",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=150&auto=format",
      ],
      onPress: () => console.log("Bucket pressed"),
      onMorePress: () => console.log("More options pressed"),
    },
    {
      title: "Douro Valley with family",
      images: [
        "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=300&auto=format",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=150&auto=format",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=150&auto=format",
      ],
      onPress: () => console.log("Bucket pressed"),
      onMorePress: () => console.log("More options pressed"),
    },
  ];

  // Sample data for likes
  const likesData = [
    {
      title: "Douro Valley with family",
      image:
        "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=300&auto=format",
      onPress: () => console.log("Like pressed"),
      onMorePress: () => console.log("Like more options pressed"),
    },
    {
      title: "Douro Valley with family",
      image:
        "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=300&auto=format",
      onPress: () => console.log("Like pressed"),
      onMorePress: () => console.log("Like more options pressed"),
    },
  ];

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
          <ProfileSection />
          <BucketsSection
            buckets={bucketsData}
            onSeeMorePress={() => console.log("See more buckets pressed")}
          />
          <LikesSection
            likes={likesData}
            onSeeMorePress={() => console.log("See more likes pressed")}
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
});
