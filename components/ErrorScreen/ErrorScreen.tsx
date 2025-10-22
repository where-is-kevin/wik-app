import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";

interface ErrorScreenProps {
  title?: string;
  message?: string;
  buttonText?: string;
  onRetry?: () => void;
  style?: any;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({
  title = "Failed to load content",
  message = "Please try again",
  buttonText = "Try Again",
  onRetry,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <CustomView style={[styles.errorContainer, style]}>
      <CustomText
        fontFamily="Inter-SemiBold"
        style={[styles.errorTitle, { color: colors.label_dark }]}
      >
        {title}
      </CustomText>
      <CustomText style={[styles.errorText, { color: colors.gray_regular }]}>
        {message}
      </CustomText>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <CustomText style={styles.retryButtonText}>{buttonText}</CustomText>
        </TouchableOpacity>
      )}
    </CustomView>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: horizontalScale(20),
  },
  errorTitle: {
    fontSize: scaleFontSize(18),
    textAlign: "center",
    marginBottom: verticalScale(8),
    fontWeight: "600",
  },
  errorText: {
    fontSize: scaleFontSize(16),
    textAlign: "center",
    marginBottom: verticalScale(16),
    lineHeight: scaleFontSize(20),
  },
  retryButton: {
    backgroundColor: "#6C63FF",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    textAlign: "center",
  },
});
