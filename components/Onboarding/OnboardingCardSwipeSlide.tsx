import React from "react";
import { StyleSheet } from "react-native";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import CustomTouchable from "../CustomTouchableOpacity";
import { useTheme } from "@/contexts/ThemeContext";
import { horizontalScale, scaleFontSize, verticalScale } from "@/utilities/scaling";
import { SwipeCards, CardData } from "../SwipeCards/SwipeCards";
import SwipeCardTooltips from "../Tooltips/SwipeCardTooltips";
import AnimatedLoader from "../Loader/AnimatedLoader";
import { commonOnboardingStyles } from "./OnboardingStyles";

interface OnboardingCardSwipeSlideProps {
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

export const OnboardingCardSwipeSlide: React.FC<OnboardingCardSwipeSlideProps> = ({
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
            onPress={onRetry}
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
            onPress={onRetry}
            bgColor={colors.lime}
          >
            <CustomText style={styles.retryButtonText}>Refresh</CustomText>
          </CustomTouchable>
        </CustomView>
      </CustomView>
    );
  }

  return (
    <CustomView style={commonOnboardingStyles.content}>
      <CustomView style={styles.swipeContainer}>
        <SwipeCards
          data={cardData}
          onCardTap={onCardTap}
          onSwipeLeft={onSwipeLeft}
          onSwipeRight={onSwipeRight}
          onSwipeUp={onSwipeUp}
          onComplete={onComplete}
          hideBucketsButton={true}
        />

        {showTutorial && !isLoading && (
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
});