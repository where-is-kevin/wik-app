import React from "react";
import { StyleSheet, Modal } from "react-native";
import CustomView from "@/components/CustomView";
import CustomText from "@/components/CustomText";
import CustomTouchable from "@/components/CustomTouchableOpacity";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  verticalScale,
  scaleFontSize,
} from "@/utilities/scaling";

interface OnboardingSwipeUpModalProps {
  visible: boolean;
  onClose: () => void;
}

export const OnboardingSwipeUpModal: React.FC<OnboardingSwipeUpModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <CustomView style={styles.overlay} bgColor="rgba(0, 0, 0, 0.7)">
        <CustomView
          style={[styles.modalContent, { backgroundColor: colors.background }]}
        >
          <CustomText
            style={[styles.title, { color: colors.label_dark }]}
            fontFamily="Inter-SemiBold"
          >
            Saved for later!
          </CustomText>

          <CustomText
            style={[
              styles.description,
              { color: colors.onboarding_option_dark },
            ]}
          >
            You'll be able to book this experience once you've finished
            onboarding. We've added it to your liked recommendations for now.
          </CustomText>

          <CustomTouchable
            style={[styles.button]}
            bgColor={colors.lime}
            onPress={onClose}
          >
            <CustomText
              style={[styles.buttonText, { color: colors.label_dark }]}
              fontFamily="Inter-SemiBold"
            >
              Continue swiping
            </CustomText>
          </CustomTouchable>
        </CustomView>
      </CustomView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 10,
    padding: 20,
    width: "100%",
    maxWidth: "80%",
    alignItems: "center",
  },
  title: {
    fontSize: scaleFontSize(18),
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: scaleFontSize(14),
    textAlign: "center",
    lineHeight: scaleFontSize(20),
    marginBottom: verticalScale(16),
  },
  button: {
    width: "100%",
    paddingVertical: verticalScale(10),
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    fontSize: scaleFontSize(14),
  },
});
