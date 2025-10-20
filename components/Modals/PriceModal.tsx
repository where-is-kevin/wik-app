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

export interface PriceModalRef {
  present: () => void;
  dismiss: () => void;
}

interface PriceModalProps {
  onClose?: () => void;
  onSelect: (price: string) => void;
  selectedPrice?: string;
}

const priceOptions = [
  { value: "Free", label: "Free" },
  { value: "Ticketed", label: "Ticketed" },
];

export const PriceModal = forwardRef<PriceModalRef, PriceModalProps>(
  ({ onClose, onSelect, selectedPrice }, ref) => {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const [tempSelection, setTempSelection] = useState(selectedPrice || "Free");
    const [isVisible, setIsVisible] = useState(false);

    useImperativeHandle(
      ref,
      () => ({
        present: () => {
          setTempSelection(selectedPrice || "Free");
          setIsVisible(true);
        },
        dismiss: () => {
          setIsVisible(false);
        },
      }),
      [selectedPrice]
    );

    const handleClose = useCallback(() => {
      setIsVisible(false);
      onClose?.();
    }, [onClose]);

    const handleContinue = useCallback(() => {
      onSelect(tempSelection);
      setIsVisible(false);
    }, [tempSelection, onSelect]);

    const handleCancel = useCallback(() => {
      setIsVisible(false);
    }, []);

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
                  Price
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
                {priceOptions.map((option) => {
                  const isSelected = tempSelection === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={styles.optionContainer}
                      onPress={() => setTempSelection(option.value)}
                      activeOpacity={0.7}
                    >
                      <CustomView style={styles.radioContainer}>
                        <CustomView
                          style={[
                            styles.radioOuter,
                            {
                              borderColor: isSelected ? "#3C62FA" : "#A3A3A8",
                            },
                          ]}
                        >
                          {isSelected && (
                            <CustomView
                              style={[
                                styles.radioInner,
                                { backgroundColor: "#3C62FA" },
                              ]}
                            />
                          )}
                        </CustomView>
                        <CustomText
                          style={[
                            styles.optionText,
                            { color: colors.text_black },
                          ]}
                        >
                          {option.label}
                        </CustomText>
                      </CustomView>
                    </TouchableOpacity>
                  );
                })}
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
  }
);

PriceModal.displayName = "PriceModal";

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
  },
  optionContainer: {
    paddingVertical: 12,
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: horizontalScale(12),
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionText: {
    fontSize: scaleFontSize(16),
  },
  buttonContainer: {
    paddingTop: 10,
  },
});
