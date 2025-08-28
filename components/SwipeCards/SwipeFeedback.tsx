// components/SwipeFeedback.tsx
import { STATIC_IMAGES } from "@/constants/images";
import React from "react";
import { Animated, Image, StyleSheet } from "react-native";

interface SwipeFeedbackProps {
  direction: "left" | "right" | "up" | null;
  opacity: Animated.Value;
  scale: Animated.Value;
}

const getFeedbackImageSource = (direction: "left" | "right" | "up" | null) => {
  switch (direction) {
    case "right":
      return STATIC_IMAGES.APPROVE_IMAGE;
    case "left":
      return STATIC_IMAGES.CANCEL_IMAGE;
    case "up":
      return STATIC_IMAGES.ARROW_UP;
    default:
      return STATIC_IMAGES.APPROVE_IMAGE;
  }
};

export const SwipeFeedback = React.memo<SwipeFeedbackProps>(
  function SwipeFeedback({ direction, opacity, scale }) {
    if (!direction) return null;

    const imageSource = getFeedbackImageSource(direction);

    return (
      <Animated.View
        style={[
          styles.swipeFeedbackCenter,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        <Image
          source={imageSource}
          style={styles.feedbackImage}
          contentFit="contain"
          fadeDuration={0}
        />
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
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
});
