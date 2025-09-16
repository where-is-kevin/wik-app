// app/index.tsx
import React, { useEffect, useState } from "react";
import { StyleSheet, ActivityIndicator } from "react-native";
import { useLocationPermissionGuard } from "@/hooks/useLocationPermissionGuard";
import { verticalScale, scaleFontSize } from "@/utilities/scaling";
import CustomView from "@/components/CustomView";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const { checkAndNavigate } = useLocationPermissionGuard({
    redirectToTabs: true,
  });
  const router = useRouter();

  useEffect(() => {
    const handleInitialNavigation = async () => {
      // Wait for auth loading to complete
      if (!isLoading) {
        if (isAuthenticated) {
          // User is authenticated, proceed with location check and navigation
          await checkAndNavigate();
        } else {
          // User is not authenticated, check if first time
          try {
            const isFirstTime = await AsyncStorage.getItem("isFirstTimeUser");
            if (isFirstTime === null) {
              // First time user - go to onboarding
              router.replace("/(onboarding)");
            } else {
              // Returning user - go to auth
              router.replace("/(auth)");
            }
          } catch (error) {
            console.error("Error checking first time user:", error);
            // Default to auth on error
            router.replace("/(auth)");
          }
        }
      }
    };

    handleInitialNavigation();
  }, [isLoading, isAuthenticated, checkAndNavigate, router]);

  // Show loading screen while checking auth
  return (
    <CustomView style={styles.container}>
      <ActivityIndicator size={"large"} color={"#493CFA"} />
    </CustomView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: verticalScale(20),
    fontSize: scaleFontSize(16),
    color: "#666",
  },
});
