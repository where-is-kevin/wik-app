import CustomText from "@/components/CustomText";
import CustomTouchable from "@/components/CustomTouchableOpacity";
import CustomView from "@/components/CustomView";
import { OnboardingSearch } from "@/components/Onboarding/OnboardingSearch";
import { useTheme } from "@/contexts/ThemeContext";
import { useUXCam } from "@/contexts/UXCamContext"; // Add this import
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Platform, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useOTPRequest } from "@/hooks/useOTP";

interface SignInScreenProps {
  // Add any props here if needed
}

const SignInScreen: React.FC<SignInScreenProps> = () => {
  const [email, setEmail] = useState<string>(
    __DEV__ ? "fresh.trifunovic@gmail.com" : ""
  );
  const { colors } = useTheme();
  const router = useRouter();
  const { mutate: requestOTP, isPending } = useOTPRequest();
  const { logEvent } = useUXCam();
  const isFormValid = email.trim() !== "";

  const handleSignIn = (): void => {
    if (!isFormValid) return;

    // Log OTP request attempt
    logEvent("otp_request_attempt", {
      method: "email",
      email: email,
    });

    requestOTP(
      { email },
      {
        onSuccess: () => {
          logEvent("otp_request_success", {
            method: "email",
            email: email,
          });

          // Navigate to OTP verification screen with email parameter
          router.push({
            pathname: "/(auth)/otp-verification",
            params: { email },
          });
        },
        onError: (err: any) => {
          logEvent("otp_request_failed", {
            method: "email",
            email: email,
            error:
              err?.detail ||
              err?.response?.data?.detail ||
              "OTP request failed",
          });

          alert(
            err?.detail ||
              err?.response?.data?.detail ||
              "Failed to send OTP. Please try again."
          );
        },
      }
    );
  };

  const handleSignUp = (): void => {
    logEvent("signup_clicked", {
      screen: "signin_screen",
    });
    router.push("/(onboarding)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAwareScrollView
        style={styles.keyboardAwareScrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardOpeningTime={250}
        extraScrollHeight={Platform.OS === "ios" ? 20 : 0}
        resetScrollToCoords={{ x: 0, y: 0 }}
        scrollEnabled={true}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        <CustomView style={styles.content}>
          <CustomView style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/login-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </CustomView>
          {/* Form */}
          <CustomView style={styles.form}>
            <CustomView style={styles.topSection}>
              <CustomView style={styles.inputContainer}>
                <OnboardingSearch
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  placeholder="Username or email"
                  showIcon={false}
                  customStyles={{ marginBottom: 0 }}
                />
              </CustomView>

              <CustomTouchable
                disabled={isPending || !isFormValid}
                bgColor={colors.lime}
                style={[
                  styles.signInButton,
                  (!isFormValid || isPending) && { opacity: 0.7 },
                ]}
                onPress={handleSignIn}
              >
                <CustomText
                  fontFamily="Inter-SemiBold"
                  style={[
                    styles.signInButtonText,
                    { color: colors.label_dark },
                  ]}
                >
                  {isPending ? "Loading..." : "Let's go!"}
                </CustomText>
              </CustomTouchable>
            </CustomView>

            <CustomView style={styles.signUpSection}>
              <CustomView style={styles.orContainer}>
                <CustomView
                  style={[
                    styles.horizontalLine,
                    { backgroundColor: colors.input_border },
                  ]}
                />
                <CustomText
                  style={[styles.notMemberText, { color: colors.gray_regular }]}
                >
                  or
                </CustomText>
                <CustomView
                  style={[
                    styles.horizontalLine,
                    { backgroundColor: colors.input_border },
                  ]}
                />
              </CustomView>

              <CustomTouchable
                onPress={handleSignUp}
                disabled={isPending}
                style={[
                  styles.signUpButton,
                  { borderColor: colors.lime, backgroundColor: "#FFFFFF" },
                  isPending && { opacity: 0.7 },
                ]}
              >
                <CustomText
                  style={[
                    styles.signUpButtonText,
                    { color: colors.label_dark },
                  ]}
                  fontFamily="Inter-SemiBold"
                >
                  Create an account
                </CustomText>
              </CustomTouchable>
            </CustomView>
          </CustomView>
        </CustomView>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  keyboardAwareScrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(30),
  },
  form: {
    width: "100%",
    flex: 1,
  },
  topSection: {
    width: "100%",
  },
  forgotPasswordContainer: {
    marginBottom: verticalScale(16),
    marginTop: verticalScale(6),
  },
  forgotPasswordText: {
    fontSize: scaleFontSize(12),
  },
  signInButton: {
    paddingVertical: verticalScale(12),
    borderRadius: 8,
    alignItems: "center",
  },
  signInButtonText: {
    fontSize: scaleFontSize(16),
  },
  signUpSection: {
    paddingBottom: verticalScale(20),
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: verticalScale(16),
  },
  horizontalLine: {
    flex: 1,
    height: 0.5,
  },
  notMemberText: {
    fontSize: scaleFontSize(14),
    textAlign: "center",
    paddingHorizontal: horizontalScale(16),
  },
  signUpButton: {
    paddingVertical: verticalScale(12),
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 2,
  },
  signUpButtonText: {
    fontSize: scaleFontSize(16),
  },
  googleButton: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 8,
    gap: horizontalScale(12),
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(16),
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    width: "auto",
  },
  googleButtonText: {
    fontSize: scaleFontSize(16),
  },
  logoContainer: {
    alignSelf: "center",
    marginBottom: verticalScale(50),
  },
  logo: {
    width: horizontalScale(181),
    height: verticalScale(74),
  },
  inputContainer: {
    gap: verticalScale(12),
    marginBottom: verticalScale(24),
    marginTop: verticalScale(6),
  },
  otherWaysText: {
    fontSize: scaleFontSize(12),
    textAlign: "center",
    marginBottom: verticalScale(16),
  },
});

export default SignInScreen;
