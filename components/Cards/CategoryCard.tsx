import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomText from "@/components/CustomText";
import AISvg from "@/components/SvgComponents/AISvg";
import BiotechSvg from "@/components/SvgComponents/BiotechSvg";
import {
  horizontalScale,
  verticalScale,
  scaleFontSize,
} from "@/utilities/scaling";

export interface CategoryData {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface CategoryCardProps {
  category: CategoryData;
  onPress: (category: CategoryData) => void;
  style?: any;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onPress,
  style,
}) => {
  const renderIcon = () => {
    switch (category.name) {
      case "AI":
        return <AISvg style={styles.icon} />;
      case "Biotech":
        return <BiotechSvg style={styles.icon} />;
      default:
        return (
          <Ionicons
            name={category.icon as any}
            size={24}
            color="#fff"
            style={styles.icon}
          />
        );
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress(category)}
      activeOpacity={0.8}
    >
      <View style={[styles.content, { backgroundColor: category.color }]}>
        <View style={styles.textIconContainer}>
          <CustomText
            fontFamily="Inter-SemiBold"
            style={[styles.categoryName, { color: "#fff" }]}
          >
            {category.name}
          </CustomText>
          {renderIcon()}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 145,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: horizontalScale(10),
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    padding: horizontalScale(12),
  },
  textIconContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  icon: {
    // marginLeft: horizontalScale(8),
  },
  categoryName: {
    fontSize: scaleFontSize(14),
    flex: 1,
  },
});
