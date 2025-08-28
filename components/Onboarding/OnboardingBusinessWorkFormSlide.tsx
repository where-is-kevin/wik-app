import React, { useState } from "react";
import { StyleSheet } from "react-native";
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

interface OnboardingBusinessWorkFormSlideProps {
  title: string;
  subtitle: string;
  onFormChange: (data: BusinessWorkFormData) => void;
  initialData?: BusinessWorkFormData;
}

export interface BusinessWorkFormData {
  role: string;
  company: string;
  industry: string;
  stage: string;
}

const stageOptions = ["Pre-launch", "Early-stage", "Growth", "Established"];

export const OnboardingBusinessWorkFormSlide: React.FC<OnboardingBusinessWorkFormSlideProps> = ({
  title,
  subtitle,
  onFormChange,
  initialData,
}) => {
  const { colors } = useTheme();
  const [formData, setFormData] = useState<BusinessWorkFormData>(
    initialData || {
      role: "",
      company: "",
      industry: "",
      stage: "",
    }
  );

  const updateField = (field: keyof BusinessWorkFormData, value: string) => {
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
          <OnboardingSearch
            value={formData.company}
            onChangeText={(text) => updateField("company", text)}
            placeholder="Start typing and select"
            showIcon={true}
            customStyles={{ marginBottom: 0 }}
          />
        </CustomView>

        {/* Industry */}
        <CustomView style={styles.inputContainer}>
          <CustomText style={[styles.label, { color: colors.label_dark }]}>
            Industry
          </CustomText>
          <OnboardingSearch
            value={formData.industry}
            onChangeText={(text) => updateField("industry", text)}
            placeholder="Start typing and select"
            showIcon={true}
            customStyles={{ marginBottom: 0 }}
          />
        </CustomView>

        {/* Stage */}
        <CustomView style={styles.inputContainer}>
          <CustomText style={[styles.label, { color: colors.label_dark }]}>
            Stage
          </CustomText>
          <CustomView style={styles.stageContainer}>
            {stageOptions.map((stage) => (
              <CustomTouchable
                key={stage}
                style={[
                  styles.stageButton,
                  {
                    backgroundColor: formData.stage === stage ? colors.light_blue : colors.background,
                    borderColor: formData.stage === stage ? colors.light_blue : colors.border_gray,
                  },
                ]}
                onPress={() => updateField("stage", stage)}
              >
                <CustomText
                  style={[
                    styles.stageText,
                    {
                      color: formData.stage === stage ? "#FFF" : colors.label_dark,
                    },
                  ]}
                >
                  {stage}
                </CustomText>
              </CustomTouchable>
            ))}
          </CustomView>
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
  inputContainer: {
    marginBottom: verticalScale(20),
  },
  label: {
    fontSize: scaleFontSize(16),
    fontWeight: "500",
    marginBottom: verticalScale(8),
  },
  stageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: horizontalScale(8),
  },
  stageButton: {
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(8),
    borderRadius: 20,
    borderWidth: 1,
  },
  stageText: {
    fontSize: scaleFontSize(14),
    fontWeight: "500",
  },
});