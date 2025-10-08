import React from "react";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomText from "@/components/CustomText";
import CustomTouchable from "./CustomTouchableOpacity";
import { useTheme } from "@/contexts/ThemeContext";
import CategoryTag from "./Tag/CategoryTag";
import OptimizedImage from "./OptimizedImage/OptimizedImage";
import {
  scaleFontSize,
  horizontalScale,
  verticalScale,
} from "@/utilities/scaling";
import { formatDistance } from "@/utilities/formatDistance";
import PinBucketSvg from "./SvgComponents/PinBucketSvg";
import { ImagePlaceholder } from "./OptimizedImage/ImagePlaceholder";

interface ContentCardProps {
  item: any;
  width: number;
  isSelected?: boolean;
  onPress: (item: any) => void;
  onBucketPress?: (itemId: string) => void;
}

const ContentCard: React.FC<ContentCardProps> = ({
  item,
  width,
  isSelected = false,
  onPress,
  onBucketPress,
}) => {
  const { colors } = useTheme();

  const handleBucketPress = () => {
    if (onBucketPress && item.id) {
      onBucketPress(item.id);
    }
  };

  // Helper function to get valid image URL
  const getValidImageUrl = (imageUrl: string): string | null => {
    if (typeof imageUrl === "string" && imageUrl.trim() !== "") {
      return imageUrl;
    }
    return null;
  };

  // Get safe image source
  const validImageUrl = getValidImageUrl(item?.internalImageUrls?.[0]);

  return (
    <CustomTouchable
      style={[styles.card, { width }, isSelected && styles.selectedCard]}
      onPress={() => onPress(item)}
    >
      <View style={styles.imageContainer}>
        <OptimizedImage
          source={validImageUrl ? { uri: validImageUrl } : ""}
          style={styles.cardImage}
          priority="normal"
          showLoadingIndicator={true}
          borderRadius={10}
          overlayComponent={!validImageUrl ? <ImagePlaceholder /> : undefined}
        />

        {/* Top Row with Category Tag and Bucket Button */}
        <View style={styles.topRow}>
          {/* Category Tag */}
          {item.category && (
            <CategoryTag
              style={styles.categoryTag}
              category={item.category}
              colors={colors}
            />
          )}

          {/* Bucket Button */}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.lime }]}
            onPress={handleBucketPress}
          >
            <PinBucketSvg />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <CustomText
            style={[styles.cardTitle, { color: colors.label_dark }]}
            fontFamily="Inter-SemiBold"
            numberOfLines={1}
          >
            {item.title || item.name || "Event"}
          </CustomText>
          {/* <CustomText
            fontFamily="Inter-SemiBold"
            style={[styles.matchText, { color: colors.light_blue }]}
          >
            {item.similarity
              ? `${Math.round(item.similarity * 100)}% match`
              : "0% match"}
          </CustomText> */}
        </View>

        {/* Subtitle */}
        {/* {item.description && (
          <CustomText
            style={[styles.subtitle, { color: colors.onboarding_option_dark }]}
            numberOfLines={1}
          >
            {item.description}
          </CustomText>
        )} */}
        <View style={styles.cardDetails}>
          {!!item.rating && (
            <>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={11} color="#666" />
                <CustomText style={styles.distance}>{item.rating}</CustomText>
              </View>
              {(!!item.price || !!item.distance) && (
                <CustomText style={styles.separator}>•</CustomText>
              )}
            </>
          )}

          {!!item.price && (
            <>
              <CustomText style={styles.distance}>{item.price}</CustomText>
              {!!item.distance && (
                <CustomText style={styles.separator}>•</CustomText>
              )}
            </>
          )}

          {!!item.distance && (
            <CustomText style={styles.distance}>
              {formatDistance(item.distance)}
            </CustomText>
          )}
        </View>
      </View>
    </CustomTouchable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#131314",
        shadowOffset: { width: 1, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
        shadowColor: "#131314",
      },
    }),
  },
  selectedCard: {
    ...Platform.select({
      ios: {
        shadowColor: "rgba(19, 19, 20, 0.25)",
        shadowOffset: { width: 1, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  imageContainer: {
    position: "relative",
    width: "100%",
  },
  cardImage: {
    width: "100%",
    height: 150,
  },
  topRow: {
    position: "absolute",
    top: 15,
    left: 15,
    right: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  categoryTag: {},
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    paddingTop: verticalScale(10),
    paddingHorizontal: horizontalScale(15),
    paddingBottom: verticalScale(15),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: scaleFontSize(14),
    flex: 1,
    marginRight: horizontalScale(6),
  },
  subtitle: {
    fontSize: scaleFontSize(12),
    marginBottom: verticalScale(4),
  },
  matchText: {
    fontSize: scaleFontSize(12),
  },
  cardDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(4),
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(2),
  },
  rating: {
    fontSize: scaleFontSize(12),
    color: "#333",
    fontWeight: "500",
    fontFamily: "Inter-Medium",
  },
  separator: {
    fontSize: scaleFontSize(12),
    color: "#666",
    fontFamily: "Inter-Regular",
  },
  distance: {
    fontSize: scaleFontSize(12),
    color: "#666",
    fontFamily: "Inter-Regular",
  },
  status: {
    fontSize: scaleFontSize(12),
    color: "#00A86B",
    fontWeight: "500",
    fontFamily: "Inter-Medium",
  },
});

export default React.memo(ContentCard);
