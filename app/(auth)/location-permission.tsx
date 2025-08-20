// components/LocationPermissionScreen.tsx
import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { useLocation } from "@/contexts/LocationContext";
import { useLocationPermissionGuard } from "@/hooks/useLocationPermissionGuard";
import * as Location from "expo-location";
import { router } from "expo-router";
import CustomText from "@/components/CustomText";
import CustomView from "@/components/CustomView";
import CustomTouchable from "@/components/CustomTouchableOpacity";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";

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
  const { requestPermission, permissionStatus } = useLocation();
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const { savePermissionStatus } = useLocationPermissionGuard({
    redirectToTabs: false,
    skipLocationCheck: true,
  });

  const handleContinue = async () => {
    setIsLoading(true);
    
    try {
      // Use the proper permission request from context
      const granted = await requestPermission();
      
      if (granted) {
        await savePermissionStatus("granted");
        onPermissionGranted?.();
      } else {
        await savePermissionStatus("denied");
      }
      
      // Always proceed to tabs
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Location permission error:", error);
      router.replace("/(tabs)");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CustomView style={styles.container}>
      <CustomView style={styles.content}>
        <CustomText style={styles.title}>Location Services</CustomText>
        <CustomText style={styles.description}>
          This app provides personalized content and nearby recommendations
          based on your location. You'll be asked to grant location access in
          the next step.
        </CustomText>

        <CustomTouchable
          style={styles.continueButton}
          bgColor={colors.lime}
          onPress={handleContinue}
          disabled={isLoading}
        >
          <CustomText
            style={[styles.continueButtonText, { color: colors.label_dark }]}
            fontFamily="Inter-SemiBold"
          >
            {isLoading ? "Loading..." : "Continue"}
          </CustomText>
        </CustomTouchable>
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
  continueButton: {
    paddingVertical: verticalScale(12),
    borderRadius: 8,
    width: "100%",
    marginHorizontal: horizontalScale(24),
  },
  continueButtonText: {
    fontSize: scaleFontSize(16),
    textAlign: "center",
  },
});
