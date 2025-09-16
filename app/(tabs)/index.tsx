import { useContent } from "@/hooks/useContent";
import React, { useState, useCallback, useMemo } from "react";
import { useAddLike } from "@/hooks/useLikes";
import { getErrorMessage } from "@/utilities/errorUtils";
import { StyleSheet, TouchableOpacity, Linking, Alert } from "react-native";
import CustomView from "@/components/CustomView";
import { horizontalScale, verticalScale } from "@/utilities/scaling";
import {
  BucketBottomSheet,
  BucketItem,
} from "@/components/BottomSheet/BucketBottomSheet";
import { CreateBucketBottomSheet } from "@/components/BottomSheet/CreateBucketBottomSheet";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { useAddBucket, useCreateBucket } from "@/hooks/useBuckets";
import AnimatedLoader from "@/components/Loader/AnimatedLoader";
import { useAddDislike } from "@/hooks/useDislikes";
import { useLocation } from "@/contexts/LocationContext";
import CustomText from "@/components/CustomText";
import { CardData, SwipeCards } from "@/components/SwipeCards/SwipeCards";
import FilterModal, { FilterType } from "@/components/FilterModal/FilterModal";
import FilterSvg from "@/components/SvgComponents/FilterSvg";
import CustomTouchable from "@/components/CustomTouchableOpacity";
import { useAnalyticsContext } from "@/contexts/AnalyticsContext";
import ModeHeader from "@/components/Header/ModeHeader";

