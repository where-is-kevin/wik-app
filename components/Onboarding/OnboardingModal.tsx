import React from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { BlurView } from "expo-blur";
import CustomView from "../CustomView";
import { useTheme } from "@/contexts/ThemeContext";
import { horizontalScale, verticalScale } from "@/utilities/scaling";

interface OnboardingBlurModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const OnboardingBlurModal: React.FC<OnboardingBlurModalProps> = ({
  visible,
  onClose,
  children,
}) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
    >
      <BlurView
        intensity={8}
        style={styles.overlay}
        experimentalBlurMethod="dimezisBlurView"
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <SafeAreaView style={styles.safeArea}>
            <CustomView bgColor={colors.overlay} style={styles.modalContainer}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {}} // Prevent closing when clicking inside modal
                style={[
                  styles.modalContent,
                  { backgroundColor: colors.background },
                ]}
              >
                {/* Modal Content */}
                <CustomView style={styles.contentContainer}>
                  {children}
                </CustomView>
              </TouchableOpacity>
            </CustomView>
          </SafeAreaView>
        </TouchableOpacity>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    width: "100%",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: horizontalScale(24),
    paddingBottom: verticalScale(15),
  },
  modalContent: {
    width: "100%",
    minHeight: verticalScale(320),
    padding: 15,
    paddingTop: 20,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: verticalScale(15),
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 0,
  },
  placeholder: {
    width: horizontalScale(32),
  },
  contentContainer: {
    flex: 1,
    width: "100%",
  },
});
