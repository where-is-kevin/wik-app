import React, { useState } from "react";
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
import {
  ExpertiseTag,
  getExpertiseTags,
  getExpertiseColor,
} from "./ExpertiseTagsStore";

interface OnboardingExpertiseModalProps {
  visible: boolean;
  onClose: () => void;
  onExpertiseSelect: (expertise: string[]) => void;
  selectedExpertise: string[];
}

export const OnboardingExpertiseModal: React.FC<
  OnboardingExpertiseModalProps
> = ({ visible, onClose, onExpertiseSelect, selectedExpertise }) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const baseTags = getExpertiseTags(colors);

  // Create custom tags from selected expertise that aren't in base tags
  const customTags: ExpertiseTag[] = selectedExpertise
    .filter((expertise) => !baseTags.some((tag) => tag.name === expertise))
    .map((expertise) => ({
      id: `custom-${expertise}`,
      name: expertise,
      color: getExpertiseColor(expertise, colors),
    }));

  // Combine base tags with custom tags
  const allTags = [...baseTags, ...customTags];

  const filteredTags = allTags.filter((tag: ExpertiseTag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if search query doesn't match any existing tags and is not empty
  const hasCustomOption =
    searchQuery.trim().length > 0 &&
    !allTags.some(
      (tag) => tag.name.toLowerCase() === searchQuery.toLowerCase().trim()
    ) &&
    !selectedExpertise.includes(searchQuery.trim());

  const handleTagPress = (tag: ExpertiseTag) => {
    const isSelected = selectedExpertise.includes(tag.name);
    let newSelection: string[];

    if (isSelected) {
      newSelection = selectedExpertise.filter((item) => item !== tag.name);
    } else {
      newSelection = [...selectedExpertise, tag.name];
    }

    onExpertiseSelect(newSelection);
  };

  const handleCustomTagPress = () => {
    const customTagName = searchQuery.trim();
    if (customTagName && !selectedExpertise.includes(customTagName)) {
      // This will automatically store the color in the shared store
      getExpertiseColor(customTagName, colors);

      // Add to selection
      const newSelection = [...selectedExpertise, customTagName];
      onExpertiseSelect(newSelection);
      setSearchQuery(""); // Clear search after adding custom tag
    }
  };

  const handleDone = () => {
    onClose();
  };

  return (
    <OnboardingBlurModal
      visible={visible}
      onClose={onClose}
      title="Areas of Expertise"
    >
      <CustomView style={styles.container}>
        {/* Search Input */}
        <OnboardingSearch
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Areas of Expertise"
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
            {filteredTags.map((tag: ExpertiseTag) => {
              const isSelected = selectedExpertise.includes(tag.name);
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
          </CustomView>
        </ScrollView>

        {/* Done Button */}
        {selectedExpertise.length > 0 && (
          <CustomView style={styles.doneButtonContainer}>
            <TouchableOpacity
              style={[styles.doneButton, { backgroundColor: colors.lime }]}
              onPress={handleDone}
            >
              <CustomText
                fontFamily="Inter-SemiBold"
                style={[styles.doneButtonText, { color: colors.label_dark }]}
              >
                Done ({selectedExpertise.length})
              </CustomText>
            </TouchableOpacity>
          </CustomView>
        )}
      </CustomView>
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
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
  },
  doneButton: {
    borderRadius: 8,
    paddingVertical: verticalScale(12),
    alignItems: "center",
    justifyContent: "center",
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: scaleFontSize(16),
    fontWeight: "600",
  },
});
