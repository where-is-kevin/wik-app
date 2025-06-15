// components/LocationPermissionScreen.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from "react-native";
import { useLocation } from "@/contexts/LocationContext";
import { useLocationPermissionGuard } from "@/hooks/useLocationPermissionGuard";
import { router } from "expo-router";
import CustomText from "@/components/CustomText";
import CustomView from "@/components/CustomView";
import CustomTouchable from "@/components/CustomTouchableOpacity";
import { useTheme } from "@/contexts/ThemeContext";
import { horizontalScale, scaleFontSize, verticalScale } from "@/utilities/scaling";

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
  const {colors} = useTheme();
  const { savePermissionStatus } = useLocationPermissionGuard({
    redirectToTabs: false,
    skipLocationCheck: true, // Don't auto-check here
  });

const handleRequestPermission = async () => {
  const granted = await requestLocationPermission();

  if (granted) {
    onPermissionGranted?.();
    await savePermissionStatus('granted');
    router.replace('/(tabs)');
  } else {
    // User denied the permission request
    Alert.alert(
      "Location Access Required",
      "Location access is needed to provide you with relevant content and features. You can enable it later in Settings, or continue without location services.",
      [
        {
          text: "Continue Without",
          style: "cancel",
          onPress: async () => {
            await savePermissionStatus('denied'); // This marks they were asked and denied
            router.replace('/(tabs)');
          },
        },
        {
          text: "Open Settings",
          onPress: async () => {
            try {
              await Linking.openSettings();
              await savePermissionStatus('denied'); // This marks they were asked
              router.replace('/(tabs)');
            } catch (error) {
              console.error('Error opening settings:', error);
              await savePermissionStatus('denied'); // This marks they were asked
              router.replace('/(tabs)');
            }
          },
        },
      ]
    );
  }
};

const handleSkip = async () => {
  onSkip?.();
  await savePermissionStatus('denied'); // This marks they were asked and chose to skip
  router.replace('/(tabs)');
};

  return (
    <CustomView style={styles.container}>
      <CustomView style={styles.content}>
        <CustomText style={styles.title}>Enable Location Services</CustomText>
        <CustomText style={styles.description}>
          We need access to your location to provide you with personalized
          content and nearby recommendations. Your location data is kept secure
          and private.
        </CustomText>

        <CustomTouchable
          style={styles.enableButton}
          bgColor={colors.lime}
          onPress={handleRequestPermission}
          disabled={isLoading}
        >
          <CustomText style={[styles.enableButtonText, {color: colors.label_dark}]} fontFamily="Inter-SemiBold">
            {isLoading ? "Getting Location..." : "Enable Location"}
          </CustomText>
        </CustomTouchable>

        {showSkipOption && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            disabled={isLoading}
          >
            <Text style={styles.skipButtonText}>Skip for Now</Text>
          </TouchableOpacity>
        )}
      </CustomView>
    </CustomView>
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
    fontSize: scaleFontSize(24),
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: scaleFontSize(16),
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
    color: "#666",
  },
  enableButton: {
    paddingVertical: verticalScale(12),
    borderRadius: 8,
    width: '100%',
    marginBottom: verticalScale(16),
    marginHorizontal: horizontalScale(24),
  },
  enableButtonText: {
    fontSize: scaleFontSize(16),
    textAlign: "center",
  },
  skipButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  skipButtonText: {
    color: "#666",
    fontSize: scaleFontSize(16),
    textAlign: "center",
  },
});