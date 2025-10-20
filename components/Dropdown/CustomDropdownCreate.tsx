import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import CustomText from "@/components/CustomText";
import CreateChevronDownSvg from "@/components/SvgComponents/CreateChevronDownSvg";
import CreateTypeSvg from "@/components/SvgComponents/CreateTypeSvg";
import CreateUserTypeSvg from "@/components/SvgComponents/CreateUserTypeSvg";
import CreateLocationSvg from "@/components/SvgComponents/CreateLocationSvg";
import CreateDescriptionSvg from "@/components/SvgComponents/CreateDescriptionSvg";
import CreateBuildingSvg from "@/components/SvgComponents/CreateBuildingSvg";
import CreateTagSvg from "@/components/SvgComponents/CreateTagSvg";
import CreateLinkSvg from "@/components/SvgComponents/CreateLinkSvg";
import CreateCapacitySvg from "@/components/SvgComponents/CreateCapacitySvg";
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
  iconType?:
    | "type"
    | "userType"
    | "location"
    | "description"
    | "industry"
    | "tags"
    | "link"
    | "price"
    | "capacity";
  showChevron?: boolean;
  hideLabel?: boolean;
}

export const CustomDropdownCreate: React.FC<CustomDropdownCreateProps> = ({
  label,
  value,
  onPress,
  iconType,
  showChevron = true,
  hideLabel = false,
}) => {
  const { colors } = useTheme();

  const renderIcon = () => {
    switch (iconType) {
      case "type":
        return <CreateTypeSvg width={24} height={24} />;
      case "userType":
        return <CreateUserTypeSvg width={24} height={24} />;
      case "location":
        return <CreateLocationSvg width={24} height={24} />;
      case "description":
        return <CreateDescriptionSvg width={24} height={24} />;
      case "industry":
        return <CreateBuildingSvg width={24} height={24} />;
      case "tags":
        return <CreateTagSvg width={24} height={24} />;
      case "link":
        return <CreateLinkSvg width={24} height={24} />;
      case "price":
        return <CreateLinkSvg width={24} height={24} />; // Using link icon for price for now
      case "capacity":
        return <CreateCapacitySvg width={24} height={24} />;
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      style={styles.dropdownButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.dropdownContent}>
        <View style={styles.iconContainer}>{renderIcon()}</View>
        {!hideLabel && (
          <CustomText
            style={[
              styles.dropdownLabel,
              { color: colors.onboarding_option_dark },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {label}
          </CustomText>
        )}
        {value ? (
          <CustomText
            fontFamily="Inter-Medium"
            style={[
              styles.dropdownValue,
              { color: colors.label_dark },
              hideLabel && styles.dropdownValueFullWidth,
              { flex: hideLabel ? 1 : 0 },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {value}
          </CustomText>
        ) : null}
        {showChevron && (
          <View style={styles.chevronContainer}>
            <CreateChevronDownSvg />
          </View>
        )}
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
  dropdownValueFullWidth: {
    textAlign: "left",
  },
  chevronContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});
