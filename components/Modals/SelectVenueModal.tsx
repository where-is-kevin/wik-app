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
import { VenueItem } from "../VenueItem";
import { useGooglePlaces, VenueData } from "@/hooks/useGooglePlaces";
import { OnboardingSearch } from "../Onboarding/OnboardingSearch";
import { CreateModal } from "./CreateModal";

interface SelectVenueModalProps {
  visible: boolean;
  onClose: () => void;
  onVenueSelect: (venue: VenueData) => void;
  selectedVenue?: VenueData;
}

export const SelectVenueModal: React.FC<SelectVenueModalProps> = ({
  visible,
  onClose,
  onVenueSelect,
}) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const {
    results: searchResults,
    loading,
    error,
    searchPlaces,
    loadRecentVenues,
  } = useGooglePlaces();
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load recent venues when modal opens
  useEffect(() => {
    if (visible) {
      loadRecentVenues();
    }
  }, [visible]); // Removed loadRecentVenues from deps to prevent infinite loop

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length > 2) {
      searchTimeoutRef.current = setTimeout(() => {
        searchPlaces(searchQuery);
      }, 800);
    } else if (searchQuery.length === 0) {
      // Load recent venues when search is cleared
      loadRecentVenues();
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]); // Removed function deps to prevent infinite loop

  const handleVenuePress = (venue: VenueData) => {
    onVenueSelect(venue);
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

  const handleCancel = () => {
    setSearchQuery("");
    Keyboard.dismiss();
    onClose();
  };

  return (
    <CreateModal
      visible={visible}
      onClose={onClose}
      title="Select Venue"
      showCancelButton={true}
      onCancel={handleCancel}
    >
      <TouchableWithoutFeedback onPress={handleScreenTap}>
        <CustomView style={styles.container}>
          {/* Search Input */}
          <OnboardingSearch
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholder="Search locations..."
            autoFocus={false}
            autoCorrect={false}
            spellCheck={false}
            showIcon={true}
            customStyles={{
              marginBottom: verticalScale(0),
              marginTop: verticalScale(15),
            }}
          />

          {/* Venue Results */}
          <ScrollView
            style={styles.resultsContainer}
            // contentContainerStyle={{ paddingBottom: verticalScale(20) }}
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
              // Display search results
              <>
                {searchResults.map((venue) => (
                  <VenueItem
                    key={venue.id}
                    venue={venue}
                    onPress={handleVenuePress}
                    searchTerm={searchQuery}
                  />
                ))}
              </>
            ) : (
              // No results yet - showing loading or empty state
              <CustomView style={styles.noResultsContainer}>
                <CustomText
                  style={[styles.noResultsText, { color: colors.gray_regular }]}
                >
                  {searchQuery.length > 1
                    ? `No venues found for "${searchQuery}"`
                    : "Start typing to search for venues..."}
                </CustomText>
              </CustomView>
            )}
          </ScrollView>
        </CustomView>
      </TouchableWithoutFeedback>
    </CreateModal>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: verticalScale(280),
  },
  resultsContainer: {
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
