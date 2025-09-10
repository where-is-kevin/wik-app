import {
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TextStyle,
} from "react-native";
import React from "react";
import { scaleFontSize, verticalScale } from "@/utilities/scaling";
import CustomText from "../CustomText";
import { useTheme } from "@/contexts/ThemeContext";

interface NextButtonProps {
  title?: string;
  onPress: () => void;
  disabled?: boolean;
  customStyles?: ViewStyle | ViewStyle[];
  bgColor?: string;
  textColor?: string;
  customTextStyle?: TextStyle;
}

const NextButton = ({
  title = "Next",
  onPress,
  disabled = false,
  customStyles,
  bgColor,
  textColor,
  customTextStyle,
}: NextButtonProps) => {
  const { colors } = useTheme();
  const backgroundColor = bgColor !== undefined ? bgColor : colors.background;
  const customTextColor =
    textColor !== undefined ? textColor : colors.label_dark;

  return (
    <TouchableOpacity
      style={[
        styles.nextButton,
        customStyles,
        backgroundColor !== null && { backgroundColor },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <CustomText
        fontFamily="Inter-SemiBold"
        style={[
          styles.nextButtonText,
          customTextColor !== null && { color: customTextColor },
          customTextStyle,
        ]}
      >
        {title || ""}
      </CustomText>
    </TouchableOpacity>
  );
};

export default NextButton;

const styles = StyleSheet.create({
  nextButton: {
    backgroundColor: "#DEFF0A",
    paddingVertical: verticalScale(12),
    borderRadius: 8,
    alignItems: "center",
    // marginVertical: verticalScale(4),
  },
  nextButtonDisabled: {
    opacity: 0.7,
  },
  nextButtonText: {
    fontSize: scaleFontSize(18),
  },
});
