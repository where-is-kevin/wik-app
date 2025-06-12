import { View, Text, StyleSheet, Platform, Alert } from "react-native";
import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import CustomView from "@/components/CustomView";
import LoginLogoSvg from "@/components/SvgComponents/LoginLogoSvg";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import { WINDOW_HEIGHT } from "@gorhom/bottom-sheet";
import CustomTextInput from "@/components/TextInput/CustomTextInput";
import CustomTouchable from "@/components/CustomTouchableOpacity";
import CustomText from "@/components/CustomText";
import BackHeader from "@/components/Header/BackHeader";
import { useChangePassword } from "@/hooks/useChangePassword";

const ChangePasswordScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");

  const changePasswordMutation = useChangePassword();

  const isFormValid =
    email.trim() !== "" &&
    oldPassword.trim() !== "" &&
    newPassword.trim() !== "";

  const handleChangePassword = (): void => {
    if (!isFormValid) return;

    changePasswordMutation.mutate(
      {
        email,
        oldPassword,
        newPassword,
      },
      {
        onSuccess: () => {
          Alert.alert("Success", "Password changed successfully!", [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]);
        },
        onError: (err: any) => {
          console.log(err);
          Alert.alert(
            "Error",
            err?.detail || "Failed to change password. Please try again."
          );
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <BackHeader />
      <CustomView style={styles.content}>
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
              label="Old password"
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry={true}
              placeholder="Enter your old password"
            />

            <CustomTextInput
              label="New password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={true}
              placeholder="Enter your new password"
            />
          </CustomView>

          <CustomTouchable
            disabled={!isFormValid || changePasswordMutation.isPending}
            bgColor={colors.lime}
            style={[
              styles.signInButton,
              (!isFormValid || changePasswordMutation.isPending) &&
                styles.disabledButton,
            ]}
            onPress={handleChangePassword}
          >
            <CustomText
              fontFamily="Inter-SemiBold"
              style={[styles.signInButtonText, { color: colors.label_dark }]}
            >
              {changePasswordMutation.isPending ? "Changing..." : "Change"}
            </CustomText>
          </CustomTouchable>
        </CustomView>
      </CustomView>
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  content: {
    flex: 1,
    marginTop: verticalScale(24),
    paddingHorizontal: horizontalScale(24),
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    gap: verticalScale(12),
  },
  signInButton: {
    marginTop: verticalScale(32),
    paddingVertical: verticalScale(12),
    borderRadius: 8,
    alignItems: "center",
    marginBottom: verticalScale(16),
    marginHorizontal: horizontalScale(24),
  },
  disabledButton: {
    opacity: 0.7,
  },
  signInButtonText: {
    fontSize: scaleFontSize(16),
  },
});
