import React, { useState, useRef } from "react";
import { StyleSheet, TextInput } from "react-native";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import CustomTouchable from "../CustomTouchableOpacity";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import { OnboardingStep } from "@/constants/onboardingSlides";
import { commonOnboardingStyles } from "./OnboardingStyles";

interface OnboardingCodeSlideProps {
  stepData: OnboardingStep;
  code: string;
  onCodeChange: (code: string) => void;
  onResendCode?: () => void;
  email?: string;
}

export const OnboardingCodeSlide: React.FC<OnboardingCodeSlideProps> = ({
  stepData,
  code,
  onCodeChange,
  onResendCode,
  email,
}) => {
  const { colors } = useTheme();
  const inputRefs = useRef<(TextInput | null)[]>([]);
  
  const codeDigits = code.split("").concat(Array(6 - code.length).fill(""));

  const handleCodeChange = (digit: string, index: number) => {
    if (digit.length > 1) return; // Prevent multiple characters
    
    const newCode = [...codeDigits];
    newCode[index] = digit;
    const finalCode = newCode.join("").substring(0, 6);
    onCodeChange(finalCode);

    // Move to next input if digit entered
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

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
          { color: colors.gray_regular, marginBottom: verticalScale(8) },
        ]}
      >
        {stepData.subtitle}
      </CustomText>
      
      {email && (
        <CustomText
          style={[styles.emailText, { color: colors.label_dark }]}
        >
          {email}
        </CustomText>
      )}

      <CustomView style={styles.codeContainer}>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={[
              styles.codeInput,
              {
                borderColor: codeDigits[index] ? colors.lime : colors.input_border,
                color: colors.label_dark,
              },
            ]}
            value={codeDigits[index] || ""}
            onChangeText={(text) => handleCodeChange(text, index)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
            keyboardType="numeric"
            maxLength={1}
            textAlign="center"
            autoFocus={index === 0}
          />
        ))}
      </CustomView>

      {onResendCode && (
        <CustomView style={styles.resendContainer}>
          <CustomText style={[styles.resendText, { color: colors.gray_regular }]}>
            Didn't receive the code?{" "}
          </CustomText>
          <CustomTouchable onPress={onResendCode}>
            <CustomText style={[styles.resendLink, { color: colors.lime }]}>
              Resend
            </CustomText>
          </CustomTouchable>
        </CustomView>
      )}
    </CustomView>
  );
};

const styles = StyleSheet.create({
  emailText: {
    fontSize: scaleFontSize(16),
    textAlign: "center",
    marginBottom: verticalScale(32),
    fontWeight: "600",
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: verticalScale(32),
    paddingHorizontal: horizontalScale(20),
  },
  codeInput: {
    width: horizontalScale(45),
    height: verticalScale(55),
    borderWidth: 2,
    borderRadius: 8,
    fontSize: scaleFontSize(24),
    fontWeight: "600",
    backgroundColor: "#FFFFFF",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  resendText: {
    fontSize: scaleFontSize(14),
  },
  resendLink: {
    fontSize: scaleFontSize(14),
    fontWeight: "600",
  },
});