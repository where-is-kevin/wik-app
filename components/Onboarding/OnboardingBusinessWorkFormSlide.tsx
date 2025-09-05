import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, FlatList } from "react-native";
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
import CustomTouchable from "../CustomTouchableOpacity";
import { OnboardingCompanyModal } from "./OnboardingCompanyModal";
import { OnboardingIndustryModal } from "./OnboardingIndustryModal";
import OnboardingSearchSvg from "../SvgComponents/OnboardingSearchSvg";

// Get industry colors (matching the modal colors)
const getIndustryColor = (industryName: string, colors: any): string => {
  const industryColors: { [key: string]: string } = {
    Technology: colors.light_blue,
    "Tourism and Hospitality": colors.venue_orange,
    "Travel Tech": colors.label_dark,
    Healthcare: colors.pink,
    Finance: colors.legal_green,
    Education: colors.bordo,
    Retail: "#9C27B0",
    Manufacturing: "#FF5722",
    Consulting: "#607D8B",
    "Media & Entertainment": "#795548",
  };

  return industryColors[industryName] || colors.light_blue; // Default color
};

interface OnboardingBusinessWorkFormSlideProps {
  title: string;
  subtitle: string;
  onFormChange: (data: BusinessWorkFormData) => void;
  initialData?: BusinessWorkFormData;
}

export interface BusinessWorkFormData {
  role: string;
  company: string;
  industry: string[];
  stage: string;
}

const stageOptions = ["Pre-launch", "Early-stage", "Growth", "Established"];

export const OnboardingBusinessWorkFormSlide: React.FC<
  OnboardingBusinessWorkFormSlideProps
> = ({ title, subtitle, onFormChange, initialData }) => {
  const { colors } = useTheme();
  const [formData, setFormData] = useState<BusinessWorkFormData>(
    initialData || {
      role: "",
      company: "",
      industry: [],
      stage: "",
    }
  );
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showIndustryModal, setShowIndustryModal] = useState(false);

  const updateField = (field: keyof BusinessWorkFormData, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    console.log("Business form data being sent:", newData);
    onFormChange(newData);
  };

  const handleCompanySelect = (company: string) => {
    updateField("company", company);
  };

  const handleIndustrySelect = (industries: string[]) => {
    updateField("industry", industries);
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
        {/* Role */}
        <CustomView style={styles.inputContainer}>
          <CustomText style={[styles.label, { color: colors.label_dark }]}>
            Role
          </CustomText>
          <OnboardingSearch
            value={formData.role}
            onChangeText={(text) => updateField("role", text)}
            placeholder="Eg. Software Engineer"
            showIcon={false}
            customStyles={{ marginBottom: 0 }}
          />
        </CustomView>

        {/* Company */}
        <CustomView style={styles.inputContainer}>
          <CustomText style={[styles.label, { color: colors.label_dark }]}>
            Company
          </CustomText>
          <TouchableOpacity
            onPress={() => setShowCompanyModal(true)}
            activeOpacity={0.7}
          >
            <CustomView pointerEvents="none">
              <OnboardingSearch
                value={formData.company}
                onChangeText={() => {}} // Disabled - modal handles input
                placeholder="Start typing and select"
                showIcon={true}
                customStyles={{ marginBottom: 0 }}
                editable={false}
              />
            </CustomView>
          </TouchableOpacity>
        </CustomView>

        {/* Industry */}
        <CustomView style={styles.inputContainer}>
          <CustomText style={[styles.label, { color: colors.label_dark }]}>
            Industry
          </CustomText>
          <TouchableOpacity
            onPress={() => setShowIndustryModal(true)}
            activeOpacity={0.7}
          >
            <CustomView
              style={[
                styles.industryContainer,
                { borderColor: colors.input_border },
              ]}
            >
              {formData.industry.length > 0 ? (
                <CustomView style={styles.industryPills}>
                  {formData.industry.map((industry, index) => {
                    const tagColor = getIndustryColor(industry, colors);

                    return (
                      <CustomView
                        key={index}
                        style={[
                          styles.industryPill,
                          { backgroundColor: tagColor },
                        ]}
                      >
                        <CustomText style={styles.industryPillText}>
                          {industry}
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
              <CustomView style={styles.searchIconContainer}>
                <OnboardingSearchSvg />
              </CustomView>
            </CustomView>
          </TouchableOpacity>
        </CustomView>

        {/* Stage */}
        <CustomView style={styles.stageSection}>
          <CustomText
            style={[
              styles.label,
              {
                color: colors.label_dark,
                paddingHorizontal: horizontalScale(24),
              },
            ]}
          >
            Stage
          </CustomText>
          <FlatList
            data={stageOptions}
            renderItem={({ item: stage }) => (
              <CustomTouchable
                bgColor={formData.stage === stage ? "#3C62FA" : "#F2F2F3"}
                style={[
                  styles.stageButton,
                  {
                    borderColor:
                      formData.stage === stage ? "#3C62FA" : "#E5E5E6",
                  },
                ]}
                onPress={() => updateField("stage", stage)}
              >
                <CustomText
                  style={[
                    styles.stageText,
                    {
                      color:
                        formData.stage === stage
                          ? "#FFFFFF"
                          : colors.label_dark,
                    },
                  ]}
                >
                  {stage}
                </CustomText>
              </CustomTouchable>
            )}
            keyExtractor={(item) => item}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stageListContainer}
          />
        </CustomView>
      </KeyboardAwareScrollView>

      {/* Company Modal */}
      <OnboardingCompanyModal
        visible={showCompanyModal}
        onClose={() => setShowCompanyModal(false)}
        onCompanySelect={handleCompanySelect}
        selectedCompany={formData.company}
      />

      {/* Industry Modal */}
      <OnboardingIndustryModal
        visible={showIndustryModal}
        onClose={() => setShowIndustryModal(false)}
        onIndustrySelect={handleIndustrySelect}
        selectedIndustries={formData.industry}
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
  inputContainer: {
    marginBottom: verticalScale(20),
  },
  label: {
    fontSize: scaleFontSize(16),
    fontWeight: "500",
    marginBottom: verticalScale(8),
  },
  stageSection: {
    marginBottom: verticalScale(20),
    marginHorizontal: -horizontalScale(24), // Break out of parent padding
  },
  stageListContainer: {
    paddingHorizontal: horizontalScale(24),
    gap: horizontalScale(8),
  },
  stageButton: {
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(8),
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  stageText: {
    fontSize: scaleFontSize(14),
  },
  industryContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    minHeight: 44,
  },
  industryPills: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  industryPill: {
    borderRadius: 12,
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(4),
    alignSelf: "flex-start",
  },
  industryPillText: {
    color: "#FFFFFF",
    fontSize: scaleFontSize(12),
    fontWeight: "500",
  },
  placeholderText: {
    flex: 1,
    fontSize: scaleFontSize(14),
  },
  searchIconContainer: {
    padding: horizontalScale(4),
  },
});
