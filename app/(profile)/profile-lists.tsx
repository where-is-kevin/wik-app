import React, { useState, useMemo, useEffect, useRef } from "react";
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
import {
  useAddBucket,
  useBuckets,
  useCreateBucket,
  useLikes,
} from "@/hooks/useBuckets";
import AnimatedLoader from "@/components/Loader/AnimatedLoader";
import { bucketsHaveContent, likesHaveContent } from "@/utilities/hasContent";
import EmptyData from "@/components/EmptyData";

interface LocalBucketItem {
  id: string;
  title: string;
  safeImages: string[];
}

// Enhanced custom hook for debounced search with reset capability
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  // Reset function to immediately update debounced value
  const resetDebouncedValue = (newValue: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setDebouncedValue(newValue);
  };

  return [debouncedValue, resetDebouncedValue] as const;
};

const ProfileListsScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { type } = useLocalSearchParams();
  const listType = type === "buckets" || type === "likes" ? type : "buckets";
  const [activeTab, setActiveTab] = useState<"buckets" | "likes">(
    listType || "buckets"
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Debounce search query to avoid too many API calls
  const [debouncedSearchQuery, resetDebouncedValue] = useDebounce(
    searchQuery,
    600
  );

  // Only call hooks for the active tab
  const { data: buckets, isLoading: bucketsLoading } = useBuckets(
    activeTab === "buckets" ? debouncedSearchQuery : undefined
  );

  const { data: likes, isLoading: likesLoading } = useLikes(
    activeTab === "likes" ? debouncedSearchQuery : undefined
  );

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

  // Check if buckets and likes have content
  const hasBucketsContent = bucketsHaveContent(buckets || []);
  const hasLikesContent = likesHaveContent(likes || []);

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

  // Bucket selection bottom sheet handlers
  const handleShowBucketBottomSheet = (likeItemId?: string) => {
    // Store the item that user wants to add to bucket
    if (likeItemId) {
      setSelectedLikeItemId(likeItemId);
    }
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
    if (selectedLikeItemId) {
      try {
        // Create new bucket using the API
        await createBucketMutation.mutateAsync({
          bucketName: bucketName,
          contentIds: [selectedLikeItemId],
        });
        setIsCreateBucketBottomSheetVisible(false);

        // Switch to buckets tab to show the new bucket
        setActiveTab("buckets");

        // Clear selected item
        setSelectedLikeItemId(null);
      } catch (error) {
        console.error("Failed to create bucket:", error);
      }
    }
  };

  // Handle like item press
  const handleLikeItemPress = (item: LikeItem) => {
    router.push(`/event-details/${item.id}`);
  };

  // Handle search query change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Clear search when switching tabs
  const handleTabChange = (tab: "buckets" | "likes") => {
    setActiveTab(tab);
    setSearchQuery("");
    resetDebouncedValue("");
  };

  // Render buckets item
  const renderBucketItem = ({ item }: { item: LocalBucketItem }) => (
    <BucketCard
      item={item}
      onPress={() => router.push(`/bucket-details/${item.id}`)}
    />
  );

  // Show loading if data is still loading or mutations are in progress
  const isLoading =
    (activeTab === "buckets" && bucketsLoading) ||
    (activeTab === "likes" && likesLoading);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <BackHeader transparent={true} />

      {/* Tab Navigation */}
      <CustomView style={styles.tabContainer}>
        <CustomTouchable
          style={[styles.tab]}
          onPress={() => handleTabChange("buckets")}
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
          onPress={() => handleTabChange("likes")}
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
        onChangeText={handleSearchChange}
        containerStyle={styles.searchBarContainer}
      />
      {isLoading && <AnimatedLoader />}

      {/* Content */}
      {!isLoading && activeTab === "likes" && (
        <>
          {hasLikesContent && (
            <MasonryGrid
              data={transformedLikesData}
              onBucketPress={handleShowBucketBottomSheet}
              onItemPress={handleLikeItemPress}
            />
          )}
          {!hasLikesContent && <EmptyData type="likes" />}
        </>
      )}
      {!isLoading && activeTab === "buckets" && (
        <>
          {hasBucketsContent && (
            <FlatList
              data={transformedBucketsData}
              renderItem={renderBucketItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.bucketRow}
              contentContainerStyle={styles.bucketsContainer}
              showsVerticalScrollIndicator={false}
            />
          )}
          {!hasBucketsContent && <EmptyData type="buckets" />}
        </>
      )}
      <BucketBottomSheet
        selectedLikeItemId={selectedLikeItemId}
        isVisible={isBucketBottomSheetVisible}
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
