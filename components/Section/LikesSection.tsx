import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import CustomTouchable from "../CustomTouchableOpacity";
import { useTheme } from "@/contexts/ThemeContext";
import MoreSvg from "../SvgComponents/MoreSvg";
import ShareButton from "../Button/ShareButton";

// TypeScript interfaces
interface LikeItem {
  id?: string;
  title: string;
  image: string;
  onPress?: () => void;
  onMorePress?: () => void;
}

interface LikeItemProps {
  title: string;
  image: string;
  onPress?: () => void;
  onMorePress?: () => void;
}

interface LikesSectionProps {
  likes: LikeItem[];
  onSeeMorePress?: () => void;
}

const LikeItemComponent: React.FC<LikeItemProps> = ({
  title,
  image,
  onPress,
  onMorePress,
}) => {
  const { colors } = useTheme();

  // Local placeholder image
  const PLACEHOLDER_IMAGE = require("@/assets/images/placeholder-bucket.png");

  // State to track if image has failed to load
  const [imageError, setImageError] = useState<boolean>(false);

  // Function to handle image loading error
  const handleImageError = () => {
    setImageError(true);
  };

  // Function to get the appropriate image source
  const getImageSource = () => {
    if (imageError || !image) {
      return PLACEHOLDER_IMAGE;
    }
    return { uri: image };
  };

  return (
    <CustomView style={styles.container}>
      {/* Image container with its own touchable */}
      <CustomTouchable style={styles.imageContainer} onPress={onPress}>
        <Image
          source={getImageSource()}
          style={styles.image}
          onError={handleImageError}
        />
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
          message={`Check out this bucket: ${title}`}
          url={image} // Use the first image as the shared content
        />
      </CustomView>
    </CustomView>
  );
};

// Likes section component with horizontal FlatList
const LikesSection: React.FC<LikesSectionProps> = ({
  likes = [],
  onSeeMorePress,
}) => {
  const { colors } = useTheme();
  const renderLikeItem = ({ item }: { item: LikeItem }) => (
    <LikeItemComponent
      title={item.title}
      image={item.image}
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
        keyExtractor={(item, index) => item.id || `like-${index}`}
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
    width: 177, // Fixed width as requested
  },
  imageContainer: {
    width: "100%",
    height: 118, // Fixed height as requested
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
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
  sectionContainer: {},
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
