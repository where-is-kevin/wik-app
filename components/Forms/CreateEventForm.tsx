import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useTheme } from "@/contexts/ThemeContext";
import { DateTimeModal } from "@/components/Modals/DateTimeModal";
import { SelectVenueModal } from "@/components/Modals/SelectVenueModal";
import { CustomDropdownCreate } from "@/components/Dropdown/CustomDropdownCreate";
import ClockSvg from "@/components/SvgComponents/ClockSvg";
import CreateLocationSvg from "@/components/SvgComponents/CreateLocationSvg";
import CustomText from "@/components/CustomText";
import { VenueData, useGooglePlaces } from "@/hooks/useGooglePlaces";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";

export interface EventFormData {
  eventName: string;
  startDate: Date;
  endDate: Date;
  venue: string;
  venueData?: VenueData;
  description: string;
  industry: string;
  tags: string;
  bookingLink: string;
  price: string;
  capacity: string;
}

interface CreateEventFormProps {
  formData: EventFormData;
  onFormChange: (data: EventFormData) => void;
}

export const CreateEventForm: React.FC<CreateEventFormProps> = ({
  formData,
  onFormChange,
}) => {
  const { colors } = useTheme();
  const { getPlaceDetails } = useGooglePlaces();
  const [showStartDateModal, setShowStartDateModal] = useState(false);
  const [showEndDateModal, setShowEndDateModal] = useState(false);
  const [showVenueModal, setShowVenueModal] = useState(false);

  const formatDateTime = (date: Date) => {
    return (
      date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }) +
      " at " +
      date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    );
  };

  const handleStartDateSave = (selectedDate: Date) => {
    // Ensure start date is not earlier than now
    const now = new Date();
    const validStartDate = selectedDate < now ? now : selectedDate;

    // Ensure end date is not earlier than start date
    const newEndDate =
      validStartDate > formData.endDate ? validStartDate : formData.endDate;

    onFormChange({
      ...formData,
      startDate: validStartDate,
      endDate: newEndDate,
    });
  };

  const handleEndDateSave = (selectedDate: Date) => {
    // Ensure end date is not earlier than start date
    const validEndDate =
      selectedDate < formData.startDate ? formData.startDate : selectedDate;

    onFormChange({
      ...formData,
      endDate: validEndDate,
    });
  };

  const handleVenueSelect = async (venue: VenueData) => {
    // If venue has location data, use it directly
    if (venue.location) {
      onFormChange({
        ...formData,
        venue: venue.name,
        venueData: venue,
      });
      return;
    }

    // If no location data, try to get it from Google Places Details API
    if (venue.id && venue.id !== "current_location") {
      try {
        const placeDetails = await getPlaceDetails(venue.id);
        if (placeDetails && placeDetails.geometry) {
          const venueWithLocation: VenueData = {
            ...venue,
            location: {
              lat: placeDetails.geometry.location.lat,
              lng: placeDetails.geometry.location.lng,
            },
          };
          onFormChange({
            ...formData,
            venue: venue.name,
            venueData: venueWithLocation,
          });
        } else {
          // If failed to get details, save without location
          onFormChange({
            ...formData,
            venue: venue.name,
            venueData: venue,
          });
        }
      } catch (error) {
        console.error("Failed to get venue details:", error);
        onFormChange({
          ...formData,
          venue: venue.name,
          venueData: venue,
        });
      }
    } else {
      onFormChange({
        ...formData,
        venue: venue.name,
        venueData: venue,
      });
    }
  };

  return (
    <View style={styles.content}>
      {/* Event Name Input */}
      <TextInput
        style={[
          styles.textInput,
          {
            backgroundColor: colors.background,
            color: colors.label_dark,
            borderColor: colors.input_border,
          },
        ]}
        value={formData.eventName}
        onChangeText={(text) => onFormChange({ ...formData, eventName: text })}
        placeholder="Event Name"
        placeholderTextColor={colors.gray_regular}
        autoCapitalize="sentences"
        autoCorrect={false}
      />

      {/* Date/Time Section */}
      <View style={styles.dateTimeContainer}>
        <TouchableOpacity
          style={styles.dateTimeItem}
          onPress={() => setShowStartDateModal(true)}
          activeOpacity={0.7}
        >
          <View style={styles.dateTimeIcon}>
            <ClockSvg width={24} height={24} />
          </View>
          <Text
            style={[
              styles.dateTimeLabel,
              { color: colors.onboarding_option_dark },
            ]}
          >
            Start
          </Text>
          <Text style={[styles.dateTimeValue, { color: colors.label_dark }]}>
            {formatDateTime(formData.startDate)}
          </Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          style={[styles.dateTimeItem, styles.endDateTimeItem]}
          onPress={() => setShowEndDateModal(true)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.dateTimeLabel,
              { color: colors.onboarding_option_dark },
            ]}
          >
            End
          </Text>
          <Text style={[styles.dateTimeValue, { color: colors.label_dark }]}>
            {formatDateTime(formData.endDate)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Venue Selection */}
      {formData.venueData ? (
        <View style={styles.selectedVenueContainer}>
          <View style={styles.venueInfo}>
            <CreateLocationSvg width={24} height={24} />
            <View style={styles.venueTextContainer}>
              <CustomText
                style={[styles.venueName, { color: colors.label_dark }]}
              >
                {formData.venueData.name}
              </CustomText>
              <CustomText
                style={[styles.venueAddress, { color: colors.gray_regular }]}
              >
                {formData.venueData.address}
              </CustomText>
            </View>
          </View>
          <TouchableOpacity
            style={styles.additionalInstructions}
            onPress={() => {
              /* Handle additional instructions */
            }}
          >
            <CustomText
              style={[styles.instructionsText, { color: colors.gray_regular }]}
            >
              + Add additional instructions...
            </CustomText>
          </TouchableOpacity>
        </View>
      ) : (
        <CustomDropdownCreate
          label="Select Venue"
          value={""}
          onPress={() => setShowVenueModal(true)}
          iconType="location"
          showChevron={false}
        />
      )}

      {/* Map View - appears under venue selection */}
      {formData.venueData?.location && (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: formData.venueData.location.lat,
              longitude: formData.venueData.location.lng,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
          >
            <Marker
              coordinate={{
                latitude: formData.venueData.location.lat,
                longitude: formData.venueData.location.lng,
              }}
              title={formData.venueData.name}
              description={formData.venueData.address}
            />
          </MapView>
        </View>
      )}

      {/* Description Dropdown */}
      <CustomDropdownCreate
        label="Add Description"
        value={formData.description || ""}
        onPress={() => {}}
        iconType="description"
        showChevron={false}
      />

      {/* Industry Dropdown */}
      <CustomDropdownCreate
        label="Select Industry"
        value={formData.industry || ""}
        onPress={() => {}}
        iconType="industry"
        showChevron={false}
      />

      {/* Tags Dropdown */}
      <CustomDropdownCreate
        label="Add Tags (Eg. AI, Mixer, Founders)"
        value={formData.tags || ""}
        onPress={() => {}}
        iconType="tags"
        showChevron={false}
      />

      {/* Ticketing Section */}
      <CustomText
        style={[
          styles.sectionTitle,
          { color: colors.input_border, marginTop: verticalScale(24) },
        ]}
      >
        Ticketing
      </CustomText>

      {/* Booking Link Dropdown */}
      <CustomDropdownCreate
        label="Booking Link (Luma, Eventbrite...)"
        value={formData.bookingLink || ""}
        onPress={() => {}}
        iconType="link"
        showChevron={false}
      />

      {/* Price Dropdown */}
      <CustomDropdownCreate
        label="Price"
        value={formData.price || "Free"}
        onPress={() => {}}
        iconType="price"
        showChevron={true}
      />

      {/* Capacity Dropdown */}
      <CustomDropdownCreate
        label="Capacity"
        value={formData.capacity || "Unlimited"}
        onPress={() => {}}
        iconType="capacity"
        showChevron={true}
      />

      {/* Date/Time Modals */}
      <DateTimeModal
        visible={showStartDateModal}
        onClose={() => setShowStartDateModal(false)}
        onSave={handleStartDateSave}
        initialDate={formData.startDate}
        title="Select Start Date & Time"
        minimumDate={new Date()}
      />

      <DateTimeModal
        visible={showEndDateModal}
        onClose={() => setShowEndDateModal(false)}
        onSave={handleEndDateSave}
        initialDate={formData.endDate}
        title="Select End Date & Time"
        minimumDate={formData.startDate}
      />

      {/* Venue Selection Modal */}
      <SelectVenueModal
        visible={showVenueModal}
        onClose={() => setShowVenueModal(false)}
        onVenueSelect={handleVenueSelect}
        selectedVenue={formData.venueData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  content: {},
  textInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingLeft: 15,
    paddingRight: 10,
    paddingVertical: 10,
    fontSize: scaleFontSize(20),
    marginBottom: verticalScale(10),
    fontFamily: "Inter-SemiBold",
  },
  dateTimeContainer: {
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    marginBottom: verticalScale(10),
    paddingLeft: 10,
    paddingRight: 15,
    paddingVertical: 15,
    overflow: "hidden",
  },
  dateTimeItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateTimeIcon: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: horizontalScale(10),
  },
  dateTimeLabel: {
    fontSize: scaleFontSize(16),
    fontFamily: "Inter-Regular",
    flex: 1,
  },
  dateTimeValue: {
    fontSize: scaleFontSize(16),
    fontFamily: "Inter-Medium",
  },
  endDateTimeItem: {
    marginLeft: 34, // 24 (clock icon width) + 10 (margin right) to align with "Start" text
  },
  sectionTitle: {
    fontSize: scaleFontSize(16),
    marginBottom: verticalScale(15),
    marginTop: verticalScale(10),
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 12,
    marginLeft: 34, // 24 (clock icon width) + 10 (margin right)
  },
  selectedVenueContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: verticalScale(16),
    marginBottom: verticalScale(10),
  },
  venueInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: verticalScale(12),
  },
  venueTextContainer: {
    flex: 1,
    marginLeft: horizontalScale(12),
  },
  venueName: {
    fontSize: scaleFontSize(16),
    fontFamily: "Inter-SemiBold",
    marginBottom: verticalScale(4),
  },
  venueAddress: {
    fontSize: scaleFontSize(14),
    fontFamily: "Inter-Regular",
  },
  additionalInstructions: {
    paddingVertical: verticalScale(8),
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    marginBottom: verticalScale(8),
  },
  instructionsText: {
    fontSize: scaleFontSize(14),
    fontFamily: "Inter-Regular",
  },
  changeVenueButton: {
    alignSelf: "flex-start",
  },
  changeVenueText: {
    fontSize: scaleFontSize(14),
    fontFamily: "Inter-Medium",
  },
  mapContainer: {
    marginBottom: verticalScale(10),
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  map: {
    height: 120,
    width: "100%",
  },
});
