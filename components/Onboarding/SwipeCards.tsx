import React, { useRef } from "react";
import {
  StyleSheet,
  View,
  Image,
  Animated,
  PanResponder,
  Dimensions,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import CustomText from "@/components/CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import SendSvg from "../SvgComponents/SengSvg";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_UP_THRESHOLD = 0.25 * SCREEN_HEIGHT; // Changed from DOWN to UP
const SWIPE_OUT_DURATION = 250;

interface CardData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

interface SwipeCardsProps {
  data: CardData[];
  onSwipeLeft: (item: CardData) => void;
  onSwipeRight: (item: CardData) => void;
  onSwipeUp: (item: CardData) => void; // Changed from onSwipeDown to onSwipeUp
  onComplete: () => void;
}

export const SwipeCards: React.FC<SwipeCardsProps> = ({
  data,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp, // Changed from onSwipeDown to onSwipeUp
  onComplete,
}) => {
  const { colors } = useTheme();
  const [cardIndex, setCardIndex] = React.useState(0);
  const position = useRef(new Animated.ValueXY()).current;

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ["-10deg", "0deg", "10deg"],
    extrapolate: "clamp",
  });

  // Interpolation for card scaling when swiping up (changed from down to up)
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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe("right");
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe("left");
        } else if (gesture.dy < -SWIPE_UP_THRESHOLD) {
          // Changed to check for negative dy (up swipe)
          forceSwipe("up"); // Changed from "down" to "up"
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const forceSwipe = (direction: "left" | "right" | "up") => {
    // Changed "down" to "up"
    const x =
      direction === "right"
        ? SCREEN_WIDTH
        : direction === "left"
        ? -SCREEN_WIDTH
        : 0;
    const y = direction === "up" ? -SCREEN_HEIGHT : 0; // Changed from positive (down) to negative (up)

    Animated.timing(position, {
      toValue: { x, y },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction: "left" | "right" | "up") => {
    // Changed "down" to "up"
    const item = data[cardIndex];

    // Process the swipe action first
    if (direction === "right") {
      onSwipeRight(item);
    } else if (direction === "left") {
      onSwipeLeft(item);
    } else if (direction === "up") {
      // Changed from "down" to "up"
      onSwipeUp(item); // Changed from onSwipeDown to onSwipeUp
    }

    // Only reset position AFTER the animation completes
    // Use functional update to ensure we're working with the latest state
    setCardIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;

      // Check if we've gone through all cards
      if (nextIndex >= data.length) {
        // Call onComplete after a small delay to allow the last card to finish animating off screen
        setTimeout(() => {
          // Now reset position after the card is off-screen
          position.setValue({ x: 0, y: 0 });
          onComplete();
        }, 300); // Match this with SWIPE_OUT_DURATION for best results
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
          <ActivityIndicator color={colors.link_blue} size={"large"} />
        </Animated.View>
      );
    }

    return data
      .map((item, i) => {
        if (i < cardIndex) {
          return null;
        }

        if (i === cardIndex) {
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
                    { scale: scaleUp }, // Changed from scaleDown to scaleUp
                  ],
                  // Make sure the card has a high zIndex to appear above the progress bar
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
                <View style={styles.venueBadge}>
                  <CustomText
                    fontFamily="Inter-SemiBold"
                    style={[styles.venueText, { color: colors.card_purple }]}
                  >
                    VENUE
                  </CustomText>
                </View>

                {/* Content overlay on the image */}
                <View style={styles.cardContent}>
                  <CustomText
                    fontFamily="Inter-SemiBold"
                    style={[styles.cardTitle, { color: colors.background }]}
                  >
                    {item.title}
                  </CustomText>

                  <CustomText
                    fontFamily="Inter-SemiBold"
                    style={[styles.cardTitle, { color: colors.background }]}
                  >
                    {item.description || item.title}
                  </CustomText>

                  <CustomText
                    fontFamily="Inter-SemiBold"
                    style={[styles.priceText, { color: colors.lime }]}
                  >
                    £45{" "}
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

                  {/* Send icon */}
                  <View style={styles.sendIconContainer}>
                    <SendSvg />
                  </View>
                </View>
              </ImageBackground>
            </Animated.View>
          );
        }

        // Show next card
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
              {/* Using ImageBackground for the next card too */}
              <ImageBackground
                source={{ uri: item.imageUrl }}
                style={styles.cardImage}
                imageStyle={styles.imageBackground}
              >
                <View style={styles.cardContent}>
                  <CustomText
                    fontFamily="Inter-SemiBold"
                    style={styles.cardTitle}
                  >
                    {item.title}
                  </CustomText>
                  <CustomText style={styles.cardDescription}>
                    {item.description}
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
  // Styles remain unchanged
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
  venueBadge: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(6),
    borderRadius: 12,
    alignSelf: "flex-start",
    marginLeft: horizontalScale(12),
    marginTop: verticalScale(16),
  },
  venueText: {
    fontSize: scaleFontSize(10),
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
    opacity: 0.5,
  },
});
