import React, { useEffect, useRef } from "react";
import { Animated, ViewStyle } from "react-native";

interface AnimatedHeaderProps {
  children: React.ReactNode;
  isVisible: boolean;
  style?: ViewStyle;
  animationDuration?: number;
}

const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({
  children,
  isVisible,
  style,
  animationDuration = 300,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: isVisible ? 0 : -100,
        duration: animationDuration,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: isVisible ? 1 : 0,
        duration: animationDuration,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isVisible, animationDuration, translateY, opacity]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default AnimatedHeader;