import React, { useState, useEffect } from "react";
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
import ArrowLeftSvg from "@/components/SvgComponents/ArrowLeftSvg";
import NextButton from "@/components/Button/NextButton";
import { useTheme } from "@/contexts/ThemeContext";
import { useUXCam } from "@/contexts/UXCamContext";
import { useOTPVerify, useOTPRequest } from "@/hooks/useOTP";
import { useLocationPermissionGuard } from "@/hooks/useLocationPermissionGuard";
import { useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
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
  const { mutate: verifyOTP, isPending } = useOTPVerify();
  const { mutate: requestOTP, isPending: isResending } = useOTPRequest();
  const { checkAndNavigate } = useLocationPermissionGuard({
    redirectToTabs: true,
  });
  const { setUserId, setUserProperty, logEvent } = useUXCam();
  const queryClient = useQueryClient();

  const [value, setValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const AUTH_TOKEN_KEY = "authToken";
  const AUTH_USER_KEY = "authUser";

  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  // Timer effect for resend functionality
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

  // Format time helper function
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleVerifyPress = (codeToVerify?: string) => {
    const codeValue = codeToVerify || value;

    if (codeValue.length !== CELL_COUNT) {
      setErrorMessage("Wrong code. Please try again.");
      return;
    }

    setErrorMessage("");

    logEvent("otp_verify_attempt", {
      email: email as string,
    });

    verifyOTP(
      {
        email: email as string,
        otpCode: codeValue,
      },
      {
        onSuccess: async (data) => {
          try {
            // Store auth data in SecureStore (same as useAuth.ts)
            await Promise.all([
              SecureStore.setItemAsync(AUTH_TOKEN_KEY, data.accessToken),
              SecureStore.setItemAsync(
                AUTH_USER_KEY,
                JSON.stringify(data.user)
              ),
            ]);

            // Update the auth query cache
            queryClient.setQueryData(["auth"], data);

            // Set UXCam properties
            if (data?.user?.id) {
              setUserId(data.user.id.toString());
            }
            setUserProperty("email", email as string);
            logEvent("otp_verify_success", {
              email: email as string,
            });

            // Navigate to the app
            await checkAndNavigate();
          } catch (error) {
            console.error("Error storing auth data:", error);
            setErrorMessage(
              "Authentication successful but failed to save. Please try again."
            );
          }
        },
        onError: (err: any) => {
          console.error("OTP verification error:", err);

          logEvent("otp_verify_failed", {
            email: email as string,
            error:
              err?.detail ||
              err?.response?.data?.detail ||
              "OTP verification failed",
          });

          // Always show user-friendly error message regardless of server error
          setErrorMessage("Wrong code. Please try again.");
        },
      }
    );
  };

  return (
    <>
      <StatusBar style="dark" />
      <TouchableWithoutFeedback
        onPress={() => Keyboard.dismiss()}
        accessible={false}
      >
        <SafeAreaView style={styles.container}>
          <CustomView style={styles.content}>
            {/* Header with back button and logo */}
            <CustomView style={styles.topSection}>
              <CustomView style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                  <ArrowLeftSvg />
                </TouchableOpacity>
              </CustomView>

              <CustomText
                fontFamily="Inter-SemiBold"
                style={[styles.headerStyle, { color: colors.label_dark }]}
              >
                Verify your identity
              </CustomText>

              <CustomView style={styles.emailContainer}>
                <CustomText
                  style={[
                    styles.emailText,
                    {
                      color: colors.horizontal_line,
                      marginBottom: verticalScale(4),
                    },
                  ]}
                >
                  Enter the 6-digit code sent to
                </CustomText>
                <CustomText
                  style={[styles.emailText, { color: colors.horizontal_line }]}
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

                  // Auto-submit when all fields are filled
                  if (text.length === CELL_COUNT) {
                    setTimeout(() => {
                      handleVerifyPress(text);
                    }, 100); // Small delay to ensure UI updates
                  }
                }}
                cellCount={CELL_COUNT}
                rootStyle={styles.codeFieldRoot}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                autoFocus={true}
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
                            isFocused || hasValue
                              ? colors.light_blue
                              : "#E4E7EC",
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

              <NextButton
                title={isPending ? "Verifying..." : "Start exploring!"}
                onPress={() => handleVerifyPress()}
                disabled={isPending || value.length !== 6}
                bgColor={colors.lime}
                customStyles={[
                  styles.signInButton,
                  ...(isPending || value.length !== 6
                    ? [{ opacity: 0.7 }]
                    : []),
                ]}
              />

              <CustomView style={styles.resendContainer}>
                {canResend ? (
                  <>
                    <CustomText
                      style={[
                        styles.resendText,
                        { color: colors.gray_regular },
                      ]}
                    >
                      Didn't receive the code?{" "}
                    </CustomText>
                    <TouchableOpacity
                      onPress={() => {
                        logEvent("resend_otp_clicked", {
                          email: email as string,
                        });

                        requestOTP(
                          { email: email as string },
                          {
                            onSuccess: () => {
                              logEvent("resend_otp_success", {
                                email: email as string,
                              });
                              setTimeLeft(59);
                              setCanResend(false);
                            },
                            onError: (err: any) => {
                              console.error("Resend OTP error:", err);

                              logEvent("resend_otp_failed", {
                                email: email as string,
                                error:
                                  err?.detail ||
                                  err?.response?.data?.detail ||
                                  "Resend failed",
                              });

                              // Always show user-friendly error message regardless of server error
                              setErrorMessage(
                                "Failed to resend code. Please try again."
                              );
                            },
                          }
                        );
                      }}
                      disabled={isResending || isPending}
                    >
                      <CustomText
                        style={[
                          styles.resendLink,
                          { color: colors.light_blue },
                        ]}
                      >
                        {isResending ? "Resending..." : "Resend"}
                      </CustomText>
                    </TouchableOpacity>
                  </>
                ) : (
                  <CustomText
                    style={[styles.resendText, { color: colors.gray_regular }]}
                  >
                    Resend code in {formatTime(timeLeft)}
                  </CustomText>
                )}
              </CustomView>
            </CustomView>
          </CustomView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: horizontalScale(30),
    paddingTop: verticalScale(16),
    justifyContent: "space-between",
  },
  topSection: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(40),
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: 151,
    height: 61,
    borderRadius: 1,
  },
  headerStyle: {
    fontSize: scaleFontSize(18),
    marginBottom: verticalScale(4),
    textAlign: "center",
  },
  emailContainer: {
    marginBottom: verticalScale(24),
    alignItems: "center",
  },
  emailText: {
    fontSize: scaleFontSize(16),
  },
  codeFieldRoot: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: verticalScale(24),
  },
  cell: {
    width: horizontalScale(35),
    height: verticalScale(44),
    lineHeight: verticalScale(44),
    fontSize: scaleFontSize(14),
    borderWidth: 1,
    borderRadius: horizontalScale(8),
    textAlign: "center",
    backgroundColor: "#FFFFFF",
  },
  errorText: {
    color: "#FF4D4D",
    fontSize: scaleFontSize(14),
    marginBottom: verticalScale(16),
    textAlign: "center",
  },
  signInButton: {
    width: "100%",
    paddingVertical: verticalScale(12),
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 0,
  },
  signInButtonText: {
    color: "#000",
    fontSize: scaleFontSize(18),
    fontWeight: "600",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: verticalScale(20),
  },
  resendText: {
    fontSize: scaleFontSize(14),
  },
  resendLink: {
    fontSize: scaleFontSize(14),
    fontWeight: "600",
  },
  signUpSection: {
    paddingBottom: verticalScale(20),
  },
  notMemberText: {
    fontSize: scaleFontSize(14),
    textAlign: "center",
    marginBottom: verticalScale(16),
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
});

export default OTPVerificationScreen;
