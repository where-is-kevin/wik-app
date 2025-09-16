// components/SwipeCards.tsx
import React, { useRef, useState, useCallback, useMemo, useEffect } from "react";
import {
  StyleSheet,
  View,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import AnimatedLoader from "../Loader/AnimatedLoader";
import { SwipeFeedback } from "./SwipeFeedback";
import { SwipeCard } from "./SwipeCard";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_UP_THRESHOLD = 0.25 * SCREEN_HEIGHT;
const MAX_HORIZONTAL_MOVEMENT = SCREEN_WIDTH * 0.4; // Constrain horizontal movement
const MAX_VERTICAL_MOVEMENT = SCREEN_HEIGHT * 0.3; // Constrain vertical movement
const SWIPE_OUT_DURATION = 250;
const TAP_DURATION_THRESHOLD = 200;
const MAX_RENDERED_CARDS = 3;

export interface CardData {
  id: string;
  title: string;
  imageUrl: string;
  price?: string;
  rating?: string;
  category?: string;
  websiteUrl?: string;
  address?: string;
  isSponsored?: boolean;
  contentShareUrl: string;
  tags?: string;
  similarity: number;
  distance?: number;
  eventDatetime?: string; // For event type items
}

export type FilterType = "events" | "venues" | "experiences";

interface SwipeCardsProps {
  data: CardData[];
  onSwipeLeft: (item: CardData) => void;
  onSwipeRight: (item: CardData) => void;
  onSwipeUp: (item: CardData) => void;
  onComplete: () => void;
  onCardTap?: (item: CardData) => void;
  onBucketPress?: (value: string) => void;
  hideButtons?: boolean;
  shouldAdvanceOnSwipeUp?: boolean; // New prop to control if swipe up advances card
}

export const SwipeCards: React.FC<SwipeCardsProps> = ({
  data,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onComplete,
  onCardTap,
  onBucketPress,
  hideButtons = false,
  shouldAdvanceOnSwipeUp = true, // Default to true for backward compatibility
}) => {
  const { colors } = useTheme();
  const router = useRouter();
  const [cardIndex, setCardIndex] = useState(0);

  // Animation values
  const position = useRef(new Animated.ValueXY()).current;
  const feedbackOpacity = useRef(new Animated.Value(0)).current;
  const feedbackScale = useRef(new Animated.Value(0.8)).current;

  // Track animation state to prevent position jumping
  const isAnimating = useRef(false);

  // Reset position when card index changes
  useEffect(() => {
    if (!isAnimating.current) {
      position.setValue({ x: 0, y: 0 });
    }
  }, [cardIndex, position]);

  const [currentSwipeDirection, setCurrentSwipeDirection] = useState<
    "left" | "right" | "up" | null
  >(null);

  // Touch tracking
  const touchStartTime = useRef<number>(0);
  const touchStartPosition = useRef({ x: 0, y: 0 });
  const currentGestureCard = useRef<CardData | null>(null);

  // Memoized values
  const visibleCards = useMemo(() => {
    if (!data || data.length === 0) return [];
    const endIndex = Math.min(cardIndex + MAX_RENDERED_CARDS, data.length);
    return data.slice(cardIndex, endIndex);
  }, [data, cardIndex]);

  const animatedValues = useMemo(
    () => ({
      rotate: position.x.interpolate({
        inputRange: [-MAX_HORIZONTAL_MOVEMENT, 0, MAX_HORIZONTAL_MOVEMENT],
        outputRange: ["-15deg", "0deg", "15deg"],
        extrapolate: "clamp",
      }),
      scaleUp: position.y.interpolate({
        inputRange: [-MAX_VERTICAL_MOVEMENT, 0],
        outputRange: [0.85, 1],
        extrapolate: "clamp",
      }),
      opacity: position.x.interpolate({
        inputRange: [-MAX_HORIZONTAL_MOVEMENT, 0, MAX_HORIZONTAL_MOVEMENT],
        outputRange: [0.8, 1, 0.8],
        extrapolate: "clamp",
      }),
    }),
    [position.x, position.y]
  );

  // Callbacks
  const handleImageLoad = useCallback((_itemId: string) => {
    // Image load tracking removed to prevent excessive re-renders
  }, []);

  const handleImageError = useCallback((_itemId: string) => {
    // Image error tracking removed to prevent excessive re-renders
  }, []);

  const updateFeedbackOpacity = useCallback(
    (gesture: { dx: number; dy: number }) => {
      const absDx = Math.abs(gesture.dx);
      const absDy = Math.abs(gesture.dy);

      let maxOpacity = 0;
      let direction: "left" | "right" | "up" | null = null;

      if (gesture.dx > 0 && gesture.dx > absDy) {
        maxOpacity = Math.min(gesture.dx / 150, 1);
        direction = "right";
      } else if (gesture.dx < 0 && absDx > absDy) {
        maxOpacity = Math.min(absDx / 150, 1);
        direction = "left";
      } else if (gesture.dy < 0 && absDy > absDx) {
        maxOpacity = Math.min(absDy / 150, 1);
        direction = "up";
      }

      if (currentSwipeDirection !== direction) {
        setCurrentSwipeDirection(direction);
      }

      feedbackOpacity.setValue(maxOpacity);
      feedbackScale.setValue(maxOpacity > 0 ? 1 : 0.8);
    },
    [feedbackOpacity, feedbackScale, currentSwipeDirection]
  );

  const hideAllFeedback = useCallback(() => {
    feedbackOpacity.setValue(0);
    feedbackScale.setValue(0.8);
    setCurrentSwipeDirection(null);
  }, [feedbackOpacity, feedbackScale]);

  const handleCardTap = useCallback(
    (item: CardData) => {
      if (onCardTap) {
        onCardTap(item);
      } else {
        router.push(`/event-details/${item.id}`);
      }
    },
    [onCardTap, router]
  );

  const onSwipeComplete = useCallback(
    (direction: "left" | "right" | "up") => {
      hideAllFeedback();

      if (!data || data.length === 0) return;

      let item: CardData | null = null;

      if (currentGestureCard.current) {
        item = currentGestureCard.current;
      } else if (cardIndex < data.length) {
        item = data[cardIndex];
      }

      if (!item) return;

      // Analytics are now handled in parent components (main tabs, onboarding)

      try {
        if (direction === "right") {
          onSwipeRight(item);
        } else if (direction === "left") {
          onSwipeLeft(item);
        } else if (direction === "up") {
          onSwipeUp(item);
        }
      } catch (error) {
        console.error("Swipe callback error:", error);
      }

      currentGestureCard.current = null;

      // Check if we should advance the card based on direction and configuration
      const shouldAdvanceCard = direction !== "up" || shouldAdvanceOnSwipeUp;
      
      if (shouldAdvanceCard) {
        // Advance to the next card
        setCardIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;

          if (nextIndex >= data.length) {
            setTimeout(() => {
              position.setValue({ x: 0, y: 0 });
              hideAllFeedback();
              onComplete();
            }, 300);
          } else {
            // Don't reset position - let the new card render with a clean transform
            hideAllFeedback();
          }

          return nextIndex;
        });
      } else {
        // Don't advance card, just reset position and show feedback
        position.setValue({ x: 0, y: 0 });
        hideAllFeedback();
      }
    },
    [
      data,
      cardIndex,
      onSwipeRight,
      onSwipeLeft,
      onSwipeUp,
      onComplete,
      position,
      hideAllFeedback,
      shouldAdvanceOnSwipeUp,
    ]
  );

  const forceSwipe = useCallback(
    (direction: "left" | "right" | "up") => {
      const x =
        direction === "right"
          ? SCREEN_WIDTH
          : direction === "left"
          ? -SCREEN_WIDTH
          : 0;
      const y = direction === "up" ? -SCREEN_HEIGHT : 0;

      isAnimating.current = true;
      Animated.timing(position, {
        toValue: { x, y },
        duration: SWIPE_OUT_DURATION,
        useNativeDriver: true,
      }).start(() => {
        isAnimating.current = false;
        onSwipeComplete(direction);
      });
    },
    [position, onSwipeComplete, cardIndex]
  );

  const resetPosition = useCallback(() => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
    hideAllFeedback();
    currentGestureCard.current = null;
  }, [position, hideAllFeedback]);

  const createPanResponder = useCallback(
    (item: CardData, isCurrentCard: boolean) => {
      return PanResponder.create({
        onStartShouldSetPanResponder: () => isCurrentCard && data.length > 0,
        onPanResponderGrant: (evt) => {
          currentGestureCard.current = item;
          touchStartTime.current = Date.now();
          touchStartPosition.current = {
            x: evt.nativeEvent.locationX,
            y: evt.nativeEvent.locationY,
          };
        },
        onPanResponderMove: (_, gesture) => {
          if (isCurrentCard) {
            // Constrain movement with resistance
            const constrainedX = Math.max(
              -MAX_HORIZONTAL_MOVEMENT,
              Math.min(MAX_HORIZONTAL_MOVEMENT, gesture.dx)
            );

            const constrainedY = Math.max(
              -MAX_VERTICAL_MOVEMENT,
              Math.min(0, gesture.dy) // Only allow upward movement
            );

            // Apply resistance when nearing the edges
            const resistanceFactorX =
              Math.abs(constrainedX) / MAX_HORIZONTAL_MOVEMENT;
            const resistanceFactorY =
              Math.abs(constrainedY) / MAX_VERTICAL_MOVEMENT;

            const finalX = constrainedX * (1 - resistanceFactorX * 0.3);
            const finalY = constrainedY * (1 - resistanceFactorY * 0.2);

            position.setValue({ x: finalX, y: finalY });
            updateFeedbackOpacity({ dx: finalX, dy: finalY });
          }
        },
        onPanResponderRelease: (_, gesture) => {
          const touchDuration = Date.now() - touchStartTime.current;
          const distanceMoved = Math.sqrt(
            Math.pow(gesture.dx, 2) + Math.pow(gesture.dy, 2)
          );

          if (!data || data.length === 0) {
            resetPosition();
            return;
          }

          const gestureCard = currentGestureCard.current;
          if (!gestureCard) {
            resetPosition();
            return;
          }

          if (touchDuration < TAP_DURATION_THRESHOLD && distanceMoved < 10) {
            handleCardTap(gestureCard);
            resetPosition();
            hideAllFeedback();
            return;
          }

          if (isCurrentCard) {
            if (gesture.dx > SWIPE_THRESHOLD) {
              forceSwipe("right");
            } else if (gesture.dx < -SWIPE_THRESHOLD) {
              forceSwipe("left");
            } else if (gesture.dy < -SWIPE_UP_THRESHOLD) {
              forceSwipe("up");
            } else {
              resetPosition();
              hideAllFeedback();
            }
          } else {
            resetPosition();
            hideAllFeedback();
          }
        },
      });
    },
    [
      data,
      position,
      handleCardTap,
      updateFeedbackOpacity,
      hideAllFeedback,
      resetPosition,
      forceSwipe,
    ]
  );

  const renderCards = useCallback(() => {
    // Early return if no data
    if (!data || data.length === 0) {
      return (
        <View style={styles.emptyCardsContainer}>
          <AnimatedLoader />
        </View>
      );
    }
    if (cardIndex >= data.length) {
      return (
        <Animated.View
          style={[styles.emptyCardsContainer, styles.transitionContainer]}
        >
          <AnimatedLoader />
        </Animated.View>
      );
    }

    return visibleCards
      .map((item, relativeIndex) => {
        const absoluteIndex = cardIndex + relativeIndex;
        const isCurrentCard = absoluteIndex === cardIndex;
        const isNextCard = absoluteIndex === cardIndex + 1;

        if (isCurrentCard) {
          const panResponder = createPanResponder(item, true);

          return (
            <SwipeCard
              key={item.id}
              item={item}
              isCurrentCard={true}
              isNextCard={false}
              panHandlers={panResponder.panHandlers}
              animatedStyle={{
                transform: [
                  { translateX: position.x },
                  { translateY: position.y },
                  { rotate: animatedValues.rotate },
                  { scale: animatedValues.scaleUp },
                ],
                opacity: animatedValues.opacity,
                zIndex: 999,
              }}
              colors={colors}
              onBucketPress={onBucketPress}
              hideButtons={hideButtons}
              onImageLoad={handleImageLoad}
              onImageError={handleImageError}
            />
          );
        }

        if (isNextCard) {
          return (
            <SwipeCard
              key={item.id}
              item={item}
              isCurrentCard={false}
              isNextCard={true}
              colors={colors}
              onBucketPress={onBucketPress}
              hideButtons={hideButtons}
              onImageLoad={handleImageLoad}
              onImageError={handleImageError}
              animatedStyle={{
                zIndex: 1,
                // Ensure next card is always at center position
                transform: [
                  { translateX: 0 },
                  { translateY: 0 },
                  { rotate: '0deg' },
                  { scale: 1 }
                ],
              }}
            />
          );
        }

        return null;
      })
      .reverse();
  }, [
    data,
    cardIndex,
    visibleCards,
    animatedValues,
    position,
    colors,
    onBucketPress,
    hideButtons,
    handleImageLoad,
    handleImageError,
    createPanResponder,
  ]);

  return (
    <View style={styles.container}>
      <SwipeFeedback
        direction={currentSwipeDirection}
        opacity={feedbackOpacity}
        scale={feedbackScale}
      />
      {renderCards()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCardsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  transitionContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 1,
    backgroundColor: "transparent",
  },
});
