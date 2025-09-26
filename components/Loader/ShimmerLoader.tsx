import React, { useEffect, useRef } from "react";
import { Animated, DimensionValue, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/contexts/ThemeContext";

interface ShimmerLoaderProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
}

const ShimmerLoader: React.FC<ShimmerLoaderProps> = ({
  width = "100%",
  height = "100%",
  borderRadius = 16,
}) => {
  const { colors } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1200, // Faster animation - more responsive feel
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-400, 400], // Wider sweep for smoother effect
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.border_gray || "#F0F0F0",
        },
      ]}
    >
      <Animated.View
        style={[
          styles.shimmerOverlay,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            "rgba(255, 255, 255, 0)",
            "rgba(255, 255, 255, 0.2)",
            "rgba(255, 255, 255, 0.5)",
            "rgba(255, 255, 255, 0.8)",
            "rgba(255, 255, 255, 0.5)",
            "rgba(255, 255, 255, 0.2)",
            "rgba(255, 255, 255, 0)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  shimmerOverlay: {
    position: "absolute",
    top: 0,
    left: -150,
    right: -150,
    bottom: 0,
  },
  gradient: {
    width: 300,
    height: "100%",
  },
});

export default ShimmerLoader;