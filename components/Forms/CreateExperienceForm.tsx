import React, { useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useTheme } from "@/contexts/ThemeContext";
import { SelectVenueModal, SelectVenueModalRef } from "@/components/Modals/SelectVenueModal";
import { InstructionsModal, InstructionsModalRef } from "@/components/Modals/InstructionsModal";
import { DescriptionModal, DescriptionModalRef } from "@/components/Modals/DescriptionModal";
import { IndustryCreateModal, IndustryCreateModalRef } from "@/components/Modals/IndustryCreateModal";
import { CreateTagsModal, CreateTagsModalRef } from "@/components/Modals/CreateTagsModal";
import { BookingLinkModal, BookingLinkModalRef } from "@/components/Modals/BookingLinkModal";
import { PriceModal, PriceModalRef } from "@/components/Modals/PriceModal";
import { CapacityModal, CapacityModalRef } from "@/components/Modals/CapacityModal";
import { CustomDropdownCreate } from "@/components/Dropdown/CustomDropdownCreate";
import CreateLocationSvg from "@/components/SvgComponents/CreateLocationSvg";
import CustomText from "@/components/CustomText";
import { VenueData, useGooglePlaces } from "@/hooks/useGooglePlaces";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";

export interface ExperienceFormData {
  experienceName: string;
  venue: string;
  venueData?: VenueData;
  venueInstructions?: string;
  description: string;
  industry: string;
  tags: string;
  bookingLink: string;
  price: string;
  capacity: string;
}

interface CreateExperienceFormProps {
  formData: ExperienceFormData;
  onFormChange: (data: ExperienceFormData) => void;
}

