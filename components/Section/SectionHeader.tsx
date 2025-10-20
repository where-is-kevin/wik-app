import React from "react";
import { View, StyleSheet } from "react-native";
import CustomText from "@/components/CustomText";
import { ViewAllButton } from "@/components/Button/ViewAllButton";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  verticalScale,
  scaleFontSize,
} from "@/utilities/scaling";

interface SectionHeaderProps {
  title: string;
  showViewAll?: boolean;
  onViewAllPress?: () => void;
  viewAllText?: string;
  style?: any;
  titleStyle?: any;
  containerStyle?: any;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  showViewAll = false,
  onViewAllPress,
  viewAllText = "View all",
  style,
  titleStyle,
  containerStyle,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.headerRow, style]}>
        <CustomText
          fontFamily="Inter-Bold"
          style={[
            styles.title,
            { color: colors.label_dark },
            titleStyle,
          ]}
        >
          {title}
        </CustomText>
        {showViewAll && onViewAllPress && (
          <ViewAllButton
            onPress={onViewAllPress}
            text={viewAllText}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(12),
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: scaleFontSize(20),
  },
});