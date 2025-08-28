import React from "react";
import { StyleSheet, View } from "react-native";
import SuccessSvg from "../SvgComponents/SuccessSvg";
import PlusSvg from "../SvgComponents/PlusSvg";
import CheckboxSvg from "../SvgComponents/CheckboxSvg";
import CustomTouchable from "../CustomTouchableOpacity";
import CustomText from "../CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";

interface OnboardingOptionProps {
  text: string;
  selected?: boolean;
  onPress: () => void;
  allowMultipleSelections?: boolean;
}

export const OnboardingOption: React.FC<OnboardingOptionProps> = ({
  text,
  selected = false,
  onPress,
  allowMultipleSelections = false,
}) => {
  const { colors } = useTheme();
  return (
    <CustomTouchable
      bgColor={selected ? "#DAE1FF" : colors.onboarding_gray}
      style={[styles.container, selected ? styles.containerSelected : {}]}
      onPress={onPress}
    >
      <View style={styles.checkboxContainer}>
        <CheckboxSvg selected={selected} />
      </View>
      <View style={styles.textContainer}>
        <CustomText
          style={[
            styles.text,
            selected
              ? { color: colors.label_dark }
              : { color: colors.label_dark },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {text}
        </CustomText>
      </View>
    </CustomTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    paddingVertical: 10, // Added vertical padding
    paddingLeft: 28,
    borderRadius: 31,
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: "#D6D6D9",
    alignSelf: "center",
  },
  containerSelected: {
    borderColor: "#3C62FA",
    borderWidth: 2,
  },
  checkboxContainer: {
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  text: {
    fontSize: scaleFontSize(16),
    bottom: 1,
  },
});
