import React, { useCallback } from "react";
import { View, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import CustomTouchable from "../CustomTouchableOpacity";
import { useTheme } from "@/contexts/ThemeContext";
import ShareButton from "../Button/ShareButton";
import OptimizedImage from "../OptimizedImage/OptimizedImage";
import CategoryTag from "../Tag/CategoryTag";
import ImagePlaceholderSvg from "../SvgComponents/ImagePlaceholderSvg";

// Local placeholder image - moved outside component to prevent re-creation
// Using SVG placeholder via OptimizedImage error handling

// TypeScript interfaces
interface LikeItem {
  id?: string;
  title: string;
  image: string;
  category?: string;
  contentShareUrl: string;
  onPress?: () => void;
  onMorePress?: () => void;
}

interface LikeItemProps {
  title: string;
  image: string;
  category?: string;
  contentShareUrl: string;
  onPress?: () => void;
  onMorePress?: () => void;
}

interface LikesSectionProps {
  likes: LikeItem[];
  onSeeMorePress?: () => void;
}

const LikeItemComponent: React.FC<LikeItemProps> = React.memo(({
  title,
  image,
  category,
  onPress,
  contentShareUrl,
}) => {
  const { colors } = useTheme();

  // Get safe image source - memoized to prevent re-renders
  const validImageUrl = React.useMemo(() => {
    if (typeof image === "string" && image.trim() !== "") {
      return image;
    }
    return null;
  }, [image]);

  return (
    <CustomView style={styles.container}>
      {/* Image container with its own touchable */}
      <CustomTouchable style={styles.imageContainer} onPress={onPress}>
        {validImageUrl ? (
          <OptimizedImage
            source={{ uri: validImageUrl }}
            style={styles.image}
            contentFit="cover"
            priority="normal"
            showLoadingIndicator={true}
          />
        ) : (
          <CustomView
            style={[
              styles.image,
              { backgroundColor: "#F5F5F5", borderRadius: 10 },
            ]}
          >
            <ImagePlaceholderSvg
              width="100%"
              height="100%"
              backgroundColor="#F5F5F5"
              iconColor="#9CA3AF"
            />
          </CustomView>
        )}

        {/* Category tag in top left */}
        {category && (
          <CategoryTag
            style={styles.categoryTag}
            category={category}
            colors={colors}
          />
        )}
      </CustomTouchable>

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
          message={`Check out this ${category}: ${title}`}
          url={contentShareUrl || ""} // Use the validated image URL
        />
      </CustomView>
    </CustomView>
  );
});

// Likes section component with horizontal FlatList
const LikesSection: React.FC<LikesSectionProps> = ({
  likes = [],
  onSeeMorePress,
}) => {
  const { colors } = useTheme();

  const renderLikeItem = useCallback(
    ({ item }: { item: LikeItem }) => (
      <LikeItemComponent
        key={item.id}
        title={item.title}
        image={item.image}
        contentShareUrl={item.contentShareUrl}
        category={item.category}
        onPress={item.onPress}
        onMorePress={item.onMorePress}
      />
    ),
    []
  );

  const keyExtractor = useCallback(
    (item: LikeItem, index: number) => item.id || `like-${index}`,
    []
  );

  return (
    <CustomView style={styles.sectionContainer}>
      {/* Header with See More button */}
      <CustomView style={styles.sectionHeader}>
        <CustomText
          fontFamily="Inter-SemiBold"
          style={[styles.sectionTitle, { color: colors.profile_name_black }]}
        >
          LIKES
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
      {/* Horizontal FlatList of like items */}
      <FlatList
        data={likes}
        renderItem={renderLikeItem}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        removeClippedSubviews={true}
        initialNumToRender={3}
        maxToRenderPerBatch={5}
        windowSize={10}
        getItemLayout={(data, index) => ({
          length: 177 + horizontalScale(12), // item width + separator
          offset: (177 + horizontalScale(12)) * index,
          index,
        })}
      />
    </CustomView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 177, // Fixed width as requested
  },
  imageContainer: {
    width: "100%",
    height: 118, // Fixed height as requested
    borderRadius: 10,
    overflow: "hidden",
    position: "relative", // Added for absolute positioning of category tag
  },
  image: {
    width: "100%",
    height: "100%",
  },
  categoryTag: {
    position: "absolute",
    top: 6,
    left: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
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
    paddingBottom: verticalScale(16),
  },
  itemSeparator: {
    width: horizontalScale(12),
  },
});

export default LikesSection;
