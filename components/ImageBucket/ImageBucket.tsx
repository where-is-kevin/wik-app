import React from "react";
import { View, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import CustomView from "../CustomView";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import CustomText from "../CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import CustomTouchable from "../CustomTouchableOpacity";
import ShareButton from "../Button/ShareButton";
import OptimizedImage from "../OptimizedImage/OptimizedImage";
import { ImagePlaceholder } from "../OptimizedImage/ImagePlaceholder";

// Local placeholder image - moved outside component to prevent re-creation
// Using SVG placeholder via OptimizedImage error handling

interface BucketItem {
  id?: string;
  title: string;
  images: (string | number)[];
  onPress?: () => void;
  onMorePress?: () => void;
  bucketShareUrl: string;
}

interface ImageBucketProps {
  title: string;
  images: (string | number)[];
  onPress?: () => void;
  onMorePress?: () => void;
  bucketShareUrl: string;
}

interface BucketsSectionProps {
  buckets: BucketItem[];
  onSeeMorePress?: () => void;
}

// Helper function to validate and filter image URLs
const getValidImageUrl = (image: string | number): string | null => {
  if (typeof image === "string" && image.trim() !== "") {
    return image;
  }
  return null;
};

// Helper function to check if content exists at position (not just image URL)
const hasContentAtPosition = (
  images: (string | number)[],
  position: number
): boolean => {
  if (!Array.isArray(images) || position >= images.length) {
    return false;
  }
  // Check if there's actual content (not empty string, null, or undefined)
  const content = images[position];
  return (
    content !== null && content !== undefined && content !== "" && content !== 0
  );
};

// Helper function to get safe images array
const getSafeImages = (images: (string | number)[]): (string | null)[] => {
  if (!Array.isArray(images)) {
    return [null, null, null];
  }

  // Get first 3 images and validate each one individually
  return [
    getValidImageUrl(images[0]),
    getValidImageUrl(images[1]),
    getValidImageUrl(images[2]),
  ];
};

const ImageBucketComponent: React.FC<ImageBucketProps> = ({
  title,
  images,
  onPress,
  onMorePress,
  bucketShareUrl,
}) => {
  const { colors } = useTheme();

  // Get safe images with validation - memoized to prevent re-renders
  const safeImages = React.useMemo(() => getSafeImages(images), [images]);

  return (
    <CustomView style={styles.container}>
      {/* Wrap the entire image container with a single TouchableOpacity */}
      <TouchableOpacity style={styles.imageContainer} onPress={onPress}>
        {/* Main large image (left side) */}
        <CustomView style={styles.mainImageContainer}>
          <OptimizedImage
            source={safeImages[0] ? { uri: safeImages[0] } : ""}
            style={styles.mainImage}
            contentFit="cover"
            priority="normal"
            showLoadingIndicator={true}
            borderRadius={12}
            overlayComponent={!safeImages[0] ? <ImagePlaceholder /> : undefined}
          />
        </CustomView>

        {/* Right column with two smaller images */}
        <CustomView style={styles.rightColumn}>
          <CustomView style={styles.smallImageContainer}>
            {hasContentAtPosition(images, 1) ? (
              <OptimizedImage
                source={safeImages[1] ? { uri: safeImages[1] } : ""}
                style={styles.smallImage}
                contentFit="cover"
                priority="normal"
                showLoadingIndicator={true}
                borderRadius={12}
                overlayComponent={!safeImages[1] ? <ImagePlaceholder /> : undefined}
              />
            ) : (
              <View
                style={[
                  styles.smallImage,
                  { backgroundColor: "#F5F5F5", borderRadius: 12 },
                ]}
              />
            )}
          </CustomView>

          <CustomView
            style={[styles.smallImageContainer, styles.bottomImageContainer]}
          >
            {hasContentAtPosition(images, 2) ? (
              <OptimizedImage
                source={safeImages[2] ? { uri: safeImages[2] } : ""}
                style={styles.smallImage}
                contentFit="cover"
                priority="normal"
                showLoadingIndicator={true}
                borderRadius={12}
                overlayComponent={!safeImages[2] ? <ImagePlaceholder /> : undefined}
              />
            ) : (
              <View
                style={[
                  styles.smallImage,
                  { backgroundColor: "#F5F5F5", borderRadius: 12 },
                ]}
              />
            )}
          </CustomView>
        </CustomView>
      </TouchableOpacity>

      {/* Title row with more options button */}
      <CustomView style={styles.titleRow}>
        <CustomText
          fontFamily="Inter-SemiBold"
          style={[styles.title, { color: colors.label_dark }]}
          numberOfLines={1}
        >
          {title}
        </CustomText>
        <ShareButton
          title={title}
          message={`Check out this bucket: ${title}`}
          url={bucketShareUrl || ""} // Use the first valid image as the shared content
        />
      </CustomView>
    </CustomView>
  );
};

// Custom comparison function for React.memo
const arePropsEqual = (
  prevProps: ImageBucketProps,
  nextProps: ImageBucketProps
) => {
  // Check if title, bucketShareUrl changed
  if (
    prevProps.title !== nextProps.title ||
    prevProps.bucketShareUrl !== nextProps.bucketShareUrl
  ) {
    return false;
  }

  // Check if images array changed (deep comparison)
  if (prevProps.images.length !== nextProps.images.length) {
    return false;
  }

  for (let i = 0; i < prevProps.images.length; i++) {
    if (prevProps.images[i] !== nextProps.images[i]) {
      return false;
    }
  }

  // Don't compare onPress/onMorePress functions - they can change
  return true;
};

export const ImageBucket = React.memo(ImageBucketComponent, arePropsEqual);

// Buckets section component with horizontal FlatList
const BucketsSection: React.FC<BucketsSectionProps> = ({
  buckets = [],
  onSeeMorePress,
}) => {
  const { colors } = useTheme();

  const renderBucketItem = ({ item }: { item: BucketItem }) => (
    <ImageBucket
      title={item.title}
      images={item.images}
      bucketShareUrl={item.bucketShareUrl}
      onPress={item.onPress}
      onMorePress={item.onMorePress}
    />
  );

  return (
    <CustomView style={styles.sectionContainer}>
      {/* Header with See More button */}
      <CustomView style={styles.sectionHeader}>
        <CustomText
          fontFamily="Inter-SemiBold"
          style={[styles.sectionTitle, { color: colors.profile_name_black }]}
        >
          BUCKETS
        </CustomText>
        <CustomTouchable
          bgColor={colors.opacity_lime}
          style={styles.seeMoreButton}
          onPress={onSeeMorePress}
        >
          <CustomText
            fontFamily="Inter-SemiBold"
            style={[styles.seeMoreText, { color: colors.profile_name_black }]}
          >
            See more
          </CustomText>
        </CustomTouchable>
      </CustomView>

      {/* Horizontal FlatList of bucket items */}
      <FlatList
        data={buckets}
        renderItem={renderBucketItem}
        keyExtractor={(item, index) => item.id || `bucket-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />
    </CustomView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 180, // Total width to accommodate all components with spacing
  },
  imageContainer: {
    flexDirection: "row",
    height: 140, // Fixed height as per requirement
  },
  mainImageContainer: {
    width: 105, // Fixed width as per requirement
    height: 140, // Fixed height as per requirement
    borderRadius: 12,
    overflow: "hidden",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  rightColumn: {
    width: 68, // Fixed width for smaller images
    height: "100%",
    justifyContent: "space-between",
    marginLeft: 4, // Exactly 4px spacing between main image and smaller images
  },
  smallImageContainer: {
    width: "100%",
    height: 68, // Fixed height for smaller images
    borderRadius: 12,
    overflow: "hidden",
  },
  bottomImageContainer: {
    marginTop: 4,
  },
  smallImage: {
    width: "100%",
    height: "100%",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  title: {
    fontSize: scaleFontSize(14),
    width: "80%", // Leave room for the more button
  },
  sectionContainer: {
    paddingVertical: verticalScale(16),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(12),
    paddingHorizontal: horizontalScale(22),
  },
  sectionTitle: {
    fontSize: scaleFontSize(14),
  },
  seeMoreButton: {
    paddingHorizontal: horizontalScale(6),
    paddingVertical: verticalScale(4),
    borderRadius: 6,
  },
  seeMoreText: {
    fontSize: scaleFontSize(12),
  },
  flatListContent: {
    paddingHorizontal: horizontalScale(22),
  },
  itemSeparator: {
    width: horizontalScale(12),
  },
  grayBackground: {
    borderRadius: 12,
  },
});

export default BucketsSection;
