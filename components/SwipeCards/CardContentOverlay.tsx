// components/CardContentOverlay.tsx
import React, { useCallback, useMemo } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import CustomText from "@/components/CustomText";
import CustomView from "../CustomView";
import CustomTouchable from "../CustomTouchableOpacity";
import ShareButton from "../Button/ShareButton";
import CategoryTag from "../Tag/CategoryTag";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import { formatTags } from "@/utilities/formatTags";
import { formatDistance } from "@/utilities/formatDistance";
import { useUserLocation } from "@/contexts/UserLocationContext";
import { shouldShowDistance } from "@/utilities/distanceHelpers";
import SponsoredKevinSvg from "../SvgComponents/SponsoredKevinSvg";
import SendSvgSmall from "../SvgComponents/SendSvgSmall";
import RatingStarSvg from "../SvgComponents/RatingStarSvg";
import PinBucketSvg from "../SvgComponents/PinBucketSvg";

// Format event datetime to "Wed, Sept 4th • 6:00 pm - 8:00 pm" or "Wed, Sept 4th • 6:00 pm" (UTC time)
const formatEventDateTime = (
  startDateTimeString?: string,
  endDateTimeString?: string
): string => {
  if (!startDateTimeString) return "";

  try {
    const startDate = new Date(startDateTimeString);

    // Use UTC methods to avoid local timezone conversion
    const dayName = startDate.toLocaleDateString("en-US", {
      weekday: "short",
      timeZone: "UTC"
    });
    const month = startDate.toLocaleDateString("en-US", {
      month: "short",
      timeZone: "UTC"
    });
    const day = startDate.getUTCDate();
    const suffix =
      day === 1 || day === 21 || day === 31
        ? "st"
        : day === 2 || day === 22
        ? "nd"
        : day === 3 || day === 23
        ? "rd"
        : "th";

    // Format time in UTC
    const startTime = startDate
      .toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "UTC",
      })
      .toLowerCase();

    let timeRange = startTime;

    // If end datetime exists and is different from start, add it to the range
    if (endDateTimeString) {
      const endDate = new Date(endDateTimeString);
      const endTime = endDate
        .toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone: "UTC",
        })
        .toLowerCase();

      // Only show end time if it's different from start time
      if (endTime !== startTime) {
        timeRange = `${startTime} - ${endTime}`;
      }
    }

    return `${dayName}, ${month} ${day}${suffix} • ${timeRange}`;
  } catch (error) {
    console.log("Error formatting event datetime:", error);
    return "";
  }
};

// Format price display logic
const formatPrice = (price?: string | number): string | null => {
  if (price === null || price === undefined) return null;

  // Handle string prices (new API format like "€10.00 - €25.00")
  if (typeof price === "string") {
    if (price === "0" || price === "0.00") return "Free";
    if (price.includes("€") || price.includes("$")) return price; // Already formatted price range
    if (price && price !== "0") return "Ticketed";
  }

  // Handle number prices (old format)
  if (typeof price === "number") {
    if (price === 0) return "Free";
    if (price > 0) return "Ticketed";
  }

  return null;
};

interface CardData {
  id: string;
  title: string;
  imageUrl: string;
  price?: string;
  rating?: string;
  category?: string;
  address?: string;
  addressShort?: string;
  isSponsored?: boolean;
  contentShareUrl: string;
  tags?: string;
  similarity: number | string;
  distance?: number;
  eventDatetimeStart?: string; // For event type items
  eventDatetimeEnd?: string;
}

interface CardContentOverlayProps {
  item: CardData;
  colors: any;
  onBucketPress?: (itemId: string) => void;
  hideButtons?: boolean;
  onCardTap?: (item: CardData) => void;
}

