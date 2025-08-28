import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import { OnboardingSearch } from "./OnboardingSearch";
import { commonOnboardingStyles } from "./OnboardingStyles";

interface OnboardingBusinessPersonalFormSlideProps {
  title: string;
  subtitle: string;
  onFormChange: (data: BusinessPersonalFormData) => void;
  initialData?: BusinessPersonalFormData;
}

export interface BusinessPersonalFormData {
  fullName: string;
  currentLocation: string;
  areasOfExpertise: string[];
}

export const OnboardingBusinessPersonalFormSlide: React.FC<OnboardingBusinessPersonalFormSlideProps> = ({
  title,
  subtitle,
  onFormChange,
  initialData,
}) => {
  const { colors } = useTheme();
  const [formData, setFormData] = useState<BusinessPersonalFormData>(
    initialData || {
      fullName: "",
      currentLocation: "",
      areasOfExpertise: [],
    }
  );

  const updateField = (field: keyof BusinessPersonalFormData, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onFormChange(newData);
  };

  return (
    <CustomView style={styles.container}>
      <CustomText
        fontFamily="Inter-SemiBold"
        style={[
          commonOnboardingStyles.title,
          { color: colors.label_dark, marginHorizontal: horizontalScale(24) },
        ]}
      >
        {title}
      </CustomText>
      <CustomText
        style={[
          commonOnboardingStyles.subtitle,
          {
            color: colors.gray_regular,
            marginHorizontal: horizontalScale(24),
          },
        ]}
      >
        {subtitle}
      </CustomText>

      <KeyboardAwareScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.formContainer}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        extraScrollHeight={-60}
        enableAutomaticScroll={true}
        enableResetScrollToCoords={false}
        scrollEnabled={true}
      >
        {/* Profile Picture Placeholder */}
        <CustomView style={styles.profilePictureContainer}>
          <CustomView style={[styles.profilePicture, { backgroundColor: colors.border_gray }]} />
        </CustomView>

        {/* Full Name */}
        <CustomView style={styles.inputContainer}>
          <CustomText style={[styles.label, { color: colors.label_dark }]}>
            Full Name
          </CustomText>
          <OnboardingSearch
            value={formData.fullName}
            onChangeText={(text) => updateField("fullName", text)}
            placeholder="Eg. John Smith"
            showIcon={false}
            customStyles={{ marginBottom: 0 }}
          />
        </CustomView>

        {/* Current Location */}
        <CustomView style={styles.inputContainer}>
          <CustomText style={[styles.label, { color: colors.label_dark }]}>
            Current Location
          </CustomText>
          <OnboardingSearch
            value={formData.currentLocation}
            onChangeText={(text) => updateField("currentLocation", text)}
            placeholder="Start typing and select"
            showIcon={true}
            customStyles={{ marginBottom: 0 }}
          />
        </CustomView>

        {/* Areas of Expertise */}
        <CustomView style={styles.inputContainer}>
          <CustomText style={[styles.label, { color: colors.label_dark }]}>
            Areas of Expertise
          </CustomText>
          <OnboardingSearch
            value={formData.areasOfExpertise.join(", ")}
            onChangeText={(text) => updateField("areasOfExpertise", text.split(", ").filter(Boolean))}
            placeholder="Start typing and select"
            showIcon={true}
            customStyles={{ marginBottom: 0 }}
          />
        </CustomView>
      </KeyboardAwareScrollView>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(20),
  },
  scrollContainer: {
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(30),
  },
  profilePictureContainer: {
    alignItems: "center",
    marginBottom: verticalScale(20),
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  inputContainer: {
    marginBottom: verticalScale(16),
  },
  label: {
    fontSize: scaleFontSize(16),
    fontWeight: "500",
    marginBottom: verticalScale(8),
  },
});