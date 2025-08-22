import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import { horizontalScale, scaleFontSize, verticalScale } from "@/utilities/scaling";

export interface LocationData {
  id: string;
  name: string;
  country: string;
  fullName: string;
}

interface OnboardingLocationItemProps {
  location: LocationData;
  onPress: (location: LocationData) => void;
}

export const OnboardingLocationItem: React.FC<OnboardingLocationItemProps> = ({
  location,
  onPress,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.location_item_background || "#E8E3FF" }
      ]}
      onPress={() => onPress(location)}
      activeOpacity={0.7}
    >
      <CustomView style={[styles.iconContainer, { backgroundColor: colors.light_blue || "#3C62FA" }]}>
        <CustomText style={styles.iconText}>📍</CustomText>
      </CustomView>
      <CustomText
        style={[styles.locationText, { color: colors.label_dark }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {location.fullName}
      </CustomText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(16),
    marginHorizontal: horizontalScale(24),
    marginVertical: verticalScale(4),
    borderRadius: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: horizontalScale(12),
  },
  iconText: {
    fontSize: scaleFontSize(16),
  },
  locationText: {
    fontSize: scaleFontSize(16),
    flex: 1,
  },
});