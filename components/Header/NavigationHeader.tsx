import { StyleSheet } from "react-native";
import React from "react";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "../../utilities/scaling";
import CustomText from "../CustomText";
import { useRouter } from "expo-router";
import ArrowLeftSvg from "../SvgComponents/ArrowLeftSvg";
import { useTheme } from "@/contexts/ThemeContext";
import CustomTouchable from "../CustomTouchableOpacity";
import CustomView from "../CustomView";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface NavigationHeaderProps {
  header: string;
  onBackPress?: () => void;
}
const NavigationHeader = ({ header, onBackPress }: NavigationHeaderProps) => {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const isNotchedDevice = insets.top > 30;
  const topPadding = isNotchedDevice ? verticalScale(4) : verticalScale(10);

  const navigateBack = () => {
    if (onBackPress) {
      // Use custom handler if provided
      onBackPress();
    } else {
      // Otherwise use default router navigation
      router.back();
    }
  };

  return (
    <CustomView style={[styles.container, { marginTop: topPadding }]}>
      <CustomTouchable onPress={navigateBack} style={styles.backButton}>
        <ArrowLeftSvg />
      </CustomTouchable>
      <CustomText
        fontFamily="Inter-SemiBold"
        style={[styles.headerText, { color: colors.label_dark }]}
      >
        {header}
      </CustomText>
    </CustomView>
  );
};

export default NavigationHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: horizontalScale(16),
    marginBottom: verticalScale(4),
    pointerEvents: "box-none",
  },
  backButton: {
    zIndex: 1,
  },
  headerText: {
    fontSize: scaleFontSize(16),
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    zIndex: 0,
  },
});
