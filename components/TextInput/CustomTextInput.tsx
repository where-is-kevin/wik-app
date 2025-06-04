import React, { useState } from "react";
import {
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardTypeOptions,
} from "react-native";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import { useTheme } from "@/contexts/ThemeContext";
import CustomTouchable from "../CustomTouchableOpacity";

interface CustomTextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: KeyboardTypeOptions;
  placeholder?: string;
  autoCorrect?: boolean;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  autoCapitalize = "none",
  keyboardType = "default",
  placeholder = "",
  autoCorrect = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  const { colors } = useTheme();

  return (
    <CustomView>
      <CustomText
        fontFamily="Inter-SemiBold"
        style={[styles.label, { color: colors.label_dark }]}
      >
        {label}
      </CustomText>
      <CustomView
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
        ]}
      >
        <TextInput
          style={[styles.input, { color: colors.label_dark }]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor={colors.gray_regular}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {secureTextEntry && (
          <CustomTouchable
            style={styles.visibilityToggle}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <CustomText
              style={[
                styles.visibilityToggleText,
                { color: colors.focus_input },
              ]}
            >
              {isPasswordVisible ? "Hide" : "Show"}
            </CustomText>
          </CustomTouchable>
        )}
      </CustomView>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: scaleFontSize(15),
    marginBottom: verticalScale(4),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E6",
    borderRadius: 8,
  },
  inputContainerFocused: {
    borderColor: "#5953FF",
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontFamily: "Inter-Regular",
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: scaleFontSize(16),
  },
  visibilityToggle: {
    paddingHorizontal: 15,
  },
  visibilityToggleText: {
    fontSize: scaleFontSize(14),
  },
});

export default CustomTextInput;
