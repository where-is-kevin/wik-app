import React, { useRef } from "react";
import {
  StyleSheet,
  View,
  Image,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";
import CustomText from "@/components/CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";

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
  onSwipeDown: (item: CardData) => void; // New prop for swipe down action
  onComplete: () => void;
}

export const SwipeCards: React.FC<SwipeCardsProps> = ({
  data,
  onSwipeLeft,
  onSwipeRight,
  onSwipeDown, // Add the new prop
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

  // New interpolation for card scaling when swiping down
  const scaleDown = position.y.interpolate({
    inputRange: [0, SCREEN_HEIGHT / 4],
    outputRange: [1, 0.8],
    extrapolate: "clamp",
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const dislikeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // New interpolation for SKIP label when swiping down
  const skipOpacity = position.y.interpolate({
    inputRange: [0, SCREEN_HEIGHT / 8],
    outputRange: [0, 1],
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
          // Handle swipe down
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
      onSwipeDown(item); // Call the new callback
    }

    position.setValue({ x: 0, y: 0 });

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
                  borderColor: colors.input_border,
                  backgroundColor: colors.background,
                  transform: [
                    { translateX: position.x },
                    { translateY: position.y },
                    { rotate },
                    { scale: scaleDown }, // Apply scale when swiping down
                  ],
                },
              ]}
              {...panResponder.panHandlers}
            >
              <Animated.View
                style={[styles.likeContainer, { opacity: likeOpacity }]}
              >
                <CustomText style={styles.likeText}>LIKE</CustomText>
              </Animated.View>
              <Animated.View
                style={[styles.dislikeContainer, { opacity: dislikeOpacity }]}
              >
                <CustomText style={styles.dislikeText}>NOPE</CustomText>
              </Animated.View>
              {/* New Skip label for swipe down */}
              <Animated.View
                style={[styles.skipContainer, { opacity: skipOpacity }]}
              >
                <CustomText style={styles.skipText}>SKIP</CustomText>
              </Animated.View>

              <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <CustomText
                  fontFamily="Inter-SemiBold"
                  style={[styles.cardTitle, { color: colors.label_dark }]}
                >
                  {item.title}
                </CustomText>
                <CustomText
                  style={[
                    styles.cardDescription,
                    { color: colors.gray_regular },
                  ]}
                >
                  {item.description}
                </CustomText>
              </View>
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
                  borderColor: colors.input_border,
                  backgroundColor: colors.background,
                  opacity: nextCardOpacity,
                  transform: [{ scale: nextCardScale }],
                  top: 10,
                  zIndex: -1,
                },
              ]}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <CustomText
                  fontFamily="Inter-SemiBold"
                  style={[styles.cardTitle, { color: colors.label_dark }]}
                >
                  {item.title}
                </CustomText>
                <CustomText
                  style={[
                    styles.cardDescription,
                    { color: colors.gray_regular },
                  ]}
                >
                  {item.description}
                </CustomText>
              </View>
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
    height: "100%",
    borderRadius: 20,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  cardContent: {
    padding: horizontalScale(15),
  },
  cardTitle: {
    fontSize: scaleFontSize(18),
    marginBottom: verticalScale(8),
  },
  cardDescription: {
    fontSize: scaleFontSize(14),
  },
  likeContainer: {
    position: "absolute",
    top: 50,
    right: 40,
    zIndex: 1,
    transform: [{ rotate: "15deg" }],
    borderWidth: 2,
    borderColor: "#4CD964",
    padding: 10,
    borderRadius: 5,
  },
  likeText: {
    color: "#4CD964",
    fontSize: scaleFontSize(24),
    fontWeight: "bold",
  },
  dislikeContainer: {
    position: "absolute",
    top: 50,
    left: 40,
    zIndex: 1,
    transform: [{ rotate: "-15deg" }],
    borderWidth: 2,
    borderColor: "#FF3B30",
    padding: 10,
    borderRadius: 5,
  },
  dislikeText: {
    color: "#FF3B30",
    fontSize: scaleFontSize(24),
    fontWeight: "bold",
  },
  // New styles for the skip container
  skipContainer: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    zIndex: 1,
    borderWidth: 2,
    borderColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
  },
  skipText: {
    color: "#007AFF",
    fontSize: scaleFontSize(24),
    fontWeight: "bold",
  },
});
