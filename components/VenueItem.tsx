import React from "react";
import { StyleSheet, TouchableOpacity, Text } from "react-native";
import CustomView from "./CustomView";
import CustomText from "./CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import { scaleFontSize, verticalScale } from "@/utilities/scaling";
import LocationPinSvg from "./SvgComponents/LocationPinSvg";
import { VenueData } from "@/hooks/useGooglePlaces";

interface VenueItemProps {
  venue: VenueData;
  onPress: (venue: VenueData) => void;
  searchTerm?: string;
}

export const VenueItem: React.FC<VenueItemProps> = ({
  venue,
  onPress,
  searchTerm,
}) => {
  const { colors } = useTheme();

  // Render current location
  if (venue.isCurrentLocation) {
    return (
      <TouchableOpacity
        style={[styles.container]}
        onPress={() => onPress(venue)}
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
        <CustomText style={[styles.venueText, { color: colors.label_dark }]}>
          Current Location
        </CustomText>
      </TouchableOpacity>
    );
  }

  const renderHighlightedText = () => {
    const displayText = venue.name;

    if (!searchTerm || searchTerm.length === 0) {
      return (
        <CustomView style={styles.textContainer}>
          <CustomText
            style={[styles.venueText, { color: colors.label_dark }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {displayText}
          </CustomText>
          {venue.address && (
            <CustomText
              style={[styles.addressText, { color: colors.gray_regular }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {venue.address}
            </CustomText>
          )}
        </CustomView>
      );
    }

    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = displayText.split(regex);

    return (
      <CustomView style={styles.textContainer}>
        <Text
          style={[styles.venueText, { color: colors.label_dark }]}
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
        {venue.address && (
          <CustomText
            style={[styles.addressText, { color: colors.gray_regular }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {venue.address}
          </CustomText>
        )}
      </CustomView>
    );
  };

  // Render regular venue item
  return (
    <TouchableOpacity
      style={[styles.container]}
      onPress={() => onPress(venue)}
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
  iconContainer: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  venueText: {
    fontSize: scaleFontSize(14),
    marginBottom: 2,
  },
  addressText: {
    fontSize: scaleFontSize(12),
  },
});