import { useContent } from "@/hooks/useContent";
import React, { useState, useCallback } from "react";
import { useAddLike } from "@/hooks/useLikes";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from "react-native";
import { SwipeCards } from "@/components/Onboarding/SwipeCards";
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

// Define the interface that matches your SwipeCards component
interface CardData {
  id: string;
  title: string;
  imageUrl: string;
  price?: string;
  category?: string;
  websiteUrl?: string;
}

interface LocalBucketItem {
  id: string;
  title: string;
  safeImages: string[];
}

const SwipeableCards = () => {
  const { data: content, isLoading, error, refetch } = useContent();
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
          item.internalImageUrls
 && item.internalImageUrls
.length > 0
            ? item.internalImageUrls
[0]
            : item.googlePlacesImageUrl,
        price: item.price?.toString(),
        rating: item?.rating?.toString(),
        category: item.category,
        websiteUrl: item.websiteUrl || "",
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
        console.error("Failed to open URL:", err);
      });
    } else {
      console.log("No website URL available for this item");
    }
  };

  // Simplified: Just refetch new content when cards are exhausted
  const handleComplete = useCallback(() => {
    console.log("All cards swiped, fetching new content...");
    refetch();
  }, []);

  const handleShowBucketBottomSheet = (itemId?: string) => {
    if (itemId) {
      setSelectedItemId(itemId);
    }
    console.log(itemId, "bre");
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
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load content.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
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
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No content available</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
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
            // onCardTap={handleCardTap}
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
  errorText: {
    color: "#ff5252",
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#6C63FF",
    paddingHorizontal: 24,
    paddingVertical: 12,
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
