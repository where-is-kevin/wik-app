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


export const OnboardingFormLocationModal: React.FC<
  OnboardingFormLocationModalProps
> = ({ visible, onClose, onLocationSelect, selectedLocation }) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const {
    results: searchResults,
    loading,
    error,
    apiMessage,
    searchLocations,
    clearResults,
    loadAllLocations,
  } = useLocationSearch();
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load all locations when modal opens
  useEffect(() => {
    if (visible) {
      loadAllLocations();
    }
  }, [visible]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length > 1) {
      searchTimeoutRef.current = setTimeout(() => {
        searchLocations(searchQuery);
      }, 400);
    } else if (searchQuery.length === 0) {
      // Load all locations when search is cleared
      loadAllLocations();
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleLocationPress = (location: LocationData) => {
    // Don't allow selection of header items
    if (location.isHeader) {
      return;
    }
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
            ) : searchResults.length > 0 ? (
              // Display grouped search results
              <>
                {searchResults.map((location) => (
                  <OnboardingLocationItem
                    key={location.id}
                    location={location}
                    onPress={handleLocationPress}
                    searchTerm={searchQuery}
                  />
                ))}
                {/* Show API message if available (e.g., "We're not there yet.") */}
                {apiMessage && searchResults.length === 1 && searchResults[0].isCurrentLocation && (
                  <CustomView style={styles.noResultsContainer}>
                    <CustomText
                      style={[
                        styles.noResultsText,
                        { color: colors.gray_regular },
                      ]}
                    >
                      {apiMessage}
                    </CustomText>
                  </CustomView>
                )}
              </>
            ) : (
              // No results yet - showing loading or empty state
              <CustomView style={styles.noResultsContainer}>
                <CustomText
                  style={[
                    styles.noResultsText,
                    { color: colors.gray_regular },
                  ]}
                >
                  {apiMessage || (searchQuery.length > 1
                    ? `No locations found for "${searchQuery}"`
                    : "Loading locations..."
                  )}
                </CustomText>
              </CustomView>
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
