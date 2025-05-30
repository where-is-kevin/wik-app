import { StyleSheet } from "react-native";
import React, { useState } from "react";
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
import { useRouter } from "expo-router";

const BucketDetailsScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Bottom sheet states
  const [isBucketBottomSheetVisible, setIsBucketBottomSheetVisible] =
    useState(false);
  const [
    isCreateBucketBottomSheetVisible,
    setIsCreateBucketBottomSheetVisible,
  ] = useState(false);
  const [bottomSheetItems, setBottomSheetItems] = useState<BucketItem[]>([]);

  // Mock data for bucket items - things saved in this specific bucket
  const bucketItemsData: LikeItem[] = [
    {
      id: "1",
      title: "Quinta do Crasto Winery",
      foodImage:
        "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300",
      landscapeImage: "",
      isExperience: true,
      hasIcon: true,
      height: "tall",
    },
    {
      id: "2",
      title: "Douro River Cruise",
      foodImage:
        "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=200",
      landscapeImage: "",
      isExperience: true,
      hasIcon: true,
      height: "short",
    },
    {
      id: "3",
      title: "Pinhão Train Station",
      foodImage:
        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=200",
      landscapeImage: "",
      isExperience: true,
      hasIcon: true,
      height: "short",
    },
    {
      id: "4",
      title: "Traditional Portuguese Restaurant",
      foodImage:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=350",
      landscapeImage: "",
      isExperience: false,
      hasIcon: true,
      height: "short",
    },
    {
      id: "5",
      title: "Viewpoint Casal de Loivos",
      foodImage:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=180",
      landscapeImage: "",
      isExperience: true,
      hasIcon: false,
      height: "tall",
    },
    {
      id: "6",
      title: "Port Wine Tasting",
      foodImage:
        "https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=400&h=250",
      landscapeImage: "",
      isExperience: true,
      hasIcon: true,
      height: "tall",
    },
  ];

  // Mock data for other buckets (for bottom sheet)
  const otherBucketsData: BucketItem[] = [
    {
      id: "1",
      title: "Summer in Lagos",
      date: "27 June - 27 July",
      image:
        "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300",
    },
    {
      id: "2",
      title: "Hiking trip in the Azores",
      date: "4-6 July",
      image:
        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300",
    },
    {
      id: "3",
      title: "Winter in Madeira",
      date: "15-20 December",
      image:
        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300",
    },
  ];

  // Filter bucket items based on search query
  const filteredBucketItems = bucketItemsData.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Bucket selection bottom sheet handlers
  const handleShowBucketBottomSheet = () => {
    setBottomSheetItems(otherBucketsData);
    setIsBucketBottomSheetVisible(true);
  };

  const handleCloseBucketBottomSheet = () => {
    setIsBucketBottomSheetVisible(false);
  };

  const handleItemSelect = (item: BucketItem) => {
    // Handle moving item to another bucket
    console.log("Moving item to bucket:", item.title);
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
    // Handle creating new bucket and moving item there
    console.log("Created new bucket:", bucketName);
    setIsCreateBucketBottomSheetVisible(false);
  };

  // Handle item press in bucket details
  const handleBucketItemPress = (item: LikeItem) => {
    console.log("Bucket item pressed:", item.title);
    router.push(`/event-details/${item.id}`);
    // Add navigation to item details or other logic here
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <BackHeader
        title="Douro Valley with Family"
        date="22-27 June"
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
      />

      {/* Bucket Selection Bottom Sheet */}
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
});
