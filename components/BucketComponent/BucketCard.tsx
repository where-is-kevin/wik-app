import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { scaleFontSize } from "@/utilities/scaling";
import CustomView from "@/components/CustomView";
import CustomTouchable from "@/components/CustomTouchableOpacity";
import CustomText from "@/components/CustomText";
import ShareButton from "../Button/ShareButton";
import OptimizedImage from "../OptimizedImage/OptimizedImage";
import { ImagePlaceholder } from "../OptimizedImage/ImagePlaceholder";

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

  // Helper function to check if a valid image exists
  const getValidImageUrl = (image: any): string | null => {
    if (typeof image === "string" && image.trim() !== "") {
      return image;
    }
    return null;
  };

  // Check if content exists at position
  const hasContentAtPosition = (position: number): boolean => {
    if (!item.safeImages || position >= item.safeImages.length) {
      return false;
    }
    // Check if there's actual content (not empty string, null, or undefined)
    const content = item.safeImages[position];
    return (
      content !== null &&
      content !== undefined &&
      content !== "" &&
      content !== 0
    );
  };

  // Get safe images with validation
  const safeImages = [
    getValidImageUrl(item.safeImages?.[0]),
    getValidImageUrl(item.safeImages?.[1]),
    getValidImageUrl(item.safeImages?.[2]),
  ];

  return (
    <CustomView style={styles.container}>
      {/* Wrap the entire image container with a single TouchableOpacity */}
      <CustomTouchable style={styles.imageContainer} onPress={onPress}>
        {/* Main large image (left side) */}
        <CustomView style={styles.mainImageContainer}>
          <OptimizedImage
            source={safeImages[0] ? { uri: safeImages[0] } : ""}
            style={styles.mainImage}
            contentFit="cover"
            priority="normal"
            showLoadingIndicator={true}
            borderRadius={9}
            overlayComponent={!safeImages[0] ? <ImagePlaceholder /> : undefined}
          />
        </CustomView>

        {/* Right column with two smaller images */}
        <CustomView style={styles.rightColumn}>
          <CustomView style={styles.smallImageContainer}>
            {hasContentAtPosition(1) ? (
              <OptimizedImage
                source={safeImages[1] ? { uri: safeImages[1] } : ""}
                style={styles.smallImage}
                contentFit="cover"
                priority="normal"
                showLoadingIndicator={true}
                borderRadius={9}
                overlayComponent={!safeImages[1] ? <ImagePlaceholder /> : undefined}
              />
            ) : (
              <View
                style={[
                  styles.smallImage,
                  { backgroundColor: "#F5F5F5", borderRadius: 9 },
                ]}
              />
            )}
          </CustomView>

          <CustomView
            style={[styles.smallImageContainer, styles.bottomImageContainer]}
          >
            {hasContentAtPosition(2) ? (
              <OptimizedImage
                source={safeImages[2] ? { uri: safeImages[2] } : ""}
                style={styles.smallImage}
                contentFit="cover"
                priority="normal"
                showLoadingIndicator={true}
                borderRadius={9}
                overlayComponent={!safeImages[2] ? <ImagePlaceholder /> : undefined}
              />
            ) : (
              <View
                style={[
                  styles.smallImage,
                  { backgroundColor: "#F5F5F5", borderRadius: 9 },
                ]}
              />
            )}
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
          {item.title || "Unnamed Bucket"}
        </CustomText>
        <ShareButton
          title={item.title || "Unnamed Bucket"}
          message={`Check out this bucket: ${item.title || "Unnamed Bucket"}`}
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
