import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Linking,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import { scaleFontSize, verticalScale } from "@/utilities/scaling";
import { VenueItem } from "../VenueItem";
import { useGooglePlaces, VenueData } from "@/hooks/useGooglePlaces";
import { OnboardingSearch } from "../Onboarding/OnboardingSearch";

export interface SelectVenueModalRef {
  present: () => void;
  dismiss: () => void;
}

interface SelectVenueModalProps {
  onClose?: () => void;
  onVenueSelect: (venue: VenueData) => void;
  selectedVenue?: VenueData;
}

export const SelectVenueModal = forwardRef<
  SelectVenueModalRef,
  SelectVenueModalProps
>(({ onClose, onVenueSelect }, ref) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const {
    results: searchResults,
    loading,
    error,
    searchPlaces,
    loadRecentVenues,
  } = useGooglePlaces();
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<TextInput>(null);

  useImperativeHandle(
    ref,
    () => ({
      present: () => {
        setIsVisible(true);
        loadRecentVenues();
        // Focus search input on Android after modal opens
        if (Platform.OS === 'android') {
          setTimeout(() => {
            searchInputRef.current?.focus();
          }, 300);
        }
      },
      dismiss: () => {
        setIsVisible(false);
      },
    }),
    [loadRecentVenues]
  );

  // Load recent venues when modal opens
  useEffect(() => {
    if (isVisible) {
      loadRecentVenues();
    }
  }, [isVisible, loadRecentVenues]);

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
    handleVenueSelect(venue);
    setSearchQuery("");
    Keyboard.dismiss();
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleScreenTap = () => {
    Keyboard.dismiss();
  };

  const handleCancel = useCallback(() => {
    setSearchQuery("");
    Keyboard.dismiss();
    setIsVisible(false);
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    onClose?.();
  }, [onClose]);

  const handleVenueSelect = useCallback(
    (venue: VenueData) => {
      onVenueSelect(venue);
      setIsVisible(false);
    },
    [onVenueSelect]
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      onRequestClose={handleClose}
      transparent={true}
      statusBarTranslucent
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleCancel}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View
            style={[styles.content, { backgroundColor: colors.background }]}
          >
            {/* Header */}
            <View style={styles.header}>
              <CustomText
                fontFamily="Inter-SemiBold"
                style={[styles.titleText, { color: colors.label_dark }]}
              >
                Select Venue
              </CustomText>
              <TouchableOpacity
                onPress={handleCancel}
                style={styles.cancelButton}
                activeOpacity={0.7}
              >
                <CustomText
                  fontFamily="Inter-SemiBold"
                  style={[styles.cancelText, { color: colors.light_blue }]}
                >
                  Cancel
                </CustomText>
              </TouchableOpacity>
            </View>

            <TouchableWithoutFeedback onPress={handleScreenTap}>
              <CustomView style={styles.container}>
                {/* Search Input */}
                <OnboardingSearch
                  ref={searchInputRef}
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  placeholder="Search locations..."
                  autoFocus={Platform.OS === 'ios'}
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
                  contentContainerStyle={{ paddingBottom: verticalScale(20) }}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {loading ? (
                    <CustomView style={styles.loadingContainer}>
                      <CustomText
                        style={[
                          styles.loadingText,
                          { color: colors.gray_regular },
                        ]}
                      >
                        Searching...
                      </CustomText>
                    </CustomView>
                  ) : error ? (
                    <CustomView style={styles.errorContainer}>
                      <CustomText
                        style={[
                          styles.errorText,
                          { color: colors.gray_regular },
                        ]}
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
                      {searchQuery.length > 2 ? (
                        <>
                          <CustomText
                            style={[
                              styles.noResultsText,
                              { color: colors.label_dark },
                            ]}
                          >
                            We can't find this venue
                          </CustomText>
                          <CustomText
                            style={[
                              styles.noResultsSubtext,
                              { color: colors.text_black },
                            ]}
                          >
                            Try a different address or email{" "}
                            <CustomText
                              onPress={() =>
                                Linking.openURL(
                                  "mailto:venues@whereiskevin.com"
                                )
                              }
                              style={[
                                styles.emailLink,
                                { color: colors.light_blue },
                              ]}
                            >
                              venues@whereiskevin.com
                            </CustomText>{" "}
                            to add it!
                          </CustomText>
                        </>
                      ) : (
                        <CustomText
                          style={[
                            styles.noResultsText,
                            { color: colors.gray_regular },
                          ]}
                        >
                          Start typing to search for venues...
                        </CustomText>
                      )}
                    </CustomView>
                  )}
                </ScrollView>
              </CustomView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
});

SelectVenueModal.displayName = "SelectVenueModal";

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    height: "70%",
  },
  content: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(20),
  },
  titleText: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
  },
  cancelButton: {},
  cancelText: {
    fontSize: scaleFontSize(16),
    color: "#007AFF",
  },
  container: {
    paddingBottom: verticalScale(20),
  },
  resultsContainer: {
    width: "100%",
    maxHeight: verticalScale(300),
  },
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(20),
  },
  noResultsText: {
    fontSize: scaleFontSize(14),
    textAlign: "center",
    fontFamily: "Inter-Regular",
    marginBottom: verticalScale(5),
  },
  noResultsSubtext: {
    fontSize: scaleFontSize(14),
    textAlign: "center",
    lineHeight: scaleFontSize(20),
  },
  emailLink: {
    textDecorationLine: "underline",
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
