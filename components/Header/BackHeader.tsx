import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import CustomTouchable from "../CustomTouchableOpacity";
import ArrowLeftSvg from "../SvgComponents/ArrowLeftSvg";
import { useRouter } from "expo-router";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import CustomView from "../CustomView";
import CustomText from "../CustomText";
import { useTheme } from "@/contexts/ThemeContext";

interface BackHeaderProps {
  transparent?: boolean;
  title?: string;
  date?: string;
}

const BackHeader: React.FC<BackHeaderProps> = ({
  transparent = false,
  title,
  date,
}) => {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <CustomView
      style={[styles.header, transparent && styles.transparentHeader]}
    >
      <CustomView bgColor={colors.overlay} style={styles.buttonContainer}>
        <CustomTouchable bgColor={colors.overlay} onPress={() => router.back()}>
          <ArrowLeftSvg />
        </CustomTouchable>
      </CustomView>
      {(title || date) && (
        <CustomView bgColor={colors.overlay} style={styles.titleContainer}>
          {title && (
            <CustomText
              fontFamily="Inter-SemiBold"
              style={[styles.titleText, { color: colors.label_dark }]}
            >
              {title}
            </CustomText>
          )}
          {date && (
            <CustomText
              style={[styles.dateText, { color: colors.gray_regular }]}
            >
              {date}
            </CustomText>
          )}
        </CustomView>
      )}
    </CustomView>
  );
};

export default BackHeader;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: horizontalScale(16),
    marginTop: verticalScale(10),
    alignItems: "center",
    flexDirection: "row",
  },
  transparentHeader: {
    backgroundColor: "transparent",
  },
  buttonContainer: {},
  titleContainer: {
    flex: 1, // Take up remaining space
    justifyContent: "center",
    alignItems: "center",
    marginRight: 30,
  },
  titleText: {
    fontSize: scaleFontSize(16),
    lineHeight: 20,
  },
  dateText: {
    fontSize: scaleFontSize(14),
  },
});
