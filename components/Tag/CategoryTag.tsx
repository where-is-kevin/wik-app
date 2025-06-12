import React from "react";
import { StyleSheet } from "react-native";
import CustomView from "@/components/CustomView";
import CustomText from "@/components/CustomText";
import { scaleFontSize } from "@/utilities/scaling";

const getCategoryTagStyles = (category: string, colors: any) => {
  const categoryLower = category.toLowerCase();

  switch (categoryLower) {
    case "experience":
      return {
        backgroundColor: colors.profile_name_black,
        textColor: colors.lime,
      };
    case "venue":
      return {
        backgroundColor: colors.venue_orange,
        textColor: colors.bordo,
      };
    case "event":
      return {
        backgroundColor: colors.bordo,
        textColor: colors.pink,
      };
    default:
      return {
        backgroundColor: colors.gray_light || "#E0E0E0",
        textColor: colors.label_dark || "#333333",
      };
  }
};

interface CategoryTagProps {
  category: string;
  colors: any;
  style?: any;
}

const CategoryTag: React.FC<CategoryTagProps> = ({
  category,
  colors,
  style,
}) => {
  const badgeStyles = getCategoryTagStyles(category, colors);

  return (
    <CustomView
      bgColor={badgeStyles.backgroundColor}
      style={[styles.experienceTag, style]}
    >
      <CustomText
        fontFamily="Inter-SemiBold"
        style={[styles.experienceText, { color: badgeStyles.textColor }]}
      >
        {category.toUpperCase()}
      </CustomText>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  experienceTag: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
  },
  experienceText: {
    fontSize: scaleFontSize(10),
  },
});

export default CategoryTag;
