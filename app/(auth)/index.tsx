import CustomText from "@/components/CustomText";
import CustomTouchable from "@/components/CustomTouchableOpacity";
import CustomView from "@/components/CustomView";
import LoginLogoSvg from "@/components/SvgComponents/LoginLogoSvg";
import CustomTextInput from "@/components/TextInput/CustomTextInput";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Dimensions, Platform, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useLogin } from "@/hooks/useLogin";

interface SignInScreenProps {
  // Add any props here if needed
}
const windowHeight = Dimensions.get("window").height;

const SignInScreen: React.FC<SignInScreenProps> = () => {
  const [email, setEmail] = useState<string>("user@example.com");
  const [password, setPassword] = useState<string>("string");
  const { colors } = useTheme();
  const { checkAuthAndNavigate } = useAuthGuard();
  const router = useRouter();
  const { mutate: login, isPending } = useLogin();
  const isFormValid = email.trim() !== "" && password.trim() !== "";

  const handleSignIn = (): void => {
    if (!isFormValid) return;
    login(
      {
        username: email,
        password,
      },
      {
        onSuccess: async () => {
          await checkAuthAndNavigate(); // Navigate after login
        },
        onError: (err: any) => {
          alert(err?.detail || err?.response?.data?.detail || "Login failed");
        },
      }
    );
  };

  const handleForgotPassword = (): void => {
    // router.push("/forgot-password");
  };

  const handleSignUp = (): void => {
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
      >
        <CustomView style={styles.content}>
          <CustomView style={styles.logoContainer}>
            <LoginLogoSvg />
          </CustomView>
          {/* Form */}
          <CustomView style={styles.form}>
            <CustomView style={styles.inputContainer}>
              <CustomTextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder="Enter your email"
              />

              <CustomTextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                placeholder="Enter your password"
              />
            </CustomView>

            <CustomTouchable
              disabled={isPending || !isFormValid}
              bgColor={colors.lime}
              style={[styles.signInButton, !isFormValid && { opacity: 0.7 }]}
              onPress={handleSignIn}
            >
              <CustomText
                fontFamily="Inter-SemiBold"
                style={[styles.signInButtonText, { color: colors.label_dark }]}
              >
                {isPending ? "Signing in..." : "Sign in"}
              </CustomText>
            </CustomTouchable>

            <CustomView style={styles.signUpContainer}>
              <CustomText
                style={[styles.notMemberText, { color: colors.gray_regular }]}
              >
                Not a member?{" "}
              </CustomText>
              <CustomTouchable onPress={handleSignUp}>
                <CustomText
                  style={[styles.signUpText, { color: colors.link_blue }]}
                  fontFamily="Inter-SemiBold"
                >
                  Sign up
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
    ...Platform.select({
      ios: {
        justifyContent: "center",
      },
      android: {
        paddingTop: windowHeight * 0.11,
      },
    }),
  },
  form: {
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
    marginBottom: verticalScale(16),
    marginHorizontal: horizontalScale(24),
  },
  signInButtonText: {
    fontSize: scaleFontSize(16),
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  notMemberText: {
    fontSize: scaleFontSize(12),
  },
  signUpText: {
    fontSize: scaleFontSize(12),
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
    marginBottom: verticalScale(40),
  },
  inputContainer: {
    gap: verticalScale(12),
    marginBottom: verticalScale(16),
    marginTop: verticalScale(6),
  },
  otherWaysText: {
    fontSize: scaleFontSize(12),
    textAlign: "center",
    marginBottom: verticalScale(16),
  },
});

export default SignInScreen;