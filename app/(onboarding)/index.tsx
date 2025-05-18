import React, { useState, useEffect } from "react";
import { StyleSheet } from "react-native";
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
import SwipeCardTooltips from "@/components/Tooltips/SwipeCardTooltips";
import LottieView from "lottie-react-native";
import OnboardingAnimationStart from "@/assets/animations/onboarding-animation-start.json";
import OnboardingAnimationEnd from "@/assets/animations/onboarding-animation-end.json";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const OnboardingScreen = () => {
  const router = useRouter();
  const { colors } = useTheme();
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
  const [showTutorial, setShowTutorial] = useState<boolean>(true);

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

    const isFormValid =
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.email.trim() !== "";

    if (stepData) {
      setSelections({
        ...selections,
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

  const handleSwipeUp = (item: any) => {
    setSwipeSkips([...swipeSkips, item.id]);
  };

  const handleSwipeComplete = () => {
    if (stepData) {
      setSelections({
        ...selections,
        [stepData.key]: 1,
      });

      setTimeout(() => {
        setCurrentStepIndex(currentStepIndex + 1);
      }, 500);
    }
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  const handleSelection = (index: number) => {
    if (stepData) {
      setSelections({
        ...selections,
        [stepData.key]: index,
      });
    }
  };

  const handleLogoSelection = (index: number) => {
    setSelections({
      ...selections,
      [stepData!.key]: index,
    });

    setTimeout(() => {
      setCurrentStepIndex(1);
    }, 150);
  };

  const handleNext = async () => {
    if (currentStepIndex === filteredSteps.length - 1) {
      try {
        await AsyncStorage.setItem("onboardingComplete", "true");

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

        router.push("/(tabs)");
      } catch (error) {
        console.error("Failed to save onboarding data", error);
      }
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const renderLogoSelection = () => {
    if (!stepData) return null;

    return (
      <CustomView style={styles.logoContent}>
        <CustomView>
          <LottieView
            source={OnboardingAnimationStart}
            autoPlay
            loop
            style={styles.logo}
          />

          <CustomText
            fontFamily="Inter-SemiBold"
            style={[styles.title, { color: colors.label_dark }]}
          >
            {stepData.title}
          </CustomText>
          <CustomText style={[styles.subtitle, { color: colors.gray_regular }]}>
            {stepData.subtitle}
          </CustomText>
        </CustomView>

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

  const renderCardSwipe = () => {
    if (!stepData || !stepData.cards) return null;

    return (
      <CustomView style={styles.content}>
        <CustomView style={styles.swipeContainer}>
          <SwipeCards
            data={stepData.cards}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onSwipeUp={handleSwipeUp}
            onComplete={handleSwipeComplete}
          />

          {showTutorial && (
            <SwipeCardTooltips onComplete={handleTutorialComplete} />
          )}
        </CustomView>
      </CustomView>
    );
  };

  const renderFinalSlide = () => {
    return (
      <CustomView style={styles.contentEnd}>
        <LottieView
          source={OnboardingAnimationEnd}
          autoPlay
          loop
          style={styles.logoEnd}
        />
        <CustomText
          fontFamily="Inter-SemiBold"
          style={[styles.endTitle, { color: colors.label_dark }]}
        >
          {stepData.title}
        </CustomText>
        <CustomText
          style={[styles.endSubtitle, { color: colors.gray_regular }]}
        >
          {stepData.subtitle}
        </CustomText>
      </CustomView>
    );
  };

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

  const isNextButtonDisabled =
    currentSelection === undefined && stepData?.type !== "final-slide";

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar style="dark" />
      {currentStepIndex > 0 && stepData?.type !== "final-slide" && (
        <CustomTouchable style={styles.header} onPress={handleBack}>
          <ArrowLeftSvg />
        </CustomTouchable>
      )}

      {renderStepContent()}

      <CustomView style={styles.footer}>
        {stepData &&
          stepData.type !== "logo-selection" &&
          stepData.type !== "card-swipe" && (
            <NextButton
              onPress={handleNext}
              customStyles={
                isNextButtonDisabled ? styles.nextButtonDisabled : {}
              }
              bgColor={colors.lime}
              title={
                currentStepIndex === filteredSteps.length - 1
                  ? "Finish"
                  : "Next"
              }
              disabled={isNextButtonDisabled}
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
  contentEnd: {
    flex: 1,
    paddingHorizontal: horizontalScale(24),
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 273,
    height: 273,
  },
  logoEnd: {
    width: 327,
    height: 327,
  },
  title: {
    fontSize: scaleFontSize(18),
    marginBottom: verticalScale(8),
    textAlign: "center",
  },
  subtitle: {
    fontSize: scaleFontSize(14),
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
  endTitle: {
    fontSize: scaleFontSize(18),
    marginBottom: verticalScale(8),
    textAlign: "center",
  },
  endSubtitle: {
    fontSize: scaleFontSize(14),
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
