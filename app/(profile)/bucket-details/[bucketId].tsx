import { StyleSheet } from "react-native";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import BackHeader from "@/components/Header/BackHeader";
import { useTheme } from "@/contexts/ThemeContext";
import SearchBar from "@/components/SearchBar/SearchBar";
import {
  verticalScale,
  horizontalScale,
  scaleFontSize,
} from "@/utilities/scaling";
import {
  BucketBottomSheet,
  BucketItem,
} from "@/components/BottomSheet/BucketBottomSheet";
import { CreateBucketBottomSheet } from "@/components/BottomSheet/CreateBucketBottomSheet";
import MasonryGrid, { LikeItem } from "@/components/MansoryGrid";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  useBucketById,
  useCreateBucket,
  useAddBucket,
} from "@/hooks/useBuckets";
import CustomText from "@/components/CustomText";
import CustomView from "@/components/CustomView";
import AnimatedLoader from "@/components/Loader/AnimatedLoader";
import { bucketsHaveContent } from "@/utilities/hasContent";
import EmptyData from "@/components/EmptyData";

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

const BucketDetailsScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { bucketId } = useLocalSearchParams<{ bucketId: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLikeItemId, setSelectedLikeItemId] = useState<string | null>(
    null
  );

  const [debouncedSearchQuery] = useDebounce(searchQuery, 600);

  // API hooks - pass search query to the API
  const {
    data: bucket,
    isLoading: isBucketLoading,
    error: bucketError,
    refetch: refetchBucket,
  } = useBucketById(bucketId || "", debouncedSearchQuery);
  const createBucketMutation = useCreateBucket();
  const addBucketMutation = useAddBucket();

  // Bottom sheet states
  const [isBucketBottomSheetVisible, setIsBucketBottomSheetVisible] =
    useState(false);
  const [
    isCreateBucketBottomSheetVisible,
    setIsCreateBucketBottomSheetVisible,
  ] = useState(false);

  // Transform Content to LikeItem format
  const transformContentToLikeItem = (
    content: any,
    index: number
  ): LikeItem => {
    return {
      id: content.id,
      title: content.title,
      foodImage: content.googlePlacesImageUrl || "",
      landscapeImage: "",
      isExperience:
        content.category === "experience" || content.category === "attraction",
      hasIcon: true,
      height: (index % 3 === 0 ? "tall" : "short") as "short" | "tall",
    };
  };

  // Transform bucket content to LikeItem array
  const bucketItemsData: LikeItem[] = useMemo(() => {
    if (!bucket?.content) return [];
    return bucket.content.map((content, index) =>
      transformContentToLikeItem(content, index)
    );
  }, [bucket?.content]);

  // Since we're filtering on the server, use the API results directly
  const filteredBucketItems = bucketItemsData;

  // Check if bucket has content using utility function (same pattern as other screens)
  const hasBucketContent = bucketsHaveContent(bucket ? [bucket] : []);

  // Determine what to show
  const hasSearchQuery = debouncedSearchQuery.trim().length > 0;
  const hasFilteredResults = filteredBucketItems.length > 0;

  // Bucket selection bottom sheet handlers
  const handleShowBucketBottomSheet = (likeItemId: string) => {
    setSelectedLikeItemId(likeItemId);
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
    setIsBucketBottomSheetVisible(false);
    setIsCreateBucketBottomSheetVisible(true);
  };

  const handleCloseCreateBucketBottomSheet = () => {
    setIsCreateBucketBottomSheetVisible(false);
  };

  const handleCreateBucket = async (bucketName: string) => {
    if (selectedLikeItemId) {
      try {
        await createBucketMutation.mutateAsync({
          bucketName,
          contentIds: [selectedLikeItemId],
        });

        setIsCreateBucketBottomSheetVisible(false);
        setSelectedLikeItemId(null);
      } catch (error) {
        console.error("Error creating bucket:", error);
      }
    }
  };

  // Handle item press in bucket details
  const handleBucketItemPress = (item: LikeItem) => {
    router.push(`/event-details/${item.id}`);
  };

  // Handle search query change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Loading state
  if (isBucketLoading && !bucket) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <BackHeader title="Loading..." transparent={true} />
        <SearchBar
          placeholder={"Search your bucket"}
          value={searchQuery}
          onChangeText={handleSearchChange}
          containerStyle={styles.searchBarContainer}
          editable={false}
        />
        <AnimatedLoader />
      </SafeAreaView>
    );
  }

  // Error state
  if (bucketError || !bucket) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <CustomView style={styles.loadingContainer}>
          <CustomText style={{ color: colors.label_dark }}>
            {bucketError ? "Error loading bucket" : "Bucket not found"}
          </CustomText>
        </CustomView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <BackHeader title={bucket.bucketName} transparent={true} />
      <SearchBar
        placeholder={"Search your bucket"}
        value={searchQuery}
        onChangeText={handleSearchChange}
        containerStyle={styles.searchBarContainer}
      />

      {/* Show loader under search when loading */}
      {isBucketLoading && (
        <CustomView style={styles.loaderContainer}>
          <AnimatedLoader />
        </CustomView>
      )}

      {/* Content */}
      {hasBucketContent && hasFilteredResults && (
        <MasonryGrid
          data={filteredBucketItems}
          onBucketPress={handleShowBucketBottomSheet}
          onItemPress={handleBucketItemPress}
          refreshing={isBucketLoading}
          onRefresh={refetchBucket}
        />
      )}

      {/* Empty bucket state */}
      {!hasBucketContent && <EmptyData type="buckets" />}

      {/* No search results state */}
      {hasBucketContent && hasSearchQuery && !hasFilteredResults && (
        <CustomView style={styles.noResultsContainer}>
          <CustomText
            style={[styles.noResultsTitle, { color: colors.gray_regular }]}
            fontFamily="Inter-SemiBold"
          >
            No results found
          </CustomText>
          <CustomText
            style={[styles.noResultsSubtitle, { color: colors.gray_regular }]}
          >
            Try adjusting your search terms
          </CustomText>
        </CustomView>
      )}

      {/* Bucket Selection Bottom Sheet */}
      <BucketBottomSheet
        isVisible={isBucketBottomSheetVisible}
        onClose={handleCloseBucketBottomSheet}
        onItemSelect={handleItemSelect}
        onCreateNew={handleShowCreateBucketBottomSheet}
        selectedLikeItemId={selectedLikeItemId}
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

export default BucketDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarContainer: {
    marginBottom: verticalScale(16),
    marginTop: verticalScale(12),
  },
  loaderContainer: {
    paddingVertical: verticalScale(20),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: horizontalScale(32),
    paddingVertical: verticalScale(60),
  },
  noResultsTitle: {
    fontSize: scaleFontSize(20),
    textAlign: "center",
    marginBottom: verticalScale(8),
  },
  noResultsSubtitle: {
    fontSize: scaleFontSize(16),
    textAlign: "center",
    lineHeight: 24,
  },
});
