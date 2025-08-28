import { useTheme } from "@/contexts/ThemeContext";
import React from "react";
import { StyleSheet } from "react-native";
import CustomView from "../CustomView";
import { verticalScale, horizontalScale } from "@/utilities/scaling";

interface ProgressBarProps {
  steps: number;
  currentStep: number;
}

export const OnboardingProgressBar: React.FC<ProgressBarProps> = ({
  steps,
  currentStep,
}) => {
  const { colors } = useTheme();

  return (
    <CustomView style={styles.container}>
      <CustomView style={styles.progressContainer}>
        {Array.from({ length: steps }, (_, index) => (
          <CustomView
            key={index}
            style={[
              styles.progressLine,
              {
                backgroundColor:
                  index <= currentStep ? colors.lime : colors.border_gray,
              },
            ]}
          />
        ))}
      </CustomView>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingBottom: verticalScale(16),
    paddingTop: verticalScale(4),
    flex: 1,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    width: "100%",
    gap: horizontalScale(6),
  },
  progressLine: {
    width: horizontalScale(30),
    height: verticalScale(5),
    borderRadius: 9.476,
    flexShrink: 0,
  },
});
