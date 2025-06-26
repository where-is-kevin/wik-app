// BucketBottomSheet.tsx - WITH PAGINATION SUPPORT
import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import CustomText from "@/components/CustomText";
import CustomView from "@/components/CustomView";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import { CustomBottomSheet } from "./CustomBottomSheet";
import CustomTouchable from "../CustomTouchableOpacity";
import CreateBucketPlus from "../SvgComponents/CreateBucketPlus";
import { useBuckets } from "@/hooks/useBuckets";
import AnimatedLoader from "@/components/Loader/AnimatedLoader";
import { useQueryClient } from "@tanstack/react-query";
import OptimizedImage from "../OptimizedImage/OptimizedImage";

// Define the BucketItem interface directly in this file
export interface BucketItem {
  id: string;
  title: string;
  date: string;
  image: string;
  contentIds: string[]; // Add contentIds to track items in bucket
}

interface BucketBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onItemSelect: (item: BucketItem) => void;
  onCreateNew: () => void;
  selectedLikeItemId: string | null;
}

export const BucketBottomSheet: React.FC<BucketBottomSheetProps> = ({
  isVisible,
  onClose,
  onItemSelect,
  onCreateNew,
  selectedLikeItemId,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  // Use the existing useBuckets hook with pagination
  const {
    data: buckets,
    isLoading: bucketsLoading,
    error: bucketsError,
    refetch: refetchBuckets,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useBuckets(
    undefined, // no search query
    isVisible, // only enabled when bottom sheet is visible
    20 // standard page size
  );

  // Placeholder image for buckets without images
  const PLACEHOLDER_IMAGE = require("@/assets/images/placeholder-bucket.png");

  // Helper function to safely get image URL
  const getBucketImage = (bucket: any): string => {
    try {
      // Check if bucket exists
      if (!bucket) return PLACEHOLDER_IMAGE;

      // Check if content exists and is an array
      if (
        !bucket.content ||
        !Array.isArray(bucket.content) ||
        bucket.content.length === 0
      ) {
        return PLACEHOLDER_IMAGE;
      }

      // Get the first content item
      const firstContent = bucket.content[0];
      if (!firstContent) return PLACEHOLDER_IMAGE;

      // Check if internalImageUrls exists and is an array
      if (
        !firstContent.internalImageUrls ||
        !Array.isArray(firstContent.internalImageUrls) ||
        firstContent.internalImageUrls.length === 0
      ) {
        // Fallback to googlePlacesImageUrl if available
        if (
          firstContent.googlePlacesImageUrl &&
          typeof firstContent.googlePlacesImageUrl === "string" &&
          firstContent.googlePlacesImageUrl.trim() !== ""
        ) {
          return firstContent.googlePlacesImageUrl;
        }
        return PLACEHOLDER_IMAGE;
      }

      // Get the first image URL
      const imageUrl = firstContent.internalImageUrls[0];

      // Ensure it's a string and not empty
      if (typeof imageUrl === "string" && imageUrl.trim() !== "") {
        return imageUrl;
      }

      return PLACEHOLDER_IMAGE;
    } catch (error) {
      console.warn("Error getting bucket image:", error);
      return PLACEHOLDER_IMAGE;
    }
  };

  // Transform buckets data to BucketItem format with null safety
  const bucketItems = useMemo(() => {
    // Handle InfiniteData structure from React Query infinite query
    let bucketsArray: any[] = [];

    if (buckets?.pages) {
      // InfiniteData structure: { pages: [{ items: [...] }, { items: [...] }], pageParams: [...] }
      bucketsArray = buckets.pages.flatMap((page: any) => {
        if (page?.items && Array.isArray(page.items)) {
          return page.items;
        }
        return [];
      });
    } else if (
      (buckets as any)?.items &&
      Array.isArray((buckets as any).items)
    ) {
      // Direct paginated response: { items: [...], limit: 20, offset: 0, total: 13 }
      bucketsArray = (buckets as any).items;
    } else if (Array.isArray(buckets)) {
      // Legacy structure: direct array
      bucketsArray = buckets as any[];
    } else {
      return [];
    }

    if (!bucketsArray.length) {
      return [];
    }

    try {
      return bucketsArray
        .filter((bucket: any) => bucket && typeof bucket === "object") // Filter out null/undefined items
        .map((bucket: any) => {
          // Ensure required properties exist with fallbacks
          const id = bucket?.id || `bucket-${Math.random()}`;
          const title =
            bucket?.bucketName || bucket?.title || "Untitled Bucket";
          const contentIds = Array.isArray(bucket?.contentIds)
            ? bucket.contentIds
            : Array.isArray(bucket?.content)
            ? bucket.content.map((item: any) => item?.id).filter(Boolean)
            : [];

          return {
            id,
            title,
            date: "22-27 June", // Static date as in original
            image: getBucketImage(bucket),
            contentIds,
          };
        });
    } catch (error) {
      console.error("Error transforming bucket data:", error);
      return [];
    }
  }, [buckets]);

  // Calculate dynamic height for bottom sheet
  const snapPointHeight = useMemo(() => {
    try {
      const screenHeight = Dimensions.get("window").height;
      const statusBarHeight =
        Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;
      const safeAreaTop = insets?.top || 0;
      const backHeaderHeight = verticalScale(10) + 30;

      const totalHeaderHeight =
        Platform.OS === "ios"
          ? safeAreaTop + backHeaderHeight
          : safeAreaTop + statusBarHeight + backHeaderHeight;

      // Calculate available height and convert to percentage
      const availableHeight = screenHeight - totalHeaderHeight;
      const percentage = (availableHeight / screenHeight) * 100;

      const finalPercentage = `${Math.floor(percentage)}%`;

      return finalPercentage;
    } catch (error) {
      console.warn("Error calculating snap point height:", error);
      return "70%"; // Fallback height
    }
  }, [insets?.top]);

  // Handle load more buckets
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Render bucket item for FlatList
  const renderBucketItem = ({ item }: { item: BucketItem }) => {
    if (!item) return null;

    try {
      const isItemInBucket =
        selectedLikeItemId && Array.isArray(item.contentIds)
          ? item.contentIds.includes(selectedLikeItemId)
          : false;

      return (
        <CustomTouchable
          style={styles.bucketItem}
          onPress={() => {
            onItemSelect(item);
          }}
          activeOpacity={0.7}
          disabled={isItemInBucket}
        >
          <OptimizedImage
            source={
              typeof item.image === "string" ? { uri: item.image } : item.image
            }
            style={styles.bucketItemImage}
            resizeMode="cover"
            priority="normal"
            showLoader={true}
            fallbackSource={PLACEHOLDER_IMAGE}
          />
          <CustomView style={styles.bucketItemContent}>
            <CustomText
              fontFamily="Inter-SemiBold"
              style={[
                styles.bucketItemTitle,
                { color: colors?.label_dark || "#000" },
              ]}
            >
              {item.title}
            </CustomText>
            {isItemInBucket && (
              <CustomText
                style={[
                  styles.alreadyInBucketText,
                  { color: colors?.bucket_green || "#00C851" },
                ]}
              >
                Already in bucket
              </CustomText>
            )}
          </CustomView>
        </CustomTouchable>
      );
    } catch (error) {
      console.warn("Error rendering bucket item:", error);
      return null;
    }
  };

  // Render footer for loading more
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;

    return (
      <CustomView style={styles.loadingFooter}>
        <AnimatedLoader customAnimationStyle={{ width: 80, height: 80 }} />
      </CustomView>
    );
  };

  const renderContent = () => {
    if (bucketsLoading && !bucketItems.length) {
      return (
        <CustomView style={styles.loadingContainer}>
          <AnimatedLoader />
          <CustomText
            style={[
              styles.loadingText,
              { color: colors?.gray_regular || "#666" },
            ]}
          >
            Loading buckets...
          </CustomText>
        </CustomView>
      );
    }

    // Handle error state
    if (bucketsError && !bucketItems.length) {
      return (
        <CustomView style={styles.errorContainer}>
          <CustomText
            style={[
              styles.errorText,
              { color: colors?.label_dark || "#FF5252" },
            ]}
          >
            Failed to load buckets
          </CustomText>
          <TouchableOpacity
            style={[
              styles.retryButton,
              { backgroundColor: colors.light_blue || "#6C63FF" },
            ]}
            onPress={() => refetchBuckets()}
          >
            <CustomText style={styles.retryButtonText}>Try Again</CustomText>
          </TouchableOpacity>
        </CustomView>
      );
    }

    if (!bucketItems || bucketItems.length === 0) {
      return (
        <CustomView style={styles.emptyContainer}>
          <CustomText
            style={[
              styles.emptyText,
              { color: colors?.gray_regular || "#666" },
            ]}
          >
            No buckets found. Create your first bucket!
          </CustomText>
        </CustomView>
      );
    }

    return (
      <FlatList
        data={bucketItems}
        renderItem={renderBucketItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    );
  };

  // Early return if required props are missing
  if (!colors) {
    console.warn("Colors context is not available");
    return null;
  }

  return (
    <CustomBottomSheet
      isVisible={isVisible}
      onClose={onClose}
      snapPoints={[snapPointHeight]}
      enablePanDownToClose={true}
    >
      <CustomView style={styles.container}>
        <CustomView style={styles.header}>
          <CustomText
            fontFamily="Inter-SemiBold"
            style={[styles.title, { color: colors.label_dark || "#000" }]}
          >
            Add to bucket
          </CustomText>
        </CustomView>

        {renderContent()}

        {/* Fixed bottom section for Create New Button */}
        <CustomView
          style={[
            styles.bottomSection,
            { borderTopColor: colors.onboarding_gray || "#E0E0E0" },
          ]}
        >
          <TouchableOpacity
            style={styles.createNewButton}
            onPress={() => {
              onCreateNew();
            }}
            activeOpacity={0.7}
          >
            <CustomView
              bgColor={colors.light_blue || "#E3F2FD"}
              style={styles.createNewIconContainer}
            >
              <CreateBucketPlus />
            </CustomView>
            <CustomText
              fontFamily="Inter-SemiBold"
              style={[
                styles.createNewText,
                { color: colors.label_dark || "#000" },
              ]}
            >
              Create new bucket
            </CustomText>
          </TouchableOpacity>
        </CustomView>
      </CustomView>
    </CustomBottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 8,
  },
  header: {
    alignItems: "center",
    marginTop: verticalScale(4),
    marginBottom: 18,
  },
  title: {
    fontSize: scaleFontSize(15),
  },
  flatListContent: {
    paddingHorizontal: 24,
    paddingBottom: verticalScale(20),
  },
  bucketItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  bucketItemImage: {
    width: 68,
    height: 68,
    borderRadius: 10,
    marginRight: horizontalScale(7),
  },
  bucketItemContent: {
    flex: 1,
  },
  bucketItemTitle: {
    fontSize: scaleFontSize(14),
    lineHeight: 20,
  },
  alreadyInBucketText: {
    fontSize: scaleFontSize(12),
    marginTop: 2,
  },
  separator: {
    height: 18,
  },
  bottomSection: {
    borderTopWidth: 1,
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(10),
    paddingHorizontal: 24,
  },
  createNewButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  createNewIconContainer: {
    width: 47,
    height: 47,
    borderRadius: 1000,
    justifyContent: "center",
    alignItems: "center",
    marginRight: horizontalScale(16),
  },
  createNewText: {
    fontSize: scaleFontSize(14),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: verticalScale(40),
  },
  loadingText: {
    marginTop: 12,
    fontSize: scaleFontSize(14),
  },
  loadingFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: verticalScale(20),
  },
  loadingFooterText: {
    marginLeft: 8,
    fontSize: scaleFontSize(12),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: verticalScale(40),
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: scaleFontSize(14),
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: verticalScale(40),
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: scaleFontSize(14),
    textAlign: "center",
    marginBottom: verticalScale(16),
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: scaleFontSize(14),
    fontWeight: "600",
  },
});
