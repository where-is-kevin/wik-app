import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { scaleFontSize, verticalScale } from "@/utilities/scaling";
import CustomText from "../CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import HeartFullSvg from "../SvgComponents/HeartFullSvg";

interface ToastProps {
  visible: boolean;
  message: string;
  duration?: number;
  onHide?: () => void;
  type?: "success" | "error" | "info";
  hasTabBar?: boolean;
}

const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  duration = 3000,
  onHide,
  type = "success",
  hasTabBar = true,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // For Android, start with smaller translateY to reduce flash
  const translateY = useRef(
    new Animated.Value(Platform.OS === "android" ? 20 : 50)
  ).current;
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  // Calculate bottom position like FloatingMapButton
  const getBottomPosition = () => {
    return hasTabBar
      ? insets.bottom > 0
        ? insets.bottom + verticalScale(60) // With tab bar: above tab bar
        : verticalScale(80)
      : insets.bottom > 0
      ? insets.bottom + verticalScale(24) // Without tab bar: closer to bottom
      : verticalScale(30);
  };

  const handleDismiss = () => {
    // Animate out and then call onHide
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: Platform.OS === "android" ? 250 : 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: Platform.OS === "android" ? 20 : 50,
        duration: Platform.OS === "android" ? 250 : 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide?.();
    });
  };

  useEffect(() => {
    if (visible) {
      // Slide in and fade in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: Platform.OS === "android" ? 200 : 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: Platform.OS === "android" ? 20 : 50,
            duration: Platform.OS === "android" ? 200 : 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onHide?.();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, fadeAnim, translateY, onHide]);

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <HeartFullSvg />;
      case "error":
        return <Ionicons name="close-circle" size={24} color="#000" />;
      case "info":
        return <Ionicons name="information-circle" size={24} color="#000" />;
      default:
        return <Ionicons name="checkmark-circle" size={24} color="#000" />;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
          bottom: getBottomPosition(),
        },
      ]}
    >
      <TouchableOpacity
        style={styles.toast}
        onPress={handleDismiss}
        activeOpacity={0.9}
      >
        {getIcon()}
        <CustomText style={[styles.message, { color: colors.label_dark }]}>
          {message}
        </CustomText>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 10,
    right: 10,
    alignItems: "center",
    zIndex: 9999,
    // Prevent Android flash issues
    ...Platform.select({
      android: {
        // Completely remove background on container
        // Let the toast handle its own background
      },
      ios: {
        // iOS can handle transparency better
      },
    }),
  },
  toast: {
    backgroundColor: "#FFF",
    paddingVertical: verticalScale(10),
    paddingHorizontal: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    width: "100%",
    ...Platform.select({
      ios: {
        shadowColor: "rgba(19, 19, 20, 0.50)",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 10,
      },
      android: {
        // NO elevation - causes white flash with animations
        elevation: 0,
        shadowOpacity: 0,
        // Use only border for definition
        borderWidth: 1,
        borderColor: "rgba(0, 0, 0, 0.15)",
        // Force solid background with no transparency
        backgroundColor: "#FFFFFF",
        // Critical: prevent any overflow compositing
        overflow: "hidden",
      },
    }),
  },
  message: {
    fontSize: scaleFontSize(14),
    flex: 1,
  },
});

export default Toast;
