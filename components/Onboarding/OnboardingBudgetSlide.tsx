import React, { useState } from "react";
import { StyleSheet, TextInput } from "react-native";
import {
  PanGestureHandler,
  GestureHandlerRootView,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  clamp,
  useAnimatedGestureHandler,
} from "react-native-reanimated";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import { OnboardingStep } from "@/constants/onboardingSlides";
import { commonOnboardingStyles } from "./OnboardingStyles";

interface BudgetRange {
  min: number;
  max: number;
}

interface OnboardingBudgetSlideProps {
  stepData: OnboardingStep;
  onBudgetChange: (budget: BudgetRange) => void;
  initialBudget?: BudgetRange;
}

export const OnboardingBudgetSlide: React.FC<OnboardingBudgetSlideProps> = ({
  stepData,
  onBudgetChange,
  initialBudget = { min: 50, max: 200 },
}) => {
  const { colors } = useTheme();
  const [budget, setBudget] = useState<BudgetRange>(initialBudget);

  const SLIDER_WIDTH = horizontalScale(240);
  const MIN_VALUE = 0;
  const MAX_VALUE = 500;
  const THUMB_SIZE = 20;

  // Convert value to position on slider
  const valueToPosition = (value: number) => {
    "worklet";
    return ((value - MIN_VALUE) / (MAX_VALUE - MIN_VALUE)) * SLIDER_WIDTH;
  };

  // Convert position to value
  const positionToValue = (position: number) => {
    "worklet";
    const value =
      (position / SLIDER_WIDTH) * (MAX_VALUE - MIN_VALUE) + MIN_VALUE;
    return Math.round(clamp(value, MIN_VALUE, MAX_VALUE));
  };

  const minThumbPosition = useSharedValue(
    valueToPosition(budget.min) - THUMB_SIZE / 2
  );
  const maxThumbPosition = useSharedValue(
    valueToPosition(budget.max) - THUMB_SIZE / 2
  );

  const updateBudget = (newBudget: BudgetRange) => {
    setBudget(newBudget);
    onBudgetChange(newBudget);
  };

  const minGestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { startX: number }
  >({
    onStart: (_, context) => {
      context.startX = minThumbPosition.value;
    },
    onActive: (event, context) => {
      const newPosition = clamp(
        context.startX + event.translationX,
        -THUMB_SIZE / 2,
        maxThumbPosition.value - THUMB_SIZE
      );
      minThumbPosition.value = newPosition;

      const newValue = positionToValue(newPosition + THUMB_SIZE / 2);
      const currentMaxValue = positionToValue(
        maxThumbPosition.value + THUMB_SIZE / 2
      );
      runOnJS(updateBudget)({ min: newValue, max: currentMaxValue });
    },
  });

  const maxGestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { startX: number }
  >({
    onStart: (_, context) => {
      context.startX = maxThumbPosition.value;
    },
    onActive: (event, context) => {
      const newPosition = clamp(
        context.startX + event.translationX,
        minThumbPosition.value + THUMB_SIZE,
        SLIDER_WIDTH - THUMB_SIZE / 2
      );
      maxThumbPosition.value = newPosition;

      const newValue = positionToValue(newPosition + THUMB_SIZE / 2);
      const currentMinValue = positionToValue(
        minThumbPosition.value + THUMB_SIZE / 2
      );
      runOnJS(updateBudget)({ min: currentMinValue, max: newValue });
    },
  });

  const minThumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: minThumbPosition.value }],
    };
  });

  const maxThumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: maxThumbPosition.value }],
    };
  });

  const activeRangeStyle = useAnimatedStyle(() => {
    return {
      left: minThumbPosition.value + THUMB_SIZE / 2,
      width: maxThumbPosition.value - minThumbPosition.value,
    };
  });

  const handleMinInputChange = (text: string) => {
    const value = Math.max(0, Math.min(parseInt(text) || 0, MAX_VALUE));
    if (value <= budget.max) {
      const newBudget = { min: value, max: budget.max };
      updateBudget(newBudget);
      minThumbPosition.value = valueToPosition(value) - THUMB_SIZE / 2;
    }
  };

  const handleMaxInputChange = (text: string) => {
    const value = Math.max(0, Math.min(parseInt(text) || 0, MAX_VALUE));
    if (value >= budget.min) {
      const newBudget = { min: budget.min, max: value };
      updateBudget(newBudget);
      maxThumbPosition.value = valueToPosition(value) - THUMB_SIZE / 2;
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CustomView style={commonOnboardingStyles.content}>
        <CustomText
          fontFamily="Inter-SemiBold"
          style={[commonOnboardingStyles.title, { color: colors.label_dark }]}
        >
          {stepData.title}
        </CustomText>
        <CustomText
          style={[
            commonOnboardingStyles.subtitle,
            { color: colors.gray_regular },
          ]}
        >
          {stepData.subtitle}
        </CustomText>

        <CustomView style={styles.sliderContainer}>
          {/* Slider Track */}
          <CustomView
            style={[
              styles.sliderTrack,
              { backgroundColor: "rgba(60,98,250,0.25)" },
            ]}
          >
            {/* Active Range */}
            <Animated.View
              style={[
                styles.activeRange,
                { backgroundColor: colors.light_blue },
                activeRangeStyle,
              ]}
            />

            {/* Min Thumb */}
            <PanGestureHandler onGestureEvent={minGestureHandler}>
              <Animated.View
                style={[
                  styles.thumb,
                  { backgroundColor: colors.light_blue },
                  minThumbStyle,
                ]}
              />
            </PanGestureHandler>

            {/* Max Thumb */}
            <PanGestureHandler onGestureEvent={maxGestureHandler}>
              <Animated.View
                style={[
                  styles.thumb,
                  { backgroundColor: colors.light_blue },
                  maxThumbStyle,
                ]}
              />
            </PanGestureHandler>
          </CustomView>

          {/* Input Fields with Labels */}
          <CustomView style={styles.inputContainer}>
            <CustomView style={styles.inputGroup}>
              <CustomText
                style={[styles.label, { color: colors.gray_regular }]}
              >
                Minimum
              </CustomText>
              <CustomView style={styles.inputWrapper}>
                <CustomText
                  style={[styles.dollarSign, { color: colors.label_dark }]}
                >
                  $
                </CustomText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.onboarding_option_dark,
                      borderColor: colors.onboarding_gray,
                    },
                  ]}
                  value={budget.min.toString()}
                  onChangeText={handleMinInputChange}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </CustomView>
            </CustomView>

            <CustomView style={styles.inputGroup}>
              <CustomText
                style={[styles.label, { color: colors.gray_regular }]}
              >
                Maximum
              </CustomText>
              <CustomView style={styles.inputWrapper}>
                <CustomText
                  style={[styles.dollarSign, { color: colors.label_dark }]}
                >
                  $
                </CustomText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.onboarding_option_dark,
                      borderColor: colors.onboarding_gray,
                    },
                  ]}
                  value={budget.max.toString()}
                  onChangeText={handleMaxInputChange}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </CustomView>
            </CustomView>
          </CustomView>
        </CustomView>
      </CustomView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  sliderContainer: {
    flex: 1,
    alignItems: "center",
    width: "100%",
  },
  sliderTrack: {
    width: 272,
    height: 8,
    borderRadius: 4,
    position: "relative",
    marginTop: verticalScale(70),
    marginBottom: verticalScale(20),
  },
  activeRange: {
    height: 8,
    borderRadius: 3,
    position: "absolute",
    top: 0,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 48,
    position: "absolute",
    top: -7,
  },
  label: {
    fontSize: scaleFontSize(12),
    textAlign: "center",
    marginBottom: verticalScale(8),
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 272,
  },
  inputGroup: {
    alignItems: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 60,
    borderColor: "#D6D6D9",
  },
  dollarSign: {
    fontSize: scaleFontSize(14),
  },
  input: {
    fontSize: scaleFontSize(14),
    textAlign: "center",
  },
});
