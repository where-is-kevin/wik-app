import React, { useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  Animated,
  PanResponder,
  Dimensions,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import CustomText from "@/components/CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import SendSvg from "../SvgComponents/SengSvg";
import CustomTouchable from "../CustomTouchableOpacity";
import AnimatedLoader from "../Loader/AnimatedLoader";
import CustomView from "../CustomView";
import BucketSvg from "../SvgComponents/BucketSvg";
import ShareButton from "../Button/ShareButton";

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
  category?: string;
}

interface SwipeCardsProps {
  data: CardData[];
  onSwipeLeft: (item: CardData) => void;
  onSwipeRight: (item: CardData) => void;
  onSwipeUp: (item: CardData) => void;
  onComplete: () => void;
  onCardTap?: (item: CardData) => void;
  onBucketPress?: () => void;
}

export const SwipeCards: React.FC<SwipeCardsProps> = ({
  data,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onComplete,
  onCardTap,
  onBucketPress,
}) => {
  const { colors } = useTheme();
  const router = useRouter();
  const [cardIndex, setCardIndex] = React.useState(0);
  const [imageLoaded, setImageLoaded] = useState<{ [key: string]: boolean }>(
    {}
  );
  const position = useRef(new Animated.ValueXY()).current;

  // Track touch start time and position to distinguish between tap and swipe
  const touchStartTime = useRef<number>(0);
  const touchStartPosition = useRef({ x: 0, y: 0 });

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

  const handleCardTap = (item: CardData) => {
    if (onCardTap) {
      onCardTap(item);
    } else {
      router.push(`/event-details/${item.id}`);
    }
  };

  const handleImageLoadStart = (itemId: string) => {
    setImageLoaded((prev) => ({ ...prev, [itemId]: false }));
  };

  const handleImageLoad = (itemId: string) => {
    setImageLoaded((prev) => ({ ...prev, [itemId]: true }));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        touchStartTime.current = Date.now();
        touchStartPosition.current = {
          x: evt.nativeEvent.locationX,
          y: evt.nativeEvent.locationY,
        };
      },
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (event, gesture) => {
        const touchDuration = Date.now() - touchStartTime.current;
        const distanceMoved = Math.sqrt(
          Math.pow(gesture.dx, 2) + Math.pow(gesture.dy, 2)
        );

        // If it's a short touch with minimal movement, consider it a tap
        if (touchDuration < TAP_DURATION_THRESHOLD && distanceMoved < 10) {
          const item = data[cardIndex];
          handleCardTap(item);
          return;
        }

        // Handle swipes
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe("right");
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe("left");
        } else if (gesture.dy < -SWIPE_UP_THRESHOLD) {
          forceSwipe("up");
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const forceSwipe = (direction: "left" | "right" | "up") => {
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
  };

  const onSwipeComplete = (direction: "left" | "right" | "up") => {
    const item = data[cardIndex];

    // Process the swipe action first
    if (direction === "right") {
      onSwipeRight(item);
    } else if (direction === "left") {
      onSwipeLeft(item);
    } else if (direction === "up") {
      onSwipeUp(item);
    }

    // Only reset position AFTER the animation completes
    setCardIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;

      // Check if we've gone through all cards
      if (nextIndex >= data.length) {
        // Call onComplete after a small delay to allow the last card to finish animating off screen
        setTimeout(() => {
          // Now reset position after the card is off-screen
          position.setValue({ x: 0, y: 0 });
          onComplete();
        }, 300);
      } else {
        // For normal card transitions, reset position after a small delay
        setTimeout(() => {
          position.setValue({ x: 0, y: 0 });
        }, 100);
      }

      return nextIndex;
    });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 4,
      useNativeDriver: false,
    }).start();
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

        if (i === cardIndex) {
          const isCurrentImageLoaded = imageLoaded[item.id];

          // Show AnimatedLoader until image is loaded
          if (!isCurrentImageLoaded) {
            return (
              <View key={item.id} style={styles.loaderContainer}>
                <AnimatedLoader />
                {/* Preload image in background */}
                <ImageBackground
                  source={{ uri: item.imageUrl }}
                  style={{ width: 0, height: 0 }}
                  onLoad={() => handleImageLoad(item.id)}
                  onError={() => handleImageLoad(item.id)}
                  onLoadStart={() => handleImageLoadStart(item.id)}
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
              <ImageBackground
                source={{ uri: item.imageUrl }}
                style={styles.cardImage}
                imageStyle={styles.imageBackground}
              >
                {/* VENUE badge */}
                <CustomView
                  bgColor={colors.overlay}
                  style={styles.shareContainer}
                >
                  <CustomView bgColor={colors.overlay} style={styles.row}>
                    <CustomTouchable
                      style={styles.bucketContainer}
                      bgColor={colors.label_dark}
                      onPress={() => onBucketPress?.()}
                    >
                      <BucketSvg />
                    </CustomTouchable>
                    <CustomTouchable
                      bgColor={colors.onboarding_gray}
                      style={styles.shareButton}
                    >
                      <ShareButton
                        width={14}
                        height={14}
                        title={""}
                        message={`Check out this bucket: `}
                        url={"www.google.com"}
                      />
                    </CustomTouchable>
                  </CustomView>
                </CustomView>

                {/* Content overlay on the image */}
                <View style={styles.cardContent}>
                  {item.category && (
                    <CustomView
                      bgColor={colors.bordo}
                      style={styles.tagContainer}
                    >
                      <CustomText
                        fontFamily="Inter-SemiBold"
                        style={[styles.venueText, { color: colors.pink }]}
                      >
                        {item.category}
                      </CustomText>
                    </CustomView>
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
                    {item.price || ""}{" "}
                    <CustomText
                      fontFamily="Inter-SemiBold"
                      style={[styles.perPersonText, { color: colors.lime }]}
                    >
                      /person
                    </CustomText>
                  </CustomText>

                  <CustomText
                    fontFamily="Inter-SemiBold"
                    style={[styles.addressText, { color: colors.background }]}
                  >
                    Address
                  </CustomText>
                </View>
              </ImageBackground>
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
              <ImageBackground
                source={{ uri: item.imageUrl }}
                style={styles.cardImage}
                imageStyle={styles.imageBackground}
                onLoad={() => handleImageLoad(item.id)}
                onError={() => handleImageLoad(item.id)}
                onLoadStart={() => handleImageLoadStart(item.id)}
              >
                <View style={styles.cardContent}>
                  <CustomText
                    fontFamily="Inter-SemiBold"
                    style={styles.cardTitle}
                  >
                    {item.title}
                  </CustomText>
                </View>
              </ImageBackground>
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
  imageBackground: {
    resizeMode: "cover",
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
    paddingHorizontal: 12,
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
});
