import React from "react";
import CustomView from "../CustomView";
import LottieView from "lottie-react-native";
import { StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface AnimatedLoaderProps {
  customAnimationStyle?: ViewStyle | ViewStyle[];
}
const AnimatedLoader = ({customAnimationStyle}: AnimatedLoaderProps) => {
  const { colors } = useTheme();
  return (
    <CustomView bgColor={colors.overlay} style={styles.container}>
      <LottieView
        source={require("@/assets/animations/kevin-loader.lottie")}
        autoPlay
        loop
        style={[styles.animation, customAnimationStyle]}
      />
    </CustomView>
  );
};

export default AnimatedLoader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  animation: {
    width: 120,
    height: 120,
  },
});
