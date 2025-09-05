import React from "react";
import { StyleSheet, TextInput, KeyboardTypeOptions, ViewStyle } from "react-native";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import OnboardingSearchSvg from "../SvgComponents/OnboardingSearchSvg";

interface OnboardingSearchProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  spellCheck?: boolean;
  autoFocus?: boolean;
  showIcon?: boolean;
  onBlur?: () => void;
  hasError?: boolean;
  errorMessage?: string;
  customStyles?: ViewStyle;
  editable?: boolean;
}

export const OnboardingSearch: React.FC<OnboardingSearchProps> = ({
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "none",
  autoCorrect = false,
  spellCheck = false,
  autoFocus = false,
  showIcon = true,
  onBlur,
  hasError = false,
  errorMessage,
  customStyles,
  editable = true,
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <CustomView style={[styles.container, customStyles]}>
      <CustomView
        style={[
          styles.searchContainer,
          !showIcon && { paddingVertical: 15.5 },
          { 
            borderColor: hasError 
              ? "#FF3B30" 
              : isFocused 
              ? "#3C62FA" 
              : colors.input_border 
          },
        ]}
      >
        <TextInput
          style={[styles.searchInput, { color: colors.label_dark }]}
          placeholder={placeholder}
          placeholderTextColor={colors.gray_regular}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          spellCheck={spellCheck}
          autoFocus={autoFocus}
          editable={editable}
        />
        {showIcon && (
          <CustomView style={styles.searchIconContainer}>
            <OnboardingSearchSvg />
          </CustomView>
        )}
      </CustomView>
      
      {errorMessage && (
        <CustomText style={[styles.errorText, { color: "#FF3B30" }]}>
          {errorMessage}
        </CustomText>
      )}
    </CustomView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: verticalScale(24),
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  searchInput: {
    flex: 1,
    fontSize: scaleFontSize(14),
    paddingRight: horizontalScale(8),
  },
  searchIconContainer: {
    padding: horizontalScale(4),
  },
  errorText: {
    fontSize: scaleFontSize(12),
    marginTop: verticalScale(8),
    marginLeft: verticalScale(4),
  },
});
