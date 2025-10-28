import React, { useState, useEffect, useRef, useCallback } from "react";
import { Alert, BackHandler } from "react-native";
import { useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { OnboardingProgressBar } from "@/components/Onboarding/OnboardingProgressBar";
import { OnboardingLogoSlide } from "@/components/Onboarding/OnboardingLogoSlide";
import { OnboardingOptionSlide } from "@/components/Onboarding/OnboardingOptionSlide";
import { OnboardingPersonalFormSlide } from "@/components/Onboarding/OnboardingPersonalFormSlide";
import { OnboardingCardSwipeSlide } from "@/components/Onboarding/OnboardingCardSwipeSlide";
import { OnboardingSwipeUpModal } from "@/components/Modals/OnboardingSwipeUpModal";
import { OnboardingTagSlide } from "@/components/Onboarding/OnboardingTagSlide";
import { OnboardingBusinessTagSlide } from "@/components/Onboarding/OnboardingBusinessTagSlide";
import { OnboardingBusinessPersonalFormSlide } from "@/components/Onboarding/OnboardingBusinessPersonalFormSlide";
import { OnboardingBusinessWorkFormSlide } from "@/components/Onboarding/OnboardingBusinessWorkFormSlide";
import { OnboardingFinalSlide } from "@/components/Onboarding/OnboardingFinalSlide";
import { OnboardingBudgetSlide } from "@/components/Onboarding/OnboardingBudgetSlide";
import { OnboardingLocationSlide } from "@/components/Onboarding/OnboardingLocationSlide";
import { LocationData } from "@/components/Onboarding/OnboardingLocationItem";
import { OnboardingTravelEmailSlide } from "@/components/Onboarding/OnboardingTravelEmailSlide";
import { OnboardingTravelNameSlide } from "@/components/Onboarding/OnboardingTravelNameSlide";
import { OnboardingCodeSlide } from "@/components/Onboarding/OnboardingCodeSlide";
import { commonOnboardingStyles } from "@/components/Onboarding/OnboardingStyles";
import {
  OnboardingSelections,
  OnboardingStep,
  getBusinessFlow,
  getLeisureFlow,
  onboardingSteps,
} from "@/constants/onboardingSlides";
import CustomView from "@/components/CustomView";
import CustomTouchable from "@/components/CustomTouchableOpacity";
import { useTheme } from "@/contexts/ThemeContext";
import ArrowLeftSvg from "@/components/SvgComponents/ArrowLeftSvg";
import NextButton from "@/components/Button/NextButton";
import { PersonalFormData } from "@/components/Onboarding/OnboardingForm";
import { BusinessPersonalFormData } from "@/components/Onboarding/OnboardingBusinessPersonalFormSlide";
import { BusinessWorkFormData } from "@/components/Onboarding/OnboardingBusinessWorkFormSlide";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useCreateUser, useValidateRegistrationCode } from "@/hooks/useUser";
import type {
  CreateUserInput,
  ValidateRegistrationCodeInput,
} from "@/hooks/useUser";
import { useContent } from "@/hooks/useContent";
import { CardData } from "@/components/SwipeCards/SwipeCards";
import { getErrorMessage } from "@/utilities/errorUtils";
import { verticalScale } from "@/utilities/scaling";
import * as Location from "expo-location";
import { useUserLocation } from "@/contexts/UserLocationContext";
import { useMode } from "@/contexts/ModeContext";
import {
  createCurrentLocationPreference,
  createSelectedLocationPreference,
} from "@/utilities/locationHelpers";

