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
}

export const OnboardingOption: React.FC<OnboardingOptionProps> = ({
  text,
  selected = false,
  onPress,
}) => {
  const { colors } = useTheme();
  return (
    <CustomTouchable
      bgColor={selected ? colors.label_dark : colors.onboarding_gray}
      style={[styles.container, selected ? styles.containerSelected : {}]}
      onPress={onPress}
    >
      <View style={styles.textContainer}>
        <CustomText
          style={[
            styles.text,
            selected
              ? { color: colors.onboarding_option_white }
              : { color: colors.label_dark },
          ]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {text}
        </CustomText>
      </View>

      <View style={styles.iconContainer}>
        {selected ? <SuccessSvg /> : <PlusSvg />}
      </View>
    </CustomTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: verticalScale(55),
    paddingVertical: verticalScale(10),
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
  text: {
    fontSize: scaleFontSize(15),
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: horizontalScale(24),
  },
});
