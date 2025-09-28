import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import CustomText from "@/components/CustomText";
import CreateChevronDownSvg from "@/components/SvgComponents/CreateChevronDownSvg";
import CreateTypeSvg from "@/components/SvgComponents/CreateTypeSvg";
import CreateUserTypeSvg from "@/components/SvgComponents/CreateUserTypeSvg";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  verticalScale,
  scaleFontSize,
} from "@/utilities/scaling";

interface CustomDropdownCreateProps {
  label: string;
  value: string;
  onPress: () => void;
  iconType?: "type" | "userType";
}

export const CustomDropdownCreate: React.FC<CustomDropdownCreateProps> = ({
  label,
  value,
  onPress,
  iconType,
}) => {
  const { colors } = useTheme();

  const renderIcon = () => {
    if (iconType === "type") {
      return <CreateTypeSvg width={24} height={24} />;
    } else if (iconType === "userType") {
      return <CreateUserTypeSvg width={24} height={24} />;
    }
    return null;
  };

  return (
    <TouchableOpacity
      style={styles.dropdownButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.dropdownContent}>
        <View style={styles.iconContainer}>{renderIcon()}</View>
        <CustomText
          style={[
            styles.dropdownLabel,
            { color: colors.onboarding_option_dark },
          ]}
        >
          {label}
        </CustomText>
        <CustomText
          fontFamily="Inter-Medium"
          style={[styles.dropdownValue, { color: colors.label_dark }]}
        >
          {value}
        </CustomText>
        <View style={styles.chevronContainer}>
          <CreateChevronDownSvg width={20} height={20} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dropdownButton: {
    alignSelf: "stretch",
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 15,
    paddingRight: 10,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    marginBottom: verticalScale(10),
  },
  dropdownContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  iconContainer: {
    width: 24,
    height: 24,
    marginRight: horizontalScale(10),
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownLabel: {
    fontSize: scaleFontSize(16),
    flex: 1,
  },
  dropdownValue: {
    fontSize: scaleFontSize(16),
    marginRight: horizontalScale(5),
  },
  chevronContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});
