import React, { useRef } from "react";
import {
  TouchableOpacity,
  Animated,
  Platform,
  StyleSheet,
  ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import HeartOutlineEmptySvg from "@/components/SvgComponents/HeartOutlineEmptySvg";
import HeartEmptySvg from "@/components/SvgComponents/HeartEmptySvg";

interface HeartButtonProps {
  isLiked: boolean;
  onPress: () => void;
  size?: number;
  color?: string;
  style?: ViewStyle;
  showFlyingAnimation?: boolean;
  hasTabBar?: boolean;
  useCustomSvg?: boolean; // New prop to use custom SVG
}

export const HeartButton: React.FC<HeartButtonProps> = ({
  isLiked,
  onPress,
  size = 24,
  color,
  style,
  showFlyingAnimation = true,
  hasTabBar = true,
  useCustomSvg = false,
}) => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const likeAnimation = useRef(new Animated.Value(1)).current;
  const flyingHeartOpacity = useRef(new Animated.Value(0)).current;
  const flyingHeartY = useRef(new Animated.Value(0)).current;
  const flyingHeartScale = useRef(new Animated.Value(1)).current;

  const heartColor = color || colors.lime;

  const handlePress = async () => {
    // Trigger haptic feedback
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Main heart pop animation
    Animated.sequence([
      Animated.timing(likeAnimation, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(likeAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Flying heart animation only when liking (not unliking)
    if (!isLiked && showFlyingAnimation) {
      // Show toast message when liking
      showToast(
        "Liked! Finding you similar suggestions nearby.",
        "success",
        hasTabBar
      );

      // Reset flying heart position
      flyingHeartY.setValue(0);
      flyingHeartScale.setValue(1.2);
      flyingHeartOpacity.setValue(1);

      Animated.parallel([
        Animated.timing(flyingHeartY, {
          toValue: -80,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(flyingHeartOpacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(flyingHeartScale, {
            toValue: 1.5,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(flyingHeartScale, {
            toValue: 0.8,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }

    onPress();
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ scale: likeAnimation }] }}>
          {useCustomSvg ? (
            <HeartOutlineEmptySvg
              width={size}
              height={size}
              fill={isLiked ? colors.lime : colors.background}
              // stroke={isLiked ? colors.lime : "#CCCCCC"}
            />
          ) : (
            <HeartEmptySvg
              width={size}
              height={size}
              fill={isLiked ? colors.lime : colors.overlay}
            />
          )}
        </Animated.View>
      </TouchableOpacity>

      {/* Flying heart animation */}
      {showFlyingAnimation && (
        <Animated.View
          style={[
            styles.flyingHeart,
            style,
            {
              opacity: flyingHeartOpacity,
              transform: [
                { translateY: flyingHeartY },
                { scale: flyingHeartScale },
              ],
            },
          ]}
          pointerEvents="none"
        >
          <HeartEmptySvg
            width={size + 4}
            height={size + 4}
            fill={colors.lime}
          />
        </Animated.View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  flyingHeart: {
    position: "absolute",
  },
});
