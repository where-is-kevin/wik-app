import React, { useState } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import CustomView from "@/components/CustomView";
import CustomText from "@/components/CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import {
  scaleFontSize,
  verticalScale,
  horizontalScale,
} from "@/utilities/scaling";
import { CreateModal } from "@/components/Modals/CreateModal";
import NextButton from "@/components/Button/NextButton";

interface TypeSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: string) => void;
  selectedType?: string;
}

const typeOptions = [
  { value: "Event", label: "Event" },
  { value: "Experience", label: "Experience" },
];

export const TypeSelectionModal: React.FC<TypeSelectionModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedType,
}) => {
  const { colors } = useTheme();
  const [tempSelection, setTempSelection] = useState(selectedType || "Event");

  const handleContinue = () => {
    onSelect(tempSelection);
    onClose();
  };

  const handleCancel = () => {
    setTempSelection(selectedType || "Event");
    onClose();
  };

  return (
    <CreateModal
      visible={visible}
      onClose={handleCancel}
      title="Type"
      showCancelButton={true}
      onCancel={handleCancel}
    >
      <CustomView style={styles.container}>
        <CustomView style={styles.optionsContainer}>
          {typeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.optionContainer}
              onPress={() => setTempSelection(option.value)}
              activeOpacity={0.7}
            >
              <CustomView style={styles.radioContainer}>
                <CustomView
                  style={[
                    styles.radioOuter,
                    {
                      borderColor:
                        tempSelection === option.value ? "#3C62FA" : "#A3A3A8",
                    },
                  ]}
                >
                  {tempSelection === option.value && (
                    <CustomView
                      style={[
                        styles.radioInner,
                        { backgroundColor: "#3C62FA" },
                      ]}
                    />
                  )}
                </CustomView>
                <CustomText
                  style={[styles.optionText, { color: colors.text_black }]}
                >
                  {option.label}
                </CustomText>
              </CustomView>
            </TouchableOpacity>
          ))}
        </CustomView>

        <CustomView style={styles.buttonContainer}>
          <NextButton
            title="Continue"
            onPress={handleContinue}
            bgColor={colors.lime}
            customTextStyle={{ fontSize: scaleFontSize(16) }}
          />
        </CustomView>
      </CustomView>
    </CreateModal>
  );
};

const styles = StyleSheet.create({
  container: {},
  optionContainer: {
    paddingVertical: 4,
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: horizontalScale(10),
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  optionText: {
    fontSize: scaleFontSize(16),
  },
  buttonContainer: {
    marginTop: "auto",
  },
  optionsContainer: {
    marginVertical: verticalScale(15),
    gap: verticalScale(10),
  },
});
