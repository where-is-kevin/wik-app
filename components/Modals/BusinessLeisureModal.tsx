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
import CheckboxSvg from "@/components/SvgComponents/CheckboxSvg";

interface BusinessLeisureModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (selections: string[]) => void;
  selectedOptions?: string[];
}

const businessLeisureOptions = [
  { value: "Business", label: "Business" },
  { value: "Leisure", label: "Leisure" },
];

export const BusinessLeisureModal: React.FC<BusinessLeisureModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedOptions = [],
}) => {
  const { colors } = useTheme();
  const [tempSelections, setTempSelections] =
    useState<string[]>(selectedOptions);

  const handleToggleOption = (option: string) => {
    setTempSelections((prev) => {
      if (prev.includes(option)) {
        return prev.filter((item) => item !== option);
      } else {
        return [...prev, option];
      }
    });
  };

  const handleContinue = () => {
    onSelect(tempSelections);
    onClose();
  };

  const handleCancel = () => {
    setTempSelections(selectedOptions);
    onClose();
  };

  return (
    <CreateModal
      visible={visible}
      onClose={handleCancel}
      title="Business or Leisure?"
      showCancelButton={true}
      onCancel={handleCancel}
    >
      <CustomView style={styles.container}>
        <CustomView style={styles.optionsContainer}>
          {businessLeisureOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.optionContainer}
              onPress={() => handleToggleOption(option.value)}
              activeOpacity={0.7}
            >
              <CustomView style={styles.checkboxContainer}>
                <CheckboxSvg selected={tempSelections.includes(option.value)} />
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
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    fontSize: scaleFontSize(16),
    marginLeft: horizontalScale(10),
  },
  buttonContainer: {
    marginTop: "auto",
  },
  optionsContainer: {
    marginVertical: verticalScale(15),
    gap: verticalScale(10),
  },
});
