import React, { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { OnboardingProgressBar } from "@/components/Onboarding/OnboardingProgressBar";
import { OnboardingLogoSlide } from "@/components/Onboarding/OnboardingLogoSlide";
import { OnboardingOptionSlide } from "@/components/Onboarding/OnboardingOptionSlide";
import { OnboardingPersonalFormSlide } from "@/components/Onboarding/OnboardingPersonalFormSlide";
import { OnboardingCardSwipeSlide } from "@/components/Onboarding/OnboardingCardSwipeSlide";
import { OnboardingTagSlide } from "@/components/Onboarding/OnboardingTagSlide";
import { OnboardingFinalSlide } from "@/components/Onboarding/OnboardingFinalSlide";
import { OnboardingBudgetSlide } from "@/components/Onboarding/OnboardingBudgetSlide";
import { OnboardingLocationSlide } from "@/components/Onboarding/OnboardingLocationSlide";
import { LocationData } from "@/components/Onboarding/OnboardingLocationItem";
import { commonOnboardingStyles } from "@/components/Onboarding/OnboardingStyles";
import {
  OnboardingSelections,
  OnboardingStep,
  onboardingSteps,
} from "@/constants/onboardingSlides";
import CustomView from "@/components/CustomView";
import CustomTouchable from "@/components/CustomTouchableOpacity";
import { useTheme } from "@/contexts/ThemeContext";
import ArrowLeftSvg from "@/components/SvgComponents/ArrowLeftSvg";
import NextButton from "@/components/Button/NextButton";
import { PersonalFormData } from "@/components/Onboarding/OnboardingForm";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useCreateUser } from "@/hooks/useUser";
import type { CreateUserInput } from "@/hooks/useUser";
import { useAuth } from "@/hooks/useAuth";
import { useContent } from "@/hooks/useContent";
import { useLocationPermissionGuard } from "@/hooks/useLocationPermissionGuard";
import { CardData } from "@/components/SwipeCards/SwipeCards";
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
  const [budgetRange, setBudgetRange] = useState<{ min: number; max: number }>({
    min: 50,
    max: 200,
  });
  const [selectedLocation, setSelectedLocation] = useState<LocationData | undefined>();

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

  const handleBudgetChange = (budget: { min: number; max: number }) => {
    if (!stepData) return;

    setBudgetRange(budget);
    setSelections((prev) => ({
      ...prev,
      [stepData.key]: budget,
    }));
  };

  const handleLocationSelect = (location: LocationData) => {
    if (!stepData) return;

    setSelectedLocation(location);
    setSelections((prev) => ({
      ...prev,
      [stepData.key]: location,
    }));
  };

  const handleNext = async () => {
    if (currentStepIndex === filteredSteps.length - 1) {
      try {
        const getSelectedOptionsString = () => {
          return Object.entries(selections)
            .map(([key, value]) => {
              const step = onboardingSteps.find((s) => s.key === key);
              if (!step || value === undefined) return null;

              // Handle budget selection
              if (
                typeof value === "object" &&
                "min" in value &&
                "max" in value
              ) {
                return `Budget: $${value.min} - $${value.max}`;
              }

              // Handle location selection
              if (
                typeof value === "object" &&
                "id" in value &&
                "fullName" in value
              ) {
                return `Destination: ${value.fullName}`;
              }

              // Skip steps without options (like budget selection)
              if (!step.options.length) return null;

              if (Array.isArray(value)) {
                return value.map((i) => step.options[i]).join(", ");
              }
              return step.options[value as number];
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
      <OnboardingLogoSlide
        stepData={stepData}
        selectedIndices={selectedIndices}
        onSelection={handleLogoSelection}
      />
    );
  };

  const renderOptionList = () => {
    if (!stepData) return null;
    return (
      <OnboardingOptionSlide
        stepData={stepData}
        selectedIndices={selectedIndices}
        onSelection={handleSelection}
      />
    );
  };

  const renderPersonalForm = () => {
    if (!stepData) return null;
    return (
      <OnboardingPersonalFormSlide
        stepData={stepData}
        formData={personalFormData}
        onFormChange={handleFormChange}
        onNext={handleNext}
      />
    );
  };

  const renderCardSwipe = () => {
    if (!stepData) return null;
    return (
      <OnboardingCardSwipeSlide
        isLoading={isContentLoading}
        error={contentError}
        cardData={transformedCardData}
        showTutorial={showTutorial}
        onCardTap={handleCardTap}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        onSwipeUp={handleSwipeUp}
        onComplete={handleSwipeComplete}
        onTutorialComplete={handleTutorialComplete}
        onRetry={() => refetch()}
      />
    );
  };

  const renderTagSelection = () => {
    if (!stepData) return null;
    return (
      <OnboardingTagSlide
        stepData={stepData}
        selectedIndices={selectedIndices}
        onSelection={handleSelection}
      />
    );
  };

  const renderBudgetSelection = () => {
    if (!stepData) return null;
    return (
      <OnboardingBudgetSlide
        stepData={stepData}
        onBudgetChange={handleBudgetChange}
        initialBudget={budgetRange}
      />
    );
  };

  const renderLocationSelection = () => {
    if (!stepData) return null;
    return (
      <OnboardingLocationSlide
        stepData={stepData}
        onLocationSelect={handleLocationSelect}
        selectedLocation={selectedLocation}
      />
    );
  };

  const renderFinalSlide = () => {
    if (!stepData) return null;
    return <OnboardingFinalSlide stepData={stepData} />;
  };

  const renderStepContent = () => {
    if (!stepData) return null;

    switch (stepData.type) {
      case "logo-selection":
        return renderLogoSelection();
      case "option-list":
        return renderOptionList();
      case "budget-selection":
        return renderBudgetSelection();
      case "location-selection":
        return renderLocationSelection();
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

    // For budget selection steps, always enabled (has default values)
    if (stepData?.type === "budget-selection") return false;

    // For location selection steps, require a location to be selected
    if (stepData?.type === "location-selection") {
      return !selectedLocation;
    }

    // For steps that allow multiple selections, require at least one selection
    if (stepData?.allowMultipleSelections) {
      return selectedIndices.length === 0;
    }

    // For single selection steps, keep original logic
    return currentSelection === undefined;
  };

  return (
    <SafeAreaView
      style={[
        commonOnboardingStyles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <StatusBar style="dark" />
      {stepData?.type !== "final-slide" && (
        <CustomTouchable
          style={commonOnboardingStyles.header}
          onPress={handleBack}
        >
          <ArrowLeftSvg />
        </CustomTouchable>
      )}

      {(stepData?.type === "option-list" ||
        stepData?.type === "budget-selection" ||
        stepData?.type === "tag-selection" ||
        stepData?.type === "location-selection") && (
        <CustomView style={commonOnboardingStyles.progressContainer}>
          <OnboardingProgressBar
            steps={
              filteredSteps.filter(
                (step) =>
                  step.type === "option-list" ||
                  step.type === "budget-selection" ||
                  step.type === "tag-selection" ||
                  step.type === "location-selection"
              ).length
            }
            currentStep={
              filteredSteps
                .slice(0, currentStepIndex + 1)
                .filter(
                  (step) =>
                    step.type === "option-list" ||
                    step.type === "budget-selection" ||
                    step.type === "tag-selection" ||
                    step.type === "location-selection"
                ).length - 1
            }
          />
        </CustomView>
      )}

      {renderStepContent()}

      <CustomView style={commonOnboardingStyles.footer}>
        {stepData &&
          stepData.type !== "logo-selection" &&
          stepData.type !== "card-swipe" &&
          stepData.type !== "personal-form" && (
            <NextButton
              onPress={handleNext}
              customStyles={
                isNextButtonDisabled() || isPending
                  ? commonOnboardingStyles.nextButtonDisabled
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
