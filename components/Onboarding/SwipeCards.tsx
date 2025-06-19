import React, { useRef, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Animated,
  PanResponder,
  Dimensions,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import CustomText from "@/components/CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import CustomTouchable from "../CustomTouchableOpacity";
import AnimatedLoader from "../Loader/AnimatedLoader";
import CustomView from "../CustomView";
import BucketSvg from "../SvgComponents/BucketSvg";
import ShareButton from "../Button/ShareButton";
import CategoryTag from "../Tag/CategoryTag";
import { OptimizedImageBackground } from "../OptimizedImage/OptimizedImage";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_UP_THRESHOLD = 0.25 * SCREEN_HEIGHT;
const SWIPE_OUT_DURATION = 250;
const TAP_DURATION_THRESHOLD = 200;

interface CardData {
  id: string;
  title: string;
  imageUrl: string;
  price?: string;
  rating?: string;
  category?: string;
  address?: string;
}

interface SwipeCardsProps {
  data: CardData[];
  onSwipeLeft: (item: CardData) => void;
  onSwipeRight: (item: CardData) => void;
  onSwipeUp: (item: CardData) => void;
  onComplete: () => void;
  onCardTap?: (item: CardData) => void;
  onBucketPress?: (value: string) => void;
  hideBucketsButton?: boolean;
}

export const SwipeCards: React.FC<SwipeCardsProps> = ({
  data,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onComplete,
  onCardTap,
  onBucketPress,
  hideBucketsButton = false,
}) => {
  const { colors } = useTheme();
  const router = useRouter();
  const [cardIndex, setCardIndex] = React.useState(0);
  const [imageLoaded, setImageLoaded] = useState<{ [key: string]: boolean }>(
    {}
  );
  const position = useRef(new Animated.ValueXY()).current;

  // Animation values for feedback
  const feedbackOpacity = useRef(new Animated.Value(0)).current;
  const feedbackScale = useRef(new Animated.Value(0.8)).current;

  // Track current swipe direction for showing appropriate feedback image
  const [currentSwipeDirection, setCurrentSwipeDirection] = useState<
    "left" | "right" | "up" | null
  >(null);

  // Track touch start time and position to distinguish between tap and swipe
  const touchStartTime = useRef<number>(0);
  const touchStartPosition = useRef({ x: 0, y: 0 });

  // Store the current card being interacted with at the start of gesture
  const currentGestureCard = useRef<CardData | null>(null);

  // Local placeholder image
  const PLACEHOLDER_IMAGE = require("@/assets/images/placeholder-bucket.png");

  // Feedback images
  const APPROVE_IMAGE = require("@/assets/images/approve.png");
  const CANCEL_IMAGE = require("@/assets/images/cancel.png");
  const STASH_IMAGE = require("@/assets/images/stash.png");

  // Helper function to validate image URLs
  const getValidImageUrl = useCallback((imageUrl: string): string | null => {
    if (typeof imageUrl === "string" && imageUrl.trim() !== "") {
      return imageUrl;
    }
    return null;
  }, []);

  // Helper function to update feedback opacity based on gesture distance
  const updateFeedbackOpacity = useCallback(
    (gesture: { dx: number; dy: number }) => {
      const absDx = Math.abs(gesture.dx);
      const absDy = Math.abs(gesture.dy);

      // Calculate the strongest direction and its opacity
      let maxOpacity = 0;
      let direction: "left" | "right" | "up" | null = null;

      if (gesture.dx > 0 && gesture.dx > absDy) {
        // Right swipe
        maxOpacity = Math.min(gesture.dx / 150, 1);
        direction = "right";
      } else if (gesture.dx < 0 && absDx > absDy) {
        // Left swipe
        maxOpacity = Math.min(absDx / 150, 1);
        direction = "left";
      } else if (gesture.dy < 0 && absDy > absDx) {
        // Up swipe
        maxOpacity = Math.min(absDy / 150, 1);
        direction = "up";
      }

      setCurrentSwipeDirection(direction);
      feedbackOpacity.setValue(maxOpacity);
      feedbackScale.setValue(maxOpacity > 0 ? 1 : 0.8);
    },
    [feedbackOpacity, feedbackScale]
  );

  // Helper function to immediately hide all feedback
  const hideAllFeedback = useCallback(() => {
    feedbackOpacity.setValue(0);
    feedbackScale.setValue(0.8);
    setCurrentSwipeDirection(null);
  }, [feedbackOpacity, feedbackScale]);

  // Early return if no data
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyCardsContainer}>
        <AnimatedLoader />
      </View>
    );
  }

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ["-10deg", "0deg", "10deg"],
    extrapolate: "clamp",
  });

  const scaleUp = position.y.interpolate({
    inputRange: [-SCREEN_HEIGHT / 4, 0],
    outputRange: [0.8, 1],
    extrapolate: "clamp",
  });

  const nextCardOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0.5, 1],
    extrapolate: "clamp",
  });

  const nextCardScale = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0.9, 1],
    extrapolate: "clamp",
  });

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

  const handleImageLoad = useCallback((itemId: string) => {
    setImageLoaded((prev) => ({ ...prev, [itemId]: true }));
  }, []);

  const handleImageError = useCallback((itemId: string) => {
    setImageLoaded((prev) => ({ ...prev, [itemId]: true }));
  }, []);

  const forceSwipe = useCallback(
    (direction: "left" | "right" | "up") => {
      const x =
        direction === "right"
          ? SCREEN_WIDTH
          : direction === "left"
          ? -SCREEN_WIDTH
          : 0;
      const y = direction === "up" ? -SCREEN_HEIGHT : 0;

      Animated.timing(position, {
        toValue: { x, y },
        duration: SWIPE_OUT_DURATION,
        useNativeDriver: false,
      }).start(() => onSwipeComplete(direction));
    },
    [position]
  );

  const resetPosition = useCallback(() => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 4,
      useNativeDriver: false,
    }).start();
    hideAllFeedback();
    currentGestureCard.current = null;
  }, [position, hideAllFeedback]);

  const onSwipeComplete = useCallback(
    (direction: "left" | "right" | "up") => {
      hideAllFeedback();

      if (!data || data.length === 0) {
        return;
      }

      // Use the gesture card if available, fallback to cardIndex
      let item: CardData | null = null;

      if (currentGestureCard.current) {
        item = currentGestureCard.current;
      } else if (cardIndex < data.length) {
        item = data[cardIndex];
      }

      if (!item) {
        return;
      }

      try {
        if (direction === "right") {
          onSwipeRight(item);
        } else if (direction === "left") {
          onSwipeLeft(item);
        } else if (direction === "up") {
          onSwipeUp(item);
        }
      } catch (error) {
        // Handle error silently
      }

      // Clear the gesture card after processing
      currentGestureCard.current = null;

      if (direction === "up") {
        setTimeout(() => {
          position.setValue({ x: 0, y: 0 });
          hideAllFeedback();
        }, 100);
      } else {
        setCardIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;

          if (nextIndex >= data.length) {
            setTimeout(() => {
              position.setValue({ x: 0, y: 0 });
              hideAllFeedback();
              onComplete();
            }, 300);
          } else {
            setTimeout(() => {
              position.setValue({ x: 0, y: 0 });
              hideAllFeedback();
            }, 100);
          }

          return nextIndex;
        });
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
    ]
  );

  const createPanResponder = useCallback(
    (item: CardData, isCurrentCard: boolean) => {
      return PanResponder.create({
        onStartShouldSetPanResponder: () => isCurrentCard && data.length > 0,
        onPanResponderGrant: (evt) => {
          // Store the exact card being touched
          currentGestureCard.current = item;
          touchStartTime.current = Date.now();
          touchStartPosition.current = {
            x: evt.nativeEvent.locationX,
            y: evt.nativeEvent.locationY,
          };
        },
        onPanResponderMove: (event, gesture) => {
          if (isCurrentCard) {
            position.setValue({ x: gesture.dx, y: gesture.dy });
            updateFeedbackOpacity(gesture);
          }
        },
        onPanResponderRelease: (event, gesture) => {
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
      cardIndex,
      handleCardTap,
      updateFeedbackOpacity,
      hideAllFeedback,
      resetPosition,
      forceSwipe,
    ]
  );

  // Function to get the appropriate feedback image based on swipe direction
  const getFeedbackImage = () => {
    switch (currentSwipeDirection) {
      case "right":
        return APPROVE_IMAGE;
      case "left":
        return CANCEL_IMAGE;
      case "up":
        return null;
      default:
        return APPROVE_IMAGE;
    }
  };

  const renderSwipeFeedback = () => {
    if (!currentSwipeDirection) return null;

    // Don't render anything for up swipe
    if (currentSwipeDirection === "up") return null;

    const feedbackImage = getFeedbackImage();
    if (!feedbackImage) return null;

    return (
      <Animated.View
        style={[
          styles.swipeFeedbackCenter,
          {
            opacity: feedbackOpacity,
            transform: [{ scale: feedbackScale }],
          },
        ]}
      >
        <Image
          source={feedbackImage}
          style={styles.feedbackImage}
          resizeMode="contain"
        />
      </Animated.View>
    );
  };

  const renderCards = () => {
    if (cardIndex >= data.length) {
      return (
        <Animated.View
          style={[styles.emptyCardsContainer, styles.transitionContainer]}
        >
          <AnimatedLoader />
        </Animated.View>
      );
    }

    return data
      .map((item, i) => {
        if (i < cardIndex) {
          return null;
        }

        const isCurrentCard = i === cardIndex;
        const panResponder = createPanResponder(item, isCurrentCard);
        const validImageUrl = getValidImageUrl(item.imageUrl);

        if (isCurrentCard) {
          const isCurrentImageLoaded = imageLoaded[item.id];

          // Show AnimatedLoader until image is loaded
          if (!isCurrentImageLoaded) {
            return (
              <View key={item.id} style={styles.loaderContainer}>
                <AnimatedLoader />
                <OptimizedImageBackground
                  source={
                    validImageUrl ? { uri: validImageUrl } : PLACEHOLDER_IMAGE
                  }
                  style={{ width: 0, height: 0 }}
                  onLoad={() => handleImageLoad(item.id)}
                  onError={() => handleImageError(item.id)}
                  showLoader={false}
                  fallbackSource={PLACEHOLDER_IMAGE}
                />
              </View>
            );
          }

          // Show actual card when image is loaded
          return (
            <Animated.View
              key={item.id}
              style={[
                styles.cardStyle,
                {
                  transform: [
                    { translateX: position.x },
                    { translateY: position.y },
                    { rotate },
                    { scale: scaleUp },
                  ],
                  zIndex: 999,
                },
              ]}
              {...panResponder.panHandlers}
            >
              <OptimizedImageBackground
                source={
                  validImageUrl ? { uri: validImageUrl } : PLACEHOLDER_IMAGE
                }
                style={styles.cardImage}
                resizeMode="cover"
                priority="high"
                showLoader={false}
                fallbackSource={PLACEHOLDER_IMAGE}
              >
                {/* VENUE badge */}
                <CustomView
                  bgColor={colors.overlay}
                  style={styles.shareContainer}
                >
                  <CustomView bgColor={colors.overlay} style={styles.row}>
                    {!hideBucketsButton && (
                      <CustomTouchable
                        style={styles.bucketContainer}
                        bgColor={colors.label_dark}
                        onPress={() => {
                          onBucketPress?.(item.id);
                        }}
                      >
                        <BucketSvg />
                      </CustomTouchable>
                    )}
                    <CustomTouchable
                      bgColor={colors.onboarding_gray}
                      style={styles.shareButton}
                    >
                      <ShareButton
                        width={14}
                        height={14}
                        title={""}
                        message={`Check out this bucket: `}
                        url={validImageUrl || ""}
                      />
                    </CustomTouchable>
                  </CustomView>
                </CustomView>

                {/* Content overlay with gradient */}
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.8)"]}
                  style={styles.gradientOverlay}
                >
                  <View style={styles.cardContent}>
                    {item.category && (
                      <CategoryTag
                        style={styles.tagContainer}
                        category={item.category}
                        colors={colors}
                      />
                    )}
                    <CustomText
                      fontFamily="Inter-SemiBold"
                      style={[styles.cardTitle, { color: colors.background }]}
                    >
                      {item.title}
                    </CustomText>

                    <CustomText
                      fontFamily="Inter-SemiBold"
                      style={[styles.priceText, { color: colors.lime }]}
                    >
                      {item?.price ? (
                        <>
                          {item.price}
                          <CustomText
                            fontFamily="Inter-SemiBold"
                            style={[
                              styles.perPersonText,
                              { color: colors.lime },
                            ]}
                          >
                            {" "}
                            /person
                          </CustomText>
                        </>
                      ) : item?.rating ? (
                        `${item.rating}★`
                      ) : (
                        "No rating"
                      )}
                    </CustomText>

                    <CustomText
                      fontFamily="Inter-SemiBold"
                      style={[styles.addressText, { color: colors.background }]}
                    >
                      {item.address || "No address"}
                    </CustomText>
                  </View>
                </LinearGradient>
              </OptimizedImageBackground>

              {/* Swipe feedback overlays */}
              {renderSwipeFeedback()}
            </Animated.View>
          );
        }

        // Show next card (also preload its image)
        if (i === cardIndex + 1) {
          return (
            <Animated.View
              key={item.id}
              style={[
                styles.cardStyle,
                {
                  opacity: nextCardOpacity,
                  transform: [{ scale: nextCardScale }],
                  top: 10,
                  zIndex: -1,
                },
              ]}
            >
              <OptimizedImageBackground
                source={
                  validImageUrl ? { uri: validImageUrl } : PLACEHOLDER_IMAGE
                }
                style={styles.cardImage}
                resizeMode="cover"
                priority="normal"
                showLoader={false}
                fallbackSource={PLACEHOLDER_IMAGE}
                onLoad={() => handleImageLoad(item.id)}
                onError={() => handleImageError(item.id)}
              >
                {/* Simple gradient for next card preview */}
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.5)"]}
                  style={styles.gradientOverlay}
                >
                  <View style={styles.cardContent}>
                    <CustomText
                      fontFamily="Inter-SemiBold"
                      style={[styles.cardTitle, { color: colors.background }]}
                    >
                      {item.title}
                    </CustomText>
                  </View>
                </LinearGradient>
              </OptimizedImageBackground>
            </Animated.View>
          );
        }

        return null;
      })
      .reverse();
  };

  return <View style={styles.container}>{renderCards()}</View>;
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
  loaderContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  cardStyle: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    justifyContent: "flex-end",
  },
  shareContainer: {
    alignSelf: "flex-end",
    marginRight: horizontalScale(12),
    marginTop: verticalScale(16),
  },
  venueText: {
    fontSize: scaleFontSize(10),
    textTransform: "uppercase",
  },
  tagContainer: {
    borderRadius: 12,
    paddingVertical: 6,
    marginBottom: verticalScale(9),
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  cardContent: {
    padding: horizontalScale(12),
    paddingBottom: verticalScale(16),
  },
  cardTitle: {
    fontSize: scaleFontSize(24),
    marginBottom: verticalScale(6),
  },
  cardDescription: {
    fontSize: scaleFontSize(16),
    color: "#FFFFFF",
    marginBottom: verticalScale(10),
  },
  priceText: {
    fontSize: scaleFontSize(24),
    marginTop: verticalScale(6),
    marginBottom: verticalScale(6),
  },
  perPersonText: {
    fontSize: scaleFontSize(12),
  },
  addressText: {
    fontSize: scaleFontSize(14),
    marginTop: verticalScale(6),
  },
  sendIconContainer: {
    position: "absolute",
    bottom: verticalScale(16),
    right: horizontalScale(12),
    justifyContent: "center",
    alignItems: "center",
  },
  transitionContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 1,
    backgroundColor: "",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bucketContainer: {
    width: 36,
    height: 36,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  shareButton: {
    width: 36,
    height: 36,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  // Swipe feedback styles
  swipeFeedbackCenter: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -30, // Half of the height (60/2)
    marginLeft: -30, // Half of the width (60/2)
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: 60,
    zIndex: 1000,
  },
  feedbackImage: {
    width: 100,
    height: 100,
  },
});
