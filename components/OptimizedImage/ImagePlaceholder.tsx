import React from "react";
import { View, StyleSheet } from "react-native";
import ImagePlaceholderSvg from "@/components/SvgComponents/ImagePlaceholderSvg";

interface ImagePlaceholderProps {
  containerWidth?: number;
  containerHeight?: number;
  backgroundColor?: string;
  iconColor?: string;
  borderRadius?: number;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  containerWidth,
  containerHeight,
  backgroundColor = "#F5F5F5",
  iconColor = "#9CA3AF",
  borderRadius,
}) => {
  // Calculate icon size based on container dimensions
  const getIconSize = () => {
    if (!containerWidth || !containerHeight) {
      return 80; // Increased default size
    }

    const minDimension = Math.min(containerWidth, containerHeight);
    // Scale icon size based on container size - much larger for big containers
    if (minDimension <= 80) return 40;
    if (minDimension <= 120) return 56;
    if (minDimension <= 180) return 72;
    if (minDimension <= 250) return 88;
    if (minDimension <= 350) return 200;
    if (minDimension <= 500) return 140; // For large hero images
    return 140; // For very large containers
  };

  const iconSize = getIconSize();

  return (
    <View style={[styles.container, { backgroundColor, borderRadius }]}>
      <ImagePlaceholderSvg
        width={iconSize}
        height={iconSize}
        backgroundColor="transparent"
        iconColor={iconColor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});
