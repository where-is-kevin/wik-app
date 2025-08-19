import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { horizontalScale, verticalScale } from "@/utilities/scaling";

interface MapHeaderProps {
  onBack: () => void;
}

const MapHeader: React.FC<MapHeaderProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const topPosition = insets.top < 30 ? insets.top + verticalScale(10) : insets.top;

  return (
    <TouchableOpacity
      style={[styles.backButton, { top: topPosition }]}
      onPress={onBack}
      activeOpacity={0.7}
    >
      <Ionicons name="arrow-back" size={28} color="#222" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    left: horizontalScale(16),
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: horizontalScale(24),
    padding: horizontalScale(8),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default MapHeader;