import React, { useState, useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import CustomText from "../CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  verticalScale,
  scaleFontSize,
} from "@/utilities/scaling";
import { Ionicons } from "@expo/vector-icons";

export type EventType = "nearby" | "worldwide";

interface EventTypeDropdownProps {
  selectedType: EventType;
  onTypeChange: (type: EventType) => void;
  location?: string;
}

export const EventTypeDropdown: React.FC<EventTypeDropdownProps> = ({
  selectedType,
  onTypeChange,
  location = "Your area",
}) => {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const buttonRef = useRef<View>(null);

  const options = [
    { value: "nearby" as EventType, label: "Major events nearby" },
    { value: "worldwide" as EventType, label: "Major events worldwide" },
  ];

  const handlePress = () => {
    if (!isOpen && buttonRef.current) {
      buttonRef.current.measureInWindow((x, y, width, height) => {
        setDropdownPosition({
          top: y + height + 6,
          left: x,
          width: width,
        });
        setIsOpen(true);
      });
    } else {
      setIsOpen(false);
    }
  };

  const handleOptionSelect = (value: EventType) => {
    onTypeChange(value);
    setIsOpen(false);
  };

  const selectedOption = options.find((opt) => opt.value === selectedType);

  return (
    <>
      <View ref={buttonRef}>
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.7}
          style={styles.dropdownButton}
        >
          <View>
            {selectedType === "nearby" && (
              <CustomText
                style={[styles.locationText, { color: colors.event_gray }]}
              >
                {location}
              </CustomText>
            )}
            {selectedType === "worldwide" && (
              <CustomText
                style={[styles.locationText, { color: colors.event_gray }]}
              >
                Global
              </CustomText>
            )}
            <View style={styles.titleContainer}>
              <CustomText
                fontFamily="Inter-Bold"
                style={[styles.titleText, { color: colors.label_dark }]}
              >
                {selectedOption?.label}
              </CustomText>
              <Ionicons
                name={isOpen ? "chevron-up" : "chevron-down"}
                size={16}
                color={colors.event_gray}
                style={styles.chevron}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.dropdownMenu,
                {
                  backgroundColor: "rgba(242, 242, 243, 0.95)",
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                  width: horizontalScale(205),
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 8,
                },
              ]}
            >
              {options.map((option, index) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleOptionSelect(option.value)}
                  style={[
                    styles.option,
                    index === options.length - 1 && styles.lastOption,
                  ]}
                  activeOpacity={0.7}
                >
                  <CustomText
                    style={[
                      styles.optionText,
                      { color: colors.onboarding_option_dark },
                      selectedType === option.value &&
                        styles.selectedOptionText,
                    ]}
                  >
                    {option.label}
                  </CustomText>
                  {selectedType === option.value && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={colors.event_gray}
                      style={styles.checkmark}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: scaleFontSize(16),
    marginBottom: verticalScale(4),
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleText: {
    fontSize: scaleFontSize(16),
  },
  chevron: {
    marginLeft: horizontalScale(4),
  },
  modalOverlay: {
    flex: 1,
  },
  dropdownMenu: {
    position: "absolute",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: verticalScale(10),
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderBottomWidth: 0,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  optionText: {
    fontSize: scaleFontSize(14),
  },
  selectedOptionText: {
    fontWeight: "500",
  },
  checkmark: {
    marginLeft: horizontalScale(8),
  },
});
