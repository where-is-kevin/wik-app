import React, { useState } from "react";
import { StyleSheet, Image, Dimensions } from "react-native";
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

const { width } = Dimensions.get("window");
const cardWidth = (width - horizontalScale(60)) / 2;

interface ExperienceCard {
  id: string;
  title: string;
  safeImages: (string | any)[];
  isExperience?: boolean;
  hasIcon?: boolean;
  height?: "short" | "tall";
}

interface BucketCardProps {
  item: ExperienceCard;
  onPress?: () => void;
}

const BucketCard: React.FC<BucketCardProps> = ({ item, onPress }) => {
  const { colors } = useTheme();

  // Local placeholder image
  const PLACEHOLDER_IMAGE = require("@/assets/images/placeholder-bucket.png");

  // State to track which images have failed to load
  const [imageErrors, setImageErrors] = useState<boolean[]>([
    false,
    false,
    false,
  ]);

  // Function to handle image loading errors
  const handleImageError = (index: number) => {
    setImageErrors((prev) => {
      const newErrors = [...prev];
      newErrors[index] = true;
      return newErrors;
    });
  };

  // Function to get the appropriate image source
  const getImageSource = (imageUrl: string | any, index: number) => {
    // If there's an error or no valid URL, use placeholder
    if (imageErrors[index] || !imageUrl) {
      return PLACEHOLDER_IMAGE;
    }

    // If it's a string URL, return uri object, otherwise return as is (local image)
    return typeof imageUrl === "string" ? { uri: imageUrl } : imageUrl;
  };

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
          <Image
            source={getImageSource(safeImages[0], 0)}
            style={styles.mainImage}
            onError={() => handleImageError(0)}
          />
        </CustomView>

        {/* Right column with two smaller images */}
        <CustomView style={styles.rightColumn}>
          <CustomView style={styles.smallImageContainer}>
            <Image
              source={getImageSource(safeImages[1], 1)}
              style={styles.smallImage}
              onError={() => handleImageError(1)}
            />
          </CustomView>

          <CustomView
            style={[styles.smallImageContainer, styles.bottomImageContainer]}
          >
            <Image
              source={getImageSource(safeImages[2], 2)}
              style={styles.smallImage}
              onError={() => handleImageError(2)}
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
          url={typeof safeImages[0] === "string" ? safeImages[0] : ""} // Use the first image as the shared content
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
