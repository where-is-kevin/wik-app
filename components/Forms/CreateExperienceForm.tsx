import React from "react";
import { View, StyleSheet, TextInput } from "react-native";
import CustomText from "@/components/CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import { CustomDropdownCreate } from "@/components/Dropdown/CustomDropdownCreate";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";

export interface ExperienceFormData {
  experienceName: string;
  venue: string;
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

  return (
    <View style={styles.content}>
      {/* Experience Name Input */}
      <TextInput
        style={[
          styles.textInput,
          {
            backgroundColor: colors.onboarding_gray,
            color: colors.label_dark,
            borderColor: colors.input_border,
          },
        ]}
        value={formData.experienceName}
        onChangeText={(text) =>
          onFormChange({ ...formData, experienceName: text })
        }
        placeholder="Experience Name"
        placeholderTextColor={colors.gray_regular}
        autoCapitalize="sentences"
        autoCorrect={false}
      />

      {/* Venue Dropdown */}
      <CustomDropdownCreate
        label="Select Venue"
        value={formData.venue || ""}
        onPress={() => {}}
      />

      {/* Description Dropdown */}
      <CustomDropdownCreate
        label="Add Description"
        value={formData.description || ""}
        onPress={() => {}}
      />

      {/* Industry Dropdown */}
      <CustomDropdownCreate
        label="Select Industry"
        value={formData.industry || ""}
        onPress={() => {}}
      />

      {/* Tags Dropdown */}
      <CustomDropdownCreate
        label="Add Tags (Eg. AI, Mixer, Founders)"
        value={formData.tags || ""}
        onPress={() => {}}
      />

      {/* Ticketing Section */}
      <CustomText style={[styles.sectionTitle, { color: colors.input_border, marginTop: verticalScale(24) }]}>
        Ticketing
      </CustomText>

      {/* Booking Link Dropdown */}
      <CustomDropdownCreate
        label="Booking Link (Luma, Eventbrite...)"
        value={formData.bookingLink || ""}
        onPress={() => {}}
      />

      {/* Price Dropdown */}
      <CustomDropdownCreate
        label="Price"
        value={formData.price || "Free"}
        onPress={() => {}}
      />

      {/* Capacity Dropdown */}
      <CustomDropdownCreate
        label="Capacity"
        value={formData.capacity || "Unlimited"}
        onPress={() => {}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: horizontalScale(24),
    paddingVertical: verticalScale(20),
  },
  sectionTitle: {
    fontSize: scaleFontSize(16),
    marginBottom: verticalScale(15),
    marginTop: verticalScale(10),
  },
  textInput: {
    height: verticalScale(48),
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: horizontalScale(16),
    fontSize: scaleFontSize(16),
    fontFamily: "Inter-Regular",
    marginBottom: verticalScale(10),
    backgroundColor: "#FFFFFF",
  },
});
