import { StyleSheet } from "react-native";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";

export const commonOnboardingStyles = StyleSheet.create({
  // Common text styles
  title: {
    fontSize: scaleFontSize(18),
    marginBottom: verticalScale(4),
    textAlign: "center" as const,
  },
  subtitle: {
    fontSize: scaleFontSize(14),
    lineHeight: scaleFontSize(20),
    textAlign: "center" as const,
  },

  // Common container styles
  content: {
    flex: 1,
    paddingHorizontal: horizontalScale(24),
    alignItems: "center" as const,
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(20),
  },

  // Button styles
  selectionButton: {
    paddingVertical: 10,
    height: 60,
    alignSelf: "center" as const,
    width: "100%" as const,
    justifyContent: "center" as const,
    paddingHorizontal: 28,
    borderRadius: 31,
    marginBottom: verticalScale(12),
  },
  businessButton: {
    borderWidth: 1,
    borderColor: "#D6D6D9",
  },
  selectedButton: {
    borderColor: "#3C62FA",
    borderWidth: 2,
  },
  selectionButtonText: {
    fontSize: scaleFontSize(16),
  },

  // Footer styles
  footer: {
    paddingHorizontal: horizontalScale(24),
    paddingBottom: verticalScale(12),
  },
  nextButtonDisabled: {
    opacity: 0.7,
  },

  // Progress bar container
  progressContainer: {
    alignItems: "center" as const,
    paddingHorizontal: horizontalScale(24),
  },

  // Header styles
  header: {
    paddingHorizontal: horizontalScale(26),
    paddingVertical: verticalScale(10),
  },

  // Container styles
  container: {
    flex: 1,
  },
});
