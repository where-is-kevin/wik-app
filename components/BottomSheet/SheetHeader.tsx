import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { scaleFontSize, verticalScale } from "@/utilities/scaling";

interface SheetHeaderProps {
  title: string;
}

// Separate component for header to prevent re-renders
const SheetHeader: React.FC<SheetHeaderProps> = ({ title }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginTop: verticalScale(4),
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: scaleFontSize(16),
    fontFamily: "Inter-SemiBold",
    color: "#131314",
  },
});

export default React.memo(SheetHeader);