const SwipeableCards = () => {
  const { location, permissionStatus } = useLocation();
  const [selectedFilters, setSelectedFilters] = useState<FilterType[]>([
    "events",
    "venues",
    "experiences",
  ]);

  // Simple params - just use current location from context
  const locationParams = {
    latitude: location?.lat,
    longitude: location?.lon,
    category_filter:
      selectedFilters.length > 0
        ? selectedFilters
            .map((filter) => {
              if (filter === "events") return "event";
              if (filter === "venues") return "venue";
              if (filter === "experiences") return "experience";
              return filter;
            })
            .join(";")
        : "event;venue;experience",
  };

  // Convert permission status to the format expected by useContent
  const getPermissionStatus = () => {
    if (permissionStatus === "granted") return "granted";
    if (permissionStatus === "denied") return "denied";
    return "undetermined";
  };

  const {
    data: content,
    isLoading,
    error,
    refetch,
  } = useContent(locationParams, getPermissionStatus());
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { trackSuggestion } = useAnalyticsContext();

  const [isBucketBottomSheetVisible, setIsBucketBottomSheetVisible] =
    useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [
    isCreateBucketBottomSheetVisible,
    setIsCreateBucketBottomSheetVisible,
  ] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  // Mutation hooks
  const addBucketMutation = useAddBucket();
  const createBucketMutation = useCreateBucket();
  const addLikeMutation = useAddLike();
  const dislikeMutation = useAddDislike();

  // Transform your content data to match SwipeCards interface
  // Memoize transformedData to prevent recreation on every render
  const transformedData: CardData[] = useMemo(() => {
    return content
      ? content.map((item) => ({
          id: item.id,
          title: item.title,
          imageUrl:
            item.internalImageUrls && item.internalImageUrls.length > 0
              ? item.internalImageUrls[0]
              : item.googlePlacesImageUrl,
          price: item.price ? item.price.toString() : undefined,
          rating: item?.rating ? item.rating.toString() : undefined,
          category: item.category,
          websiteUrl: item.websiteUrl || "",
          address: item.address || "",
          isSponsored: item.isSponsored,
          contentShareUrl: item.contentShareUrl,
          tags: item.tags,
          similarity: item.similarity,
          distance: item.distance,
          eventDatetime: (item as any).eventDatetime, // Add event datetime for events
        }))
      : [];
  }, [content]);

  const handleLike = useCallback(
    (item: CardData) => {
      if (!item) {
        console.error("No item provided to handleLike");
        return;
      }

      // Track suggestion analytics
      trackSuggestion("swipe_right", {
        suggestion_id: item.id,
        suggestion_type:
          (item.category as "venue" | "experience" | "event") || "unknown",
        category: item.category || "unknown",
        similarity_score: item.similarity,
        rating: item.rating ? parseFloat(item.rating) : undefined,
        price_range: item.price,
      });

      const likeData = {
        contentIds: [item.id],
      };

      addLikeMutation.mutate(likeData, {
        onError: (error) => {
          console.error("Failed to add like:", error);
        },
      });
    },
    [addLikeMutation, trackSuggestion]
  );

  const handleDislike = useCallback(
    (item: CardData) => {
      if (!item) {
        console.error("No item provided to handleDislike");
        return;
      }

      // Track suggestion analytics
      trackSuggestion("swipe_left", {
        suggestion_id: item.id,
        suggestion_type:
          (item.category as "venue" | "experience" | "event") || "venue",
        category: item.category || "unknown",
        similarity_score: item.similarity,
        rating: item.rating ? parseFloat(item.rating) : undefined,
        price_range: item.price,
      });

      const dislikeData = {
        contentIds: [item.id],
      };

      dislikeMutation.mutate(dislikeData, {
        onError: (error) => {
          console.error("Failed to add dislike:", error);
        },
      });
    },
    [dislikeMutation, trackSuggestion]
  );

  const handleSwipeLeft = useCallback(
    (item: CardData) => {
      if (!item) {
        console.error("No item provided to handleSwipeLeft");
        return;
      }
      handleDislike(item);
    },
    [handleDislike]
  );

  const handleSwipeRight = useCallback(
    (item: CardData) => {
      if (!item) {
        console.error("No item provided to handleSwipeRight");
        return;
      }
      handleLike(item);
    },
    [handleLike]
  );

  const handleSwipeUp = useCallback(
    (item: CardData) => {
      if (!item) {
        console.error("No item provided to handleSwipeUp");
        return;
      }

      // Track as save_suggestion (you can change to book_suggestion if this is booking)
      trackSuggestion("save_suggestion", {
        suggestion_id: item.id,
        suggestion_type:
          (item.category as "venue" | "experience" | "event") || "venue",
        category: item.category || "unknown",
        similarity_score: item.similarity,
        rating: item.rating ? parseFloat(item.rating) : undefined,
        price_range: item.price,
      });

      // Check if the item has a website URL and open it
      if (item?.websiteUrl) {
        Linking.openURL(item.websiteUrl).catch((err) => {
          // console.error("Failed to open URL:", err);
        });
      } else {
        Alert.alert("No Website", "No website is available for this content.");
      }
    },
    [trackSuggestion]
  );

  // Simplified: Just refetch new content when cards are exhausted
  const handleComplete = useCallback(() => {
    // console.log("All cards swiped, fetching new content...");
    refetch();
  }, [refetch]);

  const handleShowBucketBottomSheet = useCallback((itemId?: string) => {
    if (itemId) {
      setSelectedItemId(itemId);
    }
    setIsBucketBottomSheetVisible(true);
  }, []);

  const handleCloseBucketBottomSheet = () => {
    setIsBucketBottomSheetVisible(false);
  };

  const handleItemSelect = async (item: BucketItem) => {
    if (selectedItemId) {
      try {
        await addBucketMutation.mutateAsync({
          id: item?.id,
          bucketName: item?.title,
          contentIds: [selectedItemId],
        });

        setIsBucketBottomSheetVisible(false);
        setSelectedItemId(null);

        // console.log(`Successfully added item to bucket "${item.title}"`);
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
    if (selectedItemId) {
      try {
        // Create new bucket using the API
        await createBucketMutation.mutateAsync({
          bucketName: bucketName,
          contentIds: [selectedItemId],
        });
        setIsCreateBucketBottomSheetVisible(false);
        setSelectedItemId(null);
      } catch (error) {
        console.error("Failed to create bucket:", error);
      }
    }
  };

  const handleFilterApply = (filters: FilterType[]) => {
    setSelectedFilters(filters);
    // The locationParams will automatically update due to the dependency on selectedFilters
  };

  if (error) {
    const errorMessage = getErrorMessage(error);
    return (
      <CustomView style={styles.errorContainer}>
        <CustomText style={styles.errorTitle}>{errorMessage.title}</CustomText>
        <CustomText style={styles.errorText}>{errorMessage.message}</CustomText>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <CustomText style={styles.retryButtonText}>Check Again</CustomText>
        </TouchableOpacity>
      </CustomView>
    );
  }

  // Check if we're still waiting for location decision
  const waitingForLocation =
    getPermissionStatus() === "undetermined" ||
    (getPermissionStatus() === "granted" && !location?.lat && !location?.lon);

  // Show loading state
  if (isLoading || waitingForLocation) {
    return (
      <SafeAreaView style={{ backgroundColor: "#fff", flex: 1 }}>
        <AnimatedLoader />
      </SafeAreaView>
    );
  }

  // Show empty state when no data is available AND we're not loading
  if (!transformedData.length) {
    return (
      <>
        <ModeHeader />
        <CustomView style={styles.content}>
          <CustomTouchable
            style={styles.filterSvgButton}
            onPress={() => setIsFilterModalVisible(true)}
          >
            <CustomView style={styles.filterSvgContainer}>
              <FilterSvg />
              {selectedFilters.length < 3 && (
                <CustomView
                  bgColor={colors.light_blue}
                  style={styles.filterIndicatorDot}
                />
              )}
            </CustomView>
          </CustomTouchable>

          <CustomView style={styles.errorContainer}>
            {selectedFilters.length < 3 ? (
              <>
                <CustomText style={styles.errorTitle}>
                  No results for your filters
                </CustomText>
                <CustomText style={styles.errorText}>
                  Try changing your filters to see more content in your area.
                </CustomText>
              </>
            ) : (
              <>
                <CustomText style={styles.errorTitle}>
                  You're on the edge of something amazing.
                </CustomText>
                <CustomText style={styles.errorText}>
                  {`We're not live in your area just yet, but as soon as we reach 5000 signed up nearby we'll launch. To help us reach our goal, tell your friends so you can all be part of launching something amazing in your area.`}
                </CustomText>
              </>
            )}
          </CustomView>
        </CustomView>

        <FilterModal
          isVisible={isFilterModalVisible}
          onClose={() => setIsFilterModalVisible(false)}
          onApply={handleFilterApply}
          selectedFilters={selectedFilters}
        />
      </>
    );
  }

  return (
    <>
      <ModeHeader />
      <CustomView style={styles.content}>
        <CustomTouchable
          style={styles.filterSvgButton}
          onPress={() => setIsFilterModalVisible(true)}
        >
          <CustomView style={styles.filterSvgContainer}>
            <FilterSvg />
            {selectedFilters.length < 3 && (
              <CustomView
                bgColor={colors.light_blue}
                style={styles.filterIndicatorDot}
              />
            )}
          </CustomView>
        </CustomTouchable>

        <CustomView style={[styles.swipeContainer]}>
          <SwipeCards
            data={transformedData}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onSwipeUp={handleSwipeUp}
            onComplete={handleComplete}
            onBucketPress={handleShowBucketBottomSheet}
            shouldAdvanceOnSwipeUp={false} // Don't advance card on swipe up in tabs screen
          />
        </CustomView>
      </CustomView>
      <BucketBottomSheet
        isVisible={isBucketBottomSheetVisible}
        onClose={handleCloseBucketBottomSheet}
        onItemSelect={handleItemSelect}
        onCreateNew={handleShowCreateBucketBottomSheet}
        selectedLikeItemId={selectedItemId}
      />

      <CreateBucketBottomSheet
        isVisible={isCreateBucketBottomSheetVisible}
        onClose={handleCloseCreateBucketBottomSheet}
        onCreateBucket={handleCreateBucket}
      />

      <FilterModal
        isVisible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        onApply={handleFilterApply}
        selectedFilters={selectedFilters}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  statusBarBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  errorText: {
    color: "#666",
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: "#6C63FF",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: horizontalScale(24),
    alignItems: "center",
    justifyContent: "center",
  },
  swipeContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: verticalScale(5),
  },
  filterSvgButton: {
    marginTop: verticalScale(16),
    marginBottom: verticalScale(10),
    alignSelf: "flex-end",
  },
  filterSvgContainer: {
    position: "relative",
  },
  filterIndicatorDot: {
    position: "absolute",
    bottom: 0,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default SwipeableCards;
