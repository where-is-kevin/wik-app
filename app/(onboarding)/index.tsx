import React, { useState, useEffect } from "react";
import { StyleSheet, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { OnboardingOption } from "@/components/Onboarding/OnboardingOption";
import { OnboardingProgressBar } from "@/components/Onboarding/OnboardingProgressBar";
import { OnboardingTag } from "@/components/Onboarding/OnboardingTag";
import {
  OnboardingSelections,
  OnboardingStep,
  onboardingSteps,
} from "@/constants/onboardingSlides";
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
import SwipeCardTooltips from "@/components/Tooltips/SwipeCardTooltips";
import LottieView from "lottie-react-native";
import OnboardingAnimationStart from "@/assets/animations/onboarding-animation-start.json";
import OnboardingAnimationEnd from "@/assets/animations/onboarding-animation-end.json";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useCreateUser } from "@/hooks/useUser";
import type { CreateUserInput } from "@/hooks/useUser";
import { useAuth } from "@/hooks/useAuth";
import { useContent } from "@/hooks/useContent";
import { useLocationPermissionGuard } from "@/hooks/useLocationPermissionGuard";
import AnimatedLoader from "@/components/Loader/AnimatedLoader";
import { CardData, SwipeCards } from "@/components/SwipeCards/SwipeCards";
import { getErrorMessage } from "@/utilities/errorUtils";

