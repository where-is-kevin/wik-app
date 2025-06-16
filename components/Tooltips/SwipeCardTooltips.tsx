import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import LottieView from "lottie-react-native";
import CustomView from "@/components/CustomView";
import CustomText from "@/components/CustomText";
import CustomTouchable from "@/components/CustomTouchableOpacity";
import NextButton from "@/components/Button/NextButton";
import {
  horizontalScale,
  verticalScale,
  scaleFontSize,
} from "@/utilities/scaling";
import { useTheme } from "@/contexts/ThemeContext";
import TapAnimation from "@/assets/animations/tap.json";
import SwipeUpAnimation from "@/assets/animations/swipe-up.json";
import SwipeLeftAnimation from "@/assets/animations/swipe-left.json";
import SwipeRightAnimation from "@/assets/animations/swipe-right.json";

interface SwipeCardTooltipsProps {
  onComplete: () => void;
}

// Define the tutorial steps with animations
const TUTORIAL_STEPS = [
  {
    id: 0,
    animation: SwipeLeftAnimation,
    text: "Swipe left to decline experience",
  },
  {
    id: 1,
    animation: SwipeRightAnimation,
    text: "Swipe right to add experience to calendar ",
  },
  {
    id: 2,
    animation: SwipeUpAnimation,
    text: "Swipe up to open hosts website",
  },
  {
    id: 3,
    animation: TapAnimation,
    text: "Tap to learn more about the experience",
  },
];

const SwipeCardTooltips = ({ onComplete }: SwipeCardTooltipsProps) => {
  const [tutorialStarted, setTutorialStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { colors } = useTheme();

  const handleStartTutorial = () => {
    setTutorialStarted(true);
  };

  const handleSkipTutorial = () => {
    onComplete();
  };

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Tutorial complete
      onComplete();
    }
  };

  // Render initial welcome overlay
  const renderWelcomeOverlay = () => (
    <CustomView bgColor={colors.overlay} style={styles.contentContainer}>
      <CustomText
        style={[styles.headerText, { color: colors.background }]}
        fontFamily="Inter-SemiBold"
      >
        Let's get you ready!
      </CustomText>
      <CustomText style={[styles.subHeaderText, { color: colors.background }]}>
        Here's everything you need to know
      </CustomText>

      <CustomTouchable
        style={styles.startButton}
        bgColor={colors.lime}
        onPress={handleStartTutorial}
      >
        <CustomText
          style={[styles.buttonText, { color: colors.label_dark }]}
          fontFamily="Inter-SemiBold"
        >
          Start tutorial
        </CustomText>
      </CustomTouchable>
      <CustomTouchable
        style={styles.skipButton}
        bgColor={colors.overlay}
        onPress={handleSkipTutorial}
      >
        <CustomText fontFamily="Inter-SemiBold" style={[styles.buttonText, { color: colors.background }]}>
          Skip
        </CustomText>
      </CustomTouchable>
    </CustomView>
  );

  // Render tutorial step with animation
  const renderTutorialStep = () => {
    const step = TUTORIAL_STEPS[currentStep];

    return (
      <CustomView bgColor={colors.overlay} style={styles.contentContainer}>
        <CustomView
          bgColor={colors.overlay}
          style={styles.fixedContentContainer}
        >
          <CustomView
            bgColor={colors.overlay}
            style={styles.animationContainer}
          >
            <LottieView
              source={step.animation}
              autoPlay
              loop
              style={styles.animation}
            />
          </CustomView>

          <CustomView bgColor={colors.overlay} style={styles.textContainer}>
            <CustomText
              style={[styles.tutorialText, { color: colors.background }]}
            >
              {step.text}
            </CustomText>
          </CustomView>

          <NextButton
            onPress={handleNext}
            bgColor={colors.lime}
            title={
              currentStep === TUTORIAL_STEPS.length - 1 ? "Finish" : "Next"
            }
            customStyles={styles.nextButton}
          />
        </CustomView>
      </CustomView>
    );
  };

  return (
    <View style={styles.overlay}>
      {!tutorialStarted ? renderWelcomeOverlay() : renderTutorialStep()}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    zIndex: 1000,
    borderRadius: 16,
    marginBottom: verticalScale(30),
    paddingBottom: verticalScale(16),
  },
  contentContainer: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  fixedContentContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    height: verticalScale(200), // Fixed height container
  },
  headerText: {
    fontSize: scaleFontSize(20),
    textAlign: "center",
    marginBottom: verticalScale(8),
  },
  subHeaderText: {
    fontSize: scaleFontSize(16),
    textAlign: "center",
    marginBottom: verticalScale(24),
  },
  startButton: {
    paddingVertical: 12,
    paddingHorizontal: horizontalScale(32),
    borderRadius: 8,
    alignItems: "center",
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: scaleFontSize(16),
  },
  animationContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  animation: {
    width: horizontalScale(82),
    justifyContent: "center",
    alignItems: "center",
    height: verticalScale(82),
  },
  textContainer: {
    // height: verticalScale(30), // Fixed height for text container
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  tutorialText: {
    fontSize: scaleFontSize(16),
    textAlign: "center",
    maxWidth: "80%",
  },
  nextButton: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: horizontalScale(32),
  },
});

export default SwipeCardTooltips;
