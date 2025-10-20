// components/ModeHeader.tsx
import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useMode } from "@/contexts/ModeContext";
import CustomText from "../CustomText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomView from "../CustomView";
import { scaleFontSize } from "@/utilities/scaling";
import { useTheme } from "@/contexts/ThemeContext";
import LeisureLogoSvg from "../SvgComponents/LeisureLogoSvg";
import BusinessLogoSvg from "../SvgComponents/BusinessLogoSvg";

const ModeHeader = () => {
  const { mode, setMode } = useMode();
  const { top } = useSafeAreaInsets();
  const { colors } = useTheme();

  const isLeisure = mode === "leisure";
  const isBusiness = mode === "business";

  return (
    <CustomView style={[styles.container, { paddingTop: top }]}>
      {/* Leisure Tab */}
      <TouchableOpacity
        style={[styles.tab]}
        onPress={() => setMode("leisure")}
        activeOpacity={0.7}
      >
        <View style={styles.innerTab}>
          <LeisureLogoSvg style={{ opacity: isLeisure ? 1 : 0.5 }} />
          <CustomText
            fontFamily="Inter-SemiBold"
            style={[
              styles.text,
              {
                color: colors.label_dark,
                opacity: isLeisure ? 1 : 0.5,
              },
            ]}
          >
            Leisure
          </CustomText>
          {isLeisure && (
            <View
              style={[
                styles.activeIndicator,
                {
                  backgroundColor: colors.light_blue,
                  borderTopRightRadius: 12,
                  borderBottomRightRadius: 12,
                },
              ]}
            />
          )}
        </View>
      </TouchableOpacity>

      {/* Business Tab */}
      <TouchableOpacity
        style={[styles.tab]}
        onPress={() => setMode("business")}
        activeOpacity={0.7}
      >
        <View style={styles.innerTab}>
          <BusinessLogoSvg style={{ opacity: isBusiness ? 1 : 0.5 }} />
          <CustomText
            fontFamily="Inter-SemiBold"
            style={[
              styles.text,
              {
                color: colors.label_dark,
                opacity: isBusiness ? 1 : 0.5,
              },
            ]}
          >
            Business
          </CustomText>
          {isBusiness && (
            <View
              style={[
                styles.activeIndicator,
                {
                  backgroundColor: colors.light_blue,
                  borderTopLeftRadius: 12,
                  borderBottomLeftRadius: 12,
                },
              ]}
            />
          )}
        </View>
      </TouchableOpacity>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
  },
  tab: {
    width: "50%",
  },
  innerTab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 5,
    paddingBottom: 10,
    borderBottomWidth: 5,
    borderBottomColor: "#D8E0FF",
    position: "relative",
  },
  text: {
    fontSize: scaleFontSize(18),
    marginLeft: 5,
  },
  activeIndicator: {
    position: "absolute",
    bottom: -5,
    left: 0,
    right: 0,
    height: 5,
  },
});

export default ModeHeader;
