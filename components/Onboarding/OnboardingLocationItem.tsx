import React from "react";
import { StyleSheet, TouchableOpacity, Text } from "react-native";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import LocationPinSvg from "../SvgComponents/LocationPinSvg";
import LocationSvg from "../SvgComponents/LocationSvg";

export interface LocationData {
  id: string;
  name: string;
  country: string;
  fullName: string;
  isCurrentLocation?: boolean; // Optional flag for current location
}

interface OnboardingLocationItemProps {
  location: LocationData;
  onPress: (location: LocationData) => void;
  searchTerm?: string;
}

export const OnboardingLocationItem: React.FC<OnboardingLocationItemProps> = ({
  location,
  onPress,
  searchTerm,
}) => {
  const { colors } = useTheme();

  const renderHighlightedText = () => {
    if (!searchTerm || searchTerm.length === 0) {
      return (
        <CustomText
          style={[styles.locationText, { color: colors.label_dark }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {location.fullName}
        </CustomText>
      );
    }

    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = location.fullName.split(regex);

    return (
      <Text
        style={[styles.locationText, { color: colors.label_dark }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {parts.map((part, index) => {
          const isHighlight = regex.test(part);
          return (
            <CustomText
              fontFamily={isHighlight ? "Inter-Bold" : "Inter-Regular"}
              key={index}
            >
              {part}
            </CustomText>
          );
        })}
      </Text>
    );
  };

  return (
    <TouchableOpacity
      style={[styles.container]}
      onPress={() => onPress(location)}
      activeOpacity={0.7}
    >
      <CustomView
        style={[
          styles.iconContainer,
          { backgroundColor: colors.tag_gray_text || "#3C62FA" },
        ]}
      >
        <LocationPinSvg />
      </CustomView>
      {renderHighlightedText()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
  },
  iconContainer: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 12,
  },
  locationText: {
    fontSize: scaleFontSize(14),
    flex: 1,
  },
  highlightedText: {
    fontWeight: "600",
  },
});
