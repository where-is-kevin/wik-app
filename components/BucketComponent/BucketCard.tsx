import React, { useState } from "react";
import { StyleSheet, Dimensions } from "react-native";
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
import OptimizedImage from "../OptimizedImage/OptimizedImage";

const { width } = Dimensions.get("window");
const cardWidth = (width - horizontalScale(60)) / 2;

interface ExperienceCard {
  id: string;
  title: string;
  safeImages: (string | any)[];
  hasIcon?: boolean;
  height?: "short" | "tall";
  bucketShareUrl: string;
}

interface BucketCardProps {
  item: ExperienceCard;
  onPress?: () => void;
}

const BucketCard: React.FC<BucketCardProps> = ({ item, onPress }) => {
  const { colors } = useTheme();

  // Local placeholder image
  const PLACEHOLDER_IMAGE = require("@/assets/images/placeholder-bucket.png");

  // ✅ REMOVED imageErrors state - OptimizedImage handles this internally

  // Ensuring we have at least 3 images, using local placeholder if needed
  const safeImages = [
    item.safeImages?.[0] || PLACEHOLDER_IMAGE,
    item.safeImages?.[1] || PLACEHOLDER_IMAGE,
    item.safeImages?.[2] || PLACEHOLDER_IMAGE,
  ];

  return (
    <CustomView style={styles.container}>
      {/* Wrap the entire image container with a single TouchableOpacity */}
      <CustomTouchable style={styles.imageContainer} onPress={onPress}>
        {/* Main large image (left side) */}
        <CustomView style={styles.mainImageContainer}>
          {/* ✅ REPLACED Image with OptimizedImage */}
          <OptimizedImage
            source={
              typeof safeImages[0] === "string"
                ? { uri: safeImages[0] }
                : safeImages[0]
            }
            style={styles.mainImage}
            resizeMode="cover"
            priority="normal"
            showLoader={true}
            fallbackSource={PLACEHOLDER_IMAGE}
          />
        </CustomView>

        {/* Right column with two smaller images */}
        <CustomView style={styles.rightColumn}>
          <CustomView style={styles.smallImageContainer}>
            {/* ✅ REPLACED Image with OptimizedImage */}
            <OptimizedImage
              source={
                typeof safeImages[1] === "string"
                  ? { uri: safeImages[1] }
                  : safeImages[1]
              }
              style={styles.smallImage}
              resizeMode="cover"
              priority="normal"
              showLoader={true}
              fallbackSource={PLACEHOLDER_IMAGE}
            />
          </CustomView>

          <CustomView
            style={[styles.smallImageContainer, styles.bottomImageContainer]}
          >
            {/* ✅ REPLACED Image with OptimizedImage */}
            <OptimizedImage
              source={
                typeof safeImages[2] === "string"
                  ? { uri: safeImages[2] }
                  : safeImages[2]
              }
              style={styles.smallImage}
              resizeMode="cover"
              priority="normal"
              showLoader={true}
              fallbackSource={PLACEHOLDER_IMAGE}
            />
          </CustomView>
        </CustomView>
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
          url={item.bucketShareUrl || ""}
        />
      </CustomView>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "48%", // Total width to accommodate all components with spacing
  },
  imageContainer: {
    flexDirection: "row",
    height: 125, // Fixed height as per requirement
  },
  mainImageContainer: {
    width: 92, // Fixed width as per requirement
    borderRadius: 9,
    overflow: "hidden",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  rightColumn: {
    flex: 1,
    justifyContent: "space-between",
    marginLeft: 4, // Exactly 4px spacing between main image and smaller images
  },
  smallImageContainer: {
    width: "100%",
    height: 60, // Fixed height for smaller images
    borderRadius: 9,
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
    fontSize: scaleFontSize(12.5),
    width: "80%", // Leave room for the more button/
  },
});

export default BucketCard;
