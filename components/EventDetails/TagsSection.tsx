import React from "react";
import { View, StyleSheet } from "react-native";
import CustomText from "@/components/CustomText";
import CustomView from "@/components/CustomView";
import { useTheme } from "@/contexts/ThemeContext";
import { verticalScale, horizontalScale, scaleFontSize } from "@/utilities/scaling";
import { formatTags } from "@/utilities/formatTags";
import { trimString } from "@/utilities/stringHelpers";

interface TagsSectionProps {
  tags?: string;
}

export const TagsSection: React.FC<TagsSectionProps> = ({ tags }) => {
  const { colors } = useTheme();

  if (!tags || !trimString(tags)) return null;

  return (
    <CustomView style={styles.section}>
      <CustomText
        fontFamily="Inter-SemiBold"
        style={[styles.sectionTitle, { color: colors.label_dark }]}
      >
        Tags
      </CustomText>
      <View style={styles.sectionDivider} />
      <View style={styles.tagsContainer}>
        {formatTags(tags).map((tag, index) => (
          <View key={index} style={styles.tagPill}>
            <CustomText style={[styles.tagText, { color: colors.label_dark }]}>
              {tag}
            </CustomText>
          </View>
        ))}
      </View>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingVertical: verticalScale(16),
  },
  sectionDivider: {
    height: 0.5,
    backgroundColor: "#D6D6D9",
    marginTop: verticalScale(10),
    marginBottom: verticalScale(14),
  },
  sectionTitle: {
    fontSize: scaleFontSize(14),
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: horizontalScale(10),
  },
  tagPill: {
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(5),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#131314",
    backgroundColor: "transparent",
  },
  tagText: {
    fontSize: scaleFontSize(14),
  },
});