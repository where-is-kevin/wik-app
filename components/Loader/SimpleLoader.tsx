import React, { useEffect, useRef } from "react";
import { Animated, DimensionValue } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface SimpleLoaderProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
}

const SimpleLoader: React.FC<SimpleLoaderProps> = ({
  width = "100%",
  height = "100%",
  borderRadius = 8,
}) => {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.8,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [fadeAnim]);

  return (
    <Animated.View
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: colors.border_gray || "#D1D5DB",
        opacity: fadeAnim,
      }}
    />
  );
};

export default SimpleLoader;