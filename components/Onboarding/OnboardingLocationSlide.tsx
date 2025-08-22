import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, TextInput, ScrollView, TouchableWithoutFeedback, Keyboard } from "react-native";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import { horizontalScale, scaleFontSize, verticalScale } from "@/utilities/scaling";
import { OnboardingStep } from "@/constants/onboardingSlides";
import { commonOnboardingStyles } from "./OnboardingStyles";
import { OnboardingLocationItem, LocationData } from "./OnboardingLocationItem";
import { useLocationSearch } from "@/hooks/useLocationSearch";

interface OnboardingLocationSlideProps {
  stepData: OnboardingStep;
  onLocationSelect: (location: LocationData) => void;
  selectedLocation?: LocationData;
}


export const OnboardingLocationSlide: React.FC<OnboardingLocationSlideProps> = ({
  stepData,
  onLocationSelect,
  selectedLocation,
}) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const { results: searchResults, loading, error, searchLocations, clearResults } = useLocationSearch();
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length > 1) {
      searchTimeoutRef.current = setTimeout(() => {
        const cleanup = searchLocations(searchQuery);
        return cleanup;
      }, 300);
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
    Keyboard.dismiss();
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
          { color: colors.gray_regular, marginBottom: verticalScale(32) }
        ]}
      >
        {stepData.subtitle}
      </CustomText>

      {/* Search Input */}
      <CustomView style={[styles.searchContainer, { borderColor: colors.onboarding_gray }]}>
        <TextInput
          style={[styles.searchInput, { color: colors.label_dark }]}
          placeholder="Search for a destination..."
          placeholderTextColor={colors.gray_regular}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus={false}
        />
        <CustomView style={styles.searchIconContainer}>
          <CustomText style={[styles.searchIcon, { color: colors.light_blue }]}>🔍</CustomText>
        </CustomView>
      </CustomView>

      {/* Selected Location Display */}
      {selectedLocation && (
        <CustomView style={styles.selectedLocationContainer}>
          <CustomText style={[styles.selectedLabel, { color: colors.gray_regular }]}>
            Selected:
          </CustomText>
          <OnboardingLocationItem
            location={selectedLocation}
            onPress={handleLocationPress}
          />
        </CustomView>
      )}

      {/* Location Results */}
      <ScrollView 
        style={styles.resultsContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {loading ? (
          <CustomView style={styles.loadingContainer}>
            <CustomText style={[styles.loadingText, { color: colors.gray_regular }]}>
              Searching...
            </CustomText>
          </CustomView>
        ) : error ? (
          <CustomView style={styles.errorContainer}>
            <CustomText style={[styles.errorText, { color: colors.gray_regular }]}>
              {error}
            </CustomText>
          </CustomView>
        ) : searchQuery.length > 1 ? (
          searchResults.length > 0 ? (
            searchResults.map((location) => (
              <OnboardingLocationItem
                key={location.id}
                location={location}
                onPress={handleLocationPress}
              />
            ))
          ) : (
            <CustomView style={styles.noResultsContainer}>
              <CustomText style={[styles.noResultsText, { color: colors.gray_regular }]}>
                No locations found for "{searchQuery}"
              </CustomText>
            </CustomView>
          )
        ) : (
          <CustomView style={styles.instructionContainer}>
            <CustomText style={[styles.instructionText, { color: colors.gray_regular }]}>
              Start typing to search for destinations...
            </CustomText>
          </CustomView>
        )}
      </ScrollView>
      </CustomView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
    marginHorizontal: horizontalScale(24),
    marginBottom: verticalScale(24),
    backgroundColor: "#FFFFFF",
  },
  searchInput: {
    flex: 1,
    fontSize: scaleFontSize(16),
    paddingRight: horizontalScale(8),
  },
  searchIconContainer: {
    padding: horizontalScale(4),
  },
  searchIcon: {
    fontSize: scaleFontSize(16),
  },
  selectedLocationContainer: {
    marginBottom: verticalScale(16),
  },
  selectedLabel: {
    fontSize: scaleFontSize(14),
    marginLeft: horizontalScale(24),
    marginBottom: verticalScale(8),
  },
  resultsContainer: {
    flex: 1,
    width: "100%",
  },
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(32),
  },
  noResultsText: {
    fontSize: scaleFontSize(16),
    textAlign: "center",
  },
  instructionContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(32),
  },
  instructionText: {
    fontSize: scaleFontSize(16),
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
    paddingVertical: verticalScale(32),
  },
  errorText: {
    fontSize: scaleFontSize(16),
    textAlign: "center",
    paddingHorizontal: horizontalScale(24),
  },
});