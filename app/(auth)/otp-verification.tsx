import React, { useState } from "react";
import {
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import CustomView from "@/components/CustomView";
import CustomText from "@/components/CustomText";
import CustomTouchable from "@/components/CustomTouchableOpacity";
import LoginLogoSvg from "@/components/SvgComponents/LoginLogoSvg";
import ArrowLeftSvg from "@/components/SvgComponents/ArrowLeftSvg";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";

const CELL_COUNT = 6;

const OTPVerificationScreen = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const { email } = useLocalSearchParams();

  const [value, setValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  const handleVerifyPress = async () => {
    if (value.length !== CELL_COUNT) {
      setErrorMessage("Wrong code. Please try again.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      // TODO: Implement OTP verification API call
      console.log("Verifying OTP:", value, "for email:", email);

      // Navigate to next screen after successful verification
      router.replace("/(onboarding)");
    } catch (error) {
      console.error("OTP verification failed:", error);
      setErrorMessage("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <StatusBar style="dark" />
      <TouchableWithoutFeedback
        onPress={() => Keyboard.dismiss()}
        accessible={false}
      >
        <SafeAreaView style={styles.container}>
          {/* Header with back button and logo */}
          <CustomView style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeftSvg />
            </TouchableOpacity>

            <CustomView style={styles.logoContainer}>
              <LoginLogoSvg />
            </CustomView>
          </CustomView>

          <CustomText
            fontFamily="Inter-SemiBold"
            style={[styles.headerStyle, { color: colors.label_dark }]}
          >
            Enter the 6-digit code sent to
          </CustomText>

          <CustomView style={styles.emailContainer}>
            <CustomText
              fontFamily="Inter-SemiBold"
              style={[styles.emailText, { color: colors.label_dark }]}
            >
              {email || "email@example.com"}
            </CustomText>
          </CustomView>

          <CodeField
            ref={ref}
            {...props}
            value={value}
            onChangeText={(text) => {
              setValue(text);
              setErrorMessage("");
            }}
            cellCount={CELL_COUNT}
            rootStyle={styles.codeFieldRoot}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            renderCell={({ index, symbol, isFocused }) => {
              const hasValue = Boolean(symbol);
              return (
                <CustomText
                  fontFamily="Inter-Regular"
                  key={index}
                  style={[
                    styles.cell,
                    {
                      borderColor:
                        isFocused || hasValue ? colors.light_blue : "#E4E7EC",
                      color: hasValue ? colors.label_dark : "#637083",
                    },
                    errorMessage && { borderColor: "#FF4D4D" },
                  ]}
                  onLayout={getCellOnLayoutHandler(index)}
                >
                  {symbol || (isFocused ? <Cursor /> : null)}
                </CustomText>
              );
            }}
          />

          {errorMessage ? (
            <CustomText style={styles.errorText}>{errorMessage}</CustomText>
          ) : null}

          <CustomTouchable
            style={[styles.signInButton, { backgroundColor: colors.lime }]}
            onPress={handleVerifyPress}
            disabled={isLoading || value.length !== 6}
          >
            <CustomText style={styles.signInButtonText}>
              {isLoading ? "Verifying..." : "Verify"}
            </CustomText>
          </CustomTouchable>

          <CustomText style={styles.notReceived}>
            Didn't receive code?
          </CustomText>

          <TouchableOpacity style={styles.linkContainer} onPress={() => {}}>
            <CustomText style={[styles.notReceived, styles.resendCode]}>
              Resend code
            </CustomText>
          </TouchableOpacity>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: horizontalScale(16),
    paddingTop: verticalScale(16),
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(40),
  },
  backButton: {
    padding: 8,
  },
  logoContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerStyle: {
    fontSize: scaleFontSize(16),
    marginBottom: verticalScale(4),
    textAlign: "center",
  },
  emailContainer: {
    marginBottom: verticalScale(32),
    alignItems: "center",
  },
  emailText: {
    fontSize: scaleFontSize(16),
  },
  codeFieldRoot: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: verticalScale(24),
  },
  cell: {
    width: 44,
    height: 52,
    lineHeight: 52,
    fontSize: scaleFontSize(20),
    borderWidth: 1.5,
    borderRadius: 10,
    textAlign: "center",
    backgroundColor: "#FFF",
  },
  errorText: {
    color: "#FF4D4D",
    fontSize: scaleFontSize(14),
    marginBottom: verticalScale(16),
    textAlign: "center",
  },
  signInButton: {
    width: "100%",
    paddingVertical: verticalScale(16),
    borderRadius: 12,
    alignItems: "center",
    marginVertical: verticalScale(24),
  },
  signInButtonText: {
    color: "#000",
    fontSize: scaleFontSize(18),
    fontWeight: "600",
  },
  notReceived: {
    color: "#344051",
    fontSize: scaleFontSize(14),
    textAlign: "center",
  },
  resendCode: {
    color: "#3C62FA",
    fontWeight: "600",
  },
  linkContainer: {
    marginTop: verticalScale(2),
  },
});

export default OTPVerificationScreen;
