import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
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
  const [timeLeft, setTimeLeft] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const ref = useBlurOnFulfill({value: code, cellCount: 6});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: code,
    setValue: onCodeChange,
  });

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleResendCode = () => {
    if (canResend && onResendCode) {
      onResendCode();
      setTimeLeft(59);
      setCanResend(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
            { color: colors.gray_regular, marginBottom: verticalScale(4) },
          ]}
        >
          {stepData.subtitle}
        </CustomText>

        {email && (
          <CustomText
            style={[styles.emailText, { color: colors.gray_regular }]}
          >
            {email}
          </CustomText>
        )}

        <CodeField
          ref={ref}
          {...props}
          value={code}
          onChangeText={onCodeChange}
          cellCount={6}
          rootStyle={styles.codeContainer}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          autoFocus={true}
          renderCell={({index, symbol, isFocused}) => (
            <CustomText
              key={index}
              style={[
                styles.codeInput,
                {
                  borderColor: isFocused 
                    ? colors.light_blue 
                    : symbol 
                    ? colors.light_blue 
                    : colors.input_border,
                  color: colors.label_dark,
                },
              ]}
              onLayout={getCellOnLayoutHandler(index)}
            >
              {symbol || (isFocused ? <Cursor /> : null)}
            </CustomText>
          )}
        />

        {onResendCode && (
          <CustomView style={styles.resendContainer}>
            {canResend ? (
              <>
                <CustomText
                  style={[styles.resendText, { color: colors.gray_regular }]}
                >
                  Didn't receive the code?{" "}
                </CustomText>
                <CustomTouchable onPress={handleResendCode}>
                  <CustomText
                    style={[styles.resendLink, { color: colors.light_blue }]}
                  >
                    Resend
                  </CustomText>
                </CustomTouchable>
              </>
            ) : (
              <CustomText
                style={[styles.resendText, { color: colors.gray_regular }]}
              >
                Resend code in {formatTime(timeLeft)}
              </CustomText>
            )}
          </CustomView>
        )}
      </CustomView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  emailText: {
    fontSize: scaleFontSize(14),
    textAlign: "center",
    marginBottom: verticalScale(24),
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: verticalScale(28),
    paddingHorizontal: horizontalScale(6),
  },
  codeInput: {
    width: horizontalScale(35),
    height: verticalScale(44),
    borderWidth: 1,
    borderRadius: horizontalScale(8),
    fontSize: scaleFontSize(14),
    backgroundColor: "#FFFFFF",
    textAlign: "center",
    lineHeight: verticalScale(44),
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
