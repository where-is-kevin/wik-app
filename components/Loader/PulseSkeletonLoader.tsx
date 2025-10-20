import React, { useEffect, useRef } from "react";
import { Animated, DimensionValue } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface PulseSkeletonLoaderProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
}

const PulseSkeletonLoader: React.FC<PulseSkeletonLoaderProps> = ({
  width = "100%",
  height = "100%",
  borderRadius,
}) => {
  const { colors } = useTheme();
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const finalBorderRadius = borderRadius ?? 8;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    
    pulse.start();

    return () => {
      pulse.stop();
    };
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        {
          backgroundColor: colors.border_gray,
          width,
          height,
          borderRadius: finalBorderRadius,
          opacity: pulseAnim,
        },
      ]}
    />
  );
};

export default PulseSkeletonLoader;