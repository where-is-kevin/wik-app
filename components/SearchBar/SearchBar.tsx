import React from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import CustomView from "../CustomView";
import SearchSvg from "../SvgComponents/SearchSvg";

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  showClearButton?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  iconColor?: string;
  borderColor?: string;
  backgroundColor?: string;
  autoFocus?: boolean;
  editable?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
  returnKeyType?: "done" | "search" | "next" | "go" | "send";
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search...",
  value,
  onChangeText,
  onClear,
  showClearButton = true,
  containerStyle,
  inputStyle,
  iconColor,
  borderColor,
  backgroundColor,
  autoFocus = false,
  editable = true,
  onFocus,
  onBlur,
  onSubmitEditing,
  returnKeyType = "search",
}) => {
  const { colors } = useTheme();

  const handleClear = () => {
    onChangeText("");
    if (onClear) {
      onClear();
    }
  };

  return (
    <CustomView style={[styles.container, containerStyle]}>
      <CustomView style={[styles.searchInputContainer]}>
        {/* Search Icon */}
        <SearchSvg />

        {/* Text Input */}
        <TextInput
          style={[styles.searchInput, { color: colors.label_dark }, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={colors.gray_regular}
          value={value}
          onChangeText={onChangeText}
          autoFocus={autoFocus}
          autoCorrect={false}
          editable={editable}
          onFocus={onFocus}
          onBlur={onBlur}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
        />

        {/* Clear Button */}
        {/* {showClearButton && value.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={[styles.clearIcon, { color: colors.label_medium }]}>
              ✕
            </Text>
          </TouchableOpacity>
        )} */}
      </CustomView>
    </CustomView>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: horizontalScale(24),
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D6D6D9",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: scaleFontSize(14),
    marginLeft: 8,
    fontFamily: "Inter-Regular",
  },
  clearButton: {
    padding: horizontalScale(4),
  },
  clearIcon: {
    fontSize: scaleFontSize(14),
    fontWeight: "bold",
  },
});
