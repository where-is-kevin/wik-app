import React, { useState } from "react";
import { StyleSheet, View, TextInput, ScrollView } from "react-native";
import CustomText from "@/components/CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";

interface PersonalDetailsFormProps {
  onFormChange: (formData: PersonalFormData) => void;
  formData: PersonalFormData;
}

export interface PersonalFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formGroup}>
        <CustomText style={[styles.label, { color: colors.label_dark }]}>
          Full Name
        </CustomText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.onboarding_gray,
              borderColor: colors.input_border,
              color: colors.label_dark,
            },
          ]}
          value={formData.fullName}
          onChangeText={(text) => handleChange("fullName", text)}
          placeholder="Enter your full name"
          placeholderTextColor={colors.gray_regular}
        />
      </View>

      <View style={styles.formGroup}>
        <CustomText style={[styles.label, { color: colors.label_dark }]}>
          Email Address
        </CustomText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.onboarding_gray,
              borderColor: colors.input_border,
              color: colors.label_dark,
            },
          ]}
          value={formData.email}
          onChangeText={(text) => handleChange("email", text)}
          placeholder="Enter your email address"
          placeholderTextColor={colors.gray_regular}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.formGroup}>
        <CustomText style={[styles.label, { color: colors.label_dark }]}>
          Phone Number
        </CustomText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.onboarding_gray,
              borderColor: colors.input_border,
              color: colors.label_dark,
            },
          ]}
          value={formData.phone}
          onChangeText={(text) => handleChange("phone", text)}
          placeholder="Enter your phone number"
          placeholderTextColor={colors.gray_regular}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.formGroup}>
        <CustomText style={[styles.label, { color: colors.label_dark }]}>
          Address
        </CustomText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.onboarding_gray,
              borderColor: colors.input_border,
              color: colors.label_dark,
            },
            styles.multilineInput,
          ]}
          value={formData.address}
          onChangeText={(text) => handleChange("address", text)}
          placeholder="Enter your address"
          placeholderTextColor={colors.gray_regular}
          multiline
          numberOfLines={3}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  formGroup: {
    marginBottom: verticalScale(20),
  },
  label: {
    fontSize: scaleFontSize(14),
    marginBottom: verticalScale(8),
  },
  input: {
    fontSize: scaleFontSize(16),
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(16),
  },
  multilineInput: {
    height: verticalScale(100),
    textAlignVertical: "top",
  },
});