export const CardContentOverlay = React.memo<CardContentOverlayProps>(
  function CardContentOverlay({
    item,
    colors,
    onBucketPress,
    hideButtons,
    onCardTap,
  }) {
    const { userLocation } = useUserLocation();
    const handleBucketPress = useCallback(() => {
      onBucketPress?.(item.id);
    }, [onBucketPress, item.id]);

    const formattedTags = useMemo(
      () => formatTags(item.tags || ""),
      [item.tags]
    );

    const renderTagBubbles = () => {
      if (!formattedTags || formattedTags.length === 0) return null;

      return (
        <View style={styles.tagsContainer}>
          {formattedTags.map((tag, index) => (
            <View key={index} style={styles.tagBubble}>
              <CustomText
                fontFamily="Inter-SemiBold"
                style={[styles.tagText, { color: colors.background }]}
              >
                {tag}
              </CustomText>
            </View>
          ))}
        </View>
      );
    };
    const handleCardTap = useCallback(() => {
      onCardTap?.(item);
    }, [onCardTap, item]);

    const renderCardContent = () => (
      <View style={styles.cardContent}>
        {item.isSponsored && (
          <CustomView
            bgColor={colors.background}
            style={[styles.sponsoredCard, { borderColor: colors.light_blue }]}
          >
            <SponsoredKevinSvg />
            <CustomText
              fontFamily="Inter-SemiBold"
              style={[styles.sponsoredText, { color: colors.light_blue }]}
            >
              SPONSORED
            </CustomText>
          </CustomView>
        )}
        <CustomText
          fontFamily="Inter-SemiBold"
          style={[styles.cardTitle, { color: colors.background }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {item.title}
        </CustomText>

        {/* <View style={styles.matchContainer}>
          <CustomText
            fontFamily="Inter-SemiBold"
            style={[styles.priceText, { color: colors.lime }]}
          >
            {formatSimilarity(item?.similarity)}
          </CustomText>
          <CustomText
            fontFamily="Inter-SemiBold"
            style={[styles.matchText, { color: colors.lime }]}
          >
            {"match"}
          </CustomText>
        </View> */}

        {/* Rating, Price, Distance OR Event DateTime */}
        <View style={styles.infoRow}>
          {(item.category === "event" || item.category === "events") &&
          item.eventDatetimeStart ? (
            // Show event datetime for events
            <>
              <CustomText
                fontFamily="Inter-Medium"
                style={[styles.infoText, { color: colors.background }]}
              >
                {formatEventDateTime(item.eventDatetimeStart, item.eventDatetimeEnd)}
              </CustomText>
              {formatPrice(item.price) && (
                <>
                  <View style={styles.dotSeparator}>
                    <View style={styles.whiteDot} />
                  </View>
                  <CustomText
                    fontFamily="Inter-Medium"
                    style={[styles.infoText, { color: colors.legal_green }]}
                  >
                    {formatPrice(item.price)}
                  </CustomText>
                </>
              )}
            </>
          ) : (
            // Show rating and distance for venues/experiences (no pricing)
            <>
              {item.rating && (
                <View style={styles.ratingContainer}>
                  <RatingStarSvg />
                  <CustomText
                    style={[styles.infoText, { color: colors.background }]}
                  >
                    {item.rating}
                  </CustomText>
                </View>
              )}

              {!!item.rating && shouldShowDistance(item.distance, userLocation) && (
                <View style={styles.dotSeparator}>
                  <View style={styles.whiteDot} />
                </View>
              )}
              {shouldShowDistance(item.distance, userLocation) && (
                <CustomText
                  style={[styles.infoText, { color: colors.background }]}
                >
                  {formatDistance(item.distance!)}
                </CustomText>
              )}
            </>
          )}
        </View>
        {(item.addressShort || item.address) && (
          <CustomText
            fontFamily="Inter-Medium"
            style={[styles.addressText, { color: colors.background }]}
          >
            {item.addressShort || item.address}
          </CustomText>
        )}

        {renderTagBubbles()}
      </View>
    );

    const renderTopRow = () => (
      <View style={styles.topRowContainer}>
        {item.category && (
          <CategoryTag
            style={styles.topTagContainer}
            category={item.category}
            colors={colors}
          />
        )}

        <CustomView bgColor={colors.overlay} style={styles.rightTopSection}>
          <CustomView bgColor={colors.overlay} style={styles.row}>
            {!hideButtons && (
              <>
                <TouchableOpacity
                  style={[
                    styles.bucketContainer,
                    { backgroundColor: colors.lime },
                  ]}
                  onPress={handleBucketPress}
                  activeOpacity={0.7}
                >
                  <PinBucketSvg />
                </TouchableOpacity>
                <CustomTouchable
                  bgColor={colors.lime}
                  style={styles.shareButton}
                >
                  <ShareButton
                    title={""}
                    message={`Check out this bucket: `}
                    url={item.contentShareUrl || ""}
                    IconComponent={() => (
                      <SendSvgSmall
                        width={18}
                        height={18}
                        stroke={colors.label_dark}
                      />
                    )}
                  />
                </CustomTouchable>
              </>
            )}
          </CustomView>
        </CustomView>
      </View>
    );

    return (
      <>
        {/* Render buttons outside of the gradient overlay */}
        {renderTopRow()}

        <LinearGradient
          colors={["rgba(242, 242, 243, 0)", "#0B2E34"]}
          style={styles.gradientOverlay}
        >
          <TouchableOpacity
            onPress={handleCardTap}
            activeOpacity={0.95}
            style={styles.cardTouchableArea}
          >
            {renderCardContent()}
          </TouchableOpacity>
        </LinearGradient>
      </>
    );
  }
);

const styles = StyleSheet.create({
  topRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(20),
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 10,
  },
  rightTopSection: {
    alignSelf: "flex-end",
  },
  topTagContainer: {
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  sponsoredCard: {
    paddingHorizontal: 9.35,
    paddingVertical: 9.35,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 6,
  },
  sponsoredText: {
    fontSize: scaleFontSize(10),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bucketContainer: {
    width: 30,
    height: 30,
    borderRadius: 1000,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    elevation: 20,
  },
  shareButton: {
    width: 30,
    height: 30,
    borderRadius: 1000,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    elevation: 20,
  },
  cardContent: {
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(20),
  },
  cardTitle: {
    fontSize: scaleFontSize(26),
    marginTop: verticalScale(8),
  },
  priceText: {
    fontSize: scaleFontSize(24),
  },
  perPersonText: {
    fontSize: scaleFontSize(12),
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  tagBubble: {
    display: "flex",
    paddingHorizontal: horizontalScale(9.35),
    paddingVertical: verticalScale(4.675),
    justifyContent: "center",
    alignItems: "center",
    gap: horizontalScale(11.687),
    borderRadius: 35.063,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
  tagText: {
    fontSize: scaleFontSize(12),
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
    justifyContent: "flex-end",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  sponsoredOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0B2E34",
    justifyContent: "flex-end",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  matchContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  matchText: {
    fontSize: scaleFontSize(12),
    marginLeft: horizontalScale(4), // Small spacing between percentage and "match"
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(4),
  },
  ratingText: {
    fontSize: scaleFontSize(16),
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: verticalScale(10),
  },
  infoText: {
    fontSize: scaleFontSize(14),
  },
  addressText: {
    fontSize: scaleFontSize(14),
    marginBottom: verticalScale(10),
  },
  dotSeparator: {
    paddingHorizontal: horizontalScale(6),
    justifyContent: "center",
    alignItems: "center",
  },
  whiteDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "white",
  },
  cardTouchableArea: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
  },
});