const OnboardingScreen = () => {
  const router = useRouter();
  const { mutate: createUser, isPending } = useCreateUser();
  const { mutate: validateRegistrationCode, isPending: isValidating } =
    useValidateRegistrationCode();
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const { setUserLocation } = useUserLocation();
  const { setMode } = useMode();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [selections, setSelections] = useState<OnboardingSelections>({});

  const [currentFlow, setCurrentFlow] = useState<OnboardingStep[]>([]);
  const [userType, setUserType] = useState<number | null>(null);
  const [personalFormData, setPersonalFormData] = useState<PersonalFormData>({
    firstName: "",
    lastName: "",
    email: "",
    travelDestination: "",
    personalSummary: "",
  });
  const [swipeLikes, setSwipeLikes] = useState<string[]>([]);
  const [swipeDislikes, setSwipeDislikes] = useState<string[]>([]);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const hasSwipedUpRef = useRef<boolean>(false);
  const isVerifyingRef = useRef<boolean>(false);
  const [showSwipeUpModal, setShowSwipeUpModal] = useState<boolean>(false);
  const [budgetRange, setBudgetRange] = useState<{ min: number; max: number }>({
    min: 50,
    max: 200,
  });
  const [selectedLocation, setSelectedLocation] = useState<
    LocationData | undefined
  >();
  const [travelEmail, setTravelEmail] = useState<string>("");
  const [travelName, setTravelName] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [businessPersonalFormData, setBusinessPersonalFormData] =
    useState<BusinessPersonalFormData>({
      fullName: "",
      areasOfExpertise: [],
    });
  const [businessWorkFormData, setBusinessWorkFormData] =
    useState<BusinessWorkFormData>({
      role: "",
      company: "",
      industry: [],
      stage: "",
    });

  // Helper function to save location preference based on onboarding selection
  const saveLocationPreference = useCallback(async () => {
    // Try to get location from selectedLocation state or fallback to selections
    const locationToSave =
      selectedLocation ||
      selections["travelDestination"] ||
      selections["businessDestination"];

    if (
      locationToSave &&
      typeof locationToSave === "object" &&
      "fullName" in locationToSave
    ) {
      try {
        // Always try to get device location first
        const { status } = await Location.getForegroundPermissionsAsync();
        let deviceLat = 0;
        let deviceLng = 0;

        if (status === Location.PermissionStatus.GRANTED) {
          try {
            const currentLocation = await Location.getCurrentPositionAsync();
            deviceLat = currentLocation.coords.latitude;
            deviceLng = currentLocation.coords.longitude;
          } catch {
            // Failed to get location but continue
          }
        }

        if (locationToSave.isCurrentLocation) {
          // User selected "Current Location" - save as current location type
          const locationData = createCurrentLocationPreference(
            deviceLat,
            deviceLng,
            "Current Location"
          );
          await setUserLocation(locationData);
        } else {
          // User selected a specific location - save without coordinates
          const locationData = createSelectedLocationPreference(
            locationToSave.fullName,
            locationToSave.name + ", " + locationToSave.country,
            locationToSave.id
          );
          await setUserLocation(locationData);
        }
      } catch (error) {
        console.error("Failed to save location preference:", error);
      }
    }
  }, [selectedLocation, selections, setUserLocation]);

  // Simple navigation function - no complex auth checks during onboarding
  const navigateAfterAuth = useCallback(async () => {
    try {
      // Set user mode based on their onboarding choice
      if (userType !== null) {
        const userMode = userType === 0 ? "business" : "leisure";
        await setMode(userMode);
      }

      // Check location permission status
      const { status } = await Location.getForegroundPermissionsAsync();

      if (status === Location.PermissionStatus.GRANTED) {
        // Permission already granted, go directly to tabs
        router.push("/(tabs)");
      } else {
        // Permission needed, show permission screen
        router.push("/(auth)/location-permission");
      }
    } catch (error) {
      console.error("Error checking location permission:", error);
      // On error, show permission screen to be safe
      router.push("/(auth)/location-permission");
    }
  }, [router, userType, setMode]);

  const {
    data: content,
    isLoading: isContentLoading,
    error: contentError,
    refetch,
  } = useContent({
    category_filter: "event;venue;experience", // Load all content types for onboarding
  });


  // Helper function to remove emojis from text (remove emoji at start + any trailing space)
  const removeEmojis = (text: string): string => {
    // Remove emoji(s) at the start of the string, including complex emojis with variation selectors and ZWJ sequences
    return text.replace(
      /^[\u{1F000}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}]+\s*/gu,
      ""
    );
  };

  // Helper function to create user input for leisure users
  const createTravelUserInput = useCallback((): CreateUserInput => {
    // Extract traveling reasons from selections
    const travelingReasonStep = onboardingSteps.find(
      (step) => step.key === "personalTravelReason"
    );
    const travelingReasonSelection = selections["personalTravelReason"];
    const travelingReason = Array.isArray(travelingReasonSelection)
      ? travelingReasonSelection
          .map((index) => {
            const option = travelingReasonStep?.options?.[index];
            return option ? removeEmojis(option) : undefined;
          })
          .filter((item): item is string => Boolean(item))
      : travelingReasonStep?.options?.[travelingReasonSelection as number]
      ? [
          removeEmojis(
            travelingReasonStep.options[travelingReasonSelection as number]
          ),
        ]
      : [];

    // Extract traveling tags from selections (personalTravelFrequency is the tag selection step)
    const travelingTagsStep = onboardingSteps.find(
      (step) => step.key === "personalTravelFrequency"
    );
    const travelingTagsSelection = selections["personalTravelFrequency"];
    const travelingTags = Array.isArray(travelingTagsSelection)
      ? travelingTagsSelection
          .map((index) => {
            const tag = travelingTagsStep?.tags?.find(
              (t) => t.number === index + 1
            );
            return tag?.text; // tag.text doesn't have emojis - emojis are in tag.icon
          })
          .filter((item): item is string => Boolean(item))
      : [];

    return {
      type: "leisure",
      travelingReason: travelingReason,
      travelingTags: travelingTags,
      minBudget: budgetRange.min,
      maxBudget: budgetRange.max,
      currency: "USD",
      location: selectedLocation?.fullName || "current location",
      onboardingLikes: swipeLikes,
      onboardingDislikes: swipeDislikes,
      fullName: travelName,
      email: travelEmail,
    };
  }, [
    travelName,
    travelEmail,
    selectedLocation,
    selections,
    budgetRange,
    swipeLikes,
    swipeDislikes,
  ]);

  // Helper function to create user input for business users
  const createBusinessUserInput = useCallback((): CreateUserInput => {
    // Extract traveling goals from selections
    const travelingGoalStep = onboardingSteps.find(
      (step) => step.key === "businessTravelReason"
    );
    const travelingGoalSelection = selections["businessTravelReason"];
    const travelingGoal = Array.isArray(travelingGoalSelection)
      ? travelingGoalSelection
          .map((index) => {
            const option = travelingGoalStep?.options?.[index];
            return option ? removeEmojis(option) : undefined;
          })
          .filter((item): item is string => Boolean(item))
      : travelingGoalStep?.options?.[travelingGoalSelection as number]
      ? [
          removeEmojis(
            travelingGoalStep.options[travelingGoalSelection as number]
          ),
        ]
      : [];

    // Extract connection tags from selections
    const connectionTagsStep = onboardingSteps.find(
      (step) => step.key === "businessConnections"
    );
    const connectionTagsSelection = selections["businessConnections"];
    const connectionTags = Array.isArray(connectionTagsSelection)
      ? connectionTagsSelection
          .map((index) => {
            const tag = connectionTagsStep?.tags?.find(
              (t) => t.number === index + 1
            );
            return tag?.text; // tag.text doesn't have emojis - emojis are in tag.icon
          })
          .filter((item): item is string => Boolean(item))
      : [];

    // Extract industry tags from selections
    const industryTagsStep = onboardingSteps.find(
      (step) => step.key === "businessIndustries"
    );
    const industryTagsSelection = selections["businessIndustries"];
    const industryTags = Array.isArray(industryTagsSelection)
      ? industryTagsSelection
          .map((index) => {
            const tag = industryTagsStep?.tags?.find(
              (t) => t.number === index + 1
            );
            return tag?.text; // tag.text doesn't have emojis - emojis are in tag.icon
          })
          .filter((item): item is string => Boolean(item))
      : [];

    // Extract networking style from selections
    const networkingStyleStep = onboardingSteps.find(
      (step) => step.key === "businessNetworkStyle"
    );
    const networkingStyleSelection = selections["businessNetworkStyle"];
    const networkingStyle = Array.isArray(networkingStyleSelection)
      ? networkingStyleSelection
          .map((index) => {
            const option = networkingStyleStep?.options?.[index];
            return option ? removeEmojis(option) : undefined;
          })
          .filter((item): item is string => Boolean(item))
      : networkingStyleStep?.options?.[networkingStyleSelection as number]
      ? [
          removeEmojis(
            networkingStyleStep.options[networkingStyleSelection as number]
          ),
        ]
      : [];

    return {
      type: "business",
      travelingGoal: travelingGoal,
      connectionTags: connectionTags,
      industryTags: industryTags,
      networkingStyle: networkingStyle,
      location: selectedLocation?.fullName || "current location",
      onboardingLikes: swipeLikes,
      onboardingDislikes: swipeDislikes,
      fullName: businessPersonalFormData.fullName,
      areasOfExpertise: businessPersonalFormData.areasOfExpertise,
      role: businessWorkFormData.role,
      company: businessWorkFormData.company,
      industry: businessWorkFormData.industry,
      stage: businessWorkFormData.stage,
      email: travelEmail,
    };
  }, [
    businessPersonalFormData,
    businessWorkFormData,
    travelEmail,
    selectedLocation,
    selections,
    swipeLikes,
    swipeDislikes,
  ]);

  // Function to handle code validation
  const handleCodeValidation = useCallback(async () => {
    if (verificationCode.length !== 6) return;

    // Prevent double submissions
    if (isVerifyingRef.current || isValidating) {
      return;
    }

    isVerifyingRef.current = true;

    const validationInput: ValidateRegistrationCodeInput = {
      email: travelEmail,
      otpCode: verificationCode,
    };

    validateRegistrationCode(validationInput, {
      onSuccess: async (response) => {
        try {
          // Store auth data in secure storage and query cache (like login does)
          if (response?.accessToken && response?.user) {
            const authData = {
              accessToken: response.accessToken,
              tokenType: response.tokenType || "Bearer",
              user: response.user,
            };

            // Store in secure storage
            await Promise.all([
              SecureStore.setItemAsync("authToken", authData.accessToken),
              SecureStore.setItemAsync(
                "authUser",
                JSON.stringify(authData.user)
              ),
            ]);

            // Update query cache
            queryClient.setQueryData(["auth"], authData);
          }
          // Save location preference
          await saveLocationPreference();

          // Move to next step (final slide) instead of navigating to app
          setCurrentStepIndex(currentStepIndex + 1);
        } catch (error) {
          console.error("Error storing auth data:", error);
          // Save location preference even if auth storage fails
          await saveLocationPreference();
          await navigateAfterAuth(); // Continue anyway
        } finally {
          isVerifyingRef.current = false;
        }
      },
      onError: (err: any) => {
        isVerifyingRef.current = false;
        // Always show user-friendly error message regardless of server error
        Alert.alert(
          "Verification Failed",
          "The verification code is incorrect or has expired. Please try again."
        );
      },
    });
  }, [
    verificationCode,
    travelEmail,
    validateRegistrationCode,
    queryClient,
    navigateAfterAuth,
    saveLocationPreference,
  ]);

  const stepData = currentFlow[currentStepIndex];
  const currentSelection = stepData ? selections[stepData.key] : undefined;

  // Auto-save default budget values when entering budget selection step
  useEffect(() => {
    if (stepData?.type === "budget-selection" && !selections[stepData.key]) {
      setSelections((prev) => ({
        ...prev,
        [stepData.key]: budgetRange,
      }));
    }
  }, [stepData?.key, stepData?.type, budgetRange, selections]);

  // Function to handle resending verification code
  const handleResendCode = useCallback(async () => {
    // Use appropriate user input based on user type
    const userInput =
      userType === 0 ? createBusinessUserInput() : createTravelUserInput();

    createUser(userInput, {
      onSuccess: () => {
        Alert.alert(
          "Code Sent",
          "A new verification code has been sent to your email.",
          [{ text: "OK", style: "default" }]
        );
      },
      onError: (err: any) => {

        // Handle specific error cases - check for detail property first
        const errorMessage =
          err?.detail ||
          err?.message ||
          err?.response?.detail ||
          err?.response?.message ||
          "Unknown error";

        // Check for duplicate email error
        if (
          errorMessage.toLowerCase().includes("email") &&
          (errorMessage.toLowerCase().includes("exists") ||
            errorMessage.toLowerCase().includes("taken") ||
            errorMessage.toLowerCase().includes("already"))
        ) {
          Alert.alert("Email Already Registered", errorMessage, [
            {
              text: "Try Different Email",
              style: "default",
            },
            {
              text: "Sign In Instead",
              onPress: () => router.push("/(auth)"),
              style: "default",
            },
          ]);
          return;
        }

        // Handle other API errors with detail
        if (err?.detail) {
          Alert.alert("Error", errorMessage, [
            { text: "OK", style: "default" },
          ]);
          return;
        }

        // Default error message for other error types
        Alert.alert(
          "Error",
          "Failed to resend verification code. Please try again.",
          [{ text: "OK", style: "default" }]
        );
      },
    });
  }, [createUser, createTravelUserInput, createBusinessUserInput, userType, router]);

  // Auto-submit when verification code is complete
  useEffect(() => {
    if (verificationCode.length === 6 && stepData?.type === "code-slide") {
      handleCodeValidation();
    }
  }, [verificationCode, stepData?.type]); // Removed handleCodeValidation from dependencies

  // Transform content data to match SwipeCards interface (limit to 5 items)
  const transformedCardData: CardData[] = content
    ? content.slice(0, 5).map((item, index) => {
        // Hardcoded percentages for onboarding cards
        const hardcodedPercentages = [0.98, 0.98, 0.97, 0.96, 0.98];
        const percentage = hardcodedPercentages[index] || 0.98;

        return {
          id: item.id,
          title: item.title || "Untitled",
          imageUrl:
            item.internalImageUrls &&
            Array.isArray(item.internalImageUrls) &&
            item.internalImageUrls.length > 0
              ? item.internalImageUrls[0]
              : "",
          price:
            typeof item.price === "number" ? item.price.toString() : item.price || "",
          rating: item?.rating?.toString() || "0",
          category: item.category,
          websiteUrl: item.websiteUrl || "",
          address: item.addressShort || item.address || "",
          isSponsored: item.isSponsored,
          contentShareUrl: item.contentShareUrl,
          tags: item.tags,
          similarity: percentage, // Override with hardcoded percentage for onboarding
          distance: item.distance,
          eventDatetimeStart: item.eventDatetimeStart || undefined, // Pass through event datetime for events
          eventDatetimeEnd: item.eventDatetimeEnd || undefined,
        };
      })
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
    // Start with just the initial step
    const initialSteps = userType === null ? [getBusinessFlow()[0]] : [];
    setCurrentFlow(initialSteps);
  }, [userType]);

  useEffect(() => {
    // When user type is selected, switch to the appropriate flow
    if (userType !== null) {
      const flow = userType === 0 ? getBusinessFlow() : getLeisureFlow();
      setCurrentFlow(flow);
    }
  }, [userType]);

  // Show tutorial only when content is loaded and we're on the card swipe slide
  useEffect(() => {
    const isCardSwipeSlide = stepData?.type === "card-swipe";
    if (
      isCardSwipeSlide &&
      !isContentLoading &&
      content &&
      content.length > 0
    ) {
      setShowTutorial(true);
    } else {
      setShowTutorial(false);
    }
  }, [stepData, isContentLoading, content]);

  // Handle Android back button to go to previous slide instead of exiting onboarding
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (currentStepIndex > 0) {
          setCurrentStepIndex(currentStepIndex - 1);
          return true; // Prevent default back action
        }
        return false; // Allow default back action (exit onboarding)
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => subscription.remove();
    }, [currentStepIndex])
  );

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
    if (!item || !item.id) {
      return;
    }

    // Show modal on first swipe up during onboarding
    if (!hasSwipedUpRef.current) {
      hasSwipedUpRef.current = true;
      setShowSwipeUpModal(true);
    }

    // During onboarding, swipe up performs the same action as swipe right
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

  const handleCloseSwipeUpModal = () => {
    setShowSwipeUpModal(false);
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

    // Set user type and let useEffect handle flow switching
    setUserType(index);

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

  const handleLocationSelect = async (location: LocationData | undefined) => {
    if (!stepData) return;

    setSelectedLocation(location);
    setSelections((prev) => ({
      ...prev,
      [stepData.key]: location,
    }));

    // Save location preference immediately when selected
    if (location) {
      try {
        // Always try to get device location first
        const { status } = await Location.getForegroundPermissionsAsync();
        let deviceLat = 0;
        let deviceLng = 0;

        if (status === Location.PermissionStatus.GRANTED) {
          try {
            const currentLocation = await Location.getCurrentPositionAsync();
            deviceLat = currentLocation.coords.latitude;
            deviceLng = currentLocation.coords.longitude;
          } catch {
            // Failed to get location but continue
          }
        }

        if (location.isCurrentLocation) {
          // User selected "Current Location" - save as current location type
          const locationData = createCurrentLocationPreference(
            deviceLat,
            deviceLng,
            "Current Location"
          );
          await setUserLocation(locationData);
        } else {
          // User selected a specific location - save without coordinates
          const locationData = createSelectedLocationPreference(
            location.fullName,
            location.name + ", " + location.country,
            location.id
          );
          await setUserLocation(locationData);
        }
      } catch (error) {
        console.error("Failed to immediately save location preference:", error);
      }

      // Auto-advance to next step when location is selected
      setTimeout(() => {
        setCurrentStepIndex(currentStepIndex + 1);
      }, 300); // Small delay for better UX
    }
  };

  const handleNext = async () => {
    // If we're on travel-email step, call createUser to send OTP before moving to code verification
    if (stepData?.type === "travel-email") {
      try {
        // Use appropriate user input based on user type
        const userInput =
          userType === 0 ? createBusinessUserInput() : createTravelUserInput();

        createUser(userInput, {
          onSuccess: () => {
            // Clear verification code and move to next step (code verification) after OTP is sent
            setVerificationCode("");
            setCurrentStepIndex(currentStepIndex + 1);
          },
          onError: (err: any) => {

            // Handle specific error cases - check for detail property first
            const errorMessage =
              err?.detail ||
              err?.message ||
              err?.response?.detail ||
              err?.response?.message ||
              "Unknown error";

            // Check for duplicate email error
            if (
              errorMessage.toLowerCase().includes("email") &&
              (errorMessage.toLowerCase().includes("exists") ||
                errorMessage.toLowerCase().includes("taken") ||
                errorMessage.toLowerCase().includes("already"))
            ) {
              Alert.alert("Email Already Registered", errorMessage, [
                {
                  text: "Try Different Email",
                  style: "default",
                },
                {
                  text: "Sign In Instead",
                  onPress: () => router.push("/(auth)"),
                  style: "default",
                },
              ]);
              return;
            }

            // Handle other API errors with detail
            if (err?.detail) {
              Alert.alert("Registration Error", errorMessage, [
                { text: "OK", style: "default" },
              ]);
              return;
            }

            // Default error message for other error types
            Alert.alert(
              "Error",
              "Failed to send verification code. Please try again.",
              [{ text: "OK", style: "default" }]
            );
          },
        });
      } catch {
        // Error preparing user data - handle silently
      }
      return;
    }

    // Check if we're on code-slide (validate OTP) - manual button option
    if (stepData?.type === "code-slide") {
      handleCodeValidation();
      return;
    }

    // Check if we're on final-slide - navigate to app
    if (stepData?.type === "final-slide") {
      await navigateAfterAuth();
      return;
    }

    // Check if we're at the final leisure registration step (personal-form)
    if (
      currentStepIndex === currentFlow.length - 1 &&
      stepData?.type === "personal-form"
    ) {
      try {
        const userInput = createTravelUserInput();

        createUser(userInput, {
          onSuccess: async () => {
            try {
              // Save location preference before navigation
              await saveLocationPreference();

              // For leisure users, navigate directly to tabs after creation
              await navigateAfterAuth();
            } catch (error) {
              console.error("Navigation failed after user creation", error);
            }
          },
          onError: (err: any) => {

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
      />
    );
  };

  const renderBusinessPersonalForm = () => {
    if (!stepData) return null;

    const handleBusinessPersonalFormChange = (
      data: BusinessPersonalFormData
    ) => {
      setBusinessPersonalFormData(data);

      const isFormValid = data.fullName.trim() !== "";

      if (stepData) {
        setSelections((prev) => ({
          ...prev,
          [stepData.key]: isFormValid ? 1 : 0,
        }));
      }
    };

    return (
      <OnboardingBusinessPersonalFormSlide
        title={stepData.title}
        subtitle={stepData.subtitle}
        onFormChange={handleBusinessPersonalFormChange}
        initialData={businessPersonalFormData}
      />
    );
  };

  const renderBusinessWorkForm = () => {
    if (!stepData) return null;

    const handleBusinessWorkFormChange = (data: BusinessWorkFormData) => {
      setBusinessWorkFormData(data);

      const isFormValid =
        data.role.trim() !== "" &&
        data.company.trim() !== "" &&
        data.industry.length > 0 &&
        data.stage.trim() !== "";

      if (stepData) {
        setSelections((prev) => ({
          ...prev,
          [stepData.key]: isFormValid ? 1 : 0,
        }));
      }
    };

    return (
      <OnboardingBusinessWorkFormSlide
        title={stepData.title}
        subtitle={stepData.subtitle}
        onFormChange={handleBusinessWorkFormChange}
        initialData={businessWorkFormData}
      />
    );
  };

  const renderCardSwipe = () => {
    if (!stepData) return null;
    return (
      <OnboardingCardSwipeSlide
        stepData={stepData}
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

  const renderBusinessTagSelection = () => {
    if (!stepData) return null;
    return (
      <OnboardingBusinessTagSlide
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

  const renderTravelEmailSlide = () => {
    if (!stepData) return null;

    // Extract first name from travelName
    const firstName = travelName ? travelName.split(" ")[0] : undefined;

    return (
      <OnboardingTravelEmailSlide
        stepData={stepData}
        email={travelEmail}
        onEmailChange={setTravelEmail}
        firstName={firstName}
      />
    );
  };

  const renderTravelNameSlide = () => {
    if (!stepData) return null;
    return (
      <OnboardingTravelNameSlide
        stepData={stepData}
        name={travelName}
        onNameChange={setTravelName}
      />
    );
  };

  const renderCodeSlide = () => {
    if (!stepData) return null;
    return (
      <OnboardingCodeSlide
        stepData={stepData}
        code={verificationCode}
        onCodeChange={setVerificationCode}
        email={travelEmail}
        onResendCode={handleResendCode}
      />
    );
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
      case "business-personal-form":
        return renderBusinessPersonalForm();
      case "business-work-form":
        return renderBusinessWorkForm();
      case "card-swipe":
        return renderCardSwipe();
      case "tag-selection":
        return renderTagSelection();
      case "business-tag-selection":
        return renderBusinessTagSelection();
      case "final-slide":
        return renderFinalSlide();
      case "travel-email":
        return renderTravelEmailSlide();
      case "travel-name":
        return renderTravelNameSlide();
      case "code-slide":
        return renderCodeSlide();
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

    // For travel email step, require valid email
    if (stepData?.type === "travel-email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !travelEmail || !emailRegex.test(travelEmail);
    }

    // For travel name step, require name
    if (stepData?.type === "travel-name") {
      return !travelName.trim();
    }

    // For business personal form step, require full name
    if (stepData?.type === "business-personal-form") {
      return !businessPersonalFormData.fullName.trim();
    }

    // For business work form step, require all fields
    if (stepData?.type === "business-work-form") {
      return (
        !businessWorkFormData.role.trim() ||
        !businessWorkFormData.company.trim() ||
        !businessWorkFormData.industry.length ||
        !businessWorkFormData.stage.trim()
      );
    }

    // For code verification step, require 6-digit code
    if (stepData?.type === "code-slide") {
      return verificationCode.length !== 6;
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
        stepData?.type === "business-tag-selection" ||
        stepData?.type === "location-selection") && (
        <CustomView style={commonOnboardingStyles.progressContainer}>
          <OnboardingProgressBar
            steps={
              currentFlow.filter(
                (step) =>
                  step.type === "option-list" ||
                  step.type === "budget-selection" ||
                  step.type === "tag-selection" ||
                  step.type === "business-tag-selection" ||
                  step.type === "location-selection"
              ).length
            }
            currentStep={
              currentFlow
                .slice(0, currentStepIndex + 1)
                .filter(
                  (step) =>
                    step.type === "option-list" ||
                    step.type === "budget-selection" ||
                    step.type === "tag-selection" ||
                    step.type === "business-tag-selection" ||
                    step.type === "location-selection"
                ).length - 1
            }
          />
        </CustomView>
      )}

      {renderStepContent()}

      <LinearGradient
        colors={stepData?.type === "card-swipe"
          ? ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0)"]
          : ["#FFFFFF", "rgba(255, 255, 255, 0)"]}
        locations={[0, 1]}
        style={[
          commonOnboardingStyles.footer,
          stepData?.type === "card-swipe"
            ? { paddingBottom: verticalScale(24) }
            : { paddingBottom: verticalScale(12) },
        ]}
      >
        {stepData &&
          stepData.type !== "logo-selection" &&
          stepData.type !== "card-swipe" && (
            <NextButton
              onPress={handleNext}
              customStyles={
                isNextButtonDisabled() || isPending || isValidating
                  ? commonOnboardingStyles.nextButtonDisabled
                  : {}
              }
              bgColor={colors.lime}
              title={
                isPending
                  ? stepData?.type === "travel-email"
                    ? "Sending code..."
                    : "Finalizing..."
                  : isValidating
                  ? "Verifying..."
                  : stepData?.type === "final-slide"
                  ? "Let's Go!"
                  : stepData?.type === "code-slide"
                  ? "Start exploring!"
                  : currentStepIndex === currentFlow.length - 1
                  ? "Create Account"
                  : "Continue"
              }
              disabled={isNextButtonDisabled() || isPending || isValidating}
            />
          )}
      </LinearGradient>

      {/* Modal for first swipe right */}
      <OnboardingSwipeUpModal
        visible={showSwipeUpModal}
        onClose={handleCloseSwipeUpModal}
      />
    </SafeAreaView>
  );
};

export default OnboardingScreen;
