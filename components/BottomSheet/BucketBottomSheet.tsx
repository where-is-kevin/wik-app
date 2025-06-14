// BucketBottomSheet.tsx
import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
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

  // Transform buckets data to BucketItem format
  const bucketItems = useMemo(() => {
    if (!buckets || buckets.length === 0) return [];

    return buckets.map((bucket: any) => ({
      id: bucket.id,
      title: bucket.bucketName,
      date: "22-27 June",
      image:
        typeof bucket.content?.[0]?.googlePlacesImageUrl === "string"
          ? bucket.content[0].googlePlacesImageUrl
          : PLACEHOLDER_IMAGE,
      contentIds: bucket.contentIds || [],
    }));
  }, [buckets]);

  // Calculate dynamic height for bottom sheet
  const snapPointHeight = useMemo(() => {
    const screenHeight = Dimensions.get("window").height;
    const statusBarHeight =
      Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;
    const safeAreaTop = insets.top;
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
  }, [insets.top]);

  const renderBucketItem = (item: BucketItem) => {
    const isItemInBucket = selectedLikeItemId
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
        <Image
          source={
            typeof item.image === "string" ? { uri: item.image } : item.image
          }
          style={styles.bucketItemImage}
        />
        <CustomView style={styles.bucketItemContent}>
          <CustomText
            fontFamily="Inter-SemiBold"
            style={[styles.bucketItemTitle, { color: colors.label_dark }]}
          >
            {item.title}
          </CustomText>
          {isItemInBucket && (
            <CustomText
              style={[
                styles.alreadyInBucketText,
                { color: colors.bucket_green },
              ]}
            >
              Already in bucket
            </CustomText>
          )}
        </CustomView>
      </CustomTouchable>
    );
  };

  const renderContent = () => {
    if (bucketsLoading) {
      return (
        <CustomView style={styles.loadingContainer}>
          <AnimatedLoader />
        </CustomView>
      );
    }

    if (bucketItems.length === 0) {
      return (
        <CustomView style={styles.emptyContainer}>
          <CustomText
            style={[styles.emptyText, { color: colors.gray_regular }]}
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
        {bucketItems.map(renderBucketItem)}
      </ScrollView>
    );
  };

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
            style={[styles.title, { color: colors.label_dark }]}
          >
            Add to bucket
          </CustomText>
        </CustomView>

        {renderContent()}

        {/* Fixed bottom section for Create New Button */}
        <CustomView
          style={[
            styles.bottomSection,
            { borderTopColor: colors.onboarding_gray },
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
              bgColor={colors.light_blue}
              style={styles.createNewIconContainer}
            >
              <CreateBucketPlus />
            </CustomView>
            <CustomText
              fontFamily="Inter-SemiBold"
              style={[styles.createNewText, { color: colors.label_dark }]}
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
