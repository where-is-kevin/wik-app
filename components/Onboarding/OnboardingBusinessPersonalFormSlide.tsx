import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
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
import { OnboardingExpertiseModal } from "./OnboardingExpertiseModal";
import OnboardingSearchSvg from "../SvgComponents/OnboardingSearchSvg";
import { getExpertiseColor } from "./ExpertiseTagsStore";

interface OnboardingBusinessPersonalFormSlideProps {
  title: string;
  subtitle: string;
  onFormChange: (data: BusinessPersonalFormData) => void;
  initialData?: BusinessPersonalFormData;
}

export interface BusinessPersonalFormData {
  fullName: string;
  areasOfExpertise: string[];
}

export const OnboardingBusinessPersonalFormSlide: React.FC<
  OnboardingBusinessPersonalFormSlideProps
> = ({ title, subtitle, onFormChange, initialData }) => {
  const { colors } = useTheme();
  const [formData, setFormData] = useState<BusinessPersonalFormData>(
    initialData || {
      fullName: "",
      areasOfExpertise: [],
    }
  );
  const [showExpertiseModal, setShowExpertiseModal] = useState(false);

  const updateField = (field: keyof BusinessPersonalFormData, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onFormChange(newData);
  };

  const handleExpertiseSelect = (expertise: string[]) => {
    updateField("areasOfExpertise", expertise);
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
        {/* Profile Picture Placeholder
        <CustomView style={styles.profilePictureContainer}>
          <CustomView style={[styles.profilePicture, { backgroundColor: colors.border_gray }]} />
        </CustomView> */}

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


        {/* Areas of Expertise */}
        <CustomView style={styles.inputContainer}>
          <CustomText style={[styles.label, { color: colors.label_dark }]}>
            Areas of Expertise
          </CustomText>
          <TouchableOpacity
            onPress={() => setShowExpertiseModal(true)}
            activeOpacity={0.7}
          >
            <CustomView
              style={[
                styles.expertiseContainer,
                { borderColor: colors.input_border },
              ]}
            >
              <CustomView style={styles.searchIcon}>
                <OnboardingSearchSvg />
              </CustomView>
              {formData.areasOfExpertise.length > 0 ? (
                <CustomView style={styles.expertisePills}>
                  {formData.areasOfExpertise.map((expertise, index) => {
                    const tagColor = getExpertiseColor(expertise, colors);

                    return (
                      <CustomView
                        key={index}
                        style={[
                          styles.expertisePill,
                          { backgroundColor: tagColor },
                        ]}
                      >
                        <CustomText style={styles.expertisePillText}>
                          {expertise}
                        </CustomText>
                      </CustomView>
                    );
                  })}
                </CustomView>
              ) : (
                <CustomText
                  style={[
                    styles.placeholderText,
                    { color: colors.gray_regular },
                  ]}
                >
                  Start typing and select
                </CustomText>
              )}
            </CustomView>
          </TouchableOpacity>
        </CustomView>
      </KeyboardAwareScrollView>


      {/* Expertise Modal */}
      <OnboardingExpertiseModal
        visible={showExpertiseModal}
        onClose={() => setShowExpertiseModal(false)}
        onExpertiseSelect={handleExpertiseSelect}
        selectedExpertise={formData.areasOfExpertise}
      />
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
  expertiseContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    minHeight: 44,
  },
  expertisePills: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  expertisePill: {
    borderRadius: 12,
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(4),
    marginBottom: verticalScale(4),
  },
  expertisePillText: {
    color: "#FFFFFF",
    fontSize: scaleFontSize(12),
    fontWeight: "500",
  },
  placeholderText: {
    flex: 1,
    fontSize: scaleFontSize(14),
  },
  searchIcon: {
    marginRight: 11,
  },
});
