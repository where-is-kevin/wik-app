import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomText from "@/components/CustomText";
import AnimatedLoader from "@/components/Loader/AnimatedLoader";
import {
  verticalScale,
  horizontalScale,
  scaleFontSize,
} from "@/utilities/scaling";

interface MapLoadingStateProps {
  onBack: () => void;
  source: string;
  locationLoading: boolean;
  locationError: string | null;
}

const MapLoadingState: React.FC<MapLoadingStateProps> = ({
  onBack,
  source,
  locationLoading,
  locationError,
}) => {
  const insets = useSafeAreaInsets();
  const topPosition =
    insets.top < 30 ? insets.top + verticalScale(10) : insets.top;

  const getLoadingMessage = () => {
    if (source === "content" && locationLoading) {
      return "Getting location...";
    }
    return `Loading ${source}...`;
  };

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
        <AnimatedLoader />

        {source === "content" && locationError && (
          <CustomText style={styles.errorText} fontFamily="Inter-Regular">
            Using default location
          </CustomText>
        )}
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
  loadingText: {
    fontSize: scaleFontSize(16),
    color: "#666",
    marginTop: verticalScale(20),
    textAlign: "center",
  },
  errorText: {
    fontSize: scaleFontSize(12),
    marginTop: verticalScale(8),
    color: "#666",
    textAlign: "center",
  },
});

export default MapLoadingState;
