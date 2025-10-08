import React, { useState, useCallback } from "react";
import { StyleSheet } from "react-native";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import { verticalScale } from "@/utilities/scaling";
import SwipeCards, { CardData } from "../SwipeCards/SwipeCards";
import SwipeCardTooltips from "../Tooltips/SwipeCardTooltips";
import AnimatedLoader from "../Loader/AnimatedLoader";
import { commonOnboardingStyles } from "./OnboardingStyles";
import { OnboardingStep } from "@/constants/onboardingSlides";
import { useAnalyticsContext } from "@/contexts/AnalyticsContext";
import { ErrorScreen } from "@/components/ErrorScreen";

interface OnboardingCardSwipeSlideProps {
  stepData: OnboardingStep;
  isLoading: boolean;
  error: any;
  cardData: CardData[];
  showTutorial: boolean;
  onCardTap: (item: CardData) => void;
  onSwipeLeft: (item: CardData) => void;
  onSwipeRight: (item: CardData) => void;
  onSwipeUp: (item: CardData) => void;
  onComplete: () => void;
  onTutorialComplete: () => void;
  onRetry: () => void;
}

export const OnboardingCardSwipeSlide: React.FC<
  OnboardingCardSwipeSlideProps
> = ({
  stepData,
  isLoading,
  error,
  cardData,
  showTutorial,
  onCardTap,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onComplete,
  onTutorialComplete,
  onRetry,
}) => {
  const { colors } = useTheme();
  const { trackSuggestion } = useAnalyticsContext();

  // Track when to refresh the card stack (same as tabs index)
  const [swipeKey, setSwipeKey] = useState<number>(0);

  // Enhanced analytics tracking for onboarding swipes
  const handleSwipeLeft = (item: CardData) => {
    trackSuggestion("swipe_left", {
      suggestion_id: item.id,
      suggestion_type:
        (item.category as "venue" | "experience" | "event") || "venue",
      category: item.category || "unknown",
      similarity_score: typeof item.similarity === 'string' ? parseFloat(item.similarity) || 0 : item.similarity,
      onboarding_step: stepData.title,
      is_onboarding: true,
    });
    onSwipeLeft(item);
  };

  const handleSwipeRight = (item: CardData) => {
    trackSuggestion("swipe_right", {
      suggestion_id: item.id,
      suggestion_type:
        (item.category as "venue" | "experience" | "event") || "venue",
      category: item.category || "unknown",
      similarity_score: typeof item.similarity === 'string' ? parseFloat(item.similarity) || 0 : item.similarity,
      onboarding_step: stepData.title,
      is_onboarding: true,
    });
    onSwipeRight(item);
  };

  const handleSwipeUp = (item: CardData) => {
    trackSuggestion("save_suggestion", {
      suggestion_id: item.id,
      suggestion_type:
        (item.category as "venue" | "experience" | "event") || "venue",
      category: item.category || "unknown",
      similarity_score: typeof item.similarity === 'string' ? parseFloat(item.similarity) || 0 : item.similarity,
      onboarding_step: stepData.title,
      is_onboarding: true,
    });
    onSwipeUp(item);
  };

  const handleCardTap = (item: CardData) => {
    onCardTap(item);
  };

  const handleRetry = () => {
    onRetry();
  };

  // Handle completion of card stack - for onboarding, just complete without refresh
  const handleComplete = useCallback(() => {
    // Don't refresh cards in onboarding, just complete the step
    onComplete();
  }, [onComplete]);

  // Show loading state while content is being fetched
  if (isLoading) {
    return (
      <CustomView style={commonOnboardingStyles.content}>
        <CustomView style={styles.swipeContainer}>
          <AnimatedLoader />
        </CustomView>
      </CustomView>
    );
  }

  // Show error state if content failed to load - use same design as main tab
  if (error) {
    return (
      <CustomView style={commonOnboardingStyles.content}>
        <CustomView style={styles.swipeContainer}>
          <ErrorScreen
            title="Failed to load content"
            message="No internet connection available"
            onRetry={handleRetry}
          />
        </CustomView>
      </CustomView>
    );
  }

  // Show empty state if no content available - use same design as main tab
  if (!cardData.length) {
    return (
      <CustomView style={commonOnboardingStyles.content}>
        <CustomView style={styles.swipeContainer}>
          <ErrorScreen
            title="No content available"
            message="No internet connection available"
            onRetry={handleRetry}
          />
        </CustomView>
      </CustomView>
    );
  }

  return (
    <CustomView
      bgColor={colors.overlay}
      style={[
        commonOnboardingStyles.content,
        { paddingTop: 0, paddingBottom: 0 },
      ]}
    >
      <CustomText
        fontFamily="Inter-SemiBold"
        style={[commonOnboardingStyles.title, { color: colors.label_dark }]}
      >
        {stepData.title}
      </CustomText>
      <CustomText
        style={[
          commonOnboardingStyles.subtitle,
          { color: colors.gray_regular },
        ]}
      >
        {stepData.subtitle}
      </CustomText>

      <CustomView bgColor={colors.overlay} style={styles.swipeContainer}>
        <SwipeCards
          key={swipeKey}
          data={cardData}
          onCardTap={handleCardTap}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          onSwipeUp={handleSwipeUp}
          onComplete={handleComplete}
          isLoading={isLoading}
          hideButtons={true}
          showLoaderOnComplete={false}
          fullWidth={true}
        />

        {showTutorial && !isLoading && !error && cardData.length > 0 && (
          <SwipeCardTooltips onComplete={onTutorialComplete} />
        )}
      </CustomView>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  swipeContainer: {
    flex: 1,
    width: "100%",
    marginTop: verticalScale(12),
  },
});
