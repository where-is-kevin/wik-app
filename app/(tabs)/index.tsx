import { useContent } from "@/hooks/useContent";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useAddLike } from "@/hooks/useLikes";
import { getErrorMessage } from "@/utilities/errorUtils";
import { StyleSheet, View, Linking, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ErrorScreen } from "@/components/ErrorScreen";
import CustomView from "@/components/CustomView";
import { horizontalScale, verticalScale } from "@/utilities/scaling";
import {
  BucketBottomSheet,
  BucketItem,
} from "@/components/BottomSheet/BucketBottomSheet";
import { CreateBucketBottomSheet } from "@/components/BottomSheet/CreateBucketBottomSheet";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { useAddBucket, useCreateBucket } from "@/hooks/useBuckets";
import AnimatedLoader from "@/components/Loader/AnimatedLoader";
import { useAddDislike } from "@/hooks/useDislikes";
import { useLocation } from "@/contexts/LocationContext";
import { useUserLocation } from "@/contexts/UserLocationContext";
import SwipeCards, { CardData } from "@/components/SwipeCards/SwipeCards";
import FilterModal, { FilterType } from "@/components/FilterModal/FilterModal";
import FilterSvg from "@/components/SvgComponents/FilterSvg";
import CustomTouchable from "@/components/CustomTouchableOpacity";
import { useAnalyticsContext } from "@/contexts/AnalyticsContext";
import ModeHeader from "@/components/Header/ModeHeader";
import { useToast } from "@/contexts/ToastContext";
import { useMode } from "@/contexts/ModeContext";
import SwipeCardTooltips from "@/components/Tooltips/SwipeCardTooltips";
import AsyncStorage from "@react-native-async-storage/async-storage";
import QuestionMarkSvg from "@/components/SvgComponents/QuestionMarkSvg";
import QuestionMarkActiveSvg from "@/components/SvgComponents/QuestionMarkActiveSvg";

