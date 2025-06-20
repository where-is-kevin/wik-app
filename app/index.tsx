// app/index.tsx
import React, { useEffect } from "react";
import { StyleSheet, ActivityIndicator } from "react-native";
import { useLocationPermissionGuard } from "@/hooks/useLocationPermissionGuard";
import { verticalScale, scaleFontSize } from "@/utilities/scaling";
import CustomView from "@/components/CustomView";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";

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
          // User is not authenticated, redirect to auth screen
          router.replace("/(auth)");
        }
      }
    };

    handleInitialNavigation();
  }, [isLoading, isAuthenticated]);

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
