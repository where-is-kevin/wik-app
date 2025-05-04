import { useTheme } from "@/contexts/ThemeContext";
import React from "react";
import { StyleSheet } from "react-native";
import CustomView from "../CustomView";
import { verticalScale } from "@/utilities/scaling";

interface ProgressBarProps {
  steps: number;
  currentStep: number;
}

export const OnboardingProgressBar: React.FC<ProgressBarProps> = ({
  steps,
  currentStep,
}) => {
  const { colors } = useTheme();
  const fillPercentage = ((currentStep + 1) / steps) * 100;

  return (
    <CustomView style={styles.container}>
      <CustomView bgColor={colors.onboarding_gray} style={styles.backgroundBar}>
        <CustomView
          style={[
            styles.fillBar,
            { width: `${fillPercentage}%`, backgroundColor: colors.link_blue },
          ]}
        />
      </CustomView>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: verticalScale(24),
  },
  backgroundBar: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  fillBar: {
    height: "100%",
    backgroundColor: "#3478F6", // Active blue color
    borderRadius: 4,
  },
});
