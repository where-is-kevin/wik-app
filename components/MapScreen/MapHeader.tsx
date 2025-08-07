import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { horizontalScale, verticalScale } from "@/utilities/scaling";

interface MapHeaderProps {
  onBack: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const MapHeader: React.FC<MapHeaderProps> = ({ onBack, onZoomIn, onZoomOut }) => {
  const insets = useSafeAreaInsets();
  const topPosition = insets.top < 30 ? insets.top + verticalScale(10) : insets.top;

  return (
    <>
      <TouchableOpacity
        style={[styles.backButton, { top: topPosition }]}
        onPress={onBack}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={28} color="#222" />
      </TouchableOpacity>

      <View
        style={[styles.zoomControlsContainer, { top: topPosition }]}
      >
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={onZoomIn}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={20} color="#333" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.zoomButton, styles.zoomButtonSpacing]}
          onPress={onZoomOut}
          activeOpacity={0.7}
        >
          <Ionicons name="remove" size={20} color="#333" />
        </TouchableOpacity>
      </View>
    </>
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
  zoomControlsContainer: {
    position: "absolute",
    right: horizontalScale(16),
    zIndex: 10,
  },
  zoomButton: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: horizontalScale(20),
    width: horizontalScale(40),
    height: horizontalScale(40),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  zoomButtonSpacing: {
    marginTop: verticalScale(6),
  },
});

export default MapHeader;