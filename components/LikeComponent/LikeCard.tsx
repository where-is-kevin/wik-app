import React, { useState } from "react";
import { StyleSheet, Image } from "react-native";
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

interface ExperienceCard {
  id: string;
  title: string;
  foodImage: string;
  landscapeImage: string;
  isExperience?: boolean;
  hasIcon?: boolean;
  height?: "short" | "tall";
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

  // State to track if image has failed to load
  const [imageError, setImageError] = useState<boolean>(false);

  // Function to handle image loading error
  const handleImageError = () => {
    setImageError(true);
  };

  // Function to get the appropriate image source
  const getImageSource = () => {
    if (imageError || !item.foodImage) {
      return PLACEHOLDER_IMAGE;
    }
    return { uri: item.foodImage };
  };

  const cardHeight =
    item.height === "tall" ? verticalScale(217) : verticalScale(117);
  const imageHeight =
    item.height === "tall" ? verticalScale(187) : verticalScale(87);

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
          <Image
            source={getImageSource()}
            style={styles.image}
            onError={handleImageError}
          />

          {/* Experience tag in top left */}
          {item.isExperience && (
            <CustomView
              bgColor={colors.profile_name_black}
              style={styles.experienceTag}
            >
              <CustomText
                fontFamily="Inter-SemiBold"
                style={[styles.experienceText, { color: colors.lime }]}
              >
                EXPERIENCE
              </CustomText>
            </CustomView>
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
            message={`Check out this bucket: ${item.title}`}
            url={item.foodImage}
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
    resizeMode: "cover",
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
