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
import NavStarSvg from "../SvgComponents/NavStarSvg";
import SendSvgSmall from "../SvgComponents/SendSvgSmall";
import { useAnalyticsContext } from "@/contexts/AnalyticsContext";
import CustomTouchable from "../CustomTouchableOpacity";

type AskKevinSectionProps = {
  onSend?: (message: string) => void;
  onInputChange?: (text: string) => void;
  onClear?: () => void;
  value?: string;
};

const AskKevinSection = ({
  onSend,
  onInputChange,
  onClear,
  value,
}: AskKevinSectionProps) => {
  const { colors } = useTheme();
  const { trackButtonClick, trackCustomEvent, trackSearch } =
    useAnalyticsContext();
  const [input, setInput] = useState(value || "");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  // const screenHeight = Dimensions.get("window").height;

  // Sync internal state with controlled value prop
  useEffect(() => {
    if (value !== undefined) {
      setInput(value);
    }
  }, [value]);

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

    const message = input.trim();

    // Track Ask Kevin interaction
    trackButtonClick("ask_kevin_send_button", {
      message_length: message.length,
      keyboard_type: Platform.OS,
      is_focused: isInputFocused,
    });

    trackSearch(message, {
      search_type: "ask_kevin",
      source: "ask_kevin_input",
      query_length: message.length,
    });

    trackCustomEvent("ask_kevin_query_sent", {
      query: message,
      query_length: message.length,
      timestamp: new Date().toISOString(),
    });

    Keyboard.dismiss();
    onSend?.(message);
    // Don't clear input - keep the query visible
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
    trackCustomEvent("ask_kevin_input_focused", {
      platform: Platform.OS,
      keyboard_height: keyboardHeight,
    });
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
  };

  const handleInputChange = (text: string) => {
    setInput(text);
    onInputChange?.(text);
  };

  const handleClear = () => {
    setInput("");
    onClear?.();
    Keyboard.dismiss();
  };

  // Calculate the dynamic height when input is focused
  // const getDynamicInputHeight = () => {
  //   if (isInputFocused && keyboardHeight > 0) {
  //     // Calculate available height: screen height - keyboard height - other UI elements
  //     const headerPadding = insets.top + verticalScale(12) + verticalScale(24); // top + bottom padding
  //     const inputContainerPadding = 20; // paddingVertical * 2
  //     const safetyMargin = 20; // Extra margin for safety
  //     const bottomTabNavigator = Platform.OS === "android" ? 80 : 0;

  //     const availableHeight =
  //       screenHeight -
  //       keyboardHeight -
  //       headerPadding -
  //       inputContainerPadding -
  //       safetyMargin -
  //       bottomTabNavigator;
  //     return Math.max(availableHeight, verticalScale(100));
  //   }
  //   return verticalScale(24);
  // };

  // const inputHeight = getDynamicInputHeight();

  return (
    <CustomView
      bgColor={colors.background}
      style={[styles.askKevinHeader, { marginTop: verticalScale(15) }]}
    >
      <CustomView bgColor={colors.background} style={styles.inputRow}>
        {/* Input Container with lime green border */}
        <View style={styles.inputContainer}>
          <NavStarSvg color={colors.light_blue} style={styles.starIcon} />
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              Platform.OS === "android" && styles.androidInput,
            ]}
            autoCorrect={false}
            placeholder="Ask Kevin..."
            placeholderTextColor={colors.profile_name_black}
            value={input}
            onChangeText={handleInputChange}
            onSubmitEditing={handleSend}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            returnKeyType="send"
            multiline={false}
          />
          {/* Clear button - only show when there's text */}
          {input.trim().length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <MaterialCommunityIcons
                name="close"
                size={18}
                color={colors.profile_name_black}
              />
            </TouchableOpacity>
          )}
        </View>
      </CustomView>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  askKevinHeader: {
    paddingHorizontal: horizontalScale(24),
    justifyContent: "space-between",
    width: "100%",
    marginBottom: verticalScale(15),
  },
  inputContainer: {
    flex: 1,
    height: 45,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 51.805,
    borderWidth: 2,
    borderColor: "#CCFF3A",
    backgroundColor: "rgba(204, 255, 58, 0.15)",
    paddingHorizontal: 15.542,
    gap: 7.081,
    shadowColor: "#131314",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 0,
  },
  starIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 0,
    color: "#0B2E34",
    fontFamily: "Inter-Regular",
    fontSize: scaleFontSize(16),
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
  clearButton: {
    padding: 2,
    borderRadius: 12,
    borderWidth: 0.5,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AskKevinSection;
