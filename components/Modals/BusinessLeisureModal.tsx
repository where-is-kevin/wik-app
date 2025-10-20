import React, {
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { TouchableOpacity, StyleSheet, View, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomView from "@/components/CustomView";
import CustomText from "@/components/CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import {
  scaleFontSize,
  verticalScale,
  horizontalScale,
} from "@/utilities/scaling";
import NextButton from "@/components/Button/NextButton";
import CheckboxSvg from "@/components/SvgComponents/CheckboxSvg";

export interface BusinessLeisureModalRef {
  present: () => void;
  dismiss: () => void;
}

interface BusinessLeisureModalProps {
  onClose?: () => void;
  onSelect: (selections: string[]) => void;
  selectedOptions?: string[];
}

const businessLeisureOptions = [
  { value: "Business", label: "Business" },
  { value: "Leisure", label: "Leisure" },
];

export const BusinessLeisureModal = forwardRef<
  BusinessLeisureModalRef,
  BusinessLeisureModalProps
>(({ onClose, onSelect, selectedOptions = [] }, ref) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [tempSelections, setTempSelections] =
    useState<string[]>(selectedOptions);
  const [isVisible, setIsVisible] = useState(false);

  useImperativeHandle(
    ref,
    () => ({
      present: () => {
        setTempSelections(selectedOptions);
        setIsVisible(true);
      },
      dismiss: () => {
        setIsVisible(false);
      },
    }),
    [selectedOptions]
  );

  const handleToggleOption = (option: string) => {
    setTempSelections((prev) => {
      if (prev.includes(option)) {
        return prev.filter((item) => item !== option);
      } else {
        return [...prev, option];
      }
    });
  };

  const handleContinue = useCallback(() => {
    onSelect(tempSelections);
    setIsVisible(false);
  }, [tempSelections, onSelect]);

  const handleCancel = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    onClose?.();
  }, [onClose]);

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      onRequestClose={handleClose}
      transparent={true}
      statusBarTranslucent
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleCancel}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View
            style={[styles.content, { backgroundColor: colors.background }]}
          >
            {/* Header */}
            <View style={styles.header}>
              <CustomText
                fontFamily="Inter-SemiBold"
                style={[styles.titleText, { color: colors.label_dark }]}
              >
                Business or Leisure?
              </CustomText>
              <TouchableOpacity
                onPress={handleCancel}
                style={styles.cancelButton}
                activeOpacity={0.7}
              >
                <CustomText
                  fontFamily="Inter-SemiBold"
                  style={[styles.cancelText, { color: colors.light_blue }]}
                >
                  Cancel
                </CustomText>
              </TouchableOpacity>
            </View>

            {/* Options */}
            <CustomView style={styles.optionsContainer}>
              {businessLeisureOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.optionContainer}
                  onPress={() => handleToggleOption(option.value)}
                  activeOpacity={0.7}
                >
                  <CustomView style={styles.checkboxContainer}>
                    <CheckboxSvg
                      selected={tempSelections.includes(option.value)}
                    />
                    <CustomText
                      style={[styles.optionText, { color: colors.text_black }]}
                    >
                      {option.label}
                    </CustomText>
                  </CustomView>
                </TouchableOpacity>
              ))}
            </CustomView>

            {/* Button */}
            <CustomView
              style={[
                styles.buttonContainer,
                { paddingBottom: insets.bottom + 20 },
              ]}
            >
              <NextButton
                title="Continue"
                onPress={handleContinue}
                bgColor={colors.lime}
                customTextStyle={{ fontSize: scaleFontSize(16) }}
              />
            </CustomView>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
});

BusinessLeisureModal.displayName = "BusinessLeisureModal";

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    // Height determined by content
  },
  content: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(20),
  },
  titleText: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
  },
  cancelButton: {},
  cancelText: {
    fontSize: scaleFontSize(16),
    color: "#007AFF",
  },
  optionsContainer: {
    marginBottom: verticalScale(20),
    gap: verticalScale(10),
  },
  optionContainer: {
    paddingVertical: 8,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    fontSize: scaleFontSize(16),
    marginLeft: horizontalScale(10),
  },
  buttonContainer: {
    paddingTop: 10,
  },
});
