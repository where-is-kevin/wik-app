import React from "react";
import { StyleSheet, TouchableOpacity, View, Platform } from "react-native";
import CustomText from "../CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import { horizontalScale, scaleFontSize } from "@/utilities/scaling";

interface OnboardingTagProps {
  number: number;
  text: string;
  icon?: string;
  selected?: boolean;
  onPress?: () => void;
}

export const OnboardingTag: React.FC<OnboardingTagProps> = ({
  number,
  text,
  icon,
  selected = false,
  onPress,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: selected
            ? colors.light_blue
            : colors.onboarding_gray,
          borderColor: selected ? colors.light_blue : colors.border_gray,
        },
      ]}
      onPress={onPress}
    >
      {selected && (
        <View style={styles.numberContainer}>
          <CustomText
            style={[
              styles.numberText,
              Platform.OS === "android" && styles.numberTextAndroid,
            ]}
          >
            {number}
          </CustomText>
        </View>
      )}
      <View style={styles.contentContainer}>
        {icon && <CustomText style={styles.icon}>{icon}</CustomText>}
        <CustomText
          style={[
            styles.text,
            { color: selected ? "#FFF" : colors.label_dark },
          ]}
        >
          {text}
        </CustomText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 9.5,
    borderRadius: 28,
    borderWidth: 1,
  },
  numberContainer: {
    width: 18,
    height: 18,
    borderRadius: 36,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  numberText: {
    color: "#3C62FA",
    fontSize: scaleFontSize(14),
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
    lineHeight: scaleFontSize(14) * 1.1,
  },
  numberTextAndroid: {
    paddingTop: Platform.OS === "android" ? 1 : 0,
    marginTop: Platform.OS === "android" ? -1 : 0,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    fontSize: scaleFontSize(16),
    bottom: 2,
  },
  text: {
    fontSize: scaleFontSize(16),
    marginLeft: horizontalScale(6),
    flex: 1,
  },
});
