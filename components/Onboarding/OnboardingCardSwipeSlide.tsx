import React from "react";
import { StyleSheet } from "react-native";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import CustomTouchable from "../CustomTouchableOpacity";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import { SwipeCards, CardData } from "../SwipeCards/SwipeCards";
import SwipeCardTooltips from "../Tooltips/SwipeCardTooltips";
import AnimatedLoader from "../Loader/AnimatedLoader";
import { commonOnboardingStyles } from "./OnboardingStyles";
import { OnboardingStep } from "@/constants/onboardingSlides";
import { useAnalyticsContext } from "@/contexts/AnalyticsContext";

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
  const { trackSwipe, trackButtonClick, trackContentInteraction } = useAnalyticsContext();

  // Enhanced analytics tracking for onboarding swipes
  const handleSwipeLeft = (item: CardData) => {
    trackSwipe('left', 'onboarding_card_swipe', {
      item_id: item.id,
      item_title: item.title,
      item_category: item.category || 'unknown',
      onboarding_step: stepData.title,
      swipe_type: 'dislike'
    });
    trackContentInteraction('onboarding_card', item.id, 'swipe_left', {
      step: stepData.title
    });
    onSwipeLeft(item);
  };

  const handleSwipeRight = (item: CardData) => {
    trackSwipe('right', 'onboarding_card_swipe', {
      item_id: item.id,
      item_title: item.title,
      item_category: item.category || 'unknown',
      onboarding_step: stepData.title,
      swipe_type: 'like'
    });
    trackContentInteraction('onboarding_card', item.id, 'swipe_right', {
      step: stepData.title
    });
    onSwipeRight(item);
  };

  const handleSwipeUp = (item: CardData) => {
    trackSwipe('up', 'onboarding_card_swipe', {
      item_id: item.id,
      item_title: item.title,
      item_category: item.category || 'unknown',
      onboarding_step: stepData.title,
      swipe_type: 'save'
    });
    trackContentInteraction('onboarding_card', item.id, 'swipe_up', {
      step: stepData.title
    });
    onSwipeUp(item);
  };

  const handleCardTap = (item: CardData) => {
    trackButtonClick('onboarding_card_tap', {
      item_id: item.id,
      item_title: item.title,
      item_category: item.category || 'unknown',
      onboarding_step: stepData.title
    });
    trackContentInteraction('onboarding_card', item.id, 'tap', {
      step: stepData.title
    });
    onCardTap(item);
  };

  const handleRetry = () => {
    trackButtonClick('onboarding_retry_button', {
      onboarding_step: stepData.title,
      error_context: error ? 'content_load_error' : 'empty_state'
    });
    onRetry();
  };

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

  // Show error state if content failed to load
  if (error) {
    return (
      <CustomView style={commonOnboardingStyles.content}>
        <CustomView style={styles.swipeContainer}>
          <CustomText
            style={[styles.errorText, { color: colors.gray_regular }]}
          >
            Failed to load content. Please try again.
          </CustomText>
          <CustomTouchable
            style={styles.retryButton}
            onPress={handleRetry}
            bgColor={colors.lime}
          >
            <CustomText style={styles.retryButtonText}>Retry</CustomText>
          </CustomTouchable>
        </CustomView>
      </CustomView>
    );
  }

  // Show empty state if no content available
  if (!cardData.length) {
    return (
      <CustomView style={commonOnboardingStyles.content}>
        <CustomView style={styles.swipeContainer}>
          <CustomText
            style={[styles.emptyText, { color: colors.gray_regular }]}
          >
            No content available at the moment.
          </CustomText>
          <CustomTouchable
            style={styles.retryButton}
            onPress={handleRetry}
            bgColor={colors.lime}
          >
            <CustomText style={styles.retryButtonText}>Refresh</CustomText>
          </CustomTouchable>
        </CustomView>
      </CustomView>
    );
  }

  return (
    <CustomView
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

      <CustomView style={styles.swipeContainer}>
        <SwipeCards
          data={cardData}
          onCardTap={handleCardTap}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          onSwipeUp={handleSwipeUp}
          onComplete={onComplete}
          hideButtons={true}
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
    alignItems: "center",
    justifyContent: "center",
    marginTop: verticalScale(12),
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
});
