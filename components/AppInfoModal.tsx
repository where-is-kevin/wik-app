import React from "react";
import { StyleSheet, Modal, Pressable, StatusBar } from "react-native";
import CustomView from "@/components/CustomView";
import CustomText from "@/components/CustomText";
import CustomTouchable from "@/components/CustomTouchableOpacity";
import { useTheme } from "@/contexts/ThemeContext";
import {
  scaleFontSize,
  verticalScale,
  horizontalScale,
} from "@/utilities/scaling";
import packageJson from "../package.json";

interface AppInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

const AppInfoModal: React.FC<AppInfoModalProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <CustomView
          style={[
            styles.modalContainer,
            { backgroundColor: colors?.background },
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            {/* Content */}
            <CustomView style={styles.content}>
              <CustomText
                style={[styles.appName, { color: colors?.label_dark }]}
                fontFamily="Inter-SemiBold"
              >
                Where is Kevin?
              </CustomText>

              <CustomText
                style={[styles.version, { color: colors?.event_gray }]}
                fontFamily="Inter-Medium"
              >
                Version {packageJson.version}
              </CustomText>

              <CustomText
                style={[styles.copyright, { color: colors?.event_gray }]}
              >
                © 2024 Where is Kevin Team
              </CustomText>
            </CustomView>

            {/* Close button */}
            <CustomTouchable
              style={styles.closeButton}
              onPress={onClose}
              bgColor={colors.lime}
            >
              <CustomText
                style={[styles.closeButtonText, { color: colors?.label_dark }]}
                fontFamily="Inter-SemiBold"
              >
                Close
              </CustomText>
            </CustomTouchable>
          </Pressable>
        </CustomView>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: StatusBar.currentHeight || 0,
  },
  modalContainer: {
    borderRadius: 16,
    width: "80%",
    maxWidth: 300,
    paddingVertical: verticalScale(24),
    paddingHorizontal: horizontalScale(24),
  },
  content: {
    alignItems: "center",
    marginBottom: verticalScale(24),
  },
  appName: {
    fontSize: scaleFontSize(20),
    marginBottom: verticalScale(8),
    textAlign: "center",
  },
  version: {
    fontSize: scaleFontSize(16),
    marginBottom: verticalScale(16),
    textAlign: "center",
  },
  copyright: {
    fontSize: scaleFontSize(12),
    textAlign: "center",
  },
  closeButton: {
    paddingVertical: verticalScale(12),
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: scaleFontSize(16),
    textAlign: "center",
  },
});

export default AppInfoModal;