const OnboardingScreen = () => {
  const router = useRouter();
  const { mutate: createUser, isPending } = useCreateUser();
  const { mutate: login } = useAuth();
  const { colors } = useTheme();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [selections, setSelections] = useState<OnboardingSelections>({});
  const [filteredSteps, setFilteredSteps] = useState<OnboardingStep[]>([]);
  const [personalFormData, setPersonalFormData] = useState<PersonalFormData>({
    firstName: "",
    lastName: "",
    email: "",
    home: "",
    travelDestination: "",
    personalSummary: "",
    password: "",
  });
  const [swipeLikes, setSwipeLikes] = useState<string[]>([]);
  const [swipeDislikes, setSwipeDislikes] = useState<string[]>([]);
  const [showTutorial, setShowTutorial] = useState<boolean>(true);

  const {
    data: content,
    isLoading: isContentLoading,
    error: contentError,
    refetch,
  } = useContent({});

  const { checkAndNavigate } = useLocationPermissionGuard({
    redirectToTabs: true,
  });

  const stepData = filteredSteps[currentStepIndex];
  const currentSelection = stepData ? selections[stepData.key] : undefined;

  // Transform content data to match SwipeCards interface (limit to 5 items)
  const transformedCardData: CardData[] = content
    ? content.slice(0, 5).map((item) => ({
        id: item.id,
        title: item.title,
        imageUrl:
          item.internalImageUrls && item.internalImageUrls.length > 0
            ? item.internalImageUrls[0]
            : item.googlePlacesImageUrl,
        price: item.price?.toString(),
        rating: item?.rating?.toString(),
        category: item.category,
        websiteUrl: item.websiteUrl || "",
        address: item.address || "",
        isSponsored: item.isSponsored,
        contentShareUrl: item.contentShareUrl,
        tags: item.tags,
        similarity: item.similarity,
        distance: item.distance,
      }))
    : [];

  // Helper to get selected indices as array
  const getSelectedIndices = (): number[] => {
    if (!stepData) return [];
    const selection = selections[stepData.key];

    // Handle multiple selections (array)
    if (Array.isArray(selection)) {
      return selection;
    }

    // Handle single selection (number) - convert to array for consistency
    if (typeof selection === "number") {
      return [selection];
    }

    return [];
  };

  const selectedIndices = getSelectedIndices();

  useEffect(() => {
    const initialSteps = onboardingSteps.filter((step) => !step.condition);
    setFilteredSteps(initialSteps);
  }, []);

  useEffect(() => {
    const newFilteredSteps = onboardingSteps.filter((step) => {
      if (!step.condition) return true;
      const { key, value } = step.condition;
      const stepSelection = selections[key];

      // Handle array selections - check if value exists in array
      if (Array.isArray(stepSelection)) {
        return stepSelection.includes(value);
      }

      // Handle single selection
      return stepSelection === value;
    });

    setFilteredSteps(newFilteredSteps);
  }, [selections]);

  const handleFormChange = (formData: PersonalFormData) => {
    setPersonalFormData(formData);

    const isFormValid =
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.email.trim() !== "";

    if (stepData) {
      setSelections((prev) => ({
        ...prev,
        [stepData.key]: isFormValid ? 1 : 0,
      }));
    }
  };

  const handleSwipeRight = (item: CardData) => {
    if (!item || !item.id) {
      return;
    }

    setSwipeLikes((prevLikes) => {
      // Prevent duplicates
      if (prevLikes.includes(item.id)) {
        return prevLikes;
      }

      // Add new item to existing array
      return [...prevLikes, item.id];
    });

    // Remove from dislikes if it was there
    setSwipeDislikes((prevDislikes) =>
      prevDislikes.filter((id) => id !== item.id)
    );
  };

  const handleSwipeLeft = (item: CardData) => {
    if (!item || !item.id) {
      return;
    }

    setSwipeDislikes((prevDislikes) => {
      // Prevent duplicates
      if (prevDislikes.includes(item.id)) {
        return prevDislikes;
      }

      // Add new item to existing array
      return [...prevDislikes, item.id];
    });

    // Remove from likes if it was there
    setSwipeLikes((prevLikes) => prevLikes.filter((id) => id !== item.id));
  };

  const handleSwipeUp = (item: CardData) => {
    if (!item) return;
    // For onboarding, you might want to handle this differently
    console.log("Swiped up on:", item.title);
  };

  const handleSwipeComplete = () => {
    if (stepData) {
      setSelections((prev) => ({
        ...prev,
        [stepData.key]: 1,
      }));

      setTimeout(() => {
        setCurrentStepIndex(currentStepIndex + 1);
      }, 500);
    }
  };

  const handleCardTap = (item: CardData) => {
    if (!item) return;

    // Navigate to event details with hideBucketsButton param
    router.push({
      pathname: "/event-details/[eventId]",
      params: {
        eventId: item.id,
        hideBucketsButton: "true",
      },
    });
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  const handleSelection = (index: number) => {
    if (!stepData) return;

    // Check if this step allows multiple selections
    if (stepData.allowMultipleSelections) {
      const currentSelections = Array.isArray(selections[stepData.key])
        ? (selections[stepData.key] as number[])
        : [];

      let newSelections: number[];

      if (currentSelections.includes(index)) {
        // Remove if already selected
        newSelections = currentSelections.filter((i) => i !== index);
      } else {
        // Add if not selected
        newSelections = [...currentSelections, index];
      }

      setSelections((prev) => ({
        ...prev,
        [stepData.key]: newSelections,
      }));
    } else {
      // Single selection logic (original behavior)
      setSelections((prev) => ({
        ...prev,
        [stepData.key]: index,
      }));
    }
  };

  const handleLogoSelection = (index: number) => {
    if (!stepData) return;

    setSelections((prev) => ({
      ...prev,
      [stepData.key]: index,
    }));

    setTimeout(() => {
      setCurrentStepIndex(1);
    }, 150);
  };

  const handleNext = async () => {
    if (currentStepIndex === filteredSteps.length - 1) {
      try {
        const getSelectedOptionsString = () => {
          return Object.entries(selections)
            .map(([key, value]) => {
              const step = onboardingSteps.find((s) => s.key === key);
              if (!step || !step.options.length || value === undefined)
                return null;
              if (Array.isArray(value)) {
                return value.map((i) => step.options[i]).join(", ");
              }
              return step.options[value];
            })
            .filter(Boolean)
            .join(" | ");
        };

        // Map personalFormData to CreateUserInput
        const userInput: CreateUserInput = {
          firstName: personalFormData.firstName,
          lastName: personalFormData.lastName,
          email: personalFormData.email,
          home: personalFormData.home,
          location: personalFormData.travelDestination,
          password: personalFormData.password,
          description: getSelectedOptionsString(),
          personalSummary: personalFormData.personalSummary,
          onboardingLikes: swipeLikes, // Array of liked content IDs
          onboardingDislikes: swipeDislikes, // Array of disliked content IDs
        };

        createUser(userInput, {
          onSuccess: async () => {
            try {
              // After successful user creation, log in the user
              login(
                {
                  username: userInput.email,
                  password: userInput.password,
                },
                {
                  onSuccess: async () => {
                    // Navigate through location permission check instead of directly to tabs
                    await checkAndNavigate();
                  },
                  onError: (loginErr: any) => {
                    console.error("Login failed after signup", loginErr);
                    router.push("/(auth)");
                  },
                }
              );
            } catch (loginErr) {
              console.error("Login failed after signup", loginErr);
              router.push("/(auth)");
            }
          },
          onError: (err: any) => {
            console.error("Signup failed", err?.message || "Unknown error");

            // Handle specific error cases
            if (err?.status === 400) {
              const errorMessage =
                err?.detail ||
                err?.message ||
                err?.response?.detail ||
                err?.response?.message ||
                "Bad request";

              // Check for duplicate email error
              if (
                errorMessage.toLowerCase().includes("email") &&
                (errorMessage.toLowerCase().includes("exists") ||
                  errorMessage.toLowerCase().includes("taken") ||
                  errorMessage.toLowerCase().includes("already"))
              ) {
                Alert.alert(
                  "Email Already Registered",
                  "This email is already registered. Please use a different email or go back to sign in.",
                  [
                    {
                      text: "Try Different Email",
                      style: "default",
                    },
                    {
                      text: "Sign In Instead",
                      onPress: () => router.push("/(auth)"),
                      style: "default",
                    },
                  ]
                );
                return; // Don't navigate, let user fix the issue
              }

              // Handle other 400 errors
              Alert.alert("Registration Error", errorMessage, [
                { text: "OK", style: "default" },
              ]);
              return;
            }

            // Handle other error types using the global error utility
            const { title, message } = getErrorMessage(err);
            Alert.alert(title, message, [
              {
                text: "Try Again",
                style: "default",
              },
              {
                text: "Sign In Instead",
                onPress: () => router.push("/(auth)"),
                style: "cancel",
              },
            ]);
          },
        });
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
    } else {
      router.back();
    }
  };

  const renderLogoSelection = () => {
    if (!stepData) return null;

    return (
      <CustomView style={styles.logoContent}>
        <CustomView>
          <CustomText
            fontFamily="Inter-SemiBold"
            style={[styles.title, { color: colors.label_dark }]}
          >
            {stepData.title}
          </CustomText>
          <CustomText style={[styles.subtitle, { color: colors.gray_regular }]}>
            {stepData.subtitle}
          </CustomText>
          <LottieView
            source={OnboardingAnimationStart}
            autoPlay
            loop
            style={styles.logo}
          />
        </CustomView>

        <CustomView style={styles.travelOptionContainer}>
          {stepData.options.map((option, index) => (
            <CustomTouchable
              key={index}
              style={[
                styles.selectionButton,
                styles.businessButton,
                selectedIndices.includes(index) ? styles.selectedButton : {},
              ]}
              bgColor={
                selectedIndices.includes(index)
                  ? "#DAE1FF"
                  : colors.onboarding_gray
              }
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
            <OnboardingOption
              key={index}
              text={option}
              selected={selectedIndices.includes(index)}
              onPress={() => handleSelection(index)}
              allowMultipleSelections={stepData.allowMultipleSelections}
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
          onPressNext={handleNext}
          formData={personalFormData}
          onFormChange={handleFormChange}
        />
      </CustomView>
    );
  };

  const renderCardSwipe = () => {
    if (!stepData) return null;

    // Show loading state while content is being fetched
    if (isContentLoading) {
      return (
        <CustomView style={styles.content}>
          <CustomView style={styles.swipeContainer}>
            <AnimatedLoader />
          </CustomView>
        </CustomView>
      );
    }

    // Show error state if content failed to load
    if (contentError) {
      return (
        <CustomView style={styles.content}>
          <CustomView style={styles.swipeContainer}>
            <CustomText
              style={[styles.errorText, { color: colors.gray_regular }]}
            >
              Failed to load content. Please try again.
            </CustomText>
            <CustomTouchable
              style={styles.retryButton}
              onPress={() => refetch()}
              bgColor={colors.lime}
            >
              <CustomText style={styles.retryButtonText}>Retry</CustomText>
            </CustomTouchable>
          </CustomView>
        </CustomView>
      );
    }

    // Show empty state if no content available
    if (!transformedCardData.length) {
      return (
        <CustomView style={styles.content}>
          <CustomView style={styles.swipeContainer}>
            <CustomText
              style={[styles.emptyText, { color: colors.gray_regular }]}
            >
              No content available at the moment.
            </CustomText>
            <CustomTouchable
              style={styles.retryButton}
              onPress={() => refetch()}
              bgColor={colors.lime}
            >
              <CustomText style={styles.retryButtonText}>Refresh</CustomText>
            </CustomTouchable>
          </CustomView>
        </CustomView>
      );
    }

    return (
      <CustomView style={styles.content}>
        <CustomView style={styles.swipeContainer}>
          <SwipeCards
            data={transformedCardData}
            onCardTap={handleCardTap}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onSwipeUp={handleSwipeUp}
            onComplete={handleSwipeComplete}
            hideBucketsButton={true}
          />

          {showTutorial && !isContentLoading && (
            <SwipeCardTooltips onComplete={handleTutorialComplete} />
          )}
        </CustomView>
      </CustomView>
    );
  };

  const renderTagSelection = () => {
    if (!stepData || !stepData.tags) return null;

    // Group tags by category
    const groupedTags = stepData.tags.reduce((acc, tag) => {
      if (!acc[tag.category]) {
        acc[tag.category] = [];
      }
      acc[tag.category].push(tag);
      return acc;
    }, {} as Record<string, typeof stepData.tags>);

    return (
      <CustomView style={styles.tagContent}>
        <CustomText
          fontFamily="Inter-SemiBold"
          style={[
            styles.title,
            { color: colors.label_dark, marginHorizontal: horizontalScale(24) },
          ]}
        >
          {stepData.title}
        </CustomText>
        <CustomText
          style={[
            styles.subtitle,
            {
              color: colors.gray_regular,
              marginHorizontal: horizontalScale(24),
            },
          ]}
        >
          {stepData.subtitle}
        </CustomText>

        <ScrollView
          style={styles.tagScrollContainer}
          contentContainerStyle={styles.tagContainer}
          showsVerticalScrollIndicator={false}
        >
          {Object.entries(groupedTags).map(([category, tags]) => (
            <CustomView key={category} style={styles.categoryContainer}>
              <CustomText
                fontFamily="Inter-SemiBold"
                style={[
                  styles.categoryTitle,
                  {
                    color: colors.label_dark,
                    marginLeft: horizontalScale(24),
                  },
                ]}
              >
                {category}
              </CustomText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalTagsContainer}
              >
                <CustomView style={styles.twoRowContainer}>
                  <CustomView style={styles.tagRow}>
                    {tags.slice(0, Math.ceil(tags.length / 2)).map((tag) => (
                      <OnboardingTag
                        key={tag.number}
                        number={tag.number}
                        text={tag.text}
                        icon={tag.icon}
                        selected={selectedIndices.includes(tag.number - 1)}
                        onPress={() => handleSelection(tag.number - 1)}
                      />
                    ))}
                  </CustomView>
                  <CustomView style={styles.tagRow}>
                    {tags.slice(Math.ceil(tags.length / 2)).map((tag) => (
                      <OnboardingTag
                        key={tag.number}
                        number={tag.number}
                        text={tag.text}
                        icon={tag.icon}
                        selected={selectedIndices.includes(tag.number - 1)}
                        onPress={() => handleSelection(tag.number - 1)}
                      />
                    ))}
                  </CustomView>
                </CustomView>
              </ScrollView>
            </CustomView>
          ))}
        </ScrollView>
      </CustomView>
    );
  };

  const renderFinalSlide = () => {
    if (!stepData) return null;

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
      case "tag-selection":
        return renderTagSelection();
      case "final-slide":
        return renderFinalSlide();
      default:
        return null;
    }
  };

  // Updated validation logic to handle both single and multiple selections
  const isNextButtonDisabled = (): boolean => {
    if (stepData?.type === "final-slide") return false;

    // For steps that allow multiple selections, require at least one selection
    if (stepData?.allowMultipleSelections) {
      return selectedIndices.length === 0;
    }

    // For single selection steps, keep original logic
    return currentSelection === undefined;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar style="dark" />
      {stepData?.type !== "final-slide" && (
        <CustomTouchable style={styles.header} onPress={handleBack}>
          <ArrowLeftSvg />
        </CustomTouchable>
      )}

      {(stepData?.type === "option-list" ||
        stepData?.type === "tag-list" ||
        stepData?.type === "budget-selection" ||
        stepData?.type === "tag-selection") && (
        <CustomView style={styles.progressContainer}>
          <OnboardingProgressBar
            steps={
              filteredSteps.filter(
                (step) =>
                  step.type === "option-list" ||
                  step.type === "tag-list" ||
                  step.type === "budget-selection" ||
                  step.type === "tag-selection"
              ).length
            }
            currentStep={
              filteredSteps
                .slice(0, currentStepIndex + 1)
                .filter(
                  (step) =>
                    step.type === "option-list" ||
                    step.type === "tag-list" ||
                    step.type === "budget-selection" ||
                    step.type === "tag-selection"
                ).length - 1
            }
          />
        </CustomView>
      )}

      {renderStepContent()}

      <CustomView style={styles.footer}>
        {stepData &&
          stepData.type !== "logo-selection" &&
          stepData.type !== "card-swipe" &&
          stepData.type !== "personal-form" && (
            <NextButton
              onPress={handleNext}
              customStyles={
                isNextButtonDisabled() || isPending
                  ? styles.nextButtonDisabled
                  : {}
              }
              bgColor={colors.lime}
              title={
                isPending
                  ? "Finalizing..."
                  : currentStepIndex === filteredSteps.length - 1
                  ? "Finish"
                  : "Continue"
              }
              disabled={isNextButtonDisabled() || isPending}
            />
          )}
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
    paddingHorizontal: horizontalScale(26),
    paddingVertical: verticalScale(10),
  },
  content: {
    flex: 1,
    paddingHorizontal: horizontalScale(24),
    alignItems: "center",
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(20),
  },
  tagContent: {
    flex: 1,
    alignItems: "center",
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(20),
  },
  logoContent: {
    flex: 1,
    paddingHorizontal: horizontalScale(24),
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(20),
  },
  contentEnd: {
    flex: 1,
    paddingHorizontal: horizontalScale(24),
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 240,
    height: 240,
    marginTop: verticalScale(30),
    marginBottom: verticalScale(50),
    alignSelf: "center",
  },
  logoEnd: {
    width: 240,
    height: 240,
  },
  title: {
    fontSize: scaleFontSize(18),
    marginBottom: verticalScale(4),
    textAlign: "center",
  },
  subtitle: {
    fontSize: scaleFontSize(14),
    textAlign: "center",
  },
  optionsSubtitle: {
    fontSize: scaleFontSize(15),
    textAlign: "center",
    marginBottom: verticalScale(8),
  },
  optionsTitle: {
    fontSize: scaleFontSize(18),
    minHeight: 58,
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
  travelOptionContainer: {
    width: "100%",
    flex: 1,
  },
  optionsContainer: {
    width: "100%",
    justifyContent: "center",
    flex: 1,
  },
  selectionButton: {
    paddingVertical: 10,
    height: 60,
    alignSelf: "center",
    width: "100%",
    justifyContent: "center",
    paddingHorizontal: 28,
    borderRadius: 31,
    marginBottom: verticalScale(12),
  },
  businessButton: {
    borderWidth: 1,
    borderColor: "#D6D6D9",
  },
  selectedButton: {
    borderColor: "#3C62FA",
    borderWidth: 2,
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
    paddingHorizontal: horizontalScale(24),
  },
  swipeContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: verticalScale(30),
  },
  errorText: {
    fontSize: scaleFontSize(16),
    textAlign: "center",
    marginBottom: verticalScale(16),
  },
  emptyText: {
    fontSize: scaleFontSize(16),
    textAlign: "center",
    marginBottom: verticalScale(16),
  },
  retryButton: {
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(24),
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: scaleFontSize(14),
    color: "#fff",
    textAlign: "center",
  },
  tagScrollContainer: {
    flex: 1,
    width: "100%",
  },
  tagContainer: {
    width: "100%",
    paddingTop: verticalScale(20),
  },
  categoryContainer: {
    marginBottom: verticalScale(20),
  },
  categoryTitle: {
    fontSize: scaleFontSize(16),
    marginBottom: verticalScale(10),
  },
  horizontalTagsContainer: {
    paddingHorizontal: horizontalScale(24),
  },
  twoRowContainer: {
    flexDirection: "column",
  },
  tagRow: {
    flexDirection: "row",
    marginBottom: verticalScale(8),
    gap: horizontalScale(8),
  },
});
