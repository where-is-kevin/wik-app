import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import { OnboardingSearch } from "./OnboardingSearch";
import { OnboardingBlurModal } from "./OnboardingModal";

export interface IndustryTag {
  id: string;
  name: string;
  color: string;
}

export const getIndustryTags = (colors: any): IndustryTag[] => [
  { id: "technology", name: "Technology", color: colors.light_blue },
  { id: "travel-tech", name: "Travel Tech", color: colors.label_dark },
  {
    id: "tourism-hospitality",
    name: "Tourism and Hospitality",
    color: colors.venue_orange,
  },
  { id: "retail", name: "Retail", color: "#9C27B0" },
  { id: "finance", name: "Finance", color: colors.legal_green },
  { id: "healthcare", name: "Healthcare", color: colors.pink },
  { id: "education", name: "Education", color: colors.bordo },
  { id: "manufacturing", name: "Manufacturing", color: "#FF5722" },
  { id: "consulting", name: "Consulting", color: "#607D8B" },
  { id: "media", name: "Media & Entertainment", color: "#795548" },
];

// Generate random colors for custom tags
export const getRandomColor = () => {
  const colors = [
    "#FF9800",
    "#4CAF50",
    "#2196F3",
    "#E91E63",
    "#009688",
    "#FFC107",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Global store for custom industry tags
export const customIndustryStore: { [key: string]: string } = {};

interface OnboardingIndustryModalProps {
  visible: boolean;
  onClose: () => void;
  onIndustrySelect: (industries: string[]) => void;
  selectedIndustries: string[];
}

export const OnboardingIndustryModal: React.FC<
  OnboardingIndustryModalProps
> = ({
  visible,
  onClose,
  onIndustrySelect,
  selectedIndustries = [], // Provide default empty array
}) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSelectedIndustries, setTempSelectedIndustries] = useState<string[]>(selectedIndustries || []);

  // Sync temp state when modal becomes visible or selectedIndustries changes
  useEffect(() => {
    if (visible) {
      setTempSelectedIndustries(selectedIndustries || []);
    }
  }, [visible, selectedIndustries]);

  const industryTags = getIndustryTags(colors);
  const filteredTags = industryTags.filter((tag: IndustryTag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if search query doesn't match any existing tags and is not empty
  const hasCustomOption =
    searchQuery.trim().length > 0 &&
    !industryTags.some(
      (tag) => tag.name.toLowerCase() === searchQuery.toLowerCase().trim()
    ) &&
    !tempSelectedIndustries.includes(searchQuery.trim());

  const handleTagPress = (tag: IndustryTag) => {
    const isSelected = tempSelectedIndustries.includes(tag.name);
    let newSelection: string[];

    if (isSelected) {
      newSelection = tempSelectedIndustries.filter((item) => item !== tag.name);
    } else {
      newSelection = [...tempSelectedIndustries, tag.name];
    }

    setTempSelectedIndustries(newSelection);
  };

  const handleCustomTagPress = () => {
    const customTagName = searchQuery.trim();
    if (customTagName && !tempSelectedIndustries.includes(customTagName)) {
      // Store color for this custom tag
      if (!customIndustryStore[customTagName]) {
        customIndustryStore[customTagName] = getRandomColor();
      }

      const newSelection = [...tempSelectedIndustries, customTagName];
      setTempSelectedIndustries(newSelection);
      setSearchQuery(""); // Clear search after adding custom tag
    }
  };

  const handleDone = () => {
    onIndustrySelect(tempSelectedIndustries);
    onClose();
  };

  // Get color for selected industry (predefined or custom)
  const getIndustryColor = (industryName: string): string => {
    const predefinedTag = industryTags.find((tag) => tag.name === industryName);

    if (predefinedTag) {
      return predefinedTag.color;
    }

    // For custom tags, use stored color or generate new one
    if (!customIndustryStore[industryName]) {
      customIndustryStore[industryName] = getRandomColor();
    }

    return customIndustryStore[industryName];
  };

  return (
    <OnboardingBlurModal
      visible={visible}
      onClose={onClose}
      title="Select Industry"
    >
      <CustomView style={styles.container}>
        {/* Search Input */}
        <OnboardingSearch
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Industry"
          autoFocus={false}
          autoCorrect={false}
          spellCheck={false}
          showIcon={true}
          customStyles={{ marginBottom: verticalScale(16) }}
        />

        {/* Tags Container */}
        <ScrollView
          style={styles.tagsContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <CustomView style={styles.tagsGrid}>
            {/* Show custom tag option first if available */}
            {hasCustomOption && (
              <TouchableOpacity
                style={[
                  styles.tagButton,
                  styles.customTagButton,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.light_blue,
                    borderStyle: "dashed",
                  },
                ]}
                onPress={handleCustomTagPress}
              >
                <CustomText
                  style={[styles.tagText, { color: colors.light_blue }]}
                >
                  + Add "{searchQuery.trim()}"
                </CustomText>
              </TouchableOpacity>
            )}

            {/* Show existing filtered tags */}
            {filteredTags.map((tag: IndustryTag) => {
              const isSelected = tempSelectedIndustries.includes(tag.name);
              return (
                <TouchableOpacity
                  key={tag.id}
                  style={[
                    styles.tagButton,
                    {
                      backgroundColor: isSelected
                        ? tag.color
                        : colors.background,
                      borderColor: tag.color,
                    },
                  ]}
                  onPress={() => handleTagPress(tag)}
                >
                  <CustomText
                    style={[
                      styles.tagText,
                      {
                        color: isSelected ? "#FFFFFF" : tag.color,
                      },
                    ]}
                  >
                    {tag.name}
                  </CustomText>
                </TouchableOpacity>
              );
            })}

            {/* Show selected custom industries */}
            {tempSelectedIndustries
              .filter(
                (industry) => !industryTags.some((tag) => tag.name === industry)
              )
              .filter(
                (industry) =>
                  searchQuery.length === 0 ||
                  industry.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((industry, index) => (
                <TouchableOpacity
                  key={`custom-${index}`}
                  style={[
                    styles.tagButton,
                    {
                      backgroundColor: getIndustryColor(industry),
                      borderColor: getIndustryColor(industry),
                    },
                  ]}
                  onPress={() => {
                    const newSelection = tempSelectedIndustries.filter(
                      (item) => item !== industry
                    );
                    setTempSelectedIndustries(newSelection);
                  }}
                >
                  <CustomText style={[styles.tagText, { color: "#FFFFFF" }]}>
                    {industry}
                  </CustomText>
                </TouchableOpacity>
              ))}
          </CustomView>
        </ScrollView>
      </CustomView>

      {/* Done Button - Fixed at bottom */}
      {tempSelectedIndustries.length > 0 && (
        <CustomView style={styles.doneButtonContainer}>
          <TouchableOpacity
            style={[styles.doneButton, { backgroundColor: colors.lime }]}
            onPress={handleDone}
          >
            <CustomText
              fontFamily="Inter-SemiBold"
              style={[styles.doneButtonText, { color: colors.label_dark }]}
            >
              Done ({tempSelectedIndustries.length})
            </CustomText>
          </TouchableOpacity>
        </CustomView>
      )}
    </OnboardingBlurModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tagsContainer: {
    flex: 1,
    width: "100%",
  },
  tagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    // paddingVertical: verticalScale(8),
  },
  tagButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(8),
    marginRight: horizontalScale(8),
    marginBottom: verticalScale(8),
  },
  customTagButton: {
    borderWidth: 2,
  },
  tagText: {
    fontSize: scaleFontSize(14),
    fontWeight: "500",
  },
  doneButtonContainer: {
    paddingTop: verticalScale(16),
    paddingHorizontal: 0,
    width: "100%",
  },
  doneButton: {
    borderRadius: 8,
    paddingVertical: verticalScale(12),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(20),
  },
  doneButtonText: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
  },
});
