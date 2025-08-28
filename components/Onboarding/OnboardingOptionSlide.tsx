import React from "react";
import { StyleSheet } from "react-native";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import { OnboardingOption } from "./OnboardingOption";
import { OnboardingStep } from "@/constants/onboardingSlides";
import { commonOnboardingStyles } from "./OnboardingStyles";

interface OnboardingOptionSlideProps {
  stepData: OnboardingStep;
  selectedIndices: number[];
  onSelection: (index: number) => void;
}

export const OnboardingOptionSlide: React.FC<OnboardingOptionSlideProps> = ({
  stepData,
  selectedIndices,
  onSelection,
}) => {
  const { colors } = useTheme();

  return (
    <CustomView style={commonOnboardingStyles.content}>
      <CustomText
        fontFamily="Inter-SemiBold"
        style={[commonOnboardingStyles.title, { color: colors.label_dark }]}
      >
        {stepData.title}
      </CustomText>
      <CustomText style={[commonOnboardingStyles.subtitle, { color: colors.gray_regular }]}>
        {stepData.subtitle}
      </CustomText>

      <CustomView style={styles.optionsContainer}>
        {stepData.options.map((option, index) => (
          <OnboardingOption
            key={index}
            text={option}
            selected={selectedIndices.includes(index)}
            onPress={() => onSelection(index)}
            allowMultipleSelections={stepData.allowMultipleSelections}
          />
        ))}
      </CustomView>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  optionsContainer: {
    width: "100%",
    justifyContent: "center",
    flex: 1,
  },
});