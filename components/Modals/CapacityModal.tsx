import React, {
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useRef,
} from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomText from "../CustomText";
import NextButton from "../Button/NextButton";
import { useTheme } from "@/contexts/ThemeContext";
import { scaleFontSize } from "@/utilities/scaling";
import { trimString } from "@/utilities/stringHelpers";

export interface CapacityModalRef {
  present: () => void;
  dismiss: () => void;
}

interface CapacityModalProps {
  onClose?: () => void;
  onSave: (capacity: string) => void;
  initialValue?: string;
}

export const CapacityModal = forwardRef<CapacityModalRef, CapacityModalProps>(
  ({ onClose, onSave, initialValue = "" }, ref) => {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const [capacity, setCapacity] = useState(initialValue);
    const [isVisible, setIsVisible] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const textInputRef = useRef<TextInput>(null);

    // iOS-only keyboard handling
    useEffect(() => {
      if (Platform.OS === "ios") {
        const keyboardWillShow = Keyboard.addListener(
          "keyboardWillShow",
          (event) => {
            setKeyboardHeight(event.endCoordinates.height);
          }
        );

        const keyboardWillHide = Keyboard.addListener(
          "keyboardWillHide",
          () => {
            setKeyboardHeight(0);
          }
        );

        return () => {
          keyboardWillShow.remove();
          keyboardWillHide.remove();
        };
      }
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        present: () => {
          setCapacity(initialValue || "");
          setIsVisible(true);
          // Focus text input on Android after modal opens
          if (Platform.OS === "android") {
            setTimeout(() => {
              textInputRef.current?.focus();
            }, 300);
          }
        },
        dismiss: () => {
          setIsVisible(false);
        },
      }),
      [initialValue]
    );

    const handleSave = useCallback(() => {
      const trimmed = trimString(capacity);
      onSave(trimmed || "Unlimited");
      setIsVisible(false);
    }, [capacity, onSave]);

    const handleCancel = useCallback(() => {
      setIsVisible(false);
    }, []);

    const handleClose = useCallback(() => {
      setIsVisible(false);
      onClose?.();
    }, [onClose]);

    const getInputContainerStyle = () => {
      return styles.inputContainer;
    };

    const getTextInputStyle = () => {
      return styles.textInput;
    };

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
          <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
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
                    Capacity
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

                {/* Content Area */}
                <View style={getInputContainerStyle()}>
                  <TextInput
                    ref={textInputRef}
                    style={[
                      getTextInputStyle(),
                      {
                        color: colors.onboarding_option_dark,
                        backgroundColor: colors.background,
                      },
                    ]}
                    placeholder="Unlimited"
                    placeholderTextColor={colors.event_gray}
                    value={capacity}
                    onChangeText={setCapacity}
                    multiline={false}
                    autoFocus={Platform.OS === "ios"}
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                  />
                </View>

                {/* Button */}
                <View
                  style={[
                    styles.buttonContainer,
                    { paddingBottom: insets.bottom + 20 },
                  ]}
                >
                  <NextButton
                    title="Continue"
                    onPress={handleSave}
                    bgColor={colors.lime}
                    customTextStyle={{ fontSize: scaleFontSize(16) }}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    );
  }
);

CapacityModal.displayName = "CapacityModal";

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  keyboardView: {
    flex: 1,
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
    marginBottom: 16,
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
  inputContainer: {
    marginBottom: 20,
  },
  textInput: {
    fontSize: scaleFontSize(16),
    fontFamily: "Inter-Regular",
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
