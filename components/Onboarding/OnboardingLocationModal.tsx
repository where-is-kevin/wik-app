import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import { scaleFontSize, verticalScale } from "@/utilities/scaling";
import { OnboardingLocationItem, LocationData } from "./OnboardingLocationItem";
import { useLocationSearch } from "@/hooks/useLocationSearch";
import { OnboardingSearch } from "./OnboardingSearch";
import { OnboardingBlurModal } from "./OnboardingModal";
import { TouchableOpacity } from "react-native";
import LocationSvg from "../SvgComponents/LocationSvg";

interface OnboardingFormLocationModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: LocationData) => void;
  selectedLocation?: LocationData;
}

const DEFAULT_LOCATIONS: LocationData[] = [
  {
    id: "current_location",
    name: "Current location",
    country: "",
    fullName: "Current location",
    isCurrentLocation: true, // Special flag to identify current location
  },
  {
    id: "lisbon",
    name: "Lisbon, Portugal",
    country: "Portugal",
    fullName: "Lisbon, Portugal",
  },
  {
    id: "london",
    name: "London, United Kingdom",
    country: "United Kingdom",
    fullName: "London, United Kingdom",
  },
  {
    id: "belgrade",
    name: "Belgrade, Serbia",
    country: "Serbia",
    fullName: "Belgrade, Serbia",
  },
  {
    id: "toronto",
    name: "Toronto, Canada",
    country: "Canada",
    fullName: "Toronto, Canada",
  },
];

export const OnboardingFormLocationModal: React.FC<
  OnboardingFormLocationModalProps
> = ({ visible, onClose, onLocationSelect, selectedLocation }) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const {
    results: searchResults,
    loading,
    error,
    searchLocations,
    clearResults,
  } = useLocationSearch();
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length > 1) {
      searchTimeoutRef.current = setTimeout(() => {
        searchLocations(searchQuery);
      }, 400);
    } else {
      clearResults();
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleLocationPress = (location: LocationData) => {
    onLocationSelect(location);
    setSearchQuery("");
    Keyboard.dismiss();
    onClose();
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleScreenTap = () => {
    Keyboard.dismiss();
  };

  return (
    <OnboardingBlurModal
      visible={visible}
      onClose={onClose}
      title="Current Location - Search"
    >
      <TouchableWithoutFeedback onPress={handleScreenTap}>
        <CustomView style={styles.container}>
          {/* Search Input */}
          <OnboardingSearch
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholder="Current Location"
            autoFocus={false}
            autoCorrect={false}
            spellCheck={false}
            showIcon={true}
            customStyles={{ marginBottom: 0 }}
          />

          {/* Location Results */}
          <ScrollView
            style={styles.resultsContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {loading ? (
              <CustomView style={styles.loadingContainer}>
                <CustomText
                  style={[styles.loadingText, { color: colors.gray_regular }]}
                >
                  Searching...
                </CustomText>
              </CustomView>
            ) : error ? (
              <CustomView style={styles.errorContainer}>
                <CustomText
                  style={[styles.errorText, { color: colors.gray_regular }]}
                >
                  {error}
                </CustomText>
              </CustomView>
            ) : searchQuery.length > 1 ? (
              searchResults.length > 0 ? (
                <>
                  {/* Current Location option at the top */}
                  <OnboardingLocationItem
                    key="current_location_search"
                    location={DEFAULT_LOCATIONS[0]} // Current location is first in array
                    onPress={handleLocationPress}
                  />
                  {searchResults.map((location) => (
                    <OnboardingLocationItem
                      key={location.id}
                      location={location}
                      onPress={handleLocationPress}
                      searchTerm={searchQuery}
                    />
                  ))}
                </>
              ) : (
                <>
                  {/* Current Location option when no search results */}
                  <OnboardingLocationItem
                    key="current_location_no_results"
                    location={DEFAULT_LOCATIONS[0]} // Current location is first in array
                    onPress={handleLocationPress}
                  />
                  <CustomView style={styles.noResultsContainer}>
                    <CustomText
                      style={[
                        styles.noResultsText,
                        { color: colors.gray_regular },
                      ]}
                    >
                      No locations found for "{searchQuery}"
                    </CustomText>
                  </CustomView>
                </>
              )
            ) : (
              DEFAULT_LOCATIONS.map((location) => (
                <OnboardingLocationItem
                  key={location.id}
                  location={location}
                  onPress={handleLocationPress}
                />
              ))
            )}
          </ScrollView>
        </CustomView>
      </TouchableWithoutFeedback>
    </OnboardingBlurModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  resultsContainer: {
    flex: 1,
    width: "100%",
  },
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(20),
  },
  noResultsText: {
    fontSize: scaleFontSize(14),
    textAlign: "center",
  },
  instructionContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(20),
  },
  instructionText: {
    fontSize: scaleFontSize(14),
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(32),
  },
  loadingText: {
    fontSize: scaleFontSize(16),
    textAlign: "center",
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(20),
  },
  errorText: {
    fontSize: scaleFontSize(14),
    textAlign: "center",
  },
});