export const CreateExperienceForm: React.FC<CreateExperienceFormProps> = ({
  formData,
  onFormChange,
}) => {
  const { colors } = useTheme();
  const { getPlaceDetails } = useGooglePlaces();
  const descriptionModalRef = useRef<DescriptionModalRef>(null);
  const venueModalRef = useRef<SelectVenueModalRef>(null);
  const instructionsModalRef = useRef<InstructionsModalRef>(null);
  const industryModalRef = useRef<IndustryCreateModalRef>(null);
  const tagsModalRef = useRef<CreateTagsModalRef>(null);
  const bookingLinkModalRef = useRef<BookingLinkModalRef>(null);
  const priceModalRef = useRef<PriceModalRef>(null);
  const capacityModalRef = useRef<CapacityModalRef>(null);

  const handleDescriptionSave = useCallback((description: string) => {
    onFormChange({ ...formData, description });
  }, [formData, onFormChange]);

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
      {/* Experience Name Input */}
      <TextInput
        style={[
          styles.textInput,
          {
            backgroundColor: colors.background,
            color: colors.label_dark,
            borderColor: colors.input_border,
          },
        ]}
        value={formData.experienceName}
        onChangeText={(text) => onFormChange({ ...formData, experienceName: text })}
        placeholder="Experience Name"
        placeholderTextColor={colors.gray_regular}
        autoCapitalize="sentences"
        autoCorrect={false}
      />

      {/* Venue Selection */}
      {formData.venueData ? (
        <TouchableOpacity
          style={styles.selectedVenueContainer}
          onPress={() => venueModalRef.current?.present()}
          activeOpacity={0.7}
        >
          <View style={styles.venueInfo}>
            <CreateLocationSvg />
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
              <View style={styles.dividerLine} />
              <TouchableOpacity
                style={styles.additionalInstructions}
                onPress={() => instructionsModalRef.current?.present()}
              >
                <CustomText
                  style={[
                    styles.instructionsText,
                    { color: formData.venueInstructions ? colors.label_dark : colors.gray_regular },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {formData.venueInstructions || "+ Add additional instructions..."}
                </CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        <CustomDropdownCreate
          label="Select Venue"
          value={""}
          onPress={() => venueModalRef.current?.present()}
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
        onPress={() => descriptionModalRef.current?.present()}
        iconType="description"
        showChevron={false}
        hideLabel={!!formData.description}
      />

      {/* Industry Dropdown */}
      <CustomDropdownCreate
        label="Select Industry"
        value={formData.industry || ""}
        onPress={() => industryModalRef.current?.present()}
        iconType="industry"
        showChevron={false}
        hideLabel={!!formData.industry}
      />

      {/* Tags Dropdown */}
      <CustomDropdownCreate
        label="Add Tags (Eg. AI, Mixer, Founders)"
        value={formData.tags || ""}
        onPress={() => tagsModalRef.current?.present()}
        iconType="tags"
        showChevron={false}
        hideLabel={!!formData.tags}
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
        onPress={() => bookingLinkModalRef.current?.present()}
        iconType="link"
        showChevron={false}
        hideLabel={!!formData.bookingLink}
      />

      {/* Price Dropdown */}
      <CustomDropdownCreate
        label="Price"
        value={formData.price || "Free"}
        onPress={() => priceModalRef.current?.present()}
        iconType="price"
        showChevron={true}
      />

      {/* Capacity Dropdown */}
      <CustomDropdownCreate
        label="Capacity"
        value={formData.capacity || "Unlimited"}
        onPress={() => capacityModalRef.current?.present()}
        iconType="capacity"
        showChevron={true}
      />

      {/* Venue Selection Modal */}
      <SelectVenueModal
        ref={venueModalRef}
        onVenueSelect={handleVenueSelect}
        selectedVenue={formData.venueData}
      />

      {/* Instructions Modal */}
      <InstructionsModal
        ref={instructionsModalRef}
        onSave={(instructions) => {
          onFormChange({ ...formData, venueInstructions: instructions });
        }}
        initialValue={formData.venueInstructions || ""}
      />

      {/* Description Modal */}
      <DescriptionModal
        ref={descriptionModalRef}
        onSave={handleDescriptionSave}
        initialValue={formData.description || ""}
      />

      {/* Industry Modal */}
      <IndustryCreateModal
        ref={industryModalRef}
        onSave={(industry) => {
          onFormChange({ ...formData, industry });
        }}
        selectedIndustry={formData.industry || ""}
      />

      {/* Tags Modal */}
      <CreateTagsModal
        ref={tagsModalRef}
        onSave={(tags) => {
          onFormChange({ ...formData, tags });
        }}
        initialValue={formData.tags || ""}
      />

      {/* Booking Link Modal */}
      <BookingLinkModal
        ref={bookingLinkModalRef}
        onSave={(bookingLink) => {
          onFormChange({ ...formData, bookingLink });
        }}
        initialValue={formData.bookingLink || ""}
      />

      {/* Price Modal */}
      <PriceModal
        ref={priceModalRef}
        onSelect={(price) => {
          onFormChange({ ...formData, price });
        }}
        selectedPrice={formData.price || "Free"}
      />

      {/* Capacity Modal */}
      <CapacityModal
        ref={capacityModalRef}
        onSave={(capacity) => {
          onFormChange({ ...formData, capacity });
        }}
        initialValue={formData.capacity || ""}
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
  sectionTitle: {
    fontSize: scaleFontSize(16),
    marginBottom: verticalScale(15),
    marginTop: verticalScale(10),
  },
  selectedVenueContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: verticalScale(10),
  },
  venueInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  venueTextContainer: {
    flex: 1,
    marginLeft: horizontalScale(10),
  },
  venueName: {
    fontSize: scaleFontSize(16),
    fontFamily: "Inter-Regular",
    marginBottom: verticalScale(2),
  },
  venueAddress: {
    fontSize: scaleFontSize(14),
    fontFamily: "Inter-Regular",
    lineHeight: 20,
  },
  dividerLine: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 12,
  },
  additionalInstructions: {},
  instructionsText: {
    fontSize: scaleFontSize(16),
    fontFamily: "Inter-Regular",
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
