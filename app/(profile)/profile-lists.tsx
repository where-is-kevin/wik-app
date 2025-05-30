import React, { useState } from "react";
import { StyleSheet, FlatList, ScrollView } from "react-native";
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
import LikeCard from "@/components/LikeComponent/LikeCard";
import BucketCard from "@/components/BucketComponent/BucketCard";
import { useLocalSearchParams } from "expo-router";
import {
  BucketBottomSheet,
  BucketItem,
} from "@/components/BottomSheet/BucketBottomSheet";

interface LocalBucketItem {
  id: string;
  title: string;
  safeImages: string[];
}

// Interface for like items
interface LikeItem {
  id: string;
  title: string;
  foodImage: string;
  landscapeImage: string;
  isExperience?: boolean;
  hasIcon?: boolean;
  height?: "short" | "tall";
}

const ProfileListsScreen = () => {
  const { colors } = useTheme();
  const { type } = useLocalSearchParams();
  const listType = type === "buckets" || type === "likes" ? type : "buckets";
  const [activeTab, setActiveTab] = useState<"buckets" | "likes">(
    listType || "buckets"
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Bottom sheet state
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [bottomSheetItems, setBottomSheetItems] = useState<BucketItem[]>([]);

  // Mock data for buckets
  const bucketsData: LocalBucketItem[] = [
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
  ];

  // Mock data for likes with varying heights
  const likesData: LikeItem[] = [
    {
      id: "1",
      title: "Douro Valley with f...",
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
      height: "tall",
    },
    {
      id: "5",
      title: "Douro Valley with f...",
      foodImage:
        "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=180",
      landscapeImage: "",
      isExperience: true,
      hasIcon: false,
      height: "short",
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
    {
      id: "7",
      title: "Douro Valley with f...",
      foodImage:
        "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=200",
      landscapeImage: "",
      isExperience: true,
      hasIcon: true,
      height: "short",
    },
    {
      id: "8",
      title: "Douro Valley with f...",
      foodImage:
        "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300",
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

  // Bottom sheet handlers
  const handleShowBottomSheet = () => {
    console.log("🚀 Opening bottom sheet");
    const items = transformBucketsForBottomSheet();
    setBottomSheetItems(items);
    setIsBottomSheetVisible(true);
  };

  const handleCloseBottomSheet = () => {
    console.log("🔒 Closing bottom sheet");
    setIsBottomSheetVisible(false);
  };

  const handleItemSelect = (item: BucketItem) => {
    console.log("✅ Selected bucket:", item.title);
    // Handle bucket selection logic here
    setIsBottomSheetVisible(false);
  };

  const handleCreateNew = () => {
    console.log("🆕 Create new bucket");
    // Handle create new bucket logic here
    setIsBottomSheetVisible(false);
  };

  const filteredData = (
    activeTab === "buckets" ? bucketsData : likesData
  ).filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const MasonryGrid = ({ data }: { data: LikeItem[] }) => {
    // Split data into two columns for masonry effect
    const leftColumn = data.filter((_, index) => index % 2 === 0);
    const rightColumn = data.filter((_, index) => index % 2 === 1);

    const renderColumn = (columnData: LikeItem[]) => (
      <CustomView style={{ flex: 1 }}>
        {columnData.map((item) => (
          <CustomView key={item.id} style={{ marginBottom: 0 }}>
            <LikeCard
              onBucketPress={handleShowBottomSheet}
              item={item}
              onPress={() => console.log("Like card pressed:", item.id)}
            />
          </CustomView>
        ))}
      </CustomView>
    );

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: horizontalScale(16),
        }}
      >
        <CustomView
          style={{
            flexDirection: "row",
            gap: 16,
            alignItems: "flex-start",
          }}
        >
          {renderColumn(leftColumn)}
          {renderColumn(rightColumn)}
        </CustomView>
      </ScrollView>
    );
  };

  // Render buckets item
  const renderBucketItem = ({ item }: { item: LocalBucketItem }) => (
    <BucketCard
      item={item}
      onPress={() => console.log("Bucket card pressed:", item.id)}
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
        <MasonryGrid data={filteredData} />
      ) : (
        <FlatList
          data={filteredData}
          renderItem={renderBucketItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.bucketRow}
          contentContainerStyle={styles.bucketsContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Bottom Sheet */}
      <BucketBottomSheet
        isVisible={isBottomSheetVisible}
        bucketItems={bottomSheetItems}
        onClose={handleCloseBottomSheet}
        onItemSelect={handleItemSelect}
        onCreateNew={handleCreateNew}
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
  },
  bucketRow: {
    justifyContent: "space-between",
  },
});
