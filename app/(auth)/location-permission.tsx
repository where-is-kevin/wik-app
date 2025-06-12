// components/LocationPermissionScreen.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useLocation } from "@/contexts/LocationContext";
import { router } from "expo-router";

interface LocationPermissionScreenProps {
  onPermissionGranted?: () => void;
  onSkip?: () => void;
  showSkipOption?: boolean;
}

const LocationPermissionScreen: React.FC<LocationPermissionScreenProps> = ({
  onPermissionGranted,
  onSkip,
  showSkipOption = true,
}) => {
  const { requestLocationPermission, isLoading } = useLocation();

  const navigateToTabs = () => {
    router.replace("/(tabs)");
  };

  const handleRequestPermission = async () => {
    const granted = await requestLocationPermission();

    if (granted) {
      onPermissionGranted?.();
      navigateToTabs();
    } else {
      Alert.alert(
        "Location Access Required",
        "Location access is needed to provide you with relevant content and features. Please enable location access in your device settings.",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => navigateToTabs(), // Navigate even if user cancels
          },
          {
            text: "Open Settings",
            onPress: () => {
              // You can use expo-linking to open settings
              // Linking.openSettings();
              navigateToTabs(); // Navigate after attempting to open settings
            },
          },
        ]
      );
    }
  };

  const handleSkip = () => {
    onSkip?.();
    navigateToTabs();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Enable Location Services</Text>
        <Text style={styles.description}>
          We need access to your location to provide you with personalized
          content and nearby recommendations. Your location data is kept secure
          and private.
        </Text>

        <TouchableOpacity
          style={styles.enableButton}
          onPress={handleRequestPermission}
          disabled={isLoading}
        >
          <Text style={styles.enableButtonText}>
            {isLoading ? "Getting Location..." : "Enable Location"}
          </Text>
        </TouchableOpacity>

        {showSkipOption && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            disabled={isLoading}
          >
            <Text style={styles.skipButtonText}>Skip for Now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default LocationPermissionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
    color: "#666",
  },
  enableButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    width: "100%",
    marginBottom: 16,
  },
  enableButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  skipButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  skipButtonText: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
  },
});
