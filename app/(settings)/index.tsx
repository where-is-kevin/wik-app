import React, { useState } from "react";
import { StyleSheet, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSendFeedback } from "@/hooks/useFeedback";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomView from "@/components/CustomView";
import CustomText from "@/components/CustomText";
import CustomTouchable from "@/components/CustomTouchableOpacity";
import BackHeader from "@/components/Header/BackHeader";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  verticalScale,
  scaleFontSize,
} from "@/utilities/scaling";
import CustomTextInput from "@/components/TextInput/CustomTextInput";
import NextButton from "@/components/Button/NextButton";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const FeedbackForm = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const [rating, setRating] = useState(0);
  const [likes, setLikes] = useState<string[]>([]);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");

  const sendFeedback = useSendFeedback();

  const likeOptions = [
    "Easy to use",
    "Complete",
    "Helpful",
    "Convenient",
    "Looks good",
  ];
  const improvementOptions = [
    "Could have more components",
    "Complex",
    "Not interactive",
    "Only English",
  ];

  // Check if required fields are filled
  const isFormValid = rating > 0 && likes.length > 0;

  const toggleSelection = (
    option: string,
    selectedList: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (selectedList.includes(option)) {
      setList(selectedList.filter((item) => item !== option));
    } else {
      setList([...selectedList, option]);
    }
  };

  const handleSubmit = () => {
    // Double check validation before submitting
    if (!isFormValid) return;

    const feedbackData = {
      rating,
      likes,
      improvements,
      feedback,
    };

    sendFeedback.mutate(feedbackData, {
      onSuccess: () => {
        setRating(0);
        setLikes([]);
        setImprovements([]);
        setFeedback("");
        Alert.alert("Success", "Your response has successfully been saved!");
      },
      onError: (error) => {
        Alert.alert("Error", "There was an error with saving your response.");
        console.error("Feedback submission error:", error);
      },
    });
  };

  const renderOptionButton = (
    option: string,
    isSelected: boolean,
    onPress: () => void
  ) => (
    <CustomTouchable
      key={option}
      bgColor={isSelected ? colors?.light_blue : colors.onboarding_gray}
      style={[styles.optionButton]}
      onPress={onPress}
    >
      <CustomText
        fontFamily="Inter-SemiBold"
        style={[
          styles.optionText,
          {
            color: isSelected ? colors.text_white : colors?.tag_gray_text,
          },
        ]}
      >
        {option}
      </CustomText>
    </CustomTouchable>
  );

  return (
    <>
      <StatusBar style="dark" translucent />
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <BackHeader title="Feedback" transparent={true} />

        <KeyboardAwareScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          enableOnAndroid={true}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          enableAutomaticScroll={true}
          enableResetScrollToCoords={false}
          scrollEnabled={true}
          bounces={false}
        >
          {/* Title Section */}
          <CustomView style={styles.titleSection}>
            <CustomText
              fontFamily="Inter-SemiBold"
              style={[styles.title, { color: colors?.label_dark }]}
            >
              Rate your experience
            </CustomText>
            <CustomText
              style={[styles.subtitle, { color: colors?.gray_regular }]}
            >
              We here to serve you and improve. Any feedback will help make
              things even better in the future!
            </CustomText>
          </CustomView>

          {/* Rating Section */}
          <CustomView style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <CustomTouchable
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={20}
                  color={colors?.light_blue}
                />
              </CustomTouchable>
            ))}
          </CustomView>

          {/* Likes Section */}
          <CustomView style={styles.section}>
            <CustomText
              fontFamily="Inter-SemiBold"
              style={[styles.sectionTitle, { color: colors?.label_dark }]}
            >
              What did you like about it?
            </CustomText>
            <CustomView style={styles.optionsContainer}>
              {likeOptions.map((option) =>
                renderOptionButton(option, likes.includes(option), () =>
                  toggleSelection(option, likes, setLikes)
                )
              )}
            </CustomView>
          </CustomView>

          {/* Improvements Section */}
          <CustomView style={styles.section}>
            <CustomText
              fontFamily="Inter-SemiBold"
              style={[
                styles.sectionTitle,
                { color: colors?.label_dark || "#000000" },
              ]}
            >
              What could be improved?
            </CustomText>
            <CustomView style={styles.optionsContainer}>
              {improvementOptions.map((option) =>
                renderOptionButton(option, improvements.includes(option), () =>
                  toggleSelection(option, improvements, setImprovements)
                )
              )}
            </CustomView>
          </CustomView>

          {/* Additional Feedback Section */}
          <CustomView style={styles.section}>
            <CustomText
              fontFamily="Inter-SemiBold"
              style={[styles.sectionTitle, { color: colors?.label_dark }]}
            >
              Anything else?
            </CustomText>
            <CustomTextInput
              multiline
              customTextStyles={styles.textArea}
              value={feedback}
              onChangeText={setFeedback}
              fixedHeight={77}
              placeholder="Tell us everything."
            />
          </CustomView>

          <NextButton
            title={sendFeedback.isPending ? "Submitting..." : "Send feedback"}
            onPress={handleSubmit}
            disabled={sendFeedback.isPending || !isFormValid}
            bgColor={colors.lime}
            textColor={colors.label_dark}
            customStyles={[
              styles.submitButton,
              !isFormValid && { opacity: 0.7 },
            ]}
          />
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(12),
  },
  titleSection: {
    marginBottom: verticalScale(20),
  },
  title: {
    fontSize: scaleFontSize(14),
    marginBottom: verticalScale(12),
  },
  subtitle: {
    fontSize: scaleFontSize(14),
    lineHeight: 17.5,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(16),
    gap: horizontalScale(4),
  },
  starButton: {},
  section: {
    marginBottom: verticalScale(16),
  },
  sectionTitle: {
    fontSize: scaleFontSize(14),
    marginBottom: verticalScale(16),
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: horizontalScale(8),
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 12,
  },
  optionText: {
    fontSize: scaleFontSize(11),
    textTransform: "uppercase",
  },
  submitButton: {},
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: scaleFontSize(16),
  },
  textArea: {
    fontSize: scaleFontSize(14),
  },
});

export default FeedbackForm;
