import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, Modal, Dimensions } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import CustomText from "@/components/CustomText";
import CustomView from "@/components/CustomView";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EventsSvg from "@/components/SvgComponents/EventsSvg";
import VenuesSvg from "@/components/SvgComponents/VenuesSvg";
import ExperiencesSvg from "@/components/SvgComponents/ExperiencesSvg";
import NextButton from "@/components/Button/NextButton";
import XButtonSvg from "../SvgComponents/XButtonSvg";

export type FilterType = "events" | "venues" | "experiences";

interface FilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  onApply: (selectedFilters: FilterType[]) => void;
  selectedFilters?: FilterType[];
}

const FilterModal: React.FC<FilterModalProps> = ({
  isVisible,
  onClose,
  onApply,
  selectedFilters = [],
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [localSelectedFilters, setLocalSelectedFilters] =
    useState<FilterType[]>(selectedFilters);

  const filterOptions = [
    {
      id: "events" as FilterType,
      title: "Events",
      icon: EventsSvg,
    },
    {
      id: "venues" as FilterType,
      title: "Venues",
      icon: VenuesSvg,
    },
    {
      id: "experiences" as FilterType,
      title: "Experiences",
      icon: ExperiencesSvg,
    },
  ];

  const handleFilterToggle = (filterId: FilterType) => {
    setLocalSelectedFilters((prev) => {
      if (prev.includes(filterId)) {
        // Don't allow deselecting if it's the last selected filter
        if (prev.length === 1) {
          return prev;
        }
        return prev.filter((id) => id !== filterId);
      } else {
        return [...prev, filterId];
      }
    });
  };

  const handleApply = () => {
    onApply(localSelectedFilters);
    onClose();
  };

  const handleClose = () => {
    setLocalSelectedFilters(selectedFilters);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      {/* Overlay */}
      <CustomView style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={handleClose}
        />
        {/* Modal Content */}
        <CustomView style={styles.modalContainer}>
          {/* Handle */}
          <CustomView style={styles.handle} />
          <CustomView style={styles.container}>
            <CustomView style={styles.header}>
              <CustomText
                fontFamily="Inter-SemiBold"
                style={[styles.title, { color: colors.label_dark }]}
              >
                Filters
              </CustomText>
              <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
                <XButtonSvg />
              </TouchableOpacity>
            </CustomView>

            <CustomView style={styles.filtersContainer}>
              {filterOptions.map((filter) => {
                const isSelected = localSelectedFilters.includes(filter.id);
                return (
                  <CustomView key={filter.id} style={styles.filterWrapper}>
                    <TouchableOpacity
                      style={[
                        styles.filterItem,
                        {
                          borderColor: isSelected
                            ? colors.light_blue || "#007AFF"
                            : colors.input_border || "#E0E0E0",
                          borderWidth: isSelected ? 2 : 1,
                        },
                      ]}
                      onPress={() => handleFilterToggle(filter.id)}
                      activeOpacity={0.7}
                    >
                      <CustomView style={styles.filterIconContainer}>
                        <filter.icon width={40} height={40} />
                      </CustomView>
                    </TouchableOpacity>
                    <CustomText
                      style={[
                        styles.filterTitle,
                        { color: colors.onboarding_option_dark },
                      ]}
                    >
                      {filter.title}
                    </CustomText>
                  </CustomView>
                );
              })}
            </CustomView>

            <NextButton
              title="Apply"
              onPress={handleApply}
              bgColor={colors.lime}
              customTextStyle={{ fontSize: scaleFontSize(12) }}
              customStyles={{ marginVertical: 0 }}
            />
          </CustomView>
        </CustomView>
      </CustomView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  overlayTouchable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    maxHeight: verticalScale(231),
    position: "absolute",
    bottom: verticalScale(25),
    left: horizontalScale(12),
    right: horizontalScale(12),
    overflow: "hidden",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: scaleFontSize(16),
  },
  closeIcon: {
    width: 18,
    height: 18,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    // fontSize: scaleFontSize(18),
    fontWeight: "300",
    color: "#666",
  },
  filtersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  filterWrapper: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: horizontalScale(6),
  },
  filterItem: {
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  filterIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  filterTitle: {
    fontSize: scaleFontSize(10),
    textAlign: "center",
    marginTop: 10,
  },
  buttonContainer: {},
});

export default FilterModal;
