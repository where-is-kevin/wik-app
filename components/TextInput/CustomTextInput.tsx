import React, { useState } from "react";
import {
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardTypeOptions,
  TextStyle,
  ViewStyle,
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
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: KeyboardTypeOptions;
  placeholder?: string;
  autoCorrect?: boolean;
  editable?: boolean;
  multiline?: boolean;
  numOfLines?: number;
  maxLength?: number;
  fixedHeight?: number;
  customTextStyles?: TextStyle | TextStyle[]; // Add custom text styles prop
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
  editable,
  multiline = false,
  numOfLines = 1,
  maxLength,
  fixedHeight,
  customTextStyles,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  const { colors } = useTheme();

  // Helper function to create proper style array
  const getContainerStyles = (): ViewStyle[] => {
    const baseStyles: ViewStyle[] = [
      styles.inputContainer,
      isFocused ? styles.inputContainerFocused : {},
      multiline ? styles.multilineContainer : {},
    ];

    // Only add fixedHeight if it exists and is greater than 0
    if (fixedHeight && fixedHeight > 0) {
      baseStyles.push({ height: fixedHeight });
    }

    return baseStyles;
  };

  const getInputStyles = (): TextStyle[] => {
    const baseStyles: TextStyle[] = [
      styles.input,
      { color: colors.label_dark },
      multiline ? styles.multilineInput : {},
    ];

    // Only add fixed height if it exists and is greater than 0
    if (fixedHeight && fixedHeight > 0) {
      baseStyles.push({ height: fixedHeight - 2 });
    }

    // Add custom text styles if provided
    if (customTextStyles) {
      if (Array.isArray(customTextStyles)) {
        baseStyles.push(...customTextStyles);
      } else {
        baseStyles.push(customTextStyles);
      }
    }

    return baseStyles;
  };

  return (
    <CustomView>
      {/* Only render label if it's not empty */}
      {label && label.trim() !== "" && (
        <CustomText
          fontFamily="Inter-SemiBold"
          style={[styles.label, { color: colors.label_dark }]}
        >
          {label}
        </CustomText>
      )}
      <CustomView style={getContainerStyles()}>
        <TextInput
          style={getInputStyles()}
          numberOfLines={numOfLines}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor={colors.gray_regular}
          onFocus={() => setIsFocused(true)}
          editable={editable}
          onBlur={() => setIsFocused(false)}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          maxLength={maxLength}
          scrollEnabled={multiline}
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

      {/* Show character count if maxLength is set */}
      {maxLength && (
        <CustomText
          style={[styles.characterCount, { color: colors.gray_regular }]}
        >
          {value.length}/{maxLength}
        </CustomText>
      )}
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
  multilineContainer: {
    alignItems: "flex-start",
    minHeight: verticalScale(60),
  },
  input: {
    flex: 1,
    fontFamily: "Inter-Regular",
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: scaleFontSize(16),
  },
  multilineInput: {
    paddingTop: verticalScale(12),
  },
  visibilityToggle: {
    paddingHorizontal: 15,
  },
  visibilityToggleText: {
    fontSize: scaleFontSize(14),
  },
  characterCount: {
    fontSize: scaleFontSize(12),
    textAlign: "right",
    marginTop: verticalScale(4),
  },
});

export default CustomTextInput;
