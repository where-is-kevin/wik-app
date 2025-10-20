import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, TouchableWithoutFeedback, Keyboard } from "react-native";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import { verticalScale } from "@/utilities/scaling";
import { OnboardingStep } from "@/constants/onboardingSlides";
import { commonOnboardingStyles } from "./OnboardingStyles";
import { OnboardingSearch } from "./OnboardingSearch";

interface OnboardingTravelEmailSlideProps {
  stepData: OnboardingStep;
  email: string;
  onEmailChange: (email: string) => void;
  firstName?: string;
}

export const OnboardingTravelEmailSlide: React.FC<
  OnboardingTravelEmailSlideProps
> = ({ stepData, email, onEmailChange, firstName }) => {
  const { colors } = useTheme();
  const [emailError, setEmailError] = useState<string>("");
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  const validateEmail = useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email.trim()) {
      return "Email is required";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  }, []);

  const handleEmailChange = (text: string) => {
    onEmailChange(text);
    
    if (hasInteracted) {
      const error = validateEmail(text);
      setEmailError(error);
    }
  };

  const handleBlur = () => {
    setHasInteracted(true);
    const error = validateEmail(email);
    setEmailError(error);
  };

  useEffect(() => {
    if (hasInteracted) {
      const error = validateEmail(email);
      setEmailError(error);
    }
  }, [email, hasInteracted, validateEmail]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <CustomView style={commonOnboardingStyles.content}>
      <CustomText
        fontFamily="Inter-SemiBold"
        style={[commonOnboardingStyles.title, { color: colors.label_dark }]}
      >
        {firstName ? `Welcome, ${firstName}!` : stepData.title}
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
        value={email}
        onChangeText={handleEmailChange}
        onBlur={handleBlur}
        placeholder="Enter your email address"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={true}
        showIcon={false}
        hasError={!!emailError}
        errorMessage={emailError}
      />
      </CustomView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({});
