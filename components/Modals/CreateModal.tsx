import React from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { BlurView } from "expo-blur";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  verticalScale,
  scaleFontSize,
} from "@/utilities/scaling";

interface CreateModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  showCancelButton?: boolean;
  onCancel?: () => void;
  minHeight?: number;
}

export const CreateModal: React.FC<CreateModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCancelButton = false,
  onCancel,
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
        intensity={12}
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
                  {
                    backgroundColor: colors.background,
                  },
                ]}
              >
                {/* Header */}
                <CustomView style={styles.header}>
                  <CustomText
                    fontFamily="Inter-SemiBold"
                    style={[styles.titleText, { color: colors.label_dark }]}
                  >
                    {title}
                  </CustomText>
                  {showCancelButton && (
                    <TouchableOpacity
                      onPress={onCancel || onClose}
                      style={styles.cancelButton}
                      activeOpacity={0.7}
                    >
                      <CustomText
                        fontFamily="Inter-SemiBold"
                        style={[
                          styles.cancelText,
                          { color: colors.light_blue },
                        ]}
                      >
                        Cancel
                      </CustomText>
                    </TouchableOpacity>
                  )}
                </CustomView>

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
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#F2F2F3",
    backgroundColor: "#FFF",
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
  },
  titleText: {
    fontSize: scaleFontSize(18),
  },
  cancelButton: {},
  cancelText: {
    fontSize: scaleFontSize(14),
  },
  contentContainer: {
    width: "100%",
  },
});
