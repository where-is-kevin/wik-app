import React from "react";
import { StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import CustomView from "@/components/CustomView";
import CustomTextInput from "@/components/TextInput/CustomTextInput";
import { useTheme } from "@/contexts/ThemeContext";
import { scaleFontSize, verticalScale } from "@/utilities/scaling";
// import AddImageButton from "../Button/AddImageButton";
// import * as ImagePicker from "expo-image-picker";

interface PersonalDetailsFormProps {
  onFormChange: (formData: PersonalFormData) => void;
  formData: PersonalFormData;
}

export interface PersonalFormData {
  firstName: string;
  lastName: string;
  email: string;
  travelDestination: string;
  personalSummary: string;
}

export const OnboardingForm: React.FC<PersonalDetailsFormProps> = ({
  onFormChange,
  formData,
}) => {
  const { colors } = useTheme();

  const handleChange = (field: keyof PersonalFormData, value: string) => {
    onFormChange({
      ...formData,
      [field]: value,
    });
  };

  // Validation function to check if all required fields are filled
  const isFormValid = () => {
    return (
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.travelDestination.trim() !== ""
    );
  };

  // const handleImageSelection = async () => {
  //   // Request permission to access the media library
  //   const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  //   if (status !== "granted") {
  //     alert("Sorry, we need camera roll permissions to make this work!");
  //     return;
  //   }

  //   // Launch the image picker
  //   const result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     allowsEditing: true,
  //     aspect: [1, 1],
  //     quality: 0.8,
  //   });

  //   if (!result.canceled && result.assets && result.assets.length > 0) {
  //     // Update form data with the selected image URI
  //     onFormChange({
  //       ...formData,
  //       profileImage: result.assets[0].uri,
  //     });
  //   }
  // };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      extraScrollHeight={-60}
      enableAutomaticScroll={true}
      enableResetScrollToCoords={false}
      scrollEnabled={true}
    >
      {/* <AddImageButton
        onPress={handleImageSelection}
        imageUri={formData.profileImage}
      /> */}
      <CustomView style={styles.formGroup}>
        <CustomTextInput
          label="First name"
          value={formData.firstName}
          onChangeText={(text) => handleChange("firstName", text)}
          placeholder="Enter your first name"
          autoCapitalize="words"
        />
      </CustomView>
      <CustomView style={styles.formGroup}>
        <CustomTextInput
          label="Last name"
          value={formData.lastName}
          onChangeText={(text) => handleChange("lastName", text)}
          placeholder="Enter your last name"
          autoCapitalize="words"
        />
      </CustomView>

      <CustomView style={styles.formGroup}>
        <CustomTextInput
          label="Email"
          value={formData.email}
          onChangeText={(text) => handleChange("email", text)}
          placeholder="Enter your email address"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </CustomView>
      <CustomView style={styles.formGroup}>
        <CustomTextInput
          label="Personal summary"
          multiline
          customTextStyles={styles.textArea}
          value={formData.personalSummary}
          numOfLines={3}
          onChangeText={(text) => handleChange("personalSummary", text)}
          fixedHeight={77}
          placeholder="Tell us everything."
        />
      </CustomView>

      <CustomView style={styles.formGroup}>
        <CustomTextInput
          label="Travel destination"
          value={formData.travelDestination}
          onChangeText={(text) => handleChange("travelDestination", text)}
          placeholder="Enter your travel destination"
        />
      </CustomView>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  contentContainer: {
    paddingBottom: verticalScale(30), // Extra padding at the bottom for keyboard
  },
  formGroup: {
    marginBottom: verticalScale(12),
  },
  nextButtonDisabled: {
    opacity: 0.7,
  },
  textArea: {},
});
