import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import CustomTouchable from "../CustomTouchableOpacity";
import ArrowLeftSvg from "../SvgComponents/ArrowLeftSvg";
import { useRouter } from "expo-router";
import { horizontalScale, verticalScale } from "@/utilities/scaling";
import CustomView from "../CustomView";

interface BackHeaderProps {
  transparent?: boolean;
}

const BackHeader: React.FC<BackHeaderProps> = ({ transparent = false }) => {
  const router = useRouter();

  return (
    <CustomView
      style={[styles.header, transparent && styles.transparentHeader]}
    >
      <View style={styles.buttonContainer}>
        <CustomTouchable onPress={() => router.back()}>
          <ArrowLeftSvg />
        </CustomTouchable>
      </View>
    </CustomView>
  );
};

export default BackHeader;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: horizontalScale(16),
    marginTop: verticalScale(10),
  },
  transparentHeader: {
    backgroundColor: "transparent",
  },
  buttonContainer: {
    alignSelf: "flex-start",
  },
});
