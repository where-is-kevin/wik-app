import { StyleSheet } from "react-native";
import React, { useState, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import BackHeader from "@/components/Header/BackHeader";
import { useTheme } from "@/contexts/ThemeContext";
import SearchBar from "@/components/SearchBar/SearchBar";
import { verticalScale } from "@/utilities/scaling";
import {
  BucketBottomSheet,
  BucketItem,
} from "@/components/BottomSheet/BucketBottomSheet";
import { CreateBucketBottomSheet } from "@/components/BottomSheet/CreateBucketBottomSheet";
import MasonryGrid, { LikeItem } from "@/components/MansoryGrid";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  useBucketById,
  useBuckets,
  useCreateBucket,
  useAddBucket,
} from "@/hooks/useBuckets";
import CustomText from "@/components/CustomText";
import CustomView from "@/components/CustomView";
import AnimatedLoader from "@/components/Loader/AnimatedLoader";

const BucketDetailsScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { bucketId } = useLocalSearchParams<{ bucketId: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLikeItemId, setSelectedLikeItemId] = useState<string | null>(
    null
  );

  // API hooks
  const {
    data: bucket,
    isLoading: isBucketLoading,
    error: bucketError,
    refetch: refetchBucket,
  } = useBucketById(bucketId || "");
  const { data: allBuckets, isLoading: isBucketsLoading } = useBuckets();
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

  // Transform all buckets to BucketItem format for bottom sheet
  const otherBucketsData: BucketItem[] = useMemo(() => {
    if (!allBuckets) return [];

    return allBuckets.map((b) => ({
      id: b.id,
      title: b.bucketName,
      date: "22-27 June", // You can format this better
      image: b.content?.[0]?.googlePlacesImageUrl || "",
      contentIds: b.contentIds,
    }));
  }, [allBuckets, bucketId]);

  // Filter bucket items based on search query
  const filteredBucketItems = bucketItemsData.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Bucket selection bottom sheet handlers
  const handleShowBucketBottomSheet = (likeItemId: string) => {
    setSelectedLikeItemId(likeItemId);
    setIsBucketBottomSheetVisible(true);
  };

  const handleCloseBucketBottomSheet = () => {
    setIsBucketBottomSheetVisible(false);
    setSelectedLikeItemId(null);
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

        // Optionally refetch current bucket data to see if item was removed
        refetchBucket();
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
    try {
      await createBucketMutation.mutateAsync({
        bucketName,
        contentIds: selectedLikeItemId ? [selectedLikeItemId] : [],
      });

      setIsCreateBucketBottomSheetVisible(false);
      setSelectedLikeItemId(null);

      // Optionally refetch bucket data
      refetchBucket();
    } catch (error) {
      console.error("Error creating bucket:", error);
    }
  };

  // Handle item press in bucket details
  const handleBucketItemPress = (item: LikeItem) => {
    console.log("Bucket item pressed:", item.title);
    router.push(`/event-details/${item.id}`);
  };

  // Loading state
  if (isBucketLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
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
      <BackHeader
        title={bucket.bucketName}
        date={"22-27 June"} // Format as needed
        transparent={true}
      />
      <SearchBar
        placeholder={"Search your bucket"}
        value={searchQuery}
        onChangeText={setSearchQuery}
        containerStyle={styles.searchBarContainer}
      />

      {/* Masonry Grid for bucket items */}
      <MasonryGrid
        data={filteredBucketItems}
        onBucketPress={handleShowBucketBottomSheet}
        onItemPress={handleBucketItemPress}
        refreshing={isBucketLoading}
        onRefresh={refetchBucket}
      />

      {/* Bucket Selection Bottom Sheet */}
      <BucketBottomSheet
        isVisible={isBucketBottomSheetVisible}
        bucketItems={otherBucketsData}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
