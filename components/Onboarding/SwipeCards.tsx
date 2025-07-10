import React, { useRef, useState, useCallback, useMemo } from "react";
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

// Limit the number of cards rendered at once
const MAX_RENDERED_CARDS = 3;

interface CardData {
  id: string;
  title: string;
  imageUrl: string;
  price?: string;
  rating?: string;
  category?: string;
  address?: string;
  isSponsored?: boolean;
  contentShareUrl: string;
  tags?: string; // Added tags property
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

// Helper function to format tags - fully dynamic, no hardcoded mappings
export const formatTags = (tags: string): string => {
  if (!tags) return "";

  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0) // Remove empty tags
    .map((tag) => {
      return tag
        .toLowerCase()
        .split(/[_\s-]+/) // Split on underscores, spaces, or hyphens
        .map((word) => {
          // Handle special cases for common abbreviations
          if (word === "atm") return "ATM";
          if (word === "rv") return "RV";
          if (word === "tv") return "TV";
          if (word === "wifi") return "WiFi";
          if (word === "api") return "API";
          if (word === "gps") return "GPS";
          if (word === "usa") return "USA";
          if (word === "uk") return "UK";

          // Regular capitalization for other words
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(" ");
    })
    .slice(0, 5) // Limit to first 5 tags to avoid UI overflow
    .join(", ");
};

// Memoized card overlay component to prevent unnecessary re-renders
const CardContentOverlay = React.memo<{
  item: CardData;
  colors: any;
  onBucketPress?: (value: string) => void;
  hideBucketsButton?: boolean;
}>(({ item, colors, onBucketPress, hideBucketsButton }) => {
  const renderContentOverlay = () => {
    if (item.isSponsored) {
      return (
        <View style={styles.sponsoredOverlay}>
          <View style={styles.cardContent}>
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
                    style={[styles.perPersonText, { color: colors.lime }]}
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
            {item.address && (
              <CustomText
                fontFamily="Inter-SemiBold"
                style={[styles.addressText, { color: colors.background }]}
              >
                {item.address}
              </CustomText>
            )}
            {item.tags && (
              <CustomText
                fontFamily="Inter-SemiBold"
                style={[styles.addressText, { color: colors.background }]}
              >
                {formatTags(item.tags)}
              </CustomText>
            )}
          </View>
        </View>
      );
    } else {
      return (
        <LinearGradient
          colors={["rgba(242, 242, 243, 0)", "#0B2E34"]}
          style={styles.gradientOverlay}
        >
          <View style={styles.cardContent}>
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
                    style={[styles.perPersonText, { color: colors.lime }]}
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
            {item.address && (
              <CustomText
                fontFamily="Inter-SemiBold"
                style={[styles.addressText, { color: colors.background }]}
              >
                {item.address}
              </CustomText>
            )}
            {item.tags && (
              <CustomText
                fontFamily="Inter-SemiBold"
                style={[styles.addressText, { color: colors.background }]}
              >
                {formatTags(item.tags)}
              </CustomText>
            )}
          </View>
        </LinearGradient>
      );
    }
  };

  return (
    <>
      {/* Top row with category tag, dots, and bucket/share buttons */}
      <View style={styles.topRowContainer}>
        <View style={styles.leftTopSection}>
          {item.category && (
            <CategoryTag
              style={styles.topTagContainer}
              category={item.category}
              colors={colors}
            />
          )}
          {item.isSponsored && (
            <CustomView bgColor={colors.lime} style={styles.topExperienceTag}>
              <CustomText
                fontFamily="Inter-SemiBold"
                style={styles.topExperienceText}
              >
                SPONSORED
              </CustomText>
            </CustomView>
          )}
        </View>

        <CustomView bgColor={colors.overlay} style={styles.rightTopSection}>
          <CustomView bgColor={colors.overlay} style={styles.row}>
            {!hideBucketsButton && (
              <CustomTouchable
                style={styles.bucketContainer}
                bgColor={colors.label_dark}
                onPress={() => onBucketPress?.(item.id)}
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
                url={item.contentShareUrl || ""}
              />
            </CustomTouchable>
          </CustomView>
        </CustomView>
      </View>
      {renderContentOverlay()}
    </>
  );
});

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

  // Use native driver for better performance
  const position = useRef(new Animated.ValueXY()).current;
  const feedbackOpacity = useRef(new Animated.Value(0)).current;
  const feedbackScale = useRef(new Animated.Value(0.8)).current;

  const [currentSwipeDirection, setCurrentSwipeDirection] = useState<
    "left" | "right" | "up" | null
  >(null);

  const touchStartTime = useRef<number>(0);
  const touchStartPosition = useRef({ x: 0, y: 0 });
  const currentGestureCard = useRef<CardData | null>(null);

  // Memoize static assets
  const PLACEHOLDER_IMAGE = useMemo(
    () => require("@/assets/images/placeholder-bucket.png"),
    []
  );
  const APPROVE_IMAGE = useMemo(
    () => require("@/assets/images/approve.png"),
    []
  );
  const CANCEL_IMAGE = useMemo(() => require("@/assets/images/cancel.png"), []);
  const ARROW_UP = useMemo(() => require("@/assets/images/arrow-up.png"), []);

  // Memoize the visible cards data to prevent unnecessary re-renders
  const visibleCards = useMemo(() => {
    if (!data || data.length === 0) return [];
    const endIndex = Math.min(cardIndex + MAX_RENDERED_CARDS, data.length);
    return data.slice(cardIndex, endIndex);
  }, [data, cardIndex]);

  // Memoize interpolations to prevent recreation on every render
  const animatedValues = useMemo(
    () => ({
      rotate: position.x.interpolate({
        inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        outputRange: ["-10deg", "0deg", "10deg"],
        extrapolate: "clamp",
      }),
      scaleUp: position.y.interpolate({
        inputRange: [-SCREEN_HEIGHT / 4, 0],
        outputRange: [0.8, 1],
        extrapolate: "clamp",
      }),
      nextCardOpacity: position.x.interpolate({
        inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        outputRange: [1, 0.5, 1],
        extrapolate: "clamp",
      }),
      nextCardScale: position.x.interpolate({
        inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        outputRange: [1, 0.9, 1],
        extrapolate: "clamp",
      }),
    }),
    [position]
  );

  const getValidImageUrl = useCallback((imageUrl: string): string | null => {
    if (typeof imageUrl === "string" && imageUrl.trim() !== "") {
      return imageUrl;
    }
    return null;
  }, []);

  // Optimized feedback update with debouncing
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

      // Only update if direction changed to reduce state updates
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
        useNativeDriver: true, // Use native driver for better performance
      }).start(() => onSwipeComplete(direction));
    },
    [position]
  );

  const resetPosition = useCallback(() => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 4,
      useNativeDriver: true, // Use native driver
    }).start();
    hideAllFeedback();
    currentGestureCard.current = null;
  }, [position, hideAllFeedback]);

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

  // Memoize PanResponder creation to prevent recreation
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
      handleCardTap,
      updateFeedbackOpacity,
      hideAllFeedback,
      resetPosition,
      forceSwipe,
    ]
  );

  const getFeedbackImage = useCallback(() => {
    switch (currentSwipeDirection) {
      case "right":
        return APPROVE_IMAGE;
      case "left":
        return CANCEL_IMAGE;
      case "up":
        return ARROW_UP;
      default:
        return APPROVE_IMAGE;
    }
  }, [currentSwipeDirection, APPROVE_IMAGE, CANCEL_IMAGE, ARROW_UP]);

  const renderSwipeFeedback = () => {
    if (!currentSwipeDirection) return null;

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

  // Early return if no data
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyCardsContainer}>
        <AnimatedLoader />
      </View>
    );
  }

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

    // Only render the visible cards to improve performance
    return visibleCards
      .map((item, relativeIndex) => {
        const absoluteIndex = cardIndex + relativeIndex;
        const isCurrentCard = absoluteIndex === cardIndex;
        const validImageUrl = getValidImageUrl(item.imageUrl);

        if (isCurrentCard) {
          const isCurrentImageLoaded = imageLoaded[item.id];
          const panResponder = createPanResponder(item, true);

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

          return (
            <Animated.View
              key={item.id}
              style={[
                styles.cardStyle,
                {
                  transform: [
                    { translateX: position.x },
                    { translateY: position.y },
                    { rotate: animatedValues.rotate },
                    { scale: animatedValues.scaleUp },
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
                <CardContentOverlay
                  item={item}
                  colors={colors}
                  onBucketPress={onBucketPress}
                  hideBucketsButton={hideBucketsButton}
                />
              </OptimizedImageBackground>
            </Animated.View>
          );
        }

        // Next card
        if (absoluteIndex === cardIndex + 1) {
          return (
            <Animated.View
              key={item.id}
              style={[
                styles.cardStyle,
                {
                  opacity: animatedValues.nextCardOpacity,
                  transform: [{ scale: animatedValues.nextCardScale }],
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
                <LinearGradient
                  colors={["rgba(242, 242, 243, 0)", "#0B2E34"]}
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

  return (
    <View style={styles.container}>
      {renderSwipeFeedback()}
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
    height: "60%",
    justifyContent: "flex-end",
  },
  // TOP ROW STYLES
  topRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: horizontalScale(12),
    paddingTop: verticalScale(16),
    zIndex: 1000,
  },
  leftTopSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(8),
    flex: 1,
  },
  rightTopSection: {
    alignSelf: "flex-end",
  },
  topTagContainer: {
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
    minHeight: verticalScale(24),
  },
  topExperienceTag: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    minHeight: verticalScale(24),
  },
  topExperienceText: {
    color: "#0B2E34",
    fontSize: scaleFontSize(10),
  },
  // CARD CONTENT STYLES
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
  // BUTTON STYLES
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
  // FEEDBACK STYLES
  swipeFeedbackCenter: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1100,
    pointerEvents: "none",
  },
  feedbackImage: {
    width: 100,
    height: 100,
  },
  // OVERLAY STYLES
  sponsoredOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0B2E34",
    justifyContent: "flex-end",
  },
});