const SwipeableCards = () => {
  const router = useRouter();
  const { location: deviceLocation, permissionStatus } = useLocation();
  const { getApiLocationParams } = useUserLocation();
  const { mode } = useMode();
  const [selectedFilters, setSelectedFilters] = useState<FilterType[]>([
    "events",
    "venues",
    "experiences",
  ]);

  // Use UserLocationContext to determine if we should send coordinates
  const locationParams = {
    ...getApiLocationParams(deviceLocation || undefined),
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
    type: mode, // Add the current mode as type
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

  // Reset pagination when new content is loaded
  React.useEffect(() => {
    if (content && content.length > 0) {
      setCurrentOffset(0);
    }
  }, [content]);
  const { colors } = useTheme();
  const { trackSuggestion } = useAnalyticsContext();
  const { showToast } = useToast();

  const [isBucketBottomSheetVisible, setIsBucketBottomSheetVisible] =
    useState(false);

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [
    isCreateBucketBottomSheetVisible,
    setIsCreateBucketBottomSheetVisible,
  ] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [showSwipeTooltips, setShowSwipeTooltips] = useState(false);
  const [showQuestionMarkTooltips, setShowQuestionMarkTooltips] =
    useState(false);

  // Check if this is the first time user visits the main tab
  useEffect(() => {
    const checkFirstTimeUser = async () => {
      try {
        const hasSeenTooltips = await AsyncStorage.getItem(
          "hasSeenSwipeTooltips"
        );
        if (!hasSeenTooltips) {
          setShowSwipeTooltips(true);
        }
      } catch (error) {
        console.log("Error checking first time user:", error);
      }
    };

    checkFirstTimeUser();
  }, []);

  const handleTooltipsComplete = async () => {
    try {
      await AsyncStorage.setItem("hasSeenSwipeTooltips", "true");
      setShowSwipeTooltips(false);
    } catch (error) {
      console.log("Error saving tooltips completion:", error);
      setShowSwipeTooltips(false);
    }
  };

  const handleQuestionMarkPress = () => {
    setShowQuestionMarkTooltips(prev => !prev);
  };

  const handleQuestionMarkTooltipsComplete = () => {
    setShowQuestionMarkTooltips(false);
  };

  // Auto-dismiss question mark tooltips after 5 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showQuestionMarkTooltips) {
      timer = setTimeout(() => {
        setShowQuestionMarkTooltips(false);
      }, 5000);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [showQuestionMarkTooltips]);

  // Mutation hooks
  const addBucketMutation = useAddBucket();
  const createBucketMutation = useCreateBucket();
  const addLikeMutation = useAddLike();
  const dislikeMutation = useAddDislike();

  // Track when to refresh the card stack
  const [swipeKey, setSwipeKey] = useState<number>(0);
  // Track current offset for pagination through existing data
  const [currentOffset, setCurrentOffset] = useState<number>(0);

  // Transform your content data to match SwipeCards interface
  const transformedData: CardData[] = useMemo(() => {
    if (!content || content.length === 0) {
      return [];
    }

    // Calculate how many items we can show from current offset
    // Platform-specific batch size: iOS can handle more cards efficiently
    const itemsPerBatch = Platform.OS === "ios" ? 8 : 6;
    const startIndex = currentOffset;
    const endIndex = Math.min(startIndex + itemsPerBatch, content.length);

    const filtered = content.slice(startIndex, endIndex).map((item) => ({
      id: item.id,
      title: item.title || "Untitled", // Handle null title
      imageUrl:
        item.internalImageUrls &&
        Array.isArray(item.internalImageUrls) &&
        item.internalImageUrls.length > 0
          ? item.internalImageUrls[0]
          : "",
      price: item.price
        ? typeof item.price === "number"
          ? item.price.toString()
          : item.price
        : undefined,
      rating: item?.rating ? item.rating.toString() : undefined,
      category: item.category,
      websiteUrl: item.websiteUrl || "",
      address: item.addressShort || item.address || "",
      isSponsored: item.isSponsored,
      contentShareUrl: item.contentShareUrl,
      tags: item.tags,
      similarity:
        typeof item.similarity === "string"
          ? parseFloat(item.similarity) || 0
          : item.similarity,
      distance: item.distance,
      eventDatetimeStart: item.eventDatetimeStart || undefined, // Add event datetime for events
      eventDatetimeEnd: item.eventDatetimeEnd || undefined,
    }));

    return filtered;
  }, [content, currentOffset]);

  const handleLike = useCallback(
    (item: CardData) => {
      if (!item) {
        return;
      }

      // Track suggestion analytics
      trackSuggestion("swipe_right", {
        suggestion_id: item.id,
        suggestion_type:
          (item.category as "venue" | "experience" | "event") || "unknown",
        category: item.category || "unknown",
        similarity_score:
          typeof item.similarity === "string"
            ? parseFloat(item.similarity) || 0
            : item.similarity,
        rating: item.rating ? parseFloat(item.rating) : undefined,
        price_range: item.price,
      });

      const likeData = {
        contentIds: [item.id],
      };

      addLikeMutation.mutate(likeData, {
        onError: () => {
          showToast("Failed to save your interest", "error");
        },
      });
    },
    [addLikeMutation, trackSuggestion, showToast]
  );

  const handleDislike = useCallback(
    (item: CardData) => {
      if (!item) {
        return;
      }

      // Track suggestion analytics
      trackSuggestion("swipe_left", {
        suggestion_id: item.id,
        suggestion_type:
          (item.category as "venue" | "experience" | "event") || "venue",
        category: item.category || "unknown",
        similarity_score:
          typeof item.similarity === "string"
            ? parseFloat(item.similarity) || 0
            : item.similarity,
        rating: item.rating ? parseFloat(item.rating) : undefined,
        price_range: item.price,
      });

      const dislikeData = {
        contentIds: [item.id],
      };

      dislikeMutation.mutate(dislikeData, {
        onError: () => {
          // Silently handle dislike errors
        },
      });
    },
    [dislikeMutation, trackSuggestion]
  );

  const handleSwipeLeft = useCallback(
    (item: CardData) => {
      if (!item) {
        return;
      }

      // Handle dislike asynchronously without blocking UI
      setTimeout(() => handleDislike(item), 0);
    },
    [handleDislike]
  );

  const handleSwipeRight = useCallback(
    (item: CardData) => {
      if (!item) {
        return;
      }

      // Handle like asynchronously without blocking UI
      setTimeout(() => handleLike(item), 0);
    },
    [handleLike]
  );

  const handleSwipeUp = useCallback(
    (item: CardData) => {
      if (!item) {
        return;
      }

      // Handle analytics, liking, and URL opening asynchronously
      setTimeout(() => {
        // Track as save_suggestion
        trackSuggestion("save_suggestion", {
          suggestion_id: item.id,
          suggestion_type:
            (item.category as "venue" | "experience" | "event") || "venue",
          category: item.category || "unknown",
          similarity_score:
            typeof item.similarity === "string"
              ? parseFloat(item.similarity) || 0
              : item.similarity,
          rating: item.rating ? parseFloat(item.rating) : undefined,
          price_range: item.price,
        });

        // Like the item since the card is moving to next
        const likeData = {
          contentIds: [item.id],
        };

        addLikeMutation.mutate(likeData, {
          onSuccess: () => {
            showToast("Saved to your likes", "success");
          },
          onError: () => {
            showToast("Failed to save your interest", "error");
          },
        });

        // Also open the website URL
        if (item?.websiteUrl) {
          Linking.openURL(item.websiteUrl).catch(() => {
            Alert.alert(
              "Unable to Open",
              "Could not open the website for this content."
            );
          });
        } else {
          Alert.alert(
            "No Website",
            "No website is available for this content."
          );
        }
      }, 0);
    },
    [trackSuggestion, addLikeMutation, showToast]
  );

  // Track loading state for card refresh
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refresh the card stack when cards are exhausted
  const handleComplete = useCallback(() => {
    if (!content) return;

    const itemsPerBatch = Platform.OS === "ios" ? 8 : 6; // Match the platform-specific batch size
    const nextOffset = currentOffset + itemsPerBatch;

    // Check if we have more items in the existing data
    if (nextOffset < content.length) {
      // Show next batch from existing data without API call
      setIsRefreshing(true);
      setCurrentOffset(nextOffset);
      setSwipeKey((prev) => prev + 1);

      // Small delay for smooth transition
      setTimeout(() => setIsRefreshing(false), 500);
    } else {
      // We've exhausted all data, make a new API call
      setIsRefreshing(true);
      setCurrentOffset(0); // Reset to beginning
      setSwipeKey((prev) => prev + 1);
      refetch().finally(() => {
        setTimeout(() => setIsRefreshing(false), 500);
      });
    }
  }, [content, currentOffset, refetch]);

  const handleCardTap = useCallback(
    (item: CardData) => {
      router.push(`/event-details/${item.id}`);
    },
    [router]
  );

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
        showToast("Added to bucket", "success");
      } catch (error) {
        showToast("Failed to add to bucket", "error");
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
        showToast("Bucket created", "success");
      } catch (error) {
        showToast("Failed to create bucket", "error");
      }
    }
  };

  const handleFilterApply = (filters: FilterType[]) => {
    setSelectedFilters(filters);
    setCurrentOffset(0); // Reset pagination when filters change
    // The locationParams will automatically update due to the dependency on selectedFilters
  };

  if (error) {
    const errorMessage = getErrorMessage(error);
    return (
      <CustomView style={styles.errorContainer}>
        <ErrorScreen
          title={errorMessage.title}
          message={errorMessage.message}
          buttonText="Check Again"
          onRetry={refetch}
        />
      </CustomView>
    );
  }

  // Check if we're still waiting for location decision
  const waitingForLocation =
    getPermissionStatus() === "undetermined" ||
    (getPermissionStatus() === "granted" &&
      !deviceLocation?.lat &&
      !deviceLocation?.lon);

  // Show loading state with header still visible (initial load, location waiting)
  if (isLoading || waitingForLocation) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FFF", zIndex: -1 }}>
        <CustomView bgColor={colors.overlay} style={{ flex: 1 }}>
          <ModeHeader />
          <CustomView style={styles.headerButtonsRow}>
            <CustomTouchable
              style={[styles.questionMarkButton, styles.questionMarkButtonDisabled]}
              onPress={undefined} // Disabled when loading
              disabled={true}
            >
              <QuestionMarkSvg />
            </CustomTouchable>

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
          </CustomView>

          <CustomView style={styles.swipeContainer}>
            <AnimatedLoader />
          </CustomView>
        </CustomView>

        <FilterModal
          isVisible={isFilterModalVisible}
          onClose={() => setIsFilterModalVisible(false)}
          onApply={handleFilterApply}
          selectedFilters={selectedFilters}
        />
      </View>
    );
  }

  // Show empty state when no data is available AND we're not loading/refreshing
  if (!transformedData.length && !isRefreshing) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FFF", zIndex: -1 }}>
        <CustomView bgColor={colors.overlay} style={{ flex: 1 }}>
          <ModeHeader />
          <CustomView style={styles.headerButtonsRow}>
            <CustomTouchable
              style={[styles.questionMarkButton, styles.questionMarkButtonDisabled]}
              onPress={undefined} // Disabled when no cards available
              disabled={true}
            >
              <QuestionMarkSvg />
            </CustomTouchable>

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
          </CustomView>

          <CustomView style={styles.errorContainer}>
            {selectedFilters.length < 3 ? (
              <ErrorScreen
                title="No results for your filters"
                message="Try changing your filters to see more content in your area."
              />
            ) : (
              <ErrorScreen
                title="Oops, there are no recommendations around you"
                message="Please change your location to find new recommendations."
                buttonText="Change Location"
                onRetry={() => router.push("/location-selection")}
              />
            )}
          </CustomView>
        </CustomView>

        <FilterModal
          isVisible={isFilterModalVisible}
          onClose={() => setIsFilterModalVisible(false)}
          onApply={handleFilterApply}
          selectedFilters={selectedFilters}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF", zIndex: -1 }}>
      <CustomView bgColor={colors.overlay} style={{ flex: 1 }}>
        <ModeHeader />
        <CustomView style={styles.headerButtonsRow}>
          <CustomTouchable
            style={styles.questionMarkButton}
            onPress={handleQuestionMarkPress}
          >
            {showQuestionMarkTooltips ? (
              <QuestionMarkActiveSvg />
            ) : (
              <QuestionMarkSvg />
            )}
          </CustomTouchable>

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
        </CustomView>

        {isRefreshing ? (
          <CustomView style={styles.swipeContainer}>
            <AnimatedLoader />
          </CustomView>
        ) : (
          <CustomView style={[styles.swipeContainer, { position: "relative" }]}>
            <SwipeCards
              key={swipeKey}
              data={transformedData}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              onSwipeUp={handleSwipeUp}
              onComplete={handleComplete}
              onCardTap={handleCardTap}
              onBucketPress={handleShowBucketBottomSheet}
              isLoading={isLoading}
              showLoaderOnComplete={true}
            />

            {showSwipeTooltips && !isLoading && transformedData.length > 0 && (
              <SwipeCardTooltips onComplete={handleTooltipsComplete} />
            )}

            {showQuestionMarkTooltips &&
              !isLoading &&
              transformedData.length > 0 && (
                <SwipeCardTooltips
                  onComplete={handleQuestionMarkTooltipsComplete}
                />
              )}
          </CustomView>
        )}
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
    </View>
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
  headerButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: horizontalScale(24),
    marginTop: verticalScale(16),
    marginBottom: verticalScale(10),
  },
  questionMarkButton: {
    // Left aligned - just the icon, no background
  },
  questionMarkButtonDisabled: {
    opacity: 0.4, // Make it visually disabled
  },
  filterSvgButton: {
    // Right aligned, no longer needs alignSelf: "flex-end"
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
