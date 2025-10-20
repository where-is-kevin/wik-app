import React from "react";
import { StyleSheet } from "react-native";
import CustomView from "@/components/CustomView";
import CustomText from "@/components/CustomText";
import CustomTouchable from "@/components/CustomTouchableOpacity";
import {
  horizontalScale,
  verticalScale,
  scaleFontSize,
} from "@/utilities/scaling";
import { useTheme } from "@/contexts/ThemeContext";
import TapSvg from "@/components/SvgComponents/TapSvg";
import SwipeUpSvg from "@/components/SvgComponents/SwipeUpSvg";
import SwipeLeftSvg from "@/components/SvgComponents/SwipeLeftSvg";
import SwipeRightSvg from "@/components/SvgComponents/SwipeRightSvg";

interface SwipeCardTooltipsProps {
  onComplete: () => void;
}

const SwipeCardTooltips = ({ onComplete }: SwipeCardTooltipsProps) => {
  const { colors } = useTheme();

  return (
    <CustomTouchable
      style={styles.overlay}
      bgColor="rgba(0, 0, 0, 0.7)"
      onPress={onComplete}
      activeOpacity={1}
    >
      {/* Tutorial overlay covering entire card area */}
      <CustomView style={styles.tutorialOverlay} bgColor="transparent">
        {/* Dashed lines - using multiple segments for dashed effect */}
        {/* Top horizontal dashed line */}
        <CustomView
          style={styles.horizontalLineContainer}
          bgColor="transparent"
        >
          {Array.from({ length: 15 }).map((_, index) => (
            <CustomView
              key={`top-${index}`}
              style={styles.dashSegment}
              bgColor="rgba(255, 255, 255, 0.7)"
            />
          ))}
        </CustomView>

        {/* Bottom horizontal dashed line */}
        <CustomView
          style={styles.horizontalLineBottomContainer}
          bgColor="transparent"
        >
          {Array.from({ length: 15 }).map((_, index) => (
            <CustomView
              key={`bottom-${index}`}
              style={styles.dashSegment}
              bgColor="rgba(255, 255, 255, 0.7)"
            />
          ))}
        </CustomView>

        {/* Vertical dashed line */}
        <CustomView style={styles.verticalLineContainer} bgColor="transparent">
          {Array.from({ length: 12 }).map((_, index) => (
            <CustomView
              key={`vertical-${index}`}
              style={styles.verticalDashSegment}
              bgColor="rgba(255, 255, 255, 0.7)"
            />
          ))}
        </CustomView>

        {/* Swipe Up - Top center */}
        <CustomView style={styles.topGesture} bgColor="transparent">
          <SwipeUpSvg />
          <CustomText
            fontFamily="Inter-SemiBold"
            style={[styles.actionText, { color: colors.background }]}
          >
            VISIT
          </CustomText>
        </CustomView>

        {/* Swipe Left - Left center */}
        <CustomView style={styles.leftGesture} bgColor="transparent">
          <SwipeLeftSvg />
          <CustomText
            fontFamily="Inter-SemiBold"
            style={[styles.actionText, { color: colors.background }]}
          >
            PASS
          </CustomText>
        </CustomView>

        {/* Swipe Right - Right center */}
        <CustomView style={styles.rightGesture} bgColor="transparent">
          <SwipeRightSvg />
          <CustomText
            fontFamily="Inter-SemiBold"
            style={[styles.actionText, { color: colors.background }]}
          >
            LIKE
          </CustomText>
        </CustomView>

        {/* Tap - Bottom center */}
        <CustomView style={styles.bottomGesture} bgColor="transparent">
          <TapSvg />
          <CustomText
            fontFamily="Inter-SemiBold"
            style={[styles.actionText, { color: colors.background }]}
          >
            LEARN MORE
          </CustomText>
        </CustomView>
      </CustomView>
    </CustomTouchable>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: verticalScale(0), // Adjust top position to better align with card
    left: horizontalScale(24), // Match renderCardContainer paddingHorizontal
    right: horizontalScale(24), // Match renderCardContainer paddingHorizontal
    bottom: verticalScale(15), // Slightly more bottom margin to account for card positioning
    zIndex: 1000,
    borderRadius: 16,
  },
  title: {
    fontSize: scaleFontSize(28),
    textAlign: "center",
    marginBottom: verticalScale(8),
  },
  subtitle: {
    fontSize: scaleFontSize(16),
    textAlign: "center",
    maxWidth: horizontalScale(280),
  },
  tutorialOverlay: {
    flex: 1,
    position: "relative",
  },
  horizontalLineContainer: {
    position: "absolute",
    top: "22%",
    left: 0,
    right: 0,
    height: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  horizontalLineBottomContainer: {
    position: "absolute",
    bottom: "22%",
    left: 0,
    right: 0,
    height: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  verticalLineContainer: {
    position: "absolute",
    left: "50%",
    top: "22%",
    bottom: "22%",
    width: 1,
    marginLeft: -0.5,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dashSegment: {
    width: horizontalScale(12),
    height: 1,
  },
  verticalDashSegment: {
    width: 1,
    height: verticalScale(8),
  },
  topGesture: {
    position: "absolute",
    top: "4%",
    alignSelf: "center",
    alignItems: "center",
  },
  leftGesture: {
    position: "absolute",
    left: horizontalScale(20),
    top: "50%",
    alignItems: "center",
    transform: [{ translateY: -25 }],
  },
  rightGesture: {
    position: "absolute",
    right: horizontalScale(20),
    top: "50%",
    alignItems: "center",
    transform: [{ translateY: -25 }],
  },
  bottomGesture: {
    position: "absolute",
    bottom: "4%",
    alignSelf: "center",
    alignItems: "center",
  },
  actionText: {
    fontSize: scaleFontSize(12),
    textAlign: "center",
    marginTop: 10,
  },
});

export default SwipeCardTooltips;
