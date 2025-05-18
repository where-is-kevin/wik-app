import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import CustomTouchable from "../CustomTouchableOpacity";
import ArrowLeftSvg from "../SvgComponents/ArrowLeftSvg";
import { useRouter } from "expo-router";
import { horizontalScale, verticalScale } from "@/utilities/scaling";

interface BackHeaderProps {
  transparent?: boolean;
}

const BackHeader: React.FC<BackHeaderProps> = ({ transparent = false }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={[styles.header, transparent && styles.transparentHeader]}
      onPress={() => router.back()}
    >
      <ArrowLeftSvg />
    </TouchableOpacity>
  );
};

export default BackHeader;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: horizontalScale(16),
    paddingTop: verticalScale(10),
    backgroundColor: "white", // Default background
  },
  transparentHeader: {
    backgroundColor: "transparent", // Override when transparent is true
  },
});
