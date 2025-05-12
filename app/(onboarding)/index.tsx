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
import {
  OnboardingForm,
  PersonalFormData,
} from "@/components/Onboarding/OnboardingForm";
import { SwipeCards } from "@/components/Onboarding/SwipeCards";

const OnboardingScreen = () => {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [selections, setSelections] = useState<OnboardingSelections>({});
  const [filteredSteps, setFilteredSteps] = useState<OnboardingStep[]>([]);
  const [totalSteps, setTotalSteps] = useState<number>(MAX_PATH_STEPS);
  const [personalFormData, setPersonalFormData] = useState<PersonalFormData>({
    firstName: "",
    lastName: "",
    email: "",
    home: "",
    travelDestination: "",
    profileImage: null,
  });
  const [swipeLikes, setSwipeLikes] = useState<string[]>([]);
  const [swipeSkips, setSwipeSkips] = useState<string[]>([]);
  const [swipeDislikes, setSwipeDislikes] = useState<string[]>([]);
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

  const handleFormChange = (formData: PersonalFormData) => {
    setPersonalFormData(formData);

    // Consider the form valid if at least name and email are filled
    const isFormValid =
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.email.trim() !== "";

    // Update the selections state to enable/disable the Next button
    if (stepData) {
      setSelections({
        ...selections,
        // Use 1 for valid form, 0 for invalid form (instead of undefined)
        [stepData.key]: isFormValid ? 1 : 0,
      });
    }
  };

  const handleSwipeRight = (item: any) => {
    setSwipeLikes([...swipeLikes, item.id]);
  };

  const handleSwipeLeft = (item: any) => {
    setSwipeDislikes([...swipeDislikes, item.id]);
  };

  const handleSwipeComplete = () => {
    // Update the selections to allow progressing to the next step
    if (stepData) {
      // First update selections
      setSelections({
        ...selections,
        [stepData.key]: 1,
      });

      // Then navigate to the next step (which should be the final slide)
      setTimeout(() => {
        setCurrentStepIndex(currentStepIndex + 1);
      }, 300); // Small delay for better UX
    }
  };

  const handleSelection = (index: number) => {
    if (stepData) {
      setSelections({
        ...selections,
        [stepData.key]: index,
      });
    }
  };

  const handleSwipeDown = (item: any) => {
    setSwipeSkips([...swipeSkips, item.id]);
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
      // Save all selections and additional data
      try {
        await AsyncStorage.setItem("onboardingComplete", "true");

        // Save selections along with form data and swipe preferences
        const completeData = {
          selections,
          personalDetails: personalFormData,
          likes: swipeLikes,
          dislikes: swipeDislikes,
          skips: swipeSkips,
        };

        await AsyncStorage.setItem(
          "onboardingData",
          JSON.stringify(completeData)
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

  // Add this new render function for the personal form step
  const renderPersonalForm = () => {
    if (!stepData) return null;

    return (
      <CustomView style={styles.content}>
        <CustomText
          fontFamily="Inter-SemiBold"
          style={[styles.formTitle, { color: colors.label_dark }]}
        >
          {stepData.subtitle}
        </CustomText>
        <CustomText
          style={[styles.formSubtitle, { color: colors.gray_regular }]}
        >
          {stepData.title}
        </CustomText>

        <OnboardingForm
          formData={personalFormData}
          onFormChange={handleFormChange}
        />
      </CustomView>
    );
  };

  // Add this new render function for the card swipe step
  const renderCardSwipe = () => {
    if (!stepData || !stepData.cards) return null;

    return (
      <CustomView style={styles.content}>
        <CustomView style={styles.swipeContainer}>
          <SwipeCards
            data={stepData.cards}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onComplete={handleSwipeComplete}
            onSwipeDown={handleSwipeDown}
          />
        </CustomView>
      </CustomView>
    );
  };

  const renderFinalSlide = () => {
    return <CustomView />;
  };

  // New combined render function using switch statement
  const renderStepContent = () => {
    if (!stepData) return null;

    switch (stepData.type) {
      case "logo-selection":
        return renderLogoSelection();
      case "option-list":
        return renderOptionList();
      case "personal-form":
        return renderPersonalForm();
      case "card-swipe":
        return renderCardSwipe();
      case "final-slide":
        return renderFinalSlide();
      default:
        return null;
    }
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

      {renderStepContent()}

      <CustomView style={styles.footer}>
        {stepData &&
          stepData.type !== "logo-selection" &&
          stepData.type !== "card-swipe" && (
            <NextButton
              onPress={handleNext}
              customStyles={
                currentSelection === undefined ? styles.nextButtonDisabled : {}
              }
              bgColor={colors.lime}
              title={
                currentStepIndex === filteredSteps.length - 1
                  ? "Finish"
                  : "Next"
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
    alignItems: "center",
    paddingTop: verticalScale(16),
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
    height: 58,
    marginBottom: verticalScale(23),
    textAlign: "center",
  },
  formTitle: {
    fontSize: scaleFontSize(18),
    textAlign: "center",
    marginBottom: verticalScale(8),
  },
  formSubtitle: {
    fontSize: scaleFontSize(14),
    marginBottom: verticalScale(24),
    textAlign: "center",
  },
  title: {
    fontSize: scaleFontSize(18),
    marginBottom: verticalScale(8),
    textAlign: "center",
  },
  optionsContainer: {
    width: "100%",
    justifyContent: "center",
    flex: 1,
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
  swipeContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: verticalScale(30),
  },
});
