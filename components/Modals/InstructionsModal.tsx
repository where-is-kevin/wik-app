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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomText from "../CustomText";
import NextButton from "../Button/NextButton";
import { useTheme } from "@/contexts/ThemeContext";
import { scaleFontSize } from "@/utilities/scaling";
import { trimString } from "@/utilities/stringHelpers";

export interface InstructionsModalRef {
  present: () => void;
  dismiss: () => void;
}

interface InstructionsModalProps {
  onClose?: () => void;
  onSave: (instructions: string) => void;
  initialValue?: string;
}

export const InstructionsModal = forwardRef<
  InstructionsModalRef,
  InstructionsModalProps
>(({ onClose, onSave, initialValue = "" }, ref) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [instructions, setInstructions] = useState(initialValue);
  const [isVisible, setIsVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const textInputRef = useRef<TextInput>(null);

  // iOS-only keyboard handling
  useEffect(() => {
    if (Platform.OS === 'ios') {
      const keyboardWillShow = Keyboard.addListener('keyboardWillShow', (event) => {
        setKeyboardHeight(event.endCoordinates.height);
      });

      const keyboardWillHide = Keyboard.addListener('keyboardWillHide', () => {
        setKeyboardHeight(0);
      });

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
        setInstructions(initialValue || "");
        setIsVisible(true);
        // Focus text input on Android after modal opens
        if (Platform.OS === 'android') {
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
    const trimmed = trimString(instructions);
    onSave(trimmed);
    setIsVisible(false);
  }, [instructions, onSave]);

  const handleCancel = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    onClose?.();
  }, [onClose]);

  const getInputContainerStyle = () => {
    if (Platform.OS === 'ios' && keyboardHeight > 0) {
      // Override flex with fixed height when keyboard is open
      return [styles.inputContainer, { height: 180, flex: 0 }];
    }
    return styles.inputContainer;
  };

  const getTextInputStyle = () => {
    if (Platform.OS === 'ios' && keyboardHeight > 0) {
      // Override flex for TextInput too
      return [styles.textInput, { flex: 0, height: 160 }]; // 180 - 20 padding
    }
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
                Add Instructions
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
                placeholder="Start typing..."
                placeholderTextColor={colors.event_gray}
                value={instructions}
                onChangeText={setInstructions}
                multiline={true}
                textAlignVertical="top"
                autoFocus={Platform.OS === 'ios'}
                scrollEnabled={true}
              />
            </View>

            {/* Button */}
            <View style={[
              styles.buttonContainer,
              {
                paddingBottom: Platform.OS === 'ios' && keyboardHeight > 0
                  ? 10 // Minimal padding when keyboard is open
                  : insets.bottom + 20, // Normal safe area padding when keyboard is closed
                backgroundColor: Platform.OS === 'ios' && keyboardHeight > 0 ? 'rgba(255,255,255,0.95)' : 'transparent'
              }
            ]}>
              <NextButton
                title="Continue"
                onPress={handleSave}
                bgColor={colors.lime}
                disabled={!instructions.trim()}
                customTextStyle={{ fontSize: scaleFontSize(16) }}
              />
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
});

InstructionsModal.displayName = "InstructionsModal";

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    height: "80%",
  },
  content: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
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
    flex: 1,
    padding: 20,
  },
  textInput: {
    fontSize: scaleFontSize(16),
    fontFamily: "Inter-Regular",
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    textAlignVertical: "top",
  },
  buttonContainer: {
    padding: 20,
  },
});
