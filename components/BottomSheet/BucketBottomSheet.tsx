// BucketBottomSheet.tsx - FIXED VERSION with null safety
import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
import { fetchBuckets, useBuckets } from "@/hooks/useBuckets";
import AnimatedLoader from "@/components/Loader/AnimatedLoader";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ScrollView } from "react-native-gesture-handler";
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
  const authData = queryClient.getQueryData<{ accessToken?: string }>(["auth"]);
  const jwt = authData?.accessToken;

  // Fetch buckets data only when bottom sheet is visible
  const { data: buckets, isLoading: bucketsLoading } = useQuery<any[], Error>({
    queryKey: ["buckets"],
    queryFn: () => {
      // Your existing fetch logic
      if (!jwt) throw new Error("No JWT found");
      return fetchBuckets(jwt);
    },
    enabled: !!jwt && isVisible, // Only fetch when visible AND authenticated
    staleTime: 5000,
  });

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
    // Early return if buckets is null, undefined, or not an array
    if (!buckets || !Array.isArray(buckets) || buckets.length === 0) {
      return [];
    }

    try {
      return buckets
        .filter((bucket) => bucket && typeof bucket === "object") // Filter out null/undefined items
        .map((bucket: any) => {
          // Ensure required properties exist with fallbacks
          const id = bucket?.id || `bucket-${Math.random()}`;
          const title = bucket?.bucketName || "Untitled Bucket";
          const contentIds = Array.isArray(bucket?.contentIds)
            ? bucket.contentIds
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

  const renderBucketItem = (item: BucketItem) => {
    if (!item) return null;

    try {
      const isItemInBucket =
        selectedLikeItemId && Array.isArray(item.contentIds)
          ? item.contentIds.includes(selectedLikeItemId)
          : false;

      return (
        <CustomTouchable
          key={item.id}
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

  const renderContent = () => {
    if (bucketsLoading) {
      return (
        <CustomView style={styles.loadingContainer}>
          <AnimatedLoader />
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
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {bucketItems.map(renderBucketItem).filter(Boolean)}
      </ScrollView>
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
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: scaleFontSize(15),
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    gap: 18,
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
  bucketItemDate: {
    fontSize: scaleFontSize(14),
  },
  alreadyInBucketText: {
    fontSize: scaleFontSize(12),
    marginTop: 2,
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
});
