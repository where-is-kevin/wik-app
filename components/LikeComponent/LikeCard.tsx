import React from "react";
import { StyleSheet } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import CustomView from "@/components/CustomView";
import CustomTouchable from "@/components/CustomTouchableOpacity";
import CustomText from "@/components/CustomText";
import ShareButton from "../Button/ShareButton";
import BucketSvg from "../SvgComponents/BucketSvg";
import OptimizedImage from "../OptimizedImage/OptimizedImage";
import CategoryTag from "../Tag/CategoryTag";

interface ExperienceCard {
  id: string;
  title: string;
  foodImage: string;
  landscapeImage: string;
  hasIcon?: boolean;
  height?: "short" | "tall";
  category?: string;
  contentShareUrl: string;
}

interface LikeCardProps {
  item: ExperienceCard;
  onPress?: () => void;
  onBucketPress: (value: string) => void;
  style?: StyleProp<ViewStyle>;
}

const LikeCard: React.FC<LikeCardProps> = ({
  item,
  onPress,
  onBucketPress,
  style,
}) => {
  const { colors } = useTheme();

  // Local placeholder image
  const PLACEHOLDER_IMAGE = require("@/assets/images/placeholder-bucket.png");

  // Helper function to get valid image URL
  const getValidImageUrl = (imageUrl: string): string | null => {
    if (typeof imageUrl === "string" && imageUrl.trim() !== "") {
      return imageUrl;
    }
    return null;
  };

  const cardHeight =
    item.height === "tall" ? verticalScale(217) : verticalScale(117);
  const imageHeight =
    item.height === "tall" ? verticalScale(187) : verticalScale(87);

  // Get safe image source
  const validImageUrl = getValidImageUrl(item.foodImage);

  return (
    <CustomTouchable
      style={[
        styles.likeCard,
        {
          height: cardHeight,
        },
        style,
      ]}
      onPress={onPress}
    >
      <CustomView style={styles.container}>
        {/* Image container with fixed height */}
        <CustomTouchable
          style={[styles.imageContainer, { height: imageHeight }]}
          onPress={onPress}
        >
          <OptimizedImage
            source={validImageUrl ? { uri: validImageUrl } : PLACEHOLDER_IMAGE}
            style={styles.image}
            contentFit="cover"
            priority="normal"
            showLoadingIndicator={true}
            fallbackImage={PLACEHOLDER_IMAGE}
          />

          {/* Experience tag in top left */}
          {item.category && (
            <CategoryTag
              style={styles.experienceTag}
              category={item.category}
              colors={colors}
            />
          )}

          {/* Bucket SVG icon in bottom right */}
          {item.hasIcon && (
            <CustomTouchable
              bgColor={colors.label_dark}
              onPress={() => onBucketPress(item.id)}
              style={styles.bucketIconContainer}
            >
              <BucketSvg />
            </CustomTouchable>
          )}
        </CustomTouchable>

        {/* Title row with more options button */}
        <CustomView style={styles.titleRow}>
          <CustomText
            fontFamily="Inter-SemiBold"
            style={[styles.title, { color: colors.label_dark }]}
            numberOfLines={1}
          >
            {item.title}
          </CustomText>
          <ShareButton
            title={item.title}
            message={`Check out this ${item.category}: ${item.title}`}
            url={item.contentShareUrl || ""}
          />
        </CustomView>
      </CustomView>
    </CustomTouchable>
  );
};

const styles = StyleSheet.create({
  likeCard: {
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
    flex: 1,
  },
  container: {
    flex: 1,
  },
  imageContainer: {
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
    position: "relative", // Added for absolute positioning of overlays
  },
  image: {
    width: "100%",
    height: "100%",
  },
  experienceTag: {
    position: "absolute",
    top: 6,
    left: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
  },
  experienceText: {
    fontSize: scaleFontSize(10),
  },
  bucketIconContainer: {
    position: "absolute",
    bottom: 4,
    right: 5,
    width: 30,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 1000,
    height: 30,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: verticalScale(2),
    paddingHorizontal: horizontalScale(2),
  },
  title: {
    fontSize: scaleFontSize(12.5),
    width: "80%",
  },
});

export default LikeCard;
