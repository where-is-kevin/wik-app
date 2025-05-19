import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
} from "react-native";
import CustomView from "../CustomView";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import CustomText from "../CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import CustomTouchable from "../CustomTouchableOpacity";
import MoreSvg from "../SvgComponents/MoreSvg";
import ShareButton from "../Button/ShareButton";

interface BucketItem {
  id?: string;
  title: string;
  images: string[];
  onPress?: () => void;
  onMorePress?: () => void;
}

interface ImageBucketProps {
  title: string;
  images: string[];
  onPress?: () => void;
  onMorePress?: () => void;
}

interface BucketsSectionProps {
  buckets: BucketItem[];
  onSeeMorePress?: () => void;
}

export const ImageBucket: React.FC<ImageBucketProps> = ({
  title,
  images,
  onPress,
  onMorePress,
}) => {
  const { colors } = useTheme();
  // Ensuring we have at least 3 images, using fallbacks if needed
  const safeImages: string[] = [
    images?.[0] || "https://via.placeholder.com/150",
    images?.[1] || "https://via.placeholder.com/150",
    images?.[2] || "https://via.placeholder.com/150",
  ];

  return (
    <CustomView style={styles.container}>
      {/* Wrap the entire image container with a single TouchableOpacity */}
      <TouchableOpacity style={styles.imageContainer} onPress={onPress}>
        {/* Main large image (left side) */}
        <CustomView style={styles.mainImageContainer}>
          <Image source={{ uri: safeImages[0] }} style={styles.mainImage} />
        </CustomView>

        {/* Right column with two smaller images */}
        <CustomView style={styles.rightColumn}>
          <CustomView style={styles.smallImageContainer}>
            <Image source={{ uri: safeImages[1] }} style={styles.smallImage} />
          </CustomView>

          <CustomView
            style={[styles.smallImageContainer, styles.bottomImageContainer]}
          >
            <Image source={{ uri: safeImages[2] }} style={styles.smallImage} />
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
          url={safeImages[0]} // Use the first image as the shared content
        />
      </CustomView>
    </CustomView>
  );
};

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

const { width } = Dimensions.get("window");
// We're now using fixed dimensions for the image bucket but keeping the original
// itemWidth for the horizontal FlatList spacing if needed elsewhere

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
    paddingHorizontal: horizontalScale(3),
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
});

export default BucketsSection;
