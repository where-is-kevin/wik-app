import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState, useRef, useEffect } from "react";
import {
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  Dimensions,
  KeyboardEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomView from "../CustomView";
import StarSvg from "../SvgComponents/StarSvg";
import SendSvgSmall from "../SvgComponents/SendSvgSmall";

type AskKevinSectionProps = {
  onSend?: (message: string) => void;
  onInputChange?: (text: string) => void;
};

const AskKevinSection = ({ onSend, onInputChange }: AskKevinSectionProps) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [input, setInput] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const screenHeight = Dimensions.get("window").height;

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e: KeyboardEvent) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const handleSend = () => {
    if (input.trim() === "") return;

    Keyboard.dismiss();
    onSend?.(input.trim());
    setInput("");
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
    // console.log("AskKevin: Input focused");
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
  };

  const handleInputChange = (text: string) => {
    setInput(text);
    onInputChange?.(text);
  };

  // Calculate the dynamic height when input is focused
  const getDynamicInputHeight = () => {
    if (isInputFocused && keyboardHeight > 0) {
      // Calculate available height: screen height - keyboard height - other UI elements
      const headerPadding = insets.top + verticalScale(12) + verticalScale(24); // top + bottom padding
      const inputContainerPadding = 20; // paddingVertical * 2
      const safetyMargin = 20; // Extra margin for safety
      const bottomTabNavigator = Platform.OS === "android" ? 80 : 0;

      const availableHeight =
        screenHeight -
        keyboardHeight -
        headerPadding -
        inputContainerPadding -
        safetyMargin -
        bottomTabNavigator;
      return Math.max(availableHeight, verticalScale(100));
    }
    return verticalScale(24);
  };

  const inputHeight = getDynamicInputHeight();

  return (
    <CustomView
      bgColor={colors.lime}
      style={[
        styles.askKevinHeader,
        { paddingTop: insets.top + verticalScale(12) },
      ]}
    >
      <CustomView bgColor={colors.overlay} style={styles.inputRow}>
        {/* Input Container with StarSvg, TextInput, and SendSmallSvg */}
        <CustomView
          bgColor={colors.opacity_lime}
          style={[
            styles.inputContainer,
            isInputFocused &&
              keyboardHeight > 0 && {
                alignItems: "flex-start",
                paddingTop: 14,
              },
          ]}
        >
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              Platform.OS === "android" && styles.androidInput,
              {
                height: inputHeight,
                textAlignVertical: isInputFocused ? "top" : "center",
              },
            ]}
            placeholder="Ask Kevin..."
            placeholderTextColor={colors.profile_name_black}
            value={input}
            onChangeText={handleInputChange}
            onSubmitEditing={handleSend}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            returnKeyType="send"
            multiline={true}
            blurOnSubmit={true}
          />
        </CustomView>

        {/* Send Button */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            isInputFocused &&
              keyboardHeight > 0 && {
                alignSelf: "flex-start",
              },
          ]}
          onPress={handleSend}
          disabled={input.trim() === ""}
        >
          <SendSvgSmall stroke="#0B2E34" />
        </TouchableOpacity>
      </CustomView>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  askKevinHeader: {
    paddingHorizontal: horizontalScale(24),
    paddingBottom: verticalScale(24),
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minHeight: verticalScale(44),
  },
  starContainer: {
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
    color: "#0B2E34",
    fontFamily: "Inter-Regular",
    fontSize: scaleFontSize(14),
    minHeight: verticalScale(24),
  },
  // Android-specific styles
  androidInput: {
    paddingVertical: 0,
    includeFontPadding: false,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  sparkleContainer: {
    marginRight: 10,
  },
  askKevinTitle: {
    fontSize: scaleFontSize(18),
    flex: 1,
  },
  sendButton: {
    marginLeft: 12,
    justifyContent: "center",
    alignItems: "center",
    minHeight: verticalScale(44),
    minWidth: horizontalScale(44),
  },
});

export default AskKevinSection;
