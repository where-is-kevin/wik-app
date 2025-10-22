import React from "react";
import { StyleSheet } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import CustomView from "../CustomView";
import { HeartButton } from "../HeartButton/HeartButton";
import {
  horizontalScale,
  verticalScale,
} from "@/utilities/scaling";

interface FloatingHeartButtonProps {
  isLiked: boolean;
  onPress: () => void;
  bottom?: number; // Custom bottom position (default: 24)
  right?: number; // Custom right position (default: 24)
  size?: number; // Heart icon size (default: 25)
  buttonSize?: number; // Button container size (default: 50)
  showFlyingAnimation?: boolean; // Show flying heart animation (default: true)
  hasTabBar?: boolean; // Has tab bar for toast positioning (default: false)
  backgroundColor?: string; // Custom background color (default: light_blue)
  zIndex?: number; // Custom z-index (default: 20)
}

export const FloatingHeartButton: React.FC<FloatingHeartButtonProps> = ({
  isLiked,
  onPress,
  bottom = 24,
  right = 24,
  size = 25,
  buttonSize = 50,
  showFlyingAnimation = true,
  hasTabBar = false,
  backgroundColor,
  zIndex = 20,
}) => {
  const { colors } = useTheme();

  const dynamicStyles = StyleSheet.create({
    floatingButton: {
      position: "absolute",
      bottom: verticalScale(bottom),
      right: horizontalScale(right),
      width: buttonSize,
      height: buttonSize,
      borderRadius: buttonSize / 2,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#131314",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 8, // For Android shadow
      zIndex: zIndex,
    },
    heartContainer: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
  });

  return (
    <CustomView
      style={[
        dynamicStyles.floatingButton,
        { backgroundColor: backgroundColor || colors.light_blue },
      ]}
    >
      <HeartButton
        isLiked={isLiked}
        onPress={onPress}
        size={size}
        color={colors.lime}
        style={dynamicStyles.heartContainer}
        showFlyingAnimation={showFlyingAnimation}
        hasTabBar={hasTabBar}
      />
    </CustomView>
  );
};