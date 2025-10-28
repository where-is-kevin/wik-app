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
import { UserLocationProvider } from "@/contexts/UserLocationContext";
import { UXCamProvider } from "@/contexts/UXCamContext";
import { AnalyticsProvider } from "@/contexts/AnalyticsContext";
import { PortalProvider, PortalHost } from "@gorhom/portal";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { ModeProvider } from "@/contexts/ModeContext";
import { ToastProvider } from "@/contexts/ToastContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create QueryClient outside component to prevent recreation on re-renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes cache time
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function RootLayout() {

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
          <AnalyticsProvider>
            <ThemeProvider>
              <LocationProvider>
                <UserLocationProvider>
                  <PortalProvider>
                    <BottomSheetModalProvider>
                      <ModeProvider>
                        <ToastProvider>
                      <StatusBar style="dark" />
                      <Stack>
                        {/* Root index handles auth routing */}
                        <Stack.Screen
                          name="index"
                          options={{ headerShown: false }}
                        />
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
                          name="business-events/[businessEventId]"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name="major-events-nearby"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name="worldwide-major-events"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name="worldwide-business-events"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name="map-screen"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name="location-selection"
                          options={{ headerShown: false }}
                        />
                        {/* Create modal screen */}
                        <Stack.Screen
                          name="create"
                          options={{
                            presentation: "modal",
                            headerShown: false,
                            animation: "slide_from_bottom",
                            contentStyle: {
                              backgroundColor: "transparent",
                            },
                          }}
                        />
                        {/* Fallback screen for undefined routes */}
                        <Stack.Screen name="+not-found" />
                      </Stack>
                        </ToastProvider>
                      </ModeProvider>
                    </BottomSheetModalProvider>
                    <PortalHost name="root" />
                  </PortalProvider>
                </UserLocationProvider>
              </LocationProvider>
            </ThemeProvider>
          </AnalyticsProvider>
        </UXCamProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
