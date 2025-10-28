import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import CustomText from "@/components/CustomText";
import CustomView from "@/components/CustomView";
import { useTheme } from "@/contexts/ThemeContext";
import { scaleFontSize, verticalScale } from "@/utilities/scaling";
import { trimString } from "@/utilities/stringHelpers";
import { extractCoordinatesFromUrl } from "@/utilities/eventHelpers";

interface LocationSectionProps {
  googleMapsUrl: string;
  address?: string;
  addressShort?: string | null;
  addressCity?: string | null;
  addressCountry?: string | null;
  title?: string | null;
  category?: string;
  onMapPress: () => void;
}

export const LocationSection: React.FC<LocationSectionProps> = ({
  googleMapsUrl,
  address,
  addressShort,
  addressCity,
  addressCountry,
  title,
  category,
  onMapPress,
}) => {
  const { colors } = useTheme();

  // Format city, country display
  const cityCountryText = [addressCity, addressCountry]
    .filter(Boolean)
    .join(", ");

  return (
    <CustomView style={styles.section}>
      <CustomText
        fontFamily="Inter-SemiBold"
        style={[styles.sectionTitle, { color: colors.label_dark }]}
      >
        Location
      </CustomText>
      <View style={styles.sectionDivider} />

      {/* Content Title */}
      {title && (
        <CustomText
          fontFamily="Inter-SemiBold"
          style={[
            styles.contentTitle,
            { color: colors.onboarding_option_dark },
          ]}
        >
          {trimString(title)}
        </CustomText>
      )}

      {/* City, Country or fallback to addressShort/address */}
      {(cityCountryText || addressShort || address) && (
        <CustomText
          style={[styles.sectionText, { color: colors.gray_regular }]}
        >
          {cityCountryText || addressShort || address}
        </CustomText>
      )}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            ...extractCoordinatesFromUrl(googleMapsUrl),
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
          mapType="standard"
        >
          <Marker
            coordinate={extractCoordinatesFromUrl(googleMapsUrl)}
            title={
              trimString(title) ||
              trimString(address) ||
              trimString(category) ||
              "Location"
            }
          />
        </MapView>
        <TouchableOpacity
          style={styles.mapOverlay}
          onPress={onMapPress}
          activeOpacity={0.7}
        />
      </View>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingVertical: verticalScale(16),
  },
  sectionDivider: {
    height: 0.5,
    backgroundColor: "#D6D6D9",
    marginTop: verticalScale(10),
    marginBottom: verticalScale(14),
  },
  sectionTitle: {
    fontSize: scaleFontSize(14),
  },
  contentTitle: {
    fontSize: scaleFontSize(16),
    marginBottom: verticalScale(4),
  },
  sectionText: {
    fontSize: scaleFontSize(14),
  },
  mapContainer: {
    height: verticalScale(120),
    marginTop: verticalScale(10),
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
