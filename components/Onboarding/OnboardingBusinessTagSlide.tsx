import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import { OnboardingTag } from "./OnboardingTag";
import { OnboardingStep } from "@/constants/onboardingSlides";
import { commonOnboardingStyles } from "./OnboardingStyles";

interface OnboardingBusinessTagSlideProps {
  stepData: OnboardingStep;
  selectedIndices: number[];
  onSelection: (index: number) => void;
}

export const OnboardingBusinessTagSlide: React.FC<OnboardingBusinessTagSlideProps> = ({
  stepData,
  selectedIndices,
  onSelection,
}) => {
  const { colors } = useTheme();

  if (!stepData.tags) return null;

  return (
    <CustomView style={styles.tagContent}>
      <CustomText
        fontFamily="Inter-SemiBold"
        style={[
          commonOnboardingStyles.title,
          { color: colors.label_dark, marginHorizontal: horizontalScale(24) },
        ]}
      >
        {stepData.title}
      </CustomText>
      <CustomText
        style={[
          commonOnboardingStyles.subtitle,
          {
            color: colors.gray_regular,
            marginHorizontal: horizontalScale(24),
          },
        ]}
      >
        {stepData.subtitle}
      </CustomText>

      <ScrollView
        style={styles.tagScrollContainer}
        contentContainerStyle={styles.tagContainer}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalTagsContainer}
        >
          <CustomView style={styles.threeRowContainer}>
            {/* Dynamically create rows with 3 tags each */}
            {Array.from({ length: Math.ceil(stepData.tags.length / 3) }, (_, rowIndex) => {
              const startIndex = rowIndex * 3;
              const endIndex = Math.min(startIndex + 3, stepData.tags.length);
              const rowTags = stepData.tags.slice(startIndex, endIndex);

              return (
                <CustomView key={rowIndex} style={styles.tagRow}>
                  {rowTags.map((tag) => {
                    const tagIndex = tag.number - 1;
                    const isSelected = selectedIndices.includes(tagIndex);
                    const selectionOrder = isSelected
                      ? selectedIndices.indexOf(tagIndex) + 1
                      : tag.number;

                    return (
                      <OnboardingTag
                        key={tag.number}
                        number={selectionOrder}
                        text={tag.text}
                        icon={tag.icon}
                        selected={isSelected}
                        onPress={() => onSelection(tagIndex)}
                      />
                    );
                  })}
                </CustomView>
              );
            })}
          </CustomView>
        </ScrollView>
      </ScrollView>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  tagContent: {
    flex: 1,
    alignItems: "center",
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(20),
  },
  tagScrollContainer: {
    flex: 1,
    width: "100%",
  },
  tagContainer: {
    width: "100%",
    paddingTop: verticalScale(20),
  },
  horizontalTagsContainer: {
    paddingHorizontal: horizontalScale(24),
  },
  threeRowContainer: {
    flexDirection: "column",
  },
  tagRow: {
    flexDirection: "row",
    marginBottom: verticalScale(8),
    gap: horizontalScale(8),
  },
});