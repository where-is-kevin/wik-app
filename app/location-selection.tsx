import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView } from "react-native";
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
import { useUserLocation } from "@/contexts/UserLocationContext";
import {
  createCurrentLocationPreference,
  createSelectedLocationPreference,
} from "@/utilities/locationHelpers";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useUpdateUserLocation } from "@/hooks/useUser";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackHeader from "@/components/Header/BackHeader";
import AnimatedLoader from "@/components/Loader/AnimatedLoader";

const LocationSelectionScreen = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const { userLocation, setUserLocation } = useUserLocation();
  const updateUserLocationMutation = useUpdateUserLocation();
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    results: searchResults,
    loading,
    error,
    loadAllLocations,
  } = useLocationSearch();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // loadAllLocations is not stable from useLocationSearch hook

  const handleLocationPress = async (location: LocationData) => {

    // Start loading immediately when location is pressed
    setIsUpdating(true);

    try {
      let locationValue = "";

      if (location.isCurrentLocation) {
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
          location.fullName,
          location.name + ", " + location.country,
          location.id
        );
        await setUserLocation(locationData);
        locationValue = location.fullName;
      }

      // Update the user location using the dedicated API endpoint
      await updateUserLocationMutation.mutateAsync(locationValue);
    } catch (error) {
      console.warn("Location update failed:", error);
      // Continue to navigate back even if location update fails
    } finally {
      setIsUpdating(false);
      // Always navigate back, regardless of success or failure
      try {
        router.back();
      } catch (navError) {
        console.warn("Navigation back failed:", navError);
        // Fallback: try to navigate to the main tab
        router.push("/(tabs)");
      }
    }
  };

  return (
    <CustomView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Blue Back Button */}
      <BackHeader transparent={true} />

      <CustomView style={styles.content}>
        <CustomText
          fontFamily="Inter-SemiBold"
          style={[styles.pageTitle, { color: colors.label_dark }]}
        >
          Change Location
        </CustomText>
        <CustomText style={[styles.subtitle, { color: colors.gray_regular }]}>
          Choose your location for travel suggestions.
        </CustomText>

        {/* Current Selection Display */}
        {/* {userLocation?.displayName && !selectedLocation && (
            <CustomView style={styles.currentLocationContainer}>
              <CustomText
                style={[styles.currentLabel, { color: colors.gray_regular }]}
              >
                Current: {userLocation.displayName}
              </CustomText>
            </CustomView>
          )} */}

        {/* Location Results */}
        <ScrollView
          style={styles.resultsContainer}
          contentContainerStyle={{ paddingBottom: verticalScale(30) }}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <CustomView style={styles.loadingContainer}>
              <CustomText
                style={[styles.loadingText, { color: colors.gray_regular }]}
              >
                Loading locations...
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
            // Show all locations with section headers
            searchResults.map((location, index) => {
              const isCurrentLocation = location.isCurrentLocation;
              const prevLocation = index > 0 ? searchResults[index - 1] : null;
              const showLocalHeader =
                isCurrentLocation &&
                (!prevLocation || !prevLocation.isCurrentLocation);

              // Determine if this location is currently selected
              const isCurrentlySelected = location.isCurrentLocation
                ? userLocation?.type === "current" || userLocation === null // Default to Current Location if no preference set
                : userLocation?.displayName === location.fullName;

              return (
                <React.Fragment key={location.id}>
                  {showLocalHeader && (
                    <CustomText
                      fontFamily="Inter-SemiBold"
                      style={[
                        styles.sectionHeader,
                        { color: colors.gray_regular },
                      ]}
                    >
                      Local
                    </CustomText>
                  )}
                  <OnboardingLocationItem
                    location={location}
                    onPress={handleLocationPress}
                    isCurrentlySelected={isCurrentlySelected}
                  />
                </React.Fragment>
              );
            })
          ) : (
            <CustomView style={styles.instructionContainer}>
              <CustomText
                style={[styles.instructionText, { color: colors.gray_regular }]}
              >
                Loading locations...
              </CustomText>
            </CustomView>
          )}
        </ScrollView>
      </CustomView>

      {/* Loading Overlay */}
      {isUpdating && (
        <CustomView style={styles.loadingOverlay}>
          <AnimatedLoader />
        </CustomView>
      )}
    </CustomView>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background || "#FFFFFF",
    },
    content: {
      flex: 1,
      paddingHorizontal: horizontalScale(24),
      paddingTop: verticalScale(24),
    },
    pageTitle: {
      fontSize: scaleFontSize(18),
      textAlign: "center",
      marginBottom: verticalScale(6),
    },
    sectionHeader: {
      fontSize: scaleFontSize(14),
      paddingTop: verticalScale(6),
      width: "100%",
    },
    loadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    subtitle: {
      fontSize: scaleFontSize(14),
      textAlign: "center",
      marginBottom: verticalScale(20),
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
