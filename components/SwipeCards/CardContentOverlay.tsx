// components/CardContentOverlay.tsx
import React, { useCallback, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import CustomText from "@/components/CustomText";
import CustomView from "../CustomView";
import CustomTouchable from "../CustomTouchableOpacity";
import BucketSvg from "../SvgComponents/BucketSvg";
import ShareButton from "../Button/ShareButton";
import CategoryTag from "../Tag/CategoryTag";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import { formatTags } from "@/utilities/formatTags";

interface CardData {
  id: string;
  title: string;
  imageUrl: string;
  price?: string;
  rating?: string;
  category?: string;
  address?: string;
  isSponsored?: boolean;
  contentShareUrl: string;
  tags?: string;
}

interface CardContentOverlayProps {
  item: CardData;
  colors: any;
  onBucketPress?: (value: string) => void;
  hideBucketsButton?: boolean;
}

export const CardContentOverlay = React.memo<CardContentOverlayProps>(
  ({ item, colors, onBucketPress, hideBucketsButton }) => {
    const handleBucketPress = useCallback(() => {
      onBucketPress?.(item.id);
    }, [onBucketPress, item.id]);

    const formattedTags = useMemo(
      () => formatTags(item.tags || ""),
      [item.tags]
    );

    const renderPriceOrRating = () => {
      if (item?.price) {
        return (
          <>
            {item.price}
            <CustomText
              fontFamily="Inter-SemiBold"
              style={[styles.perPersonText, { color: colors.lime }]}
            >
              {" "}
              /person
            </CustomText>
          </>
        );
      }

      if (item?.rating) {
        return `${item.rating}★`;
      }

      return "No rating";
    };

    const renderCardContent = () => (
      <View style={styles.cardContent}>
        <CustomText
          fontFamily="Inter-SemiBold"
          style={[styles.cardTitle, { color: colors.background }]}
        >
          {item.title}
        </CustomText>

        <CustomText
          fontFamily="Inter-SemiBold"
          style={[styles.priceText, { color: colors.lime }]}
        >
          {renderPriceOrRating()}
        </CustomText>

        {item.address && (
          <CustomText
            fontFamily="Inter-SemiBold"
            style={[styles.addressText, { color: colors.background }]}
          >
            {item.address}
          </CustomText>
        )}

        {formattedTags && (
          <CustomText
            fontFamily="Inter-SemiBold"
            style={[styles.addressText, { color: colors.background }]}
          >
            {formattedTags}
          </CustomText>
        )}
      </View>
    );

    const renderTopRow = () => (
      <View style={styles.topRowContainer}>
        <View style={styles.leftTopSection}>
          {item.category && (
            <CategoryTag
              style={styles.topTagContainer}
              category={item.category}
              colors={colors}
            />
          )}
          {item.isSponsored && (
            <CustomView bgColor={colors.lime} style={styles.topExperienceTag}>
              <CustomText
                fontFamily="Inter-SemiBold"
                style={styles.topExperienceText}
              >
                SPONSORED
              </CustomText>
            </CustomView>
          )}
        </View>

        <CustomView bgColor={colors.overlay} style={styles.rightTopSection}>
          <CustomView bgColor={colors.overlay} style={styles.row}>
            {!hideBucketsButton && (
              <CustomTouchable
                style={styles.bucketContainer}
                bgColor={colors.label_dark}
                onPress={handleBucketPress}
              >
                <BucketSvg />
              </CustomTouchable>
            )}
            <CustomTouchable
              bgColor={colors.onboarding_gray}
              style={styles.shareButton}
            >
              <ShareButton
                width={14}
                height={14}
                title={""}
                message={`Check out this bucket: `}
                url={item.contentShareUrl || ""}
              />
            </CustomTouchable>
          </CustomView>
        </CustomView>
      </View>
    );

    if (item.isSponsored) {
      return (
        <>
          {renderTopRow()}
          <View style={styles.sponsoredOverlay}>{renderCardContent()}</View>
        </>
      );
    }

    return (
      <>
        {renderTopRow()}
        <LinearGradient
          colors={["rgba(242, 242, 243, 0)", "#0B2E34"]}
          style={styles.gradientOverlay}
        >
          {renderCardContent()}
        </LinearGradient>
      </>
    );
  }
);

const styles = StyleSheet.create({
  topRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: horizontalScale(12),
    paddingTop: verticalScale(16),
    zIndex: 1000,
  },
  leftTopSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(8),
    flex: 1,
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
    minHeight: verticalScale(24),
  },
  topExperienceTag: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    minHeight: verticalScale(24),
  },
  topExperienceText: {
    color: "#0B2E34",
    fontSize: scaleFontSize(10),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bucketContainer: {
    width: 36,
    height: 36,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  shareButton: {
    width: 36,
    height: 36,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    padding: horizontalScale(12),
    paddingBottom: verticalScale(16),
  },
  cardTitle: {
    fontSize: scaleFontSize(24),
    marginBottom: verticalScale(6),
  },
  priceText: {
    fontSize: scaleFontSize(24),
    marginTop: verticalScale(6),
    marginBottom: verticalScale(6),
  },
  perPersonText: {
    fontSize: scaleFontSize(12),
  },
  addressText: {
    fontSize: scaleFontSize(14),
    marginTop: verticalScale(6),
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
    justifyContent: "flex-end",
  },
  sponsoredOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0B2E34",
    justifyContent: "flex-end",
  },
});
