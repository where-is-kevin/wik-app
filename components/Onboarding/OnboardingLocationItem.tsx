import React from "react";
import { StyleSheet, TouchableOpacity, Text } from "react-native";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import { scaleFontSize, verticalScale } from "@/utilities/scaling";
import LocationPinSvg from "../SvgComponents/LocationPinSvg";

export interface LocationData {
  id: string;
  name: string;
  country: string;
  fullName: string;
  isCurrentLocation?: boolean; // Optional flag for current location
  isHeader?: boolean; // Flag for country headers
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

  // Render country header
  if (location.isHeader) {
    return (
      <CustomView style={styles.headerContainer}>
        <CustomText
          fontFamily="Inter-SemiBold"
          style={[styles.headerText, { color: colors.event_gray }]}
        >
          {location.name}
        </CustomText>
      </CustomView>
    );
  }

  // Render current location
  if (location.isCurrentLocation) {
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
        <CustomText
          fontFamily="Inter-Medium"
          style={[styles.locationText, { color: colors.label_dark }]}
        >
          Current Location
        </CustomText>
      </TouchableOpacity>
    );
  }

  const renderHighlightedText = () => {
    const displayText = location.name; // Only show city name, not full name with country

    if (!searchTerm || searchTerm.length === 0) {
      return (
        <CustomText
          style={[styles.locationText, { color: colors.label_dark }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {displayText}
        </CustomText>
      );
    }

    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = displayText.split(regex);

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

  // Render regular city item
  return (
    <TouchableOpacity
      style={[styles.container, styles.cityItem]}
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
    paddingTop: verticalScale(12),
  },
  cityItem: {},
  headerContainer: {
    width: "100%",
    paddingTop: verticalScale(12),
    // paddingBottom: verticalScale(8),
  },
  headerText: {
    fontSize: scaleFontSize(15),
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
