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

interface OnboardingTagSlideProps {
  stepData: OnboardingStep;
  selectedIndices: number[];
  onSelection: (index: number) => void;
}

export const OnboardingTagSlide: React.FC<OnboardingTagSlideProps> = ({
  stepData,
  selectedIndices,
  onSelection,
}) => {
  const { colors } = useTheme();

  if (!stepData.tags) return null;

  // Group tags by category
  const groupedTags = stepData.tags.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, typeof stepData.tags>);

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
        {Object.entries(groupedTags).map(([category, tags]) => (
          <CustomView key={category} style={styles.categoryContainer}>
            <CustomText
              fontFamily="Inter-SemiBold"
              style={[
                styles.categoryTitle,
                {
                  color: colors.label_dark,
                  marginLeft: horizontalScale(24),
                },
              ]}
            >
              {category}
            </CustomText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalTagsContainer}
            >
              <CustomView style={styles.threeRowContainer}>
                {/* First row - 4 tags */}
                <CustomView style={styles.tagRow}>
                  {tags.slice(0, 4).map((tag) => {
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
                {/* Second row - 4 tags */}
                {tags.length > 4 && (
                  <CustomView style={styles.tagRow}>
                    {tags.slice(4, 8).map((tag) => {
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
                )}
                {/* Third row - up to 4 tags */}
                {tags.length > 8 && (
                  <CustomView style={styles.tagRow}>
                    {tags.slice(8, 12).map((tag) => {
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
                )}
              </CustomView>
            </ScrollView>
          </CustomView>
        ))}
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
  categoryContainer: {
    marginBottom: verticalScale(20),
  },
  categoryTitle: {
    fontSize: scaleFontSize(16),
    marginBottom: verticalScale(10),
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
