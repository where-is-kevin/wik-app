import React from "react";
import { View, StyleSheet } from "react-native";
import CustomText from "@/components/CustomText";
import CustomView from "@/components/CustomView";
import CustomTouchable from "@/components/CustomTouchableOpacity";
import RatingStarSvg from "@/components/SvgComponents/RatingStarSvg";
import { useTheme } from "@/contexts/ThemeContext";
import { useUserLocation } from "@/contexts/UserLocationContext";
import {
  verticalScale,
  horizontalScale,
  scaleFontSize,
} from "@/utilities/scaling";
import { formatDistance } from "@/utilities/formatDistance";
import { shouldShowValidDistance } from "@/utilities/distanceHelpers";
import { trimString } from "@/utilities/stringHelpers";
import {
  formatEventDateRange,
  formatEventTimeRange,
  formatPrice,
} from "@/utilities/eventHelpers";

interface MainInfoSectionProps {
  contentData: {
    title?: string | null;
    category?: string;
    similarity?: number | string;
    eventDatetimeStart?: string | null;
    eventDatetimeEnd?: string | null;
    rating?: number;
    distance?: number;
    price?: number | string | null;
    addressCity?: string;
    addressCountry?: string;
  };
  onMoreOptionsPress: () => void;
}

export const MainInfoSection: React.FC<MainInfoSectionProps> = ({
  contentData,
  onMoreOptionsPress,
}) => {
  const { colors } = useTheme();
  const { userLocation } = useUserLocation();

  return (
    <CustomView style={styles.section}>
      <CustomTouchable onPress={onMoreOptionsPress}>
        <CustomText
          fontFamily="Inter-SemiBold"
          style={[styles.title, { color: colors.label_dark }]}
        >
          {trimString(contentData.title) || "Unknown"}
        </CustomText>
      </CustomTouchable>

      {/* City and Country OR Event Dates */}
      {contentData?.category === "event" || contentData?.category === "events" ? (
        // For events: Show event date range and times
        (contentData?.eventDatetimeStart || contentData?.eventDatetimeEnd) && (
          <View style={styles.locationContainer}>
            {/* Event Date Range */}
            <CustomText
              fontFamily="Inter-Medium"
              style={[styles.locationText, { color: colors.label_dark }]}
            >
              {formatEventDateRange(
                contentData.eventDatetimeStart || undefined,
                contentData.eventDatetimeEnd || undefined
              )}
            </CustomText>
            {/* Event Time Range */}
            <CustomText
              fontFamily="Inter-Medium"
              style={[styles.eventTimeText, { color: colors.label_dark }]}
            >
              {formatEventTimeRange(
                contentData.eventDatetimeStart || undefined,
                contentData.eventDatetimeEnd || undefined
              )}
            </CustomText>
          </View>
        )
      ) : (
        // For venues/experiences: Show city and country
        (contentData?.addressCity || contentData?.addressCountry) && (
          <View style={styles.locationContainer}>
            <CustomText
              fontFamily="Inter-Medium"
              style={[styles.locationText, { color: colors.label_dark }]}
            >
              {[contentData.addressCity, contentData.addressCountry]
                .filter(Boolean)
                .join(", ")}
            </CustomText>
          </View>
        )
      )}

      {/* Rating, Price, Distance */}
      <View style={styles.infoRow}>
        {contentData?.rating && (
          <View style={styles.ratingContainer}>
            <RatingStarSvg
              stroke={colors.gray_regular}
              fill={colors.gray_regular}
            />
            <CustomText
              fontFamily="Inter-Medium"
              style={[styles.infoText, { color: colors.gray_regular }]}
            >
              {contentData.rating}
            </CustomText>
          </View>
        )}

        {contentData?.rating &&
          (shouldShowValidDistance(contentData?.distance, userLocation) ||
            contentData?.price) && (
            <View style={styles.dotSeparator}>
              <View
                style={[styles.dot, { backgroundColor: colors.gray_regular }]}
              />
            </View>
          )}

        {shouldShowValidDistance(contentData?.distance, userLocation) && (
          <CustomText
            fontFamily="Inter-Medium"
            style={[styles.infoText, { color: colors.gray_regular }]}
          >
            {formatDistance(contentData.distance!)}
          </CustomText>
        )}

        {shouldShowValidDistance(contentData?.distance, userLocation) &&
          contentData?.price != null && (
            <View style={styles.dotSeparator}>
              <View
                style={[styles.dot, { backgroundColor: colors.gray_regular }]}
              />
            </View>
          )}

        {contentData?.price != null && (
          <CustomText
            fontFamily="Inter-Medium"
            style={[styles.infoText, { color: colors.gray_regular }]}
          >
            {formatPrice(contentData.price)}
          </CustomText>
        )}
      </View>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingVertical: verticalScale(16),
  },
  title: {
    fontSize: scaleFontSize(24),
  },
  locationContainer: {
    marginTop: verticalScale(4),
  },
  locationText: {
    fontSize: scaleFontSize(14),
    fontWeight: "500",
    lineHeight: 17.453,
    letterSpacing: 0.14,
  },
  eventTimeText: {
    fontSize: scaleFontSize(14),
    fontWeight: "500",
    lineHeight: 17.453,
    letterSpacing: 0.14,
    marginTop: verticalScale(2),
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: verticalScale(4),
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(4),
  },
  infoText: {
    fontSize: scaleFontSize(14),
  },
  dotSeparator: {
    paddingHorizontal: horizontalScale(6),
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});