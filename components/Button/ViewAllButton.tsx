import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import CustomText from "@/components/CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import { scaleFontSize } from "@/utilities/scaling";

interface ViewAllButtonProps {
  onPress: () => void;
  text?: string;
  style?: any;
  textStyle?: any;
  activeOpacity?: number;
}

export const ViewAllButton: React.FC<ViewAllButtonProps> = ({
  onPress,
  text = "View all",
  style,
  textStyle,
  activeOpacity = 0.7,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={activeOpacity}
      style={[styles.container, style]}
    >
      <CustomText
        style={[
          styles.text,
          { color: colors.light_blue },
          textStyle,
        ]}
      >
        {text}
      </CustomText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    // No default styles for maximum flexibility
  },
  text: {
    fontSize: scaleFontSize(14),
  },
});