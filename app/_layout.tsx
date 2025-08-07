import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LocationProvider } from "@/contexts/LocationContext";
import { UXCamProvider } from "@/contexts/UXCamContext";
import { PortalProvider } from "@gorhom/portal";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
      mutations: {
        retry: 1,
      },
    },
  });

  // Load custom fonts
  const [loaded] = useFonts({
    "Inter-Bold": require("../assets/fonts/Inter-Bold.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter-Medium.ttf"),
    "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter-SemiBold.ttf"),
  });

  // Hide the splash screen once fonts are loaded
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Show nothing until fonts are loaded
  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <UXCamProvider>
          <ThemeProvider>
            <LocationProvider>
              <PortalProvider>
                <StatusBar style="auto" />
                <Stack>
                  {/* Root index handles auth routing */}
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  {/* Authentication screens */}
                  <Stack.Screen
                    name="(auth)"
                    options={{ headerShown: false }}
                  />
                  {/* Onboarding screens */}
                  <Stack.Screen
                    name="(onboarding)"
                    options={{ headerShown: false }}
                  />
                  {/* Main tab navigation */}
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(profile)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(settings)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="event-details/[eventId]"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="map-screen"
                    options={{ headerShown: false }}
                  />
                  {/* Fallback screen for undefined routes */}
                  <Stack.Screen name="+not-found" />
                </Stack>
              </PortalProvider>
            </LocationProvider>
          </ThemeProvider>
        </UXCamProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
