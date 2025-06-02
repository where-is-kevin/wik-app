import { useContent } from "@/hooks/useContent";
import React, { useState } from "react";
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
import AnimatedLoader from "@/components/Loader/AnimatedLoader";
import {
  BucketBottomSheet,
  BucketItem,
} from "@/components/BottomSheet/BucketBottomSheet";
import { CreateBucketBottomSheet } from "@/components/BottomSheet/CreateBucketBottomSheet";

// Define the interface that matches your SwipeCards component
interface CardData {
  id: string;
  title: string;
  imageUrl: string;
  price?: string;
  category?: string;
}
interface LocalBucketItem {
  id: string;
  title: string;
  safeImages: string[];
}

const SwipeableCards = () => {
  const { data: content, isLoading, error, refetch } = useContent();
  const [swipeKey, setSwipeKey] = useState(0);
  const [isBucketBottomSheetVisible, setIsBucketBottomSheetVisible] =
    useState(false);
  const [
    isCreateBucketBottomSheetVisible,
    setIsCreateBucketBottomSheetVisible,
  ] = useState(false);
  const [bottomSheetItems, setBottomSheetItems] = useState<BucketItem[]>([]);
  const [bucketsData, setBucketsData] = useState<LocalBucketItem[]>([
    {
      id: "1",
      title: "Douro Valley with family",
      safeImages: [
        "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300",
        "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300",
        "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300",
      ],
    },
    {
      id: "2",
      title: "Summer in Lagos",
      safeImages: [
        "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300",
        "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300",
        "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300",
      ],
    },
    {
      id: "3",
      title: "Hiking trip in the Azores",
      safeImages: [
        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300",
        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300",
        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300",
      ],
    },
    {
      id: "4",
      title: "Hiking trip in the Azores",
      safeImages: [
        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300",
        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300",
        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300",
      ],
    },
    {
      id: "5",
      title: "Hiking trip in the Azores",
      safeImages: [
        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300",
        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300",
        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300",
      ],
    },
    {
      id: "6",
      title: "Hiking trip in the Azores",
      safeImages: [
        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300",
        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300",
        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300",
      ],
    },
    {
      id: "7",
      title: "Hiking trip in the Azores",
      safeImages: [
        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300",
        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300",
        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300",
      ],
    },
  ]);
  // Transform your content data to match SwipeCards interface
  const isBottomSheetOpen =
    isBucketBottomSheetVisible || isCreateBucketBottomSheetVisible;
  const transformedData: CardData[] = content
    ? [
        {
          id: content.id,
          title: content.title,
          imageUrl: content.googlePlacesImageUrl,
          price: `£${content.price || 50}`,
          category: content.category,
        },
      ]
    : [];

  // Transform bucketsData to match BucketItem interface for bottom sheet
  const transformBucketsForBottomSheet = (): BucketItem[] => {
    return bucketsData.map((bucket, index) => ({
      id: bucket.id,
      title: bucket.title,
      date:
        index === 0
          ? "22-27 June"
          : index === 1
          ? "27 June - 27 July"
          : "4-6 July",
      image: bucket.safeImages[0],
    }));
  };

  const handleSwipeLeft = (item: CardData) => {
    console.log("Disliked:", item.id);
    // Don't call refetch here - let onComplete handle it
  };

  const handleSwipeRight = (item: CardData) => {
    console.log("Liked:", item.id);
    // Don't call refetch here - let onComplete handle it
  };

  const handleSwipeUp = (item: CardData) => {
    console.log("Saved:", item.id);
    // Don't call refetch here - let onComplete handle it
  };

  const handleComplete = () => {
    console.log("Card completed, fetching new content...");
    // Only call refetch once here
    refetch().then(() => {
      setSwipeKey((prev) => prev + 1);
    });
  };
  const handleShowBucketBottomSheet = () => {
    const items = transformBucketsForBottomSheet();
    setBottomSheetItems(items);
    setIsBucketBottomSheetVisible(true);
  };

  const handleCloseBucketBottomSheet = () => {
    setIsBucketBottomSheetVisible(false);
  };

  const handleItemSelect = (item: BucketItem) => {
    // Handle bucket selection logic here
    setIsBucketBottomSheetVisible(false);
  };

  // Create bucket bottom sheet handlers
  const handleShowCreateBucketBottomSheet = () => {
    setIsBucketBottomSheetVisible(false); // Close bucket selection sheet
    setIsCreateBucketBottomSheetVisible(true); // Open create bucket sheet
  };

  const handleCloseCreateBucketBottomSheet = () => {
    setIsCreateBucketBottomSheetVisible(false);
  };

  const handleCreateBucket = (bucketName: string) => {
    // Create new bucket and add to the list
    const newBucket: LocalBucketItem = {
      id: Date.now().toString(),
      title: bucketName,
      safeImages: [
        "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300",
        "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300",
        "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300",
      ],
    };

    setBucketsData((prevBuckets) => [newBucket, ...prevBuckets]);
    setIsCreateBucketBottomSheetVisible(false);
  };

  // const handleCardTap = (item: CardData) => {
  //   console.log("Card tapped:", item.id);
  //   // Navigate to details or show more info
  //   if (content?.websiteUrl) {
  //     Linking.openURL(content.websiteUrl);
  //   } else if (content?.latitude && content?.longitude) {
  //     const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${content.latitude},${content.longitude}`;
  //     Linking.openURL(googleMapsUrl);
  //   }
  // };

  if (isLoading) {
    return <AnimatedLoader />;
  }

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
          ]}
        >
          <SwipeCards
            key={swipeKey}
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
