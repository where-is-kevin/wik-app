import React from "react";
import { StyleSheet } from "react-native";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import CustomTouchable from "../CustomTouchableOpacity";
import { useTheme } from "@/contexts/ThemeContext";
import { horizontalScale, verticalScale } from "@/utilities/scaling";
import LottieView from "lottie-react-native";
import OnboardingAnimationStart from "@/assets/animations/onboarding-animation-start.json";
import { OnboardingStep } from "@/constants/onboardingSlides";
import { commonOnboardingStyles } from "./OnboardingStyles";

interface OnboardingLogoSlideProps {
  stepData: OnboardingStep;
  selectedIndices: number[];
  onSelection: (index: number) => void;
}

export const OnboardingLogoSlide: React.FC<OnboardingLogoSlideProps> = ({
  stepData,
  selectedIndices,
  onSelection,
}) => {
  const { colors } = useTheme();

  return (
    <CustomView style={styles.logoContent}>
      <CustomView>
        <CustomText
          fontFamily="Inter-SemiBold"
          style={[commonOnboardingStyles.title, { color: colors.label_dark }]}
        >
          {stepData.title}
        </CustomText>
        <CustomText style={[commonOnboardingStyles.subtitle, { color: colors.gray_regular }]}>
          {stepData.subtitle}
        </CustomText>
        <LottieView
          source={OnboardingAnimationStart}
          autoPlay
          loop
          style={styles.logo}
        />
      </CustomView>

      <CustomView style={styles.travelOptionContainer}>
        {stepData.options.map((option, index) => (
          <CustomTouchable
            key={index}
            style={[
              commonOnboardingStyles.selectionButton,
              commonOnboardingStyles.businessButton,
              selectedIndices.includes(index) ? commonOnboardingStyles.selectedButton : {},
            ]}
            bgColor={
              selectedIndices.includes(index)
                ? "#DAE1FF"
                : colors.onboarding_gray
            }
            onPress={() => onSelection(index)}
          >
            <CustomText
              style={[
                commonOnboardingStyles.selectionButtonText,
                { color: colors.label_dark },
              ]}
            >
              {option}
            </CustomText>
          </CustomTouchable>
        ))}
      </CustomView>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  logoContent: {
    flex: 1,
    paddingHorizontal: horizontalScale(24),
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(20),
  },
  logo: {
    width: 240,
    height: 240,
    marginTop: verticalScale(30),
    marginBottom: verticalScale(50),
    alignSelf: "center",
  },
  travelOptionContainer: {
    width: "100%",
    flex: 1,
  },
});