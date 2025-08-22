import React from "react";
import { StyleSheet } from "react-native";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import { verticalScale } from "@/utilities/scaling";
import { OnboardingStep } from "@/constants/onboardingSlides";
import { commonOnboardingStyles } from "./OnboardingStyles";
import { OnboardingSearch } from "./OnboardingSearch";

interface OnboardingTravelNameSlideProps {
  stepData: OnboardingStep;
  name: string;
  onNameChange: (name: string) => void;
}

export const OnboardingTravelNameSlide: React.FC<
  OnboardingTravelNameSlideProps
> = ({ stepData, name, onNameChange }) => {
  const { colors } = useTheme();

  return (
    <CustomView style={commonOnboardingStyles.content}>
      <CustomText
        fontFamily="Inter-SemiBold"
        style={[commonOnboardingStyles.title, { color: colors.label_dark }]}
      >
        {stepData.title}
      </CustomText>
      <CustomText
        style={[
          commonOnboardingStyles.subtitle,
          { color: colors.gray_regular, marginBottom: verticalScale(32) },
        ]}
      >
        {stepData.subtitle}
      </CustomText>

      <OnboardingSearch
        value={name}
        onChangeText={onNameChange}
        placeholder="Enter your full name"
        autoCapitalize="words"
        autoCorrect={false}
        showIcon={false}
      />
    </CustomView>
  );
};

const styles = StyleSheet.create({});
