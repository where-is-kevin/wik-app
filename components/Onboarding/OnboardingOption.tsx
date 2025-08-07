import React from "react";
import { StyleSheet, View } from "react-native";
import SuccessSvg from "../SvgComponents/SuccessSvg";
import PlusSvg from "../SvgComponents/PlusSvg";
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
      bgColor={selected ? colors.label_dark : colors.onboarding_gray}
      style={[styles.container, selected ? styles.containerSelected : {}]}
      onPress={onPress}
    >
      <View
        style={[
          styles.textContainer,
          !(selected || allowMultipleSelections)
            ? styles.textContainerFullWidth
            : {},
        ]}
      >
        <CustomText
          style={[
            styles.text,
            selected
              ? { color: colors.onboarding_option_white }
              : { color: colors.label_dark },
          ]}
          numberOfLines={3}
          ellipsizeMode="tail"
        >
          {text}
        </CustomText>
      </View>

      {(selected || allowMultipleSelections) && (
        <View style={styles.iconContainer}>
          {selected ? <SuccessSvg /> : <PlusSvg />}
        </View>
      )}
    </CustomTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 60,
    paddingVertical: verticalScale(12), // Added vertical padding
    paddingHorizontal: horizontalScale(20),
    borderRadius: 31,
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: "#D6D6D9",
  },
  containerSelected: {
    borderColor: "#000",
  },
  textContainer: {
    flex: 1,
    maxWidth: "80%",
    justifyContent: "center",
  },
  textContainerFullWidth: {
    maxWidth: "100%",
  },
  text: {
    fontSize: scaleFontSize(15),
    lineHeight: scaleFontSize(20), // Added explicit line height
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: horizontalScale(24),
  },
});
