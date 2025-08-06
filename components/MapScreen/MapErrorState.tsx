import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomText from "@/components/CustomText";
import { horizontalScale, verticalScale, scaleFontSize } from "@/utilities/scaling";

interface MapErrorStateProps {
  onBack: () => void;
  source: string;
}

const MapErrorState: React.FC<MapErrorStateProps> = ({ onBack, source }) => {
  const insets = useSafeAreaInsets();
  const topPosition = insets.top < 30 ? insets.top + verticalScale(10) : insets.top;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.backButton, { top: topPosition }]}
        onPress={onBack}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={28} color="#222" />
      </TouchableOpacity>
      
      <View style={styles.contentContainer}>
        <CustomText style={styles.errorText} fontFamily="Inter-Medium">
          Error loading {source}
        </CustomText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: horizontalScale(20),
  },
  errorText: {
    fontSize: scaleFontSize(16),
    color: "#666",
    textAlign: "center",
  },
});

export default MapErrorState;