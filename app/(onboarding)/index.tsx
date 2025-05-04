import React, { useState, useEffect } from "react";
import { StyleSheet, SafeAreaView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { OnboardingOption } from "@/components/Onboarding/OnboardingOption";
import { OnboardingProgressBar } from "@/components/Onboarding/OnboardingProgressBar";
import {
  OnboardingSelections,
  OnboardingStep,
  onboardingSteps,
} from "@/constants/onboardingSlides";
import {
  getTotalStepsForPath,
  MAX_PATH_STEPS,
} from "@/utilities/onboardingHelpers";
import CustomView from "@/components/CustomView";
import CustomText from "@/components/CustomText";
import CustomTouchable from "@/components/CustomTouchableOpacity";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import { useTheme } from "@/contexts/ThemeContext";
import ArrowLeftSvg from "@/components/SvgComponents/ArrowLeftSvg";
import NextButton from "@/components/Button/NextButton";

const OnboardingScreen = () => {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [selections, setSelections] = useState<OnboardingSelections>({});
  const [filteredSteps, setFilteredSteps] = useState<OnboardingStep[]>([]);
  const [totalSteps, setTotalSteps] = useState<number>(MAX_PATH_STEPS);
  const { colors } = useTheme();

  const stepData = filteredSteps[currentStepIndex];
  const currentSelection = stepData ? selections[stepData.key] : undefined;

  useEffect(() => {
    const initialSteps = onboardingSteps.filter((step) => !step.condition);
    setFilteredSteps(initialSteps);
  }, []);

  useEffect(() => {
    const newFilteredSteps = onboardingSteps.filter((step) => {
      if (!step.condition) return true;
      const { key, value } = step.condition;
      return selections[key] === value;
    });

    setFilteredSteps(newFilteredSteps);
    if (selections.userType !== undefined) {
      const path = selections.userType === 0 ? "business" : "personal";
      setTotalSteps(getTotalStepsForPath(path));
    }
  }, [selections]);

  const handleSelection = (index: number) => {
    if (stepData) {
      setSelections({
        ...selections,
        [stepData.key]: index,
      });
    }
  };

  const handleLogoSelection = (index: number) => {
    // Set the selection first
    setSelections({
      ...selections,
      [stepData!.key]: index,
    });

    // Navigate to the next step after a short delay
    setTimeout(() => {
      setCurrentStepIndex(1);
    }, 150);
  };

  const handleNext = async () => {
    // If we're on the last step, complete onboarding
    if (currentStepIndex === filteredSteps.length - 1) {
      // Save all selections
      try {
        await AsyncStorage.setItem("onboardingComplete", "true");
        await AsyncStorage.setItem(
          "onboardingSelections",
          JSON.stringify(selections)
        );

        // Navigate to main app
        router.push("/(tabs)");
      } catch (error) {
        console.error("Failed to save onboarding data", error);
      }
    } else {
      // Otherwise, go to next step
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  // Render the logo selection layout
  const renderLogoSelection = () => {
    if (!stepData) return null;

    return (
      <CustomView style={styles.logoContent}>
        <CustomView style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/intro-image.png")}
            style={styles.logo}
          />
        </CustomView>

        <CustomText
          fontFamily="Inter-SemiBold"
          style={[styles.title, { color: colors.label_dark }]}
        >
          {stepData.title}
        </CustomText>
        <CustomText style={[styles.subtitle, { color: colors.gray_regular }]}>
          {stepData.subtitle}
        </CustomText>

        <CustomView style={styles.optionsContainer}>
          {stepData.options.map((option, index) => (
            <CustomTouchable
              key={index}
              style={[
                styles.selectionButton,
                currentSelection === index ? styles.selectedButton : {},
                styles.businessButton,
              ]}
              bgColor={colors.onboarding_gray}
              onPress={() => handleLogoSelection(index)}
            >
              <CustomText
                style={[
                  styles.selectionButtonText,
                  { color: colors.label_dark },
                ]}
              >
                {option}
              </CustomText>
            </CustomTouchable>
          ))}
        </CustomView>
      </CustomView>
    );
  };

  // Render the option list layout
  const renderOptionList = () => {
    if (!stepData) return null;

    return (
      <CustomView style={styles.content}>
        <CustomText style={styles.optionsTitle}>{stepData.subtitle}</CustomText>
        <CustomText fontFamily="Inter-SemiBold" style={styles.optionsSubtitle}>
          {stepData.title}
        </CustomText>

        <CustomView style={styles.optionsContainer}>
          {stepData.options.map((option, index) => (
            <OnboardingOption
              key={index}
              text={option}
              selected={currentSelection === index}
              onPress={() => handleSelection(index)}
            />
          ))}
        </CustomView>
      </CustomView>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {currentStepIndex > 0 && (
        <CustomView style={styles.header}>
          <CustomTouchable onPress={handleBack}>
            <ArrowLeftSvg />
          </CustomTouchable>
        </CustomView>
      )}
      {stepData && stepData.type === "logo-selection"
        ? renderLogoSelection()
        : renderOptionList()}

      <CustomView style={styles.footer}>
        {stepData && stepData.type !== "logo-selection" && (
          <NextButton
            onPress={handleNext}
            customStyles={
              currentSelection === undefined ? styles.nextButtonDisabled : {}
            }
            bgColor={colors.lime}
            title={
              currentStepIndex === filteredSteps.length - 1 ? "Finish" : "Next"
            }
            disabled={currentSelection === undefined}
          />
        )}

        <CustomView style={styles.progressContainer}>
          <OnboardingProgressBar
            steps={totalSteps}
            currentStep={currentStepIndex}
          />
        </CustomView>
      </CustomView>
    </SafeAreaView>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
  },
  content: {
    flex: 1,
    paddingHorizontal: horizontalScale(24),
    justifyContent: "center",
    alignItems: "center",
    paddingTop: verticalScale(10),
  },
  logoContent: {
    flex: 1,
    paddingHorizontal: horizontalScale(24),
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    marginBottom: verticalScale(28),
  },
  logo: {
    width: 216,
    height: 296,
    resizeMode: "contain",
  },
  subtitle: {
    fontSize: scaleFontSize(14),
    marginBottom: verticalScale(28),
    textAlign: "center",
  },
  optionsTitle: {
    fontSize: scaleFontSize(15),
    textAlign: "center",
    marginBottom: verticalScale(8),
  },
  optionsSubtitle: {
    fontSize: scaleFontSize(18),
    marginBottom: verticalScale(28),
    textAlign: "center",
  },
  title: {
    fontSize: scaleFontSize(18),
    marginBottom: verticalScale(8),
    textAlign: "center",
  },
  optionsContainer: {
    width: "100%",
  },
  selectionButton: {
    width: "100%",
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(20),
    borderRadius: 31,
    marginBottom: verticalScale(12),
  },
  businessButton: {
    borderWidth: 1,
    borderColor: "#D6D6D9",
  },
  personalButton: {},
  selectedButton: {
    borderColor: "#000",
  },
  selectionButtonText: {
    fontSize: scaleFontSize(16),
  },
  footer: {
    paddingHorizontal: horizontalScale(24),
    paddingBottom: verticalScale(12),
  },
  nextButtonDisabled: {
    opacity: 0.7,
  },
  progressContainer: {
    alignItems: "center",
  },
});
