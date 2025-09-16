import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import { OnboardingStep } from "@/constants/onboardingSlides";
import { commonOnboardingStyles } from "./OnboardingStyles";
import { OnboardingLocationItem, LocationData } from "./OnboardingLocationItem";
import { useLocationSearch } from "@/hooks/useLocationSearch";
import { OnboardingSearch } from "./OnboardingSearch";

interface OnboardingLocationSlideProps {
  stepData: OnboardingStep;
  onLocationSelect: (location: LocationData | undefined) => void;
  selectedLocation?: LocationData;
}

export const OnboardingLocationSlide: React.FC<
  OnboardingLocationSlideProps
> = ({ stepData, onLocationSelect, selectedLocation }) => {
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
    setSearchQuery(""); // Clear search query when location is selected
    Keyboard.dismiss();
  };


  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    // If user starts typing and there's a selected location, clear it
    if (text.length > 0 && selectedLocation) {
      onLocationSelect(undefined); // Clear the selected location
    }
  };

  const handleScreenTap = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={handleScreenTap}>
      <CustomView style={commonOnboardingStyles.content}>
        <CustomText
          fontFamily="Inter-SemiBold"
          style={[commonOnboardingStyles.title, { color: colors.label_dark }]}
        >
          {stepData.title}
        </CustomText>
        <CustomText
          style={[
            commonOnboardingStyles.subtitle,
            { color: colors.gray_regular, marginBottom: verticalScale(32) },
          ]}
        >
          {stepData.subtitle}
        </CustomText>

        {/* Search Input */}
        <OnboardingSearch
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholder="Search for a destination..."
          autoFocus={false}
          autoCorrect={false}
          spellCheck={false}
          showIcon={true}
          customStyles={{ marginBottom: 0 }}
        />

        {/* Selected Location Display */}
        {selectedLocation && (
          <CustomView style={styles.selectedLocationContainer}>
            <CustomText
              style={[styles.selectedLabel, { color: colors.gray_regular }]}
            >
              Selected:
            </CustomText>
            <OnboardingLocationItem
              location={selectedLocation}
              onPress={handleLocationPress}
            />
          </CustomView>
        )}

        {/* Location Results - Only show if no location is selected */}
        {!selectedLocation && (
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
                  {/* Current Location option at the top of search results */}
                  <OnboardingLocationItem
                    key="current_location_search"
                    location={{
                      id: "current_location",
                      name: "Current location",
                      country: "",
                      fullName: "Current location",
                      isCurrentLocation: true
                    }}
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
                    location={{
                      id: "current_location",
                      name: "Current location",
                      country: "",
                      fullName: "Current location",
                      isCurrentLocation: true
                    }}
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
              <>
                {/* Current Location option when not searching */}
                <OnboardingLocationItem
                  key="current_location_default"
                  location={{
                    id: "current_location",
                    name: "Current location",
                    country: "",
                    fullName: "Current location",
                    isCurrentLocation: true
                  }}
                  onPress={handleLocationPress}
                />
                
                <CustomView style={styles.instructionContainer}>
                  <CustomText
                    style={[
                      styles.instructionText,
                      { color: colors.gray_regular },
                    ]}
                  >
                    Start typing to search for destinations...
                  </CustomText>
                </CustomView>
              </>
            )}
          </ScrollView>
        )}
      </CustomView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  selectedLocationContainer: {
    marginBottom: verticalScale(16),
  },
  selectedLabel: {
    fontSize: scaleFontSize(14),
    marginTop: 20,
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
    paddingHorizontal: horizontalScale(24),
  },
});
