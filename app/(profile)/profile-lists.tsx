import React, { useState } from "react";
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

  // Bottom sheet states
  const [isBucketBottomSheetVisible, setIsBucketBottomSheetVisible] =
    useState(false);
  const [
    isCreateBucketBottomSheetVisible,
    setIsCreateBucketBottomSheetVisible,
  ] = useState(false);
  const [bottomSheetItems, setBottomSheetItems] = useState<BucketItem[]>([]);

  // Mock data for buckets
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

  // Mock data for likes with varying heights
  const likesData: LikeItem[] = [
    {
      id: "1",
      title: "Douro Valley with family in the alpes",
      foodImage:
        "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300",
      landscapeImage: "",
      isExperience: true,
      hasIcon: true,
      height: "tall",
    },
    {
      id: "2",
      title: "Douro Valley with f...",
      foodImage:
        "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=200",
      landscapeImage: "",
      isExperience: true,
      hasIcon: true,
      height: "short",
    },
    {
      id: "3",
      title: "Douro Valley with f...",
      foodImage:
        "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=200",
      landscapeImage: "",
      isExperience: true,
      hasIcon: true,
      height: "short",
    },
    {
      id: "4",
      title: "Douro Valley with f...",
      foodImage:
        "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=350",
      landscapeImage: "",
      isExperience: true,
      hasIcon: true,
      height: "short",
    },
    {
      id: "5",
      title: "Douro Valley with f...",
      foodImage:
        "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=180",
      landscapeImage: "",
      isExperience: true,
      hasIcon: false,
      height: "tall",
    },
    {
      id: "6",
      title: "Douro Valley with f...",
      foodImage:
        "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=250",
      landscapeImage: "",
      isExperience: true,
      hasIcon: true,
      height: "tall",
    },
  ];

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

  // Bucket selection bottom sheet handlers
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

    // Optionally switch to buckets tab to show the new bucket
    setActiveTab("buckets");
  };

  // Handle like item press
  const handleLikeItemPress = (item: LikeItem) => {
    router.push(`/event-details/${item.id}`);
    // Add your navigation or other logic here
  };

  const filteredBucketsData = bucketsData.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLikesData = likesData.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render buckets item
  const renderBucketItem = ({ item }: { item: LocalBucketItem }) => (
    <BucketCard
      item={item}
      onPress={() => router.push("/bucket-details/123")}
    />
  );

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
