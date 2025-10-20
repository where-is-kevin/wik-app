import React, {
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import { OnboardingSearch } from "../Onboarding/OnboardingSearch";
import NextButton from "../Button/NextButton";

// Recent tags for event creation
const RECENT_TAGS = [
  "Software Development",
  "Product Design",
  "Mixer",
  "AI",
  "Tech",
  "Founders",
  "Networking",
  "Startup",
  "Innovation",
  "Web3",
];

export interface CreateTagsModalRef {
  present: () => void;
  dismiss: () => void;
}

interface CreateTagsModalProps {
  onClose?: () => void;
  onSave: (tags: string) => void;
  initialValue?: string;
}

export const CreateTagsModal = forwardRef<
  CreateTagsModalRef,
  CreateTagsModalProps
>(({ onClose, onSave, initialValue = "" }, ref) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialValue ? initialValue.split(", ").filter((tag) => tag.trim()) : []
  );
  const [isVisible, setIsVisible] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  useImperativeHandle(
    ref,
    () => ({
      present: () => {
        setSelectedTags(
          initialValue
            ? initialValue.split(", ").filter((tag) => tag.trim())
            : []
        );
        setSearchQuery("");
        setIsVisible(true);
      },
      dismiss: () => {
        setIsVisible(false);
      },
    }),
    [initialValue]
  );

  const filteredTags = RECENT_TAGS.filter((tag) =>
    tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((item) => item !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleAddCustomTag = () => {
    if (searchQuery.trim() && !selectedTags.includes(searchQuery.trim())) {
      setSelectedTags((prev) => [...prev, searchQuery.trim()]);
      setSearchQuery("");
    }
  };

  const handleContinue = useCallback(() => {
    const tagsString = selectedTags.join(", ");
    onSave(tagsString);
    setIsVisible(false);
  }, [selectedTags, onSave]);

  const handleCancel = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    onClose?.();
  }, [onClose]);

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      onRequestClose={handleClose}
      transparent={true}
      statusBarTranslucent
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleCancel}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View
            style={[styles.content, { backgroundColor: colors.background }]}
          >
            {/* Header */}
            <View style={styles.header}>
              <CustomText
                fontFamily="Inter-SemiBold"
                style={[styles.titleText, { color: colors.label_dark }]}
              >
                Add Tags
              </CustomText>
              <TouchableOpacity
                onPress={handleCancel}
                style={styles.cancelButton}
                activeOpacity={0.7}
              >
                <CustomText
                  fontFamily="Inter-SemiBold"
                  style={[styles.cancelText, { color: colors.light_blue }]}
                >
                  Cancel
                </CustomText>
              </TouchableOpacity>
            </View>

            <CustomView style={styles.container}>
              {/* Search Input */}
              <OnboardingSearch
                ref={searchInputRef}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Eg. Founders, Mixer, Chill"
                autoFocus={false}
                autoCorrect={false}
                spellCheck={false}
                showIcon={true}
                customStyles={{
                  marginBottom: verticalScale(8),
                }}
              />

              {/* Add Custom Tag Button */}
              {searchQuery.trim() &&
                !filteredTags.some(
                  (tag) => tag.toLowerCase() === searchQuery.toLowerCase()
                ) && (
                  <TouchableOpacity
                    style={styles.addCustomButton}
                    onPress={handleAddCustomTag}
                    activeOpacity={0.7}
                  >
                    <CustomText
                      style={[
                        styles.addCustomText,
                        { color: colors.light_blue },
                      ]}
                    >
                      Add "{searchQuery.trim()}"
                    </CustomText>
                  </TouchableOpacity>
                )}

              {/* Recent Tags */}
              <ScrollView
                style={styles.resultsContainer}
                contentContainerStyle={{ paddingBottom: verticalScale(20) }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Show all available tags (recent + custom) */}
                <CustomView style={styles.recentTagsSection}>
                  <CustomText
                    style={[
                      styles.sectionTitle,
                      { color: "#6F6F76" },
                    ]}
                  >
                    Recent tags
                  </CustomText>
                  <CustomView style={styles.tagsGrid}>
                    {/* Show custom tags that aren't in recent tags */}
                    {selectedTags
                      .filter(tag => !filteredTags.includes(tag))
                      .map((tag) => (
                        <TouchableOpacity
                          key={tag}
                          style={[
                            styles.tagButton,
                            {
                              backgroundColor: colors.light_blue,
                              borderColor: colors.light_blue,
                            },
                          ]}
                          onPress={() => handleToggleTag(tag)}
                          activeOpacity={0.7}
                        >
                          <CustomText
                            style={[
                              styles.tagText,
                              { color: "#FFFFFF" }
                            ]}
                          >
                            {tag} ×
                          </CustomText>
                        </TouchableOpacity>
                      ))}

                    {/* Show recent tags */}
                    {filteredTags.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <TouchableOpacity
                          key={tag}
                          style={[
                            styles.tagButton,
                            {
                              backgroundColor: isSelected
                                ? colors.light_blue
                                : colors.background,
                              borderColor: isSelected
                                ? colors.light_blue
                                : "#131314",
                            },
                          ]}
                          onPress={() => handleToggleTag(tag)}
                          activeOpacity={0.7}
                        >
                          <CustomText
                            style={[
                              styles.tagText,
                              {
                                color: isSelected
                                  ? "#FFFFFF"
                                  : colors.label_dark,
                              },
                            ]}
                          >
                            {tag}{isSelected ? " ×" : ""}
                          </CustomText>
                        </TouchableOpacity>
                      );
                    })}
                  </CustomView>
                </CustomView>

                {filteredTags.length === 0 && searchQuery.length > 0 && (
                  <CustomView style={styles.noResultsContainer}>
                    <CustomText
                      style={[
                        styles.noResultsText,
                        { color: colors.gray_regular },
                      ]}
                    >
                      No matching tags found
                    </CustomText>
                  </CustomView>
                )}
              </ScrollView>

              {/* Continue Button */}
              <CustomView
                style={[
                  styles.buttonContainer,
                  { paddingBottom: insets.bottom + 20 },
                ]}
              >
                <NextButton
                  title="Continue"
                  onPress={handleContinue}
                  bgColor={colors.lime}
                  customTextStyle={{ fontSize: scaleFontSize(16) }}
                />
              </CustomView>
            </CustomView>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
});

