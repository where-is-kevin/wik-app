import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
} from "react-native";
import CustomView from "@/components/CustomView";
import CustomText from "@/components/CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import {
  OnboardingLocationItem,
  LocationData,
} from "@/components/Onboarding/OnboardingLocationItem";
import { useLocationSearch } from "@/hooks/useLocationSearch";
import { OnboardingSearch } from "@/components/Onboarding/OnboardingSearch";
import CustomTouchable from "@/components/CustomTouchableOpacity";
import { useUserLocation } from "@/contexts/UserLocationContext";
import {
  createCurrentLocationPreference,
  createSelectedLocationPreference,
} from "@/utilities/locationHelpers";
import * as Location from "expo-location";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useUpdateUserLocation } from "@/hooks/useUser";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LocationSelectionScreen = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const { userLocation, setUserLocation } = useUserLocation();
  const updateUserLocationMutation = useUpdateUserLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<
    LocationData | undefined
  >();
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    results: searchResults,
    loading,
    error,
    apiMessage,
    searchLocations,
    loadAllLocations,
    clearResults,
  } = useLocationSearch();

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load all locations when screen mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        await loadAllLocations();
      } catch {
        // Silently handle location loading errors
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length > 1) {
      searchTimeoutRef.current = setTimeout(() => {
        searchLocations(searchQuery);
      }, 400);
    } else if (searchQuery.length === 0) {
      // When search is cleared, reload all locations
      loadAllLocations();
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
    setSelectedLocation(location);
    setSearchQuery(""); // Clear search query when location is selected
    Keyboard.dismiss();
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    // If user starts typing and there's a selected location, clear it
    if (text.length > 0 && selectedLocation) {
      setSelectedLocation(undefined);
    }
  };

  const handleScreenTap = () => {
    Keyboard.dismiss();
  };

  const handleConfirm = async () => {
    if (selectedLocation && !isUpdating) {
      setIsUpdating(true);
      try {
        let locationValue = "";

        if (selectedLocation.isCurrentLocation) {
          // User selected "Current Location" - get device location if available
          const { status } = await Location.getForegroundPermissionsAsync();
          if (status === Location.PermissionStatus.GRANTED) {
            const currentLocation = await Location.getCurrentPositionAsync();
            const locationData = createCurrentLocationPreference(
              currentLocation.coords.latitude,
              currentLocation.coords.longitude,
              "Current Location"
            );
            await setUserLocation(locationData);
            locationValue = "Current Location";
          } else {
            // Permission not granted - still save as current location type without coordinates
            const locationData = createCurrentLocationPreference(
              0,
              0,
              "Current Location"
            );
            await setUserLocation(locationData);
            locationValue = "Current Location";
          }
        } else {
          // User selected a specific location - save without coordinates
          const locationData = createSelectedLocationPreference(
            selectedLocation.fullName,
            selectedLocation.name + ", " + selectedLocation.country,
            selectedLocation.id
          );
          await setUserLocation(locationData);
          locationValue = selectedLocation.fullName;
        }

        // Update the user location using the dedicated API endpoint
        await updateUserLocationMutation.mutateAsync(locationValue);

        // Navigate back
        router.back();
      } catch {
        // Silently handle location preference errors
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleCancel = () => {
    setSelectedLocation(undefined);
    setSearchQuery("");
    router.back();
  };

  return (
    <CustomView style={[styles.container, { paddingTop: insets.top }]}>
      <CustomView style={styles.header}>
        <CustomTouchable onPress={handleCancel}>
          <CustomText
            style={[styles.cancelText, { color: colors.gray_regular }]}
          >
            Cancel
          </CustomText>
        </CustomTouchable>

        <CustomText
          fontFamily="Inter-SemiBold"
          style={[styles.title, { color: colors.label_dark }]}
        >
          Change Location
        </CustomText>

        <CustomTouchable
          onPress={handleConfirm}
          disabled={!selectedLocation || isUpdating}
        >
          <CustomText
            style={[
              styles.confirmText,
              {
                color:
                  selectedLocation && !isUpdating
                    ? colors.light_blue
                    : colors.gray_regular,
              },
            ]}
          >
            {isUpdating ? "..." : "Done"}
          </CustomText>
        </CustomTouchable>
      </CustomView>

      <TouchableWithoutFeedback onPress={handleScreenTap}>
        <CustomView style={styles.content}>
          <CustomText style={[styles.subtitle, { color: colors.gray_regular }]}>
            Choose your preferred location for content recommendations
          </CustomText>

          {/* Search Input */}
          <OnboardingSearch
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholder="Search for a city..."
            autoFocus={false}
            autoCorrect={false}
            spellCheck={false}
            showIcon={true}
            customStyles={{ marginBottom: verticalScale(16) }}
          />

          {/* Current Selection Display */}
          {userLocation?.displayName && !selectedLocation && (
            <CustomView style={styles.currentLocationContainer}>
              <CustomText
                style={[styles.currentLabel, { color: colors.gray_regular }]}
              >
                Current: {userLocation.displayName}
              </CustomText>
            </CustomView>
          )}

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

          {/* Location Results */}
          {!selectedLocation && (
            <ScrollView
              style={styles.resultsContainer}
              contentContainerStyle={{ paddingBottom: verticalScale(30) }}
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
              ) : searchQuery.length > 1 ||
                (!searchQuery && searchResults.length > 0) ? (
                searchResults.length > 0 ? (
                  <>
                    {/* Display search results */}
                    {searchResults.map((location) => (
                      <OnboardingLocationItem
                        key={location.id}
                        location={location}
                        onPress={handleLocationPress}
                        searchTerm={searchQuery}
                      />
                    ))}
                    {/* Show API message when only Current Location exists */}
                    {apiMessage &&
                      searchResults.length === 1 &&
                      searchResults[0].isCurrentLocation && (
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
                  <>
                    <CustomView style={styles.noResultsContainer}>
                      <CustomText
                        style={[
                          styles.noResultsText,
                          { color: colors.gray_regular },
                        ]}
                      >
                        {apiMessage ||
                          `No locations found for "${searchQuery}"`}
                      </CustomText>
                    </CustomView>
                  </>
                )
              ) : searchResults.length > 0 ? (
                // Show all locations when not searching
                searchResults.map((location) => (
                  <OnboardingLocationItem
                    key={location.id}
                    location={location}
                    onPress={handleLocationPress}
                  />
                ))
              ) : (
                <CustomView style={styles.instructionContainer}>
                  <CustomText
                    style={[
                      styles.instructionText,
                      { color: colors.gray_regular },
                    ]}
                  >
                    Loading locations...
                  </CustomText>
                </CustomView>
              )}
            </ScrollView>
          )}
        </CustomView>
      </TouchableWithoutFeedback>
    </CustomView>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background || "#FFFFFF",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: horizontalScale(24),
      paddingVertical: verticalScale(16),
      borderBottomWidth: 1,
      borderBottomColor: "#E5E5E5",
    },
    content: {
      flex: 1,
      paddingHorizontal: horizontalScale(24),
      paddingTop: verticalScale(24),
    },
    cancelText: {
      fontSize: scaleFontSize(16),
      fontFamily: "Inter-Regular",
    },
    title: {
      fontSize: scaleFontSize(18),
      textAlign: "center",
    },
    confirmText: {
      fontSize: scaleFontSize(16),
      fontFamily: "Inter-SemiBold",
    },
    subtitle: {
      fontSize: scaleFontSize(14),
      textAlign: "center",
      marginBottom: verticalScale(24),
    },
    currentLocationContainer: {
      marginBottom: 6,
    },
    currentLabel: {
      fontSize: scaleFontSize(14),
    },
    selectedLocationContainer: {
      marginBottom: verticalScale(16),
    },
    selectedLabel: {
      fontSize: scaleFontSize(14),
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

export default LocationSelectionScreen;
