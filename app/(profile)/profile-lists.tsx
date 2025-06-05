import React, { useState, useMemo } from "react";
import { StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackHeader from "@/components/Header/BackHeader";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import SearchBar from "@/components/SearchBar/SearchBar";
import CustomView from "@/components/CustomView";
import CustomTouchable from "@/components/CustomTouchableOpacity";
import CustomText from "@/components/CustomText";
import BucketCard from "@/components/BucketComponent/BucketCard";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  BucketBottomSheet,
  BucketItem,
} from "@/components/BottomSheet/BucketBottomSheet";
import { CreateBucketBottomSheet } from "@/components/BottomSheet/CreateBucketBottomSheet";
import MasonryGrid, { LikeItem } from "@/components/MansoryGrid";
import { useAddBucket, useBuckets, useCreateBucket } from "@/hooks/useBuckets";
import { useLikes } from "@/hooks/useLikes";
import AnimatedLoader from "@/components/Loader/AnimatedLoader";

interface LocalBucketItem {
  id: string;
  title: string;
  safeImages: string[];
}

const ProfileListsScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { type } = useLocalSearchParams();
  const listType = type === "buckets" || type === "likes" ? type : "buckets";
  const [activeTab, setActiveTab] = useState<"buckets" | "likes">(
    listType || "buckets"
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Real data hooks
  const { data: buckets, isLoading: bucketsLoading } = useBuckets();
  const { data: likes, isLoading: likesLoading } = useLikes();

  // Mutation hooks
  const addBucketMutation = useAddBucket();
  const createBucketMutation = useCreateBucket();

  // Placeholder image
  const PLACEHOLDER_IMAGE = require("@/assets/images/placeholder-bucket.png");

  // State to track which item is being added to bucket
  const [selectedLikeItemId, setSelectedLikeItemId] = useState<string | null>(
    null
  );

  // Bottom sheet states
  const [isBucketBottomSheetVisible, setIsBucketBottomSheetVisible] =
    useState(false);
  const [
    isCreateBucketBottomSheetVisible,
    setIsCreateBucketBottomSheetVisible,
  ] = useState(false);
  const [bottomSheetItems, setBottomSheetItems] = useState<BucketItem[]>([]);

  // Transform real buckets data
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
        safeImages: images,
      };
    });
  }, [buckets]);

  // Transform real likes data
  const transformedLikesData = useMemo(() => {
    if (!likes || likes.length === 0) return [];

    return likes.map((like: any, index: number) => ({
      id: like.id,
      title: like.title || "Liked Item",
      foodImage: like.googlePlacesImageUrl || like.image || PLACEHOLDER_IMAGE,
      landscapeImage: "",
      isExperience: true,
      hasIcon: true,
      height: (index % 3 === 0 ? "tall" : "short") as "short" | "tall", // Vary heights for masonry effect
    }));
  }, [likes]);

  // Transform bucketsData to match BucketItem interface for bottom sheet
  // Transform bucketsData to match BucketItem interface for bottom sheet
  const transformBucketsForBottomSheet = (): BucketItem[] => {
    if (buckets) {
      return buckets.map((bucket) => ({
        id: bucket.id,
        title: bucket.bucketName,
        date: "22-27 June",
        image:
          typeof bucket.content?.[0]?.googlePlacesImageUrl === "string"
            ? bucket.content?.[0]?.googlePlacesImageUrl
            : "",
        contentIds: bucket.contentIds,
      }));
    } else return [];
  };
  // Bucket selection bottom sheet handlers
  const handleShowBucketBottomSheet = (likeItemId?: string) => {
    // Store the item that user wants to add to bucket
    if (likeItemId) {
      setSelectedLikeItemId(likeItemId);
    }
    const items = transformBucketsForBottomSheet();
    setBottomSheetItems(items);
    setIsBucketBottomSheetVisible(true);
  };

  const handleCloseBucketBottomSheet = () => {
    setIsBucketBottomSheetVisible(false);
  };

  const handleItemSelect = async (item: BucketItem) => {
    if (selectedLikeItemId) {
      try {
        await addBucketMutation.mutateAsync({
          id: item?.id,
          bucketName: item?.title,
          contentIds: [selectedLikeItemId],
        });

        setIsBucketBottomSheetVisible(false);
        setSelectedLikeItemId(null);

        console.log(`Successfully added item to bucket "${item.title}"`);
      } catch (error) {
        console.error("Failed to add item to bucket:", error);
      }
    }
  };

  // Create bucket bottom sheet handlers
  const handleShowCreateBucketBottomSheet = () => {
    setIsBucketBottomSheetVisible(false); // Close bucket selection sheet
    setIsCreateBucketBottomSheetVisible(true); // Open create bucket sheet
  };

  const handleCloseCreateBucketBottomSheet = () => {
    setIsCreateBucketBottomSheetVisible(false);
  };

  const handleCreateBucket = async (bucketName: string) => {
    console.log(selectedLikeItemId);
    if (selectedLikeItemId) {
      console.log(bucketName);
      try {
        // Create new bucket using the API
        // Note: Adjust the input fields based on your actual CreateBucketInput interface
        await createBucketMutation.mutateAsync({
          bucketName: bucketName,
          contentIds: [selectedLikeItemId],
        });
        setIsCreateBucketBottomSheetVisible(false);

        // Switch to buckets tab to show the new bucket
        setActiveTab("buckets");

        // Clear selected item
        setSelectedLikeItemId(null);

        console.log(`Successfully created new bucket: "${bucketName}"`);
      } catch (error) {
        console.error("Failed to create bucket:", error);
        // Handle error (show toast notification, etc.)
        // You might want to show an error message to the user here
      }
    }
  };

  // Handle like item press
  const handleLikeItemPress = (item: LikeItem) => {
    router.push(`/event-details/${item.id}`);
  };

  const filteredBucketsData = transformedBucketsData.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLikesData = transformedLikesData.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render buckets item
  const renderBucketItem = ({ item }: { item: LocalBucketItem }) => (
    <BucketCard
      item={item}
      onPress={() => router.push(`/bucket-details/${item.id}`)}
    />
  );

  // Show loading if data is still loading or mutations are in progress
  if (bucketsLoading || likesLoading) {
    return <AnimatedLoader />;
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <BackHeader transparent={true} />

      {/* Tab Navigation */}
      <CustomView style={styles.tabContainer}>
        <CustomTouchable
          style={[styles.tab]}
          onPress={() => setActiveTab("buckets")}
        >
          <CustomText
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "buckets"
                    ? colors.label_dark
                    : colors.gray_regular,
                fontFamily: "Inter-SemiBold",
              },
            ]}
          >
            Buckets
          </CustomText>
          {activeTab === "buckets" && (
            <CustomView
              style={styles.activeTabIndicator}
              bgColor={colors.label_dark}
            />
          )}
        </CustomTouchable>

        <CustomTouchable
          style={[styles.tab]}
          onPress={() => setActiveTab("likes")}
        >
          <CustomText
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "likes"
                    ? colors.label_dark
                    : colors.gray_regular,
                fontFamily: "Inter-SemiBold",
              },
            ]}
          >
            Likes
          </CustomText>
          {activeTab === "likes" && (
            <CustomView
              bgColor={colors.label_dark}
              style={styles.activeTabIndicator}
            />
          )}
        </CustomTouchable>
      </CustomView>

      {/* Search Bar */}
      <SearchBar
        placeholder={
          activeTab === "buckets" ? "Search your buckets" : "Search your likes"
        }
        value={searchQuery}
        onChangeText={setSearchQuery}
        containerStyle={styles.searchBarContainer}
      />

      {/* Content */}
      {activeTab === "likes" ? (
        <MasonryGrid
          data={filteredLikesData}
          onBucketPress={handleShowBucketBottomSheet}
          onItemPress={handleLikeItemPress}
        />
      ) : (
        <FlatList
          data={filteredBucketsData}
          renderItem={renderBucketItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.bucketRow}
          contentContainerStyle={styles.bucketsContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Bucket Selection Bottom Sheet */}
      <BucketBottomSheet
        selectedLikeItemId={selectedLikeItemId}
        isVisible={isBucketBottomSheetVisible}
        bucketItems={bottomSheetItems}
        onClose={handleCloseBucketBottomSheet}
        onItemSelect={handleItemSelect}
        onCreateNew={handleShowCreateBucketBottomSheet}
      />

      {/* Create Bucket Bottom Sheet */}
      <CreateBucketBottomSheet
        isVisible={isCreateBucketBottomSheetVisible}
        onClose={handleCloseCreateBucketBottomSheet}
        onCreateBucket={handleCreateBucket}
      />
    </SafeAreaView>
  );
};

export default ProfileListsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: verticalScale(16),
    justifyContent: "center",
    gap: horizontalScale(8),
  },
  tab: {
    paddingBottom: verticalScale(4),
    position: "relative",
  },
  activeTabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  tabText: {
    fontSize: scaleFontSize(16),
    fontFamily: "Inter-Medium",
  },
  searchBarContainer: {
    marginBottom: verticalScale(16),
  },
  bucketsContainer: {
    paddingHorizontal: horizontalScale(16),
    paddingBottom: verticalScale(20),
    gap: verticalScale(16),
  },
  bucketRow: {
    justifyContent: "space-between",
  },
});
