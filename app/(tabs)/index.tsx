import { useContent } from "@/hooks/useContent";
import React, { useState, useCallback, useEffect } from "react";
import { useAddLike } from "@/hooks/useLikes";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from "react-native";
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
import { useLocationForAPI } from "@/contexts/LocationContext";
import CustomText from "@/components/CustomText";
import { CardData, SwipeCards } from "@/components/SwipeCards/SwipeCards";

const SwipeableCards = () => {
  const { getLocationForAPI, hasLocationPermission } = useLocationForAPI();
  const [locationParams, setLocationParams] = useState<{
    latitude?: number;
    longitude?: number;
  }>({});

  // Get location data and update params
  useEffect(() => {
    const updateLocationParams = async () => {
      if (hasLocationPermission) {
        const locationData = await getLocationForAPI();
        if (locationData) {
          setLocationParams({
            latitude: locationData.lat,
            longitude: locationData.lon,
          });
          // console.log("Location updated for SwipeableCards:", locationData);
        }
      }
    };

    updateLocationParams();
  }, [hasLocationPermission]);

  const {
    data: content,
    isLoading,
    error,
    refetch,
  } = useContent(locationParams);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [isBucketBottomSheetVisible, setIsBucketBottomSheetVisible] =
    useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [
    isCreateBucketBottomSheetVisible,
    setIsCreateBucketBottomSheetVisible,
  ] = useState(false);

  // Mutation hooks
  const addBucketMutation = useAddBucket();
  const createBucketMutation = useCreateBucket();
  const addLikeMutation = useAddLike();
  const dislikeMutation = useAddDislike();

  // Transform your content data to match SwipeCards interface
  const isBottomSheetOpen =
    isBucketBottomSheetVisible || isCreateBucketBottomSheetVisible;

  // Fixed: Now content is always an array, so we can map directly
  const transformedData: CardData[] = content
    ? content.map((item) => ({
        id: item.id,
        title: item.title,
        imageUrl:
          item.internalImageUrls && item.internalImageUrls.length > 0
            ? item.internalImageUrls[0]
            : item.googlePlacesImageUrl,
        price: item.price?.toString(),
        rating: item?.rating?.toString(),
        category: item.category,
        websiteUrl: item.websiteUrl || "",
        address: item.address || "",
        isSponsored: item.isSponsored,
        contentShareUrl: item.contentShareUrl,
        tags: item.tags,
        similarity: item.similarity,
      }))
    : [];

  const handleLike = (item: CardData) => {
    if (!item) {
      console.error("No item provided to handleLike");
      return;
    }

    const likeData = {
      contentIds: [item.id],
    };

    addLikeMutation.mutate(likeData, {
      onError: (error) => {
        console.error("Failed to add like:", error);
      },
    });
  };

  const handleDislike = (item: CardData) => {
    if (!item) {
      console.error("No item provided to handleLike");
      return;
    }

    const dislikeData = {
      contentIds: [item.id],
    };

    dislikeMutation.mutate(dislikeData, {
      onError: (error) => {
        console.error("Failed to add like:", error);
      },
    });
  };

  const handleSwipeLeft = (item: CardData) => {
    if (!item) {
      console.error("No item provided to handleSwipeLeft");
      return;
    }
    handleDislike(item);
  };

  const handleSwipeRight = (item: CardData) => {
    if (!item) {
      console.error("No item provided to handleSwipeRight");
      return;
    }
    handleLike(item);
  };

  const handleSwipeUp = (item: CardData) => {
    if (!item) {
      console.error("No item provided to handleSwipeUp");
      return;
    }

    // Check if the item has a website URL and open it
    if (item?.websiteUrl) {
      Linking.openURL(item.websiteUrl).catch((err) => {
        // console.error("Failed to open URL:", err);
      });
    } else {
      // console.log("No website URL available for this item");
    }
  };

  // Simplified: Just refetch new content when cards are exhausted
  const handleComplete = useCallback(() => {
    // console.log("All cards swiped, fetching new content...");
    refetch();
  }, []);

  const handleShowBucketBottomSheet = (itemId?: string) => {
    if (itemId) {
      setSelectedItemId(itemId);
    }
    setIsBucketBottomSheetVisible(true);
  };

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
        // console.error("Failed to add item to bucket:", error);
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

  if (error) {
    return (
      <CustomView style={styles.errorContainer}>
        <CustomText style={styles.errorTitle}>
          {`We are coming to your\narea soon! 🚀`}
        </CustomText>
        <CustomText style={styles.errorText}>
          We don't have any content at your location currently, but we are
          working hard to bring amazing experiences to you soon!
        </CustomText>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <CustomText style={styles.retryButtonText}>Check Again</CustomText>
        </TouchableOpacity>
      </CustomView>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={{ backgroundColor: "#fff", flex: 1 }}>
        <AnimatedLoader />
      </SafeAreaView>
    );
  }

  // Show empty state when no data is available
  if (!transformedData.length) {
    return (
      <CustomView style={styles.errorContainer}>
        <CustomText style={styles.errorTitle}>
          You're on the edge of something amazing.
        </CustomText>
        <CustomText style={styles.errorText}>
          {`We're not live in your area just yet, but as soon as we reach 5000 signed up nearby we'll launch. To help us reach our goal, tell your friends so you can all be part of launching something amazing in your area.`}
        </CustomText>
      </CustomView>
    );
  }

  return (
    <>
      <CustomView style={styles.content}>
        <CustomView
          style={[
            styles.swipeContainer,
            isBottomSheetOpen && { display: "none" },
            { height: insets.top },
          ]}
        >
          <SwipeCards
            data={transformedData}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onSwipeUp={handleSwipeUp}
            onComplete={handleComplete}
            onBucketPress={handleShowBucketBottomSheet}
            // onCardTap={handleCardTap} // Remove this if you don't need it
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
    padding: 20,
    backgroundColor: "#f5f5f5",
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
    paddingTop: verticalScale(45),
  },
  swipeContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: verticalScale(30),
  },
});

export default SwipeableCards;
