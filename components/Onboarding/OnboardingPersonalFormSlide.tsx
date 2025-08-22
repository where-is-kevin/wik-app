import React from "react";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import { scaleFontSize, verticalScale } from "@/utilities/scaling";
import { OnboardingForm, PersonalFormData } from "./OnboardingForm";
import { OnboardingStep } from "@/constants/onboardingSlides";
import { commonOnboardingStyles } from "./OnboardingStyles";

interface OnboardingPersonalFormSlideProps {
  stepData: OnboardingStep;
  formData: PersonalFormData;
  onFormChange: (formData: PersonalFormData) => void;
  onNext: () => void;
}

export const OnboardingPersonalFormSlide: React.FC<OnboardingPersonalFormSlideProps> = ({
  stepData,
  formData,
  onFormChange,
  onNext,
}) => {
  const { colors } = useTheme();

  return (
    <CustomView style={commonOnboardingStyles.content}>
      <CustomText
        fontFamily="Inter-SemiBold"
        style={[styles.formTitle, { color: colors.label_dark }]}
      >
        {stepData.subtitle}
      </CustomText>
      <CustomText
        style={[styles.formSubtitle, { color: colors.gray_regular }]}
      >
        {stepData.title}
      </CustomText>

      <OnboardingForm
        onPressNext={onNext}
        formData={formData}
        onFormChange={onFormChange}
      />
    </CustomView>
  );
};

const styles = {
  formTitle: {
    fontSize: scaleFontSize(18),
    textAlign: "center" as const,
    marginBottom: verticalScale(8),
  },
  formSubtitle: {
    fontSize: scaleFontSize(14),
    marginBottom: verticalScale(24),
    textAlign: "center" as const,
  },
};