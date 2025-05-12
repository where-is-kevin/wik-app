import React, { useRef } from "react";
import {
  StyleSheet,
  View,
  Image,
  Animated,
  PanResponder,
  Dimensions,
  ImageBackground,
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
const SWIPE_DOWN_THRESHOLD = 0.25 * SCREEN_HEIGHT;
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
  onSwipeDown: (item: CardData) => void;
  onComplete: () => void;
}

export const SwipeCards: React.FC<SwipeCardsProps> = ({
  data,
  onSwipeLeft,
  onSwipeRight,
  onSwipeDown,
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

  // Interpolation for card scaling when swiping down
  const scaleDown = position.y.interpolate({
    inputRange: [0, SCREEN_HEIGHT / 4],
    outputRange: [1, 0.8],
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
        } else if (gesture.dy > SWIPE_DOWN_THRESHOLD) {
          forceSwipe("down");
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const forceSwipe = (direction: "left" | "right" | "down") => {
    const x =
      direction === "right"
        ? SCREEN_WIDTH
        : direction === "left"
        ? -SCREEN_WIDTH
        : 0;
    const y = direction === "down" ? SCREEN_HEIGHT : 0;

    Animated.timing(position, {
      toValue: { x, y },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction: "left" | "right" | "down") => {
    const item = data[cardIndex];

    if (direction === "right") {
      onSwipeRight(item);
    } else if (direction === "left") {
      onSwipeLeft(item);
    } else if (direction === "down") {
      onSwipeDown(item);
    }

    position.setValue({ x: 0, y: 0 });
    console.log(cardIndex, data.length - 1);
    if (cardIndex === data.length - 1) {
      // We've gone through all cards
      onComplete();
    } else {
      setCardIndex(cardIndex + 1);
    }
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 4,
      useNativeDriver: false,
    }).start();
  };

  if (cardIndex >= data.length) {
    return (
      <View style={styles.emptyCardsContainer}>
        <CustomText
          style={{ color: colors.label_dark, fontSize: scaleFontSize(18) }}
        >
          No more cards!
        </CustomText>
      </View>
    );
  }

  const renderCards = () => {
    if (cardIndex >= data.length) {
      return null;
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
                    { scale: scaleDown },
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
    height: "100%", // For 2:3 ratio (width:height), height = width * (3/2)
    borderRadius: 16,
    overflow: "hidden",
    // Ensure cards render above other elements when dragging
    elevation: 5, // for Android
    shadowColor: "#000", // for iOS
    shadowOffset: { width: 0, height: 2 }, // for iOS
    shadowOpacity: 0.3, // for iOS
    shadowRadius: 3, // for iOS
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
});