CreateTagsModal.displayName = "CreateTagsModal";

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    height: "60%",
  },
  content: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(16),
  },
  titleText: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
  },
  cancelButton: {},
  cancelText: {
    fontSize: scaleFontSize(16),
    color: "#007AFF",
  },
  container: {
    flex: 1,
  },
  resultsContainer: {
    flex: 1,
    width: "100%",
  },
  sectionContainer: {
    marginBottom: verticalScale(20),
  },
  recentTagsSection: {
    marginBottom: verticalScale(20),
    marginTop: verticalScale(12), // More space on top
  },
  sectionTitle: {
    fontSize: scaleFontSize(12),
    marginBottom: verticalScale(12),
  },
  addCustomButton: {
    paddingVertical: verticalScale(8),
    marginBottom: verticalScale(16),
  },
  addCustomText: {
    fontSize: scaleFontSize(14),
    fontFamily: "Inter-Medium",
  },
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(20),
  },
  noResultsText: {
    fontSize: scaleFontSize(14),
    textAlign: "center",
    fontFamily: "Inter-Regular",
  },
  buttonContainer: {
    paddingTop: verticalScale(10),
  },
  tagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: horizontalScale(10),
  },
  tagButton: {
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(5),
    marginBottom: verticalScale(8),
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#131314",
  },
  tagText: {
    fontSize: scaleFontSize(14),
    fontFamily: "Inter-Medium",
  },
});
