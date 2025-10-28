import React, { useState } from "react";
import { StyleSheet, TextInput, Keyboard, TouchableWithoutFeedback } from "react-native";
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
  const [focusedInput, setFocusedInput] = useState<'min' | 'max' | null>(null);
  const [minInputValue, setMinInputValue] = useState(initialBudget.min.toString());
  const [maxInputValue, setMaxInputValue] = useState(initialBudget.max.toString());

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
    setMinInputValue(newBudget.min.toString());
    setMaxInputValue(newBudget.max.toString());
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
    // Allow any text input but filter to numbers for processing
    setMinInputValue(text);

    // Only allow numeric input for actual value
    const numericText = text.replace(/[^0-9]/g, '');

    if (numericText === '') {
      // Don't update budget if empty, just show empty input
      return;
    }

    const value = parseInt(numericText);
    const clampedValue = Math.max(0, Math.min(value, MAX_VALUE));

    // Ensure min doesn't exceed max
    if (clampedValue <= budget.max) {
      const newBudget = { min: clampedValue, max: budget.max };
      updateBudget(newBudget);
      minThumbPosition.value = valueToPosition(clampedValue) - THUMB_SIZE / 2;
    } else {
      // If min would exceed max, set max to be equal to min
      const newBudget = { min: clampedValue, max: clampedValue };
      updateBudget(newBudget);
      minThumbPosition.value = valueToPosition(clampedValue) - THUMB_SIZE / 2;
      maxThumbPosition.value = valueToPosition(clampedValue) - THUMB_SIZE / 2;
    }
  };

  const handleMaxInputChange = (text: string) => {
    // Allow any text input but filter to numbers for processing
    setMaxInputValue(text);

    // Only allow numeric input for actual value
    const numericText = text.replace(/[^0-9]/g, '');

    if (numericText === '') {
      // Don't update budget if empty, just show empty input
      return;
    }

    const value = parseInt(numericText);
    const clampedValue = Math.max(0, Math.min(value, MAX_VALUE));

    // Ensure max doesn't go below min
    if (clampedValue >= budget.min) {
      const newBudget = { min: budget.min, max: clampedValue };
      updateBudget(newBudget);
      maxThumbPosition.value = valueToPosition(clampedValue) - THUMB_SIZE / 2;
    } else {
      // If max would go below min, set min to be equal to max
      const newBudget = { min: clampedValue, max: clampedValue };
      updateBudget(newBudget);
      minThumbPosition.value = valueToPosition(clampedValue) - THUMB_SIZE / 2;
      maxThumbPosition.value = valueToPosition(clampedValue) - THUMB_SIZE / 2;
    }
  };

  const handleMinBlur = () => {
    setFocusedInput(null);
    // Ensure valid value on blur
    if (minInputValue === '' || parseInt(minInputValue) === 0) {
      setMinInputValue(budget.min.toString());
    }
  };

  const handleMaxBlur = () => {
    setFocusedInput(null);
    // Ensure valid value on blur
    if (maxInputValue === '' || parseInt(maxInputValue) === 0) {
      setMaxInputValue(budget.max.toString());
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setFocusedInput(null);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
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
              <CustomView style={[
                styles.inputWrapper,
                {
                  borderColor: focusedInput === 'min' ? colors.light_blue : colors.onboarding_gray,
                }
              ]}>
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
                    },
                  ]}
                  value={minInputValue}
                  onChangeText={handleMinInputChange}
                  onFocus={() => setFocusedInput('min')}
                  onBlur={handleMinBlur}
                  onSubmitEditing={dismissKeyboard}
                  returnKeyType="done"
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
              <CustomView style={[
                styles.inputWrapper,
                {
                  borderColor: focusedInput === 'max' ? colors.light_blue : colors.onboarding_gray,
                }
              ]}>
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
                    },
                  ]}
                  value={maxInputValue}
                  onChangeText={handleMaxInputChange}
                  onFocus={() => setFocusedInput('max')}
                  onBlur={handleMaxBlur}
                  onSubmitEditing={dismissKeyboard}
                  returnKeyType="done"
                  keyboardType="numeric"
                  maxLength={3}
                />
              </CustomView>
            </CustomView>
          </CustomView>
        </CustomView>
      </CustomView>
      </TouchableWithoutFeedback>
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
