import React, { useState, useEffect } from "react";
import { TouchableOpacity, StyleSheet, Keyboard, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomText from "@/components/CustomText";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import { useTheme } from "@/contexts/ThemeContext";
import CustomTouchable from "./CustomTouchableOpacity";

interface FloatingMapButtonProps {
  onPress: () => void;
}

const FloatingMapButton: React.FC<FloatingMapButtonProps> = ({ onPress }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true)
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide", 
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <CustomTouchable
      bgColor={colors.light_blue}
      style={[
        styles.floatingButton,
        {
          bottom:
            insets.bottom > 0
              ? insets.bottom + verticalScale(20)
              : verticalScale(20),
          zIndex: keyboardVisible ? -1 : 1000,
          opacity: keyboardVisible ? 0.3 : 1,
        },
      ]}
      onPress={onPress}
    >
      <CustomText
        fontFamily="Inter-Medium"
        style={[styles.buttonText, { color: colors.text_white }]}
      >
        Map
      </CustomText>
      <Ionicons name="map-outline" size={20} color="#fff" style={styles.icon} />
    </CustomTouchable>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -45 }],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(5),
    paddingHorizontal: horizontalScale(15),
    borderRadius: 50,
  },
  icon: {
    marginLeft: 6,
  },
  buttonText: {
    fontSize: scaleFontSize(12),
  },
});

export default FloatingMapButton;
