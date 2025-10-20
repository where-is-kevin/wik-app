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

// Industry options for event creation
const INDUSTRY_OPTIONS = [
  { id: "ai", name: "AI", color: "#FF6B35" },
  { id: "tech", name: "Tech", color: "#4A90E2" },
  { id: "cpg", name: "CPG", color: "#2C3E50" },
  { id: "biotech", name: "Biotech", color: "#E91E63" },
  { id: "skincare", name: "Skincare and Cosmetics", color: "#8B4A8C" },
  { id: "finance", name: "Finance", color: "#2ECC71" },
  { id: "healthcare", name: "Healthcare", color: "#EC407A" },
  { id: "education", name: "Education", color: "#9C27B0" },
  { id: "retail", name: "Retail", color: "#5C6BC0" },
  { id: "media", name: "Media & Entertainment", color: "#795548" },
  { id: "realestate", name: "Real Estate", color: "#607D8B" },
  { id: "travel", name: "Travel & Hospitality", color: "#FF9800" },
];

export interface IndustryCreateModalRef {
  present: () => void;
  dismiss: () => void;
}

interface IndustryCreateModalProps {
  onClose?: () => void;
  onSave: (industry: string) => void;
  selectedIndustry?: string;
}

export const IndustryCreateModal = forwardRef<
  IndustryCreateModalRef,
  IndustryCreateModalProps
>(({ onClose, onSave, selectedIndustry = "" }, ref) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState(selectedIndustry);
  const [isVisible, setIsVisible] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  useImperativeHandle(
    ref,
    () => ({
      present: () => {
        setSelected(selectedIndustry || "");
        setSearchQuery("");
        setIsVisible(true);
      },
      dismiss: () => {
        setIsVisible(false);
      },
    }),
    [selectedIndustry]
  );

  const filteredOptions = INDUSTRY_OPTIONS.filter((option) =>
    option.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (industry: string) => {
    setSelected(industry);
  };

  const handleContinue = useCallback(() => {
    if (selected) {
      onSave(selected);
      setIsVisible(false);
    }
  }, [selected, onSave]);

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
                Select Industry
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
                placeholder="Start typing and select..."
                autoFocus={false}
                autoCorrect={false}
                spellCheck={false}
                showIcon={true}
                customStyles={{
                  marginBottom: verticalScale(8),
                }}
              />

              {/* Industry Options */}
              <ScrollView
                style={styles.resultsContainer}
                contentContainerStyle={{ paddingBottom: verticalScale(20) }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {filteredOptions.length > 0 ? (
                  <CustomView style={styles.optionsGrid}>
                    {filteredOptions.map((option) => {
                      const isSelected = selected === option.name;
                      return (
                        <TouchableOpacity
                          key={option.id}
                          style={[
                            styles.optionButton,
                            {
                              backgroundColor: isSelected
                                ? option.color
                                : colors.background,
                              borderColor: option.color,
                            },
                          ]}
                          onPress={() => handleSelect(option.name)}
                          activeOpacity={0.7}
                        >
                          <CustomText
                            style={[
                              styles.optionText,
                              {
                                color: isSelected ? "#FFFFFF" : option.color,
                              },
                            ]}
                          >
                            {option.name}
                          </CustomText>
                        </TouchableOpacity>
                      );
                    })}
                  </CustomView>
                ) : (
                  <CustomView style={styles.noResultsContainer}>
                    <CustomText
                      style={[
                        styles.noResultsText,
                        { color: colors.gray_regular },
                      ]}
                    >
                      No industries found
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
                  disabled={!selected}
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

IndustryCreateModal.displayName = "IndustryCreateModal";

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
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingTop: verticalScale(10),
  },
  optionButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(8),
    marginRight: horizontalScale(8),
    marginBottom: verticalScale(8),
  },
  optionText: {
    fontSize: scaleFontSize(14),
    fontFamily: "Inter-Medium",
  },
});
