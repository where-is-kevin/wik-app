import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomView from "../CustomView";
import StarSvg from "../SvgComponents/StarSvg";
import SendSvgSmall from "../SvgComponents/SendSvgSmall";

type AskKevinSectionProps = {
  onSend?: (message: string) => void;
  onInputChange?: (text: string) => void; // Add this new prop
  onSettingsPress?: () => void;
};

const AskKevinSection = ({
  onSend,
  onInputChange,
  onSettingsPress,
}: AskKevinSectionProps) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() === "") return;
    console.log("AskKevin: Send pressed", input);

    Keyboard.dismiss();
    onSend?.(input.trim()); // Let parent handle state update
  };

  const handleSettings = () => {
    // console.log("AskKevin: Settings pressed");
    onSettingsPress?.();
  };

  const handleInputFocus = () => {
    // console.log("AskKevin: Input focused");
  };

  const handleInputChange = (text: string) => {
    setInput(text);
    onInputChange?.(text); // Notify parent of input changes
    // console.log("AskKevin: Input changed", text);
  };

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
        <CustomView bgColor={colors.opacity_lime} style={styles.inputContainer}>
          <CustomView
            bgColor={colors.opacity_lime}
            style={styles.starContainer}
          >
            <StarSvg color="#0B2E34" />
          </CustomView>
          <TextInput
            style={styles.input}
            placeholder="Ask Kevin..."
            placeholderTextColor={colors.profile_name_black}
            value={input}
            onChangeText={handleInputChange}
            onSubmitEditing={handleSend}
            onFocus={handleInputFocus}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={input.trim() === ""} // Optional: disable when empty
          >
            <SendSvgSmall stroke="#0B2E34" />
          </TouchableOpacity>
        </CustomView>

        {/* Settings Button with Red Dot */}
        <TouchableOpacity style={styles.iconButton} onPress={handleSettings}>
          <MaterialCommunityIcons
            name="tune-variant"
            size={24}
            color={colors.profile_name_black}
          />
          <View style={styles.redDot} />
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
  iconButton: {
    padding: 4,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  redDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF2D55",
  },
  sendButton: {
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AskKevinSection;
