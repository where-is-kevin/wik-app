import CustomText from "@/components/CustomText";
import CustomTouchable from "@/components/CustomTouchableOpacity";
import CustomView from "@/components/CustomView";
import LoginLogoSvg from "@/components/SvgComponents/LoginLogoSvg";
import CustomTextInput from "@/components/TextInput/CustomTextInput";
import { commonStyles } from "@/constants/commonStyles";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Dimensions, Platform, StyleSheet } from "react-native";
import GoogleSvg from "@/components/SvgComponents/GoogleSvg";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

interface SignInScreenProps {
  // Add any props here if needed
}
const windowHeight = Dimensions.get("window").height;

const SignInScreen: React.FC<SignInScreenProps> = () => {
  const [email, setEmail] = useState<string>("contact@whereskevin.com");
  const [password, setPassword] = useState<string>("***********");
  const { colors } = useTheme();
  const router = useRouter();

  const handleSignIn = (): void => {
    console.log("Signing in with:", { email, password });
    router.replace("/(onboarding)");
  };

  const handleForgotPassword = (): void => {
    console.log("Forgot password clicked");
  };

  const handleSignUp = (): void => {
    console.log("Sign up clicked");
  };

  const handleGoogleSignIn = (): void => {
    console.log("Google sign in clicked");
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
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
            style={styles.forgotPasswordContainer}
            onPress={handleForgotPassword}
          >
            <CustomText
              fontFamily="Inter-SemiBold"
              style={[styles.forgotPasswordText, { color: colors.link_blue }]}
            >
              Forgot password?
            </CustomText>
          </CustomTouchable>

          <CustomTouchable
            bgColor={colors.lime}
            style={styles.signInButton}
            onPress={handleSignIn}
          >
            <CustomText
              fontFamily="Inter-SemiBold"
              style={[styles.signInButtonText, { color: colors.label_dark }]}
            >
              Sign in
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

          <CustomView
            bgColor={colors.horizontal_line}
            style={commonStyles.horizontalLine}
          />
          <CustomText
            style={[styles.otherWaysText, { color: colors.gray_regular }]}
          >
            Other ways to Sign in
          </CustomText>

          <CustomTouchable
            style={[styles.googleButton, { borderColor: colors.border_gray }]}
            onPress={handleGoogleSignIn}
          >
            <GoogleSvg />
            <CustomText
              fontFamily="Inter-SemiBold"
              style={[
                styles.googleButtonText,
                { color: colors.horizontal_line },
              ]}
            >
              Sign in with Google
            </CustomText>
          </CustomTouchable>
        </CustomView>
      </CustomView>
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
  },
  otherWaysText: {
    fontSize: scaleFontSize(12),
    textAlign: "center",
    marginBottom: verticalScale(16),
  },
});

export default SignInScreen;
