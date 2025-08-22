import React from "react";
import { StyleSheet } from "react-native";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import LottieView from "lottie-react-native";
import OnboardingAnimationEnd from "@/assets/animations/onboarding-animation-end.json";
import { OnboardingStep } from "@/constants/onboardingSlides";

interface OnboardingFinalSlideProps {
  stepData: OnboardingStep;
}

export const OnboardingFinalSlide: React.FC<OnboardingFinalSlideProps> = ({
  stepData,
}) => {
  const { colors } = useTheme();

  return (
    <CustomView style={styles.contentEnd}>
      <CustomView style={styles.centeredContent}>
        <LottieView
          source={OnboardingAnimationEnd}
          autoPlay
          loop
          style={styles.logoEnd}
        />
        <CustomText
          fontFamily="Inter-SemiBold"
          style={[styles.endTitle, { color: colors.label_dark }]}
        >
          {stepData.title}
        </CustomText>
        <CustomText
          style={[styles.endSubtitle, { color: colors.gray_regular }]}
        >
          {stepData.subtitle}
        </CustomText>
      </CustomView>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  contentEnd: {
    flex: 1,
    paddingHorizontal: horizontalScale(24),
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 0,
    paddingBottom: verticalScale(24),
  },
  centeredContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoEnd: {
    width: 240,
    height: 240,
  },
  endTitle: {
    fontSize: scaleFontSize(20),
    marginBottom: verticalScale(8),
    textAlign: "center",
  },
  endSubtitle: {
    fontSize: scaleFontSize(14),
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: horizontalScale(20),
  },
});